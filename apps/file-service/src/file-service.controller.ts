import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { FileServiceService } from './file-service.service';

@Controller()
export class FileServiceController {
  constructor(private readonly fileServiceService: FileServiceService) { }

  @MessagePattern('get_presigned_url')
  getPresignedUrl(@Payload() data: { fileName: string; fileType: string }) {
    return this.fileServiceService.getPresignedUrl(data.fileName, data.fileType);
  }
}
