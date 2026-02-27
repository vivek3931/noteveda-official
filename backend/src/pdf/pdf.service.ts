import { Injectable, NotFoundException, InternalServerErrorException, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { execFile } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { Readable } from 'stream';
import { Cron, CronExpression } from '@nestjs/schedule';
import axios from 'axios';
import sharp from 'sharp';

const execFileAsync = promisify(execFile);

export interface PdfMetadata {
    totalPages: number;
    dimensions: {
        width: number;
        height: number;
    };
}

@Injectable()
export class PdfService implements OnModuleInit {
    private readonly logger = new Logger(PdfService.name);
    private readonly cacheDir: string;
    private readonly pdfDir: string;
    private readonly logFile: string;
    private readonly processingMap = new Map<string, Promise<string>>();

    constructor(
        private readonly config: ConfigService,
        private readonly prisma: PrismaService,
    ) {
        const rootDir = process.cwd();
        this.cacheDir = path.join(rootDir, 'cache', 'images');
        this.pdfDir = path.join(rootDir, 'cache', 'pdfs');
        this.logFile = path.join(rootDir, 'pdf-debug.log');
    }

    // Helper to write to log file
    private debugLog(message: string) {
        const line = `[${new Date().toISOString()}] ${message}\n`;
        fs.appendFileSync(this.logFile, line);
    }

    async onModuleInit() {
        await fs.promises.mkdir(this.cacheDir, { recursive: true });
        await fs.promises.mkdir(this.pdfDir, { recursive: true });

        // DIAGNOSTIC CHECK: poppler-utils
        try {
            const { stdout } = await execFileAsync('pdfinfo', ['-v']);
            this.logger.log(`✅ [Diagnostics] pdfinfo found: ${stdout.split('\n')[0]}`);
            this.debugLog(`✅ [Diagnostics] pdfinfo found: ${stdout}`);
        } catch (e) {
            this.logger.error(`❌ [Diagnostics] pdfinfo NOT FOUND in PATH!`);
            this.debugLog(`❌ [Diagnostics] pdfinfo NOT FOUND in PATH! Error: ${e}`);
        }
    }

    async getPdfMetadata(resourceId: string): Promise<PdfMetadata> {
        this.debugLog(`[Metadata] Request for ${resourceId}`);
        try {
            const pdfPath = await this.ensurePdfExists(resourceId);

            this.debugLog(`[Metadata] PDF Path: ${pdfPath}`);

            const { stdout } = await execFileAsync('pdfinfo', ['-f', '1', '-l', '1', pdfPath]);

            const pagesMatch = stdout.match(/Pages:\s+(\d+)/);
            const sizeMatch = stdout.match(/(?:Page\s+\d+\s+size|Page size):\s+([\d.]+)\s+x\s+([\d.]+)/);

            if (!pagesMatch || !sizeMatch) {
                this.debugLog(`[Metadata] Parse failed. Output: ${stdout}`);
                throw new InternalServerErrorException('Failed to parse pdfinfo output');
            }

            return {
                totalPages: parseInt(pagesMatch[1], 10),
                dimensions: {
                    width: parseFloat(sizeMatch[1]),
                    height: parseFloat(sizeMatch[2]),
                }
            };
        } catch (error) {
            this.debugLog(`[Metadata] Failed for ${resourceId}: ${error}`);
            throw error;
        }
    }

    async getPageImage(resourceId: string, pageNumber: number, scale = 1.0): Promise<string> {
        const safeScale = Math.max(0.1, Math.min(scale, 4.0));
        const cacheKey = `${resourceId}-p${pageNumber}-s${safeScale.toFixed(2)}`;
        const webpFilename = `${cacheKey}.webp`;
        const webpPath = path.join(this.cacheDir, webpFilename);

        // Return cached WebP if exists
        if (fs.existsSync(webpPath)) return webpPath;
        if (this.processingMap.has(cacheKey)) return this.processingMap.get(cacheKey)!;

        const processPromise = (async () => {
            try {
                const pdfPath = await this.ensurePdfExists(resourceId);
                const density = Math.round(72 * safeScale * 1.5);
                const tempPrefix = path.join(this.cacheDir, `temp-${crypto.randomUUID()}`);

                this.debugLog(`[Render] Spawning pdftocairo for ${cacheKey}`);

                // Step 1: Render PDF page to PNG using pdftocairo
                await execFileAsync('pdftocairo', [
                    '-png',
                    '-singlefile',
                    '-f', pageNumber.toString(),
                    '-l', pageNumber.toString(),
                    '-r', density.toString(),
                    pdfPath,
                    tempPrefix
                ]);

                const pngFile = `${tempPrefix}.png`;
                let pngPath = '';

                if (fs.existsSync(pngFile)) {
                    pngPath = pngFile;
                } else if (fs.existsSync(tempPrefix)) {
                    pngPath = tempPrefix;
                } else {
                    this.debugLog(`[Render] Output missing for ${tempPrefix}`);
                    throw new Error('PNG output file not generated');
                }

                // Step 2: Convert PNG to WebP using sharp
                this.debugLog(`[Convert] PNG -> WebP for ${cacheKey}`);
                await sharp(pngPath)
                    .webp({ quality: 95 }) // High quality WebP (near-lossless)
                    .toFile(webpPath);

                // Step 3: Clean up temporary PNG
                await fs.promises.unlink(pngPath).catch(() => { });

                return webpPath;

            } catch (err) {
                this.debugLog(`[Render] Failed for ${cacheKey}: ${err}`);
                throw err;
            } finally {
                this.processingMap.delete(cacheKey);
            }
        })();

        this.processingMap.set(cacheKey, processPromise);
        return processPromise;
    }

    /**
     * Optimized text extraction for text layer overlay.
     * Returns compact JSON with page dimensions and words grouped by lines.
     * Format: { width, height, words: [[x, y, w, h, "text"], ...] }
     */
    async getPageText(resourceId: string, pageNumber: number): Promise<{
        width: number;
        height: number;
        words: Array<[number, number, number, number, string]>;
    }> {
        const pdfPath = await this.ensurePdfExists(resourceId);

        try {
            this.debugLog(`[Text] Extracting for ${resourceId} p${pageNumber}`);

            // Get page dimensions first
            const metadata = await this.getPdfMetadata(resourceId);

            const { stdout } = await execFileAsync('pdftotext', [
                '-bbox',
                '-f', pageNumber.toString(),
                '-l', pageNumber.toString(),
                pdfPath,
                '-' // Output to stdout
            ]);

            // Parse raw words
            const rawWords: Array<{ x: number; y: number; w: number; h: number; text: string }> = [];
            const wordTagRegex = /<word\s+([^>]+)>([^<]+)<\/word>/g;
            const attrRegex = /(xMin|yMin|xMax|yMax)="([\d.]+)"/g;

            let match;
            while ((match = wordTagRegex.exec(stdout)) !== null) {
                const attributesStr = match[1];
                const text = match[2];

                const attrs: Record<string, number> = {};
                let attrMatch;
                // Reset regex lastIndex for each word
                attrRegex.lastIndex = 0;
                while ((attrMatch = attrRegex.exec(attributesStr)) !== null) {
                    attrs[attrMatch[1]] = parseFloat(attrMatch[2]);
                }

                if (attrs.xMin !== undefined && attrs.yMin !== undefined &&
                    attrs.xMax !== undefined && attrs.yMax !== undefined) {
                    rawWords.push({
                        x: Math.round(attrs.xMin * 100) / 100,
                        y: Math.round(attrs.yMin * 100) / 100,
                        w: Math.round((attrs.xMax - attrs.xMin) * 100) / 100,
                        h: Math.round((attrs.yMax - attrs.yMin) * 100) / 100,
                        text
                    });
                }
            }

            // Optimization: Merge words on the same line (within 2pt Y tolerance)
            const Y_TOLERANCE = 2;
            const lines: Map<number, typeof rawWords> = new Map();

            for (const word of rawWords) {
                let foundLine = false;
                for (const [lineY, lineWords] of lines) {
                    if (Math.abs(word.y - lineY) <= Y_TOLERANCE) {
                        lineWords.push(word);
                        foundLine = true;
                        break;
                    }
                }
                if (!foundLine) {
                    lines.set(word.y, [word]);
                }
            }

            // Convert to compact array format: [x, y, w, h, "text"]
            const words: Array<[number, number, number, number, string]> = [];

            for (const [, lineWords] of lines) {
                // Sort words by X position
                lineWords.sort((a, b) => a.x - b.x);

                // Option 1: Merge entire line (most compact)
                // For now, keep individual words for accurate selection
                for (const word of lineWords) {
                    words.push([word.x, word.y, word.w, word.h, word.text]);
                }
            }

            this.debugLog(`[Text] Found ${words.length} words for p${pageNumber}`);

            return {
                width: metadata.dimensions.width,
                height: metadata.dimensions.height,
                words
            };

        } catch (error) {
            this.debugLog(`[Text] Failed for ${resourceId} p${pageNumber}: ${error}`);
            throw new InternalServerErrorException('Failed to extract text');
        }
    }

    async searchPdf(resourceId: string, query: string): Promise<any[]> {
        const pdfPath = await this.ensurePdfExists(resourceId);
        if (!query || query.trim().length === 0) return [];

        try {
            this.debugLog(`[Search] Searching for "${query}" in ${resourceId}`);

            // Extract all text to stdout, separated by Form Feed (\f)
            const { stdout } = await execFileAsync('pdftotext', [
                pdfPath,
                '-'
            ]);

            // Split by Form Feed (ASCII 12) to get pages
            // pdftotext usually separates pages with \f
            const pages = stdout.split('\f');
            const results: any[] = [];
            const safeQuery = query.toLowerCase();

            pages.forEach((pageText, index) => {
                const pageNum = index + 1;
                if (!pageText) return;

                const lowerText = pageText.toLowerCase();
                let startIndex = 0;
                let matchIndex;

                // Find all occurrences in this page
                while ((matchIndex = lowerText.indexOf(safeQuery, startIndex)) !== -1) {
                    // Extract snippet
                    const snippetStart = Math.max(0, matchIndex - 20);
                    const snippetEnd = Math.min(pageText.length, matchIndex + query.length + 20);
                    const snippet = pageText.substring(snippetStart, snippetEnd).replace(/\s+/g, ' ').trim();

                    results.push({
                        page: pageNum,
                        match: snippet
                    });

                    startIndex = matchIndex + query.length;

                    // Limit matches per page to avoid spam
                    if (results.filter(r => r.page === pageNum).length > 10) break;
                }
            });

            this.debugLog(`[Search] Found ${results.length} matches`);
            return results;

        } catch (error) {
            this.debugLog(`[Search] Failed for ${resourceId}: ${error}`);
            throw new InternalServerErrorException('Search failed');
        }
    }

    public async ensurePdfExists(resourceId: string): Promise<string> {
        const localPath = path.join(this.pdfDir, `${resourceId}.pdf`);
        if (fs.existsSync(localPath)) return localPath;

        const downloadKey = `download-${resourceId}`;
        if (this.processingMap.has(downloadKey)) return this.processingMap.get(downloadKey)!;

        const downloadTask = (async () => {
            this.debugLog(`[Download] Starting for ${resourceId} to ${localPath}`);

            const resource = await this.prisma.resource.findUnique({
                where: { id: resourceId },
                select: { fileUrl: true }
            });

            if (!resource) {
                this.debugLog(`[Download] Resource NOT FOUND`);
                throw new NotFoundException('Resource not found');
            }
            if (!resource.fileUrl) {
                this.debugLog(`[Download] URL missing`);
                throw new NotFoundException('Resource has no file URL');
            }

            try {
                const response = await axios({
                    url: resource.fileUrl,
                    method: 'GET',
                    responseType: 'stream'
                });

                const writer = fs.createWriteStream(localPath);

                return new Promise<string>((resolve, reject) => {
                    response.data.pipe(writer);
                    writer.on('finish', () => {
                        this.debugLog(`[Download] Success`);
                        resolve(localPath);
                    });
                    writer.on('error', (e: any) => {
                        this.debugLog(`[Download] Stream Error: ${e}`);
                        reject(e);
                    });
                });
            } catch (e) {
                this.debugLog(`[Download] Axios Error: ${e}`);
                throw e;
            }
        })();

        this.processingMap.set(downloadKey, downloadTask);
        try {
            return await downloadTask;
        } finally {
            this.processingMap.delete(downloadKey);
        }
    }

    @Cron(CronExpression.EVERY_DAY_AT_3AM)
    async handleCleanup() { }
}
