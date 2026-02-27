import { IsEmail, IsString, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
    @ApiProperty({ example: 'John Doe', description: 'User full name' })
    @IsString()
    @MinLength(2)
    @MaxLength(50)
    name: string;

    @ApiProperty({ example: 'user@example.com', description: 'Email address' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'SecurePass123!', description: 'Password (min 8 chars, 1 uppercase, 1 number)' })
    @IsString()
    @MinLength(8)
    @MaxLength(50)
    @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
        message: 'Password must contain uppercase, lowercase, and number or special character',
    })
    password: string;
}

export class LoginDto {
    @ApiProperty({ example: 'user@example.com' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'SecurePass123!' })
    @IsString()
    password: string;
}

export class RefreshTokenDto {
    @ApiProperty({ description: 'Refresh token for getting new access token' })
    @IsString()
    refreshToken: string;
}

export class AuthResponseDto {
    @ApiProperty()
    accessToken: string;

    @ApiProperty()
    refreshToken: string;

    @ApiProperty()
    user: {
        id: string;
        email: string;
        name: string;
        role: string;
        dailyCredits: number;
        uploadCredits: number;
    };
}
