import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, OtpCode, UserProfile, Role } from '@app/common';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { SendOtpDto, ConfirmOtpDto, OtpType } from './dto/otp.dto';
import { RequestResetPasswordDto, ResetPasswordDto } from './dto/reset-password.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(OtpCode)
        private otpRepository: Repository<OtpCode>,
        @InjectRepository(UserProfile)
        private profileRepository: Repository<UserProfile>,
        @InjectRepository(Role)
        private roleRepository: Repository<Role>,
        private jwtService: JwtService,
    ) { }

    async register(registerDto: RegisterDto) {
        const { phoneNumber, password, confirmPassword } = registerDto;

        if (password !== confirmPassword) {
            throw new BadRequestException('Passwords do not match');
        }

        const existingUser = await this.userRepository.findOne({ where: { phoneNumber } });
        if (existingUser) {
            throw new BadRequestException('Phone number already exists');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = this.userRepository.create({
            phoneNumber,
            passwordHash: hashedPassword,
        });

        // Assign default role (General)
        const generalRole = await this.roleRepository.findOne({ where: { name: 'General' } });
        if (generalRole) {
            user.roles = [generalRole];
        }

        await this.userRepository.save(user);

        // Create empty profile
        const profile = this.profileRepository.create({ user_id: user.id });
        await this.profileRepository.save(profile);

        return this.login({ phoneNumber, password });
    }

    async login(loginDto: LoginDto) {
        const { phoneNumber, password } = loginDto;
        const user = await this.userRepository.findOne({
            where: { phoneNumber },
            relations: ['roles'],
        });

        if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const payload = { sub: user.id, phone: user.phoneNumber, roles: user.roles.map(r => r.name) };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                phoneNumber: user.phoneNumber,
                roles: user.roles,
            }
        };
    }

    async sendOtp(dto: SendOtpDto) {
        // Generate 6 digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

        await this.otpRepository.save({
            phoneNumber: dto.phoneNumber,
            code,
            type: dto.type,
            expiresAt,
        });

        // In production, call SMS provider here.
        // For dev, return the code or just success.
        return { message: 'OTP sent successfully', dev_code: code };
    }

    async confirmOtp(dto: ConfirmOtpDto) {
        const { phoneNumber, code, type } = dto;
        const validOtp = await this.otpRepository.findOne({
            where: { phoneNumber, code, type, isUsed: false },
            order: { createdAt: 'DESC' },
        });

        if (!validOtp || new Date() > validOtp.expiresAt) {
            throw new UnauthorizedException('Invalid or expired OTP');
        }

        // Mark OTP as used
        validOtp.isUsed = true;
        await this.otpRepository.save(validOtp);

        return { message: 'OTP verified successfully' };
    }

    async requestResetPassword(dto: RequestResetPasswordDto) {
        const user = await this.userRepository.findOne({ where: { phoneNumber: dto.phoneNumber } });
        if (!user) {
            throw new UnauthorizedException('User not found'); // Or silence for security, but usually better to know in dev
        }
        // Send OTP (mocked)
        return this.sendOtp({ phoneNumber: dto.phoneNumber, type: OtpType.PASSWORD_RESET });
    }

    async resetPassword(dto: ResetPasswordDto) {
        const { phoneNumber, otp, newPassword } = dto;
        // Verify OTP first
        const validOtp = await this.otpRepository.findOne({
            where: { phoneNumber, code: otp, type: OtpType.PASSWORD_RESET, isUsed: false },
            order: { createdAt: 'DESC' },
        });

        if (!validOtp || new Date() > validOtp.expiresAt) {
            throw new UnauthorizedException('Invalid or expired OTP');
        }

        const user = await this.userRepository.findOne({ where: { phoneNumber } });
        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        user.passwordHash = await bcrypt.hash(newPassword, 10);
        await this.userRepository.save(user);

        // Mark OTP as used
        validOtp.isUsed = true;
        await this.otpRepository.save(validOtp);

        return { message: 'Password reset successfully' };
    }
}
