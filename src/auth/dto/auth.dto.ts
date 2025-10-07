import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

// Note: Password-based authentication has been removed
// These DTOs are kept for potential future use but will throw errors if used

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  phoneNumber: string;
}

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  phoneNumber: string;
}
