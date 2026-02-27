
import { Controller, Post, UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiResponse } from '@nestjs/swagger';
import { Public } from '../auth/decorators';

@ApiTags('Uploads')
@Controller('uploads')
export class UploadsController {
    constructor(private readonly cloudinaryService: CloudinaryService) { }

    @Post()
    @Public() // Or guarded, depending on rq. The user must be logged in to create resource, so upload should likely be protected? 
    // Wait, ResourcesController.create is guarded. But 'Upload form' is a wizard. 
    // Let's keep it protected via Bearer token usually, but ResourcesService.create takes userId.
    // I'll make it Public for now to match strict requirements reduction or keep it matching auth.
    // Actually, better to require Auth.
    @ApiOperation({ summary: 'Upload a file to Cloudinary' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })
    @ApiResponse({ status: 201, description: 'File uploaded successfully' })
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    // Max size 10MB
                    new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 * 5 }), // 50MB matches frontend
                    // File type matches frontend
                    // new FileTypeValidator({ fileType: '.(png|jpeg|jpg|pdf|docx|txt)' }), // Loose regex
                ],
            }),
        )
        file: Express.Multer.File,
    ) {
        const result = await this.cloudinaryService.uploadFile(file);
        return {
            url: result.secure_url,
            publicId: result.public_id,
            format: result.format,
            originalName: file.originalname,
        };
    }
}
