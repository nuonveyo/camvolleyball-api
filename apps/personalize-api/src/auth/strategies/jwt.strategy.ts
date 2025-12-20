
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserDevice } from '@app/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        configService: ConfigService,
        @InjectRepository(UserDevice)
        private deviceRepository: Repository<UserDevice>,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET') || 'supersecretkey',
            passReqToCallback: true, // Access request in validate
        });
    }

    async validate(req: any, payload: any) {
        // payload: { sub, phoneNumber, deviceId, roles }

        const headerDeviceId = req.headers['x-device-id'];

        // 1. Strict Header Check
        if (payload.deviceId) {
            if (!headerDeviceId) {
                throw new UnauthorizedException('Device ID header (x-device-id) is required');
            }
            if (headerDeviceId !== payload.deviceId) {
                throw new UnauthorizedException('Device ID mismatch. Token restricted to specific device.');
            }

            // 2. Active Session Check
            const userDevice = await this.deviceRepository.findOne({
                where: { user_id: payload.sub, device_id: payload.deviceId }
            });

            if (!userDevice || !userDevice.is_active) {
                throw new UnauthorizedException('Session expired or logged out');
            }
        }

        return { userId: payload.sub, phoneNumber: payload.phoneNumber, deviceId: payload.deviceId, roles: payload.roles };
    }
}
