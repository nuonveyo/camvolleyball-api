import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PostServiceService } from './post-service.service';
import { CreatePostDto, UpdatePostDto, PaginationDto } from '@app/common';

@Controller()
export class PostServiceController {
  constructor(private readonly postService: PostServiceService) { }

  @MessagePattern('create_post')
  create(@Payload() dto: CreatePostDto) {
    return this.postService.create(dto);
  }

  @MessagePattern('find_all_posts')
  findAll(@Payload() paginationDto: PaginationDto) {
    return this.postService.findAll(paginationDto);
  }

  @MessagePattern('find_one_post')
  findOne(@Payload() id: string) {
    return this.postService.findOne(id);
  }

  @MessagePattern('update_post')
  update(@Payload() dto: UpdatePostDto) {
    return this.postService.update(dto);
  }

  @MessagePattern('remove_post')
  remove(@Payload() payload: { id: string; userId: string }) {
    return this.postService.remove(payload.id, payload.userId);
  }
}
