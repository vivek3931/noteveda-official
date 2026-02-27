import { Controller, Get, Head, Param, Query, Req, Res, BadRequestException, ParseIntPipe, ParseFloatPipe, NotFoundException } from '@nestjs/common';
import { PdfService } from './pdf.service';
import type { Request, Response } from 'express';
import * as fs from 'fs';
import { Public } from '../auth/decorators';

@Public() // Bypass Global Auth Guard
@Controller('pdf')
export class PdfController {
    constructor(private readonly pdfService: PdfService) { }

    /**
     * Endpoint 1: Metadata
     * GET /pdf/:id/meta
     */
    @Get(':id/meta')
    async getMetadata(@Param('id') id: string) {
        if (!id) throw new BadRequestException('ID is required');
        return this.pdfService.getPdfMetadata(id);
    }

    /**
     * Endpoint 2: Page Stream
     * GET /pdf/:id/page/:pageNumber?scale=2.0
     */
    @Get(':id/page/:pageNumber')
    async getPage(
        @Param('id') id: string,
        @Param('pageNumber', ParseIntPipe) pageNumber: number,
        @Query('scale') scale = '1.0',
        @Res() res: Response
    ) {
        const scaleNum = parseFloat(scale);
        if (isNaN(scaleNum) || scaleNum <= 0) {
            throw new BadRequestException('Invalid scale parameter');
        }

        try {
            const imagePath = await this.pdfService.getPageImage(id, pageNumber, scaleNum);

            // Check if file exists (sanity check)
            if (!fs.existsSync(imagePath)) {
                throw new NotFoundException('Generated image not found');
            }

            // Stream the file
            res.setHeader('Content-Type', 'image/webp');
            res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year

            const stream = fs.createReadStream(imagePath);
            stream.pipe(res);


        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            throw new BadRequestException('Failed to generate page image');
        }
    }

    /**
     * Endpoint 3: Text Data
     * GET /pdf/:id/page/:pageNumber/text
     */
    @Get(':id/page/:pageNumber/text')
    async getPageText(
        @Param('id') id: string,
        @Param('pageNumber', ParseIntPipe) pageNumber: number,
    ) {
        return this.pdfService.getPageText(id, pageNumber);
    }

    /**
     * Endpoint 4: Search
     * GET /pdf/:id/search?q=query
     */
    @Get(':id/search')
    async search(
        @Param('id') id: string,
        @Query('q') query: string,
    ) {
        if (!query) throw new BadRequestException('Query is required');
        return this.pdfService.searchPdf(id, query);
    }

    /**
     * Endpoint 5: PDF Stream with Range Request Support
     * GET /pdf/:id/stream
     * HEAD /pdf/:id/stream
     * 
     * Supports HTTP Range requests for progressive PDF loading.
     * PDF.js will send HEAD first to check Accept-Ranges, then GET with Range header.
     */
    @Get(':id/stream')
    @Head(':id/stream')  // PDF.js sends HEAD first to check Accept-Ranges
    async streamPdf(
        @Param('id') id: string,
        @Req() req: Request,
        @Res() res: Response,
    ) {
        const pdfPath = await this.pdfService.ensurePdfExists(id);
        const stat = fs.statSync(pdfPath);
        const fileSize = stat.size;

        // Handle HEAD request (PDF.js sends this first to check Range support)
        if (req.method === 'HEAD') {
            res.writeHead(200, {
                'Content-Length': fileSize,
                'Accept-Ranges': 'bytes',
                'Content-Type': 'application/pdf',
            });
            res.end();
            return;
        }

        const range = req.headers.range;

        if (range) {
            // Parse Range header: "bytes=start-end"
            const parts = range.replace(/bytes=/, '').split('-');
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
            const chunkSize = end - start + 1;

            res.writeHead(206, {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunkSize,
                'Content-Type': 'application/pdf',
            });

            fs.createReadStream(pdfPath, { start, end }).pipe(res);
        } else {
            // No Range header - stream entire file
            res.writeHead(200, {
                'Content-Length': fileSize,
                'Accept-Ranges': 'bytes',
                'Content-Type': 'application/pdf',
            });

            fs.createReadStream(pdfPath).pipe(res);
        }
    }
}
