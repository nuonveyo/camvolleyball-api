import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { FileController } from './file.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
    imports: [
        ClientsModule.registerAsync([
            {
                name: 'FILE_SERVICE',
                useFactory: (configService: ConfigService) => ({
                    transport: Transport.TCP,
                    options: {
                        host: configService.get('FILE_SERVICE_HOST') || '127.0.0.1',
                        port: parseInt(configService.get('FILE_SERVICE_PORT') || '3003'),
                    },
                }),
                inject: [ConfigService],
            },
        ]),
    ],
    controllers: [FileController],
})
export class FileModule { }
