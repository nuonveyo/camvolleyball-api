import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { FileController } from './file.controller';

@Module({
    imports: [
        ClientsModule.register([
            {
                name: 'FILE_SERVICE',
                transport: Transport.TCP,
                options: {
                    host: '0.0.0.0',
                    port: 3002, // Should match file-service port
                },
            },
        ]),
    ],
    controllers: [FileController],
})
export class FileModule { }
