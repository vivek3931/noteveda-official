import { IsString, IsOptional, IsArray, IsEnum, IsNumber, IsObject, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateResourceDto {
    @ApiProperty({ example: 'Data Structures Notes - Complete Guide' })
    @IsString()
    @MinLength(5)
    @MaxLength(200)
    title: string;

    @ApiProperty({ example: 'Comprehensive notes covering arrays, linked lists, trees, and graphs' })
    @IsString()
    @MinLength(10)
    @MaxLength(2000)
    description: string;

    @ApiProperty({ example: 'https://res.cloudinary.com/...' })
    @IsString()
    fileUrl: string;

    @ApiProperty({ example: 'abc123...' })
    @IsString()
    fileHash: string;

    @ApiProperty({ example: 1024000 })
    @IsNumber()
    fileSize: number;

    @ApiProperty({ enum: ['PDF', 'DOCX', 'TXT'] })
    @IsEnum(['PDF', 'DOCX', 'TXT'])
    fileType: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    thumbnailUrl?: string;

    @ApiProperty({ example: 'Engineering' })
    @IsString()
    domain: string;

    @ApiProperty({ example: 'Computer Science' })
    @IsString()
    subDomain: string;

    @ApiPropertyOptional({ example: 'B.Tech' })
    @IsString()
    @IsOptional()
    stream?: string;

    @ApiProperty({ example: 'Data Structures' })
    @IsString()
    subject: string;

    @ApiProperty({ enum: ['NOTES', 'GUIDE', 'PYQ', 'SOLUTION'] })
    @IsEnum(['NOTES', 'GUIDE', 'PYQ', 'SOLUTION'])
    resourceType: string;

    @ApiProperty({ example: ['DSA', 'algorithms', 'programming'] })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    tags?: string[];

    // New polymorphic fields
    @ApiPropertyOptional({
        enum: ['ACADEMIC', 'ENTRANCE', 'SKILL', 'GENERAL'],
        example: 'ACADEMIC',
        description: 'Resource category for polymorphic filtering'
    })
    @IsEnum(['ACADEMIC', 'ENTRANCE', 'SKILL', 'GENERAL'])
    @IsOptional()
    category?: string;

    @ApiPropertyOptional({
        example: { course: 'B.Tech CSE', semester: 'Sem 5', subject: 'Data Structures', docType: 'Notes' },
        description: 'Category-specific metadata stored as JSON'
    })
    @IsObject()
    @IsOptional()
    metadata?: Record<string, unknown>;
}

export class UpdateResourceDto {
    @ApiPropertyOptional()
    @IsString()
    @MinLength(5)
    @MaxLength(200)
    @IsOptional()
    title?: string;

    @ApiPropertyOptional()
    @IsString()
    @MinLength(20)
    @MaxLength(2000)
    @IsOptional()
    description?: string;

    @ApiPropertyOptional()
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    tags?: string[];
}

export class QueryResourcesDto {
    @ApiPropertyOptional({ default: 1 })
    @IsOptional()
    page?: number;

    @ApiPropertyOptional({ default: 12 })
    @IsOptional()
    limit?: number;

    @ApiPropertyOptional()
    @IsOptional()
    domain?: string;

    @ApiPropertyOptional()
    @IsOptional()
    subDomain?: string;

    @ApiPropertyOptional()
    @IsOptional()
    subject?: string;

    @ApiPropertyOptional({ enum: ['ACADEMIC', 'ENTRANCE', 'SKILL', 'GENERAL'] })
    @IsEnum(['ACADEMIC', 'ENTRANCE', 'SKILL', 'GENERAL'])
    @IsOptional()
    category?: string;

    @ApiPropertyOptional({ enum: ['NOTES', 'GUIDE', 'PYQ', 'SOLUTION'] })
    @IsOptional()
    resourceType?: string;

    @ApiPropertyOptional()
    @IsOptional()
    search?: string;

    @ApiPropertyOptional({ enum: ['latest', 'popular', 'downloads'] })
    @IsOptional()
    sortBy?: 'latest' | 'popular' | 'downloads';
}
