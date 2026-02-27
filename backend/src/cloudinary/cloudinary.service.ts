import { Injectable } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import * as streamifier from 'streamifier';

@Injectable()
export class CloudinaryService {
    async uploadFile(file: Express.Multer.File): Promise<UploadApiResponse | UploadApiErrorResponse> {
        return new Promise((resolve, reject) => {
            const upload = cloudinary.uploader.upload_stream(
                {
                    folder: 'noteveda/resources',
                    resource_type: 'auto',
                },
                (error, result) => {
                    if (error) return reject(error);
                    if (result) resolve(result);
                    else reject(new Error('Upload failed'));
                },
            );

            streamifier.createReadStream(file.buffer).pipe(upload);
        });
    }
}

