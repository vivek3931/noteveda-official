import { IsNotEmpty, IsOptional, IsString, IsObject } from 'class-validator';

export class ChatRequestDto {
    @IsNotEmpty()
    @IsString()
    message: string;

    @IsNotEmpty()
    @IsString()
    resourceId: string;

    @IsOptional()
    @IsObject()
    resourceContext?: {
        title: string;
        subject: string;
        domain: string;
        resourceType: string;
    };
}
