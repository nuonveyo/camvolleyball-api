import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { SendOtpDto, ConfirmOtpDto } from './dto/otp.dto';
import { RequestResetPasswordDto, ResetPasswordDto } from './dto/reset-password.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register')
    register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }

    @Post('login')
    login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @Post('otp/send')
    sendOtp(@Body() sendOtpDto: SendOtpDto) {
        return this.authService.sendOtp(sendOtpDto);
    }

    @Post('otp/confirm')
    confirmOtp(@Body() confirmOtpDto: ConfirmOtpDto) {
        return this.authService.confirmOtp(confirmOtpDto);
    }

    @Post('password/reset-request')
    requestResetPassword(@Body() dto: RequestResetPasswordDto) {
        return this.authService.requestResetPassword(dto);
    }

    @Post('password/reset')
    resetPassword(@Body() dto: ResetPasswordDto) {
        return this.authService.resetPassword(dto);
    }
}
