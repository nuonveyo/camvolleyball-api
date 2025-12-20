import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { LogoutDto } from './dto/logout.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { SendOtpDto, ConfirmOtpDto } from './dto/otp.dto';
import { RequestResetPasswordDto, ResetPasswordDto } from './dto/reset-password.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register')
    @ApiOperation({ summary: 'Register a new user' })
    @ApiResponse({ status: 201, description: 'User successfully registered' })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }

    @Post('login')
    @ApiOperation({ summary: 'Login with phone number and password' })
    @ApiResponse({ status: 200, description: 'User successfully logged in' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @Post('otp/send')
    @ApiOperation({ summary: 'Send OTP for verification or password reset' })
    @ApiResponse({ status: 201, description: 'OTP sent successfully' })
    sendOtp(@Body() sendOtpDto: SendOtpDto) {
        return this.authService.sendOtp(sendOtpDto);
    }

    @Post('otp/confirm')
    @ApiOperation({ summary: 'Confirm OTP and get verification token' })
    @ApiResponse({ status: 201, description: 'OTP confirmed, token returned' })
    confirmOtp(@Body() confirmOtpDto: ConfirmOtpDto) {
        return this.authService.confirmOtp(confirmOtpDto);
    }

    @Post('password/reset-request')
    @ApiOperation({ summary: 'Request password reset (sends OTP)' })
    @ApiResponse({ status: 201, description: 'Reset request accepted' })
    requestResetPassword(@Body() dto: RequestResetPasswordDto) {
        return this.authService.requestResetPassword(dto);
    }

    @Post('password/reset')
    @ApiOperation({ summary: 'Reset password using verification token' })
    @ApiResponse({ status: 200, description: 'Password successfully reset' })
    resetPassword(@Body() dto: ResetPasswordDto) {
        return this.authService.resetPassword(dto);
    }
    @Post('logout')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Logout and deactivate device session' })
    @ApiResponse({ status: 200, description: 'Logged out successfully' })
    logout(@Body() logoutDto: LogoutDto, @Req() req) {
        return this.authService.logout(req.user.userId, logoutDto.deviceId);
    }
}
