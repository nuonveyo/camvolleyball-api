import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PostServiceService } from './post-service.service';
import { CreatePostDto, UpdatePostDto, PaginationDto, CreateCommentDto, CreateShareDto } from '@app/common';

@Controller()
export class PostServiceController {
  constructor(private readonly postService: PostServiceService) { }

  @MessagePattern('create_post')
  create(@Payload() dto: CreatePostDto) {
    return this.postService.create(dto);
  }

  @MessagePattern('find_all_posts')
  findAll(@Payload() paginationDto: PaginationDto & { userId?: string, followingIds?: string[], interestedSectors?: string[] }) {
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

  @MessagePattern('add_comment')
  addComment(@Payload() dto: CreateCommentDto) {
    return this.postService.addComment(dto);
  }

  @MessagePattern('find_comments')
  findComments(@Payload() payload: { postId: string, pagination: PaginationDto }) {
    return this.postService.findComments(payload.postId, payload.pagination);
  }

  @MessagePattern('toggle_like')
  toggleLike(@Payload() payload: { postId: string; userId: string }) {
    return this.postService.toggleLike(payload);
  }

  @MessagePattern('share_post')
  sharePost(@Payload() dto: CreateShareDto) {
    return this.postService.sharePost(dto);
  }
}
