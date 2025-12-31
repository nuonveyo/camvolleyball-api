import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { ApiQuery } from '@nestjs/swagger';
import { PaginationDto } from '@app/common';
import { Query } from '@nestjs/common';

@ApiTags('Profile')
@ApiBearerAuth()
@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
    constructor(private readonly profileService: ProfileService) { }

    @Get()
    @ApiOperation({ summary: 'Get current user profile' })
    @ApiResponse({ status: 200, description: 'Return profile data' })
    getProfile(@Request() req) {
        return this.profileService.getProfile(req.user.userId);
    }

    @Post()
    @ApiOperation({ summary: 'Update user profile' })
    @ApiResponse({ status: 200, description: 'Profile updated' })
    updateProfile(@Request() req, @Body() dto: UpdateProfileDto) {
        return this.profileService.updateProfile(req.user.userId, dto);
    }

    @Get('list')
    @UseGuards(OptionalJwtAuthGuard)
    @ApiOperation({ summary: 'List all profiles' })
    @ApiResponse({ status: 200, description: 'Return paginated profiles' })
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    async findAll(
        @Query() paginationDto: PaginationDto,
        @Request() req
    ) {
        const userId = req.user?.userId;
        return this.profileService.findAll(paginationDto, userId);
    }
}
