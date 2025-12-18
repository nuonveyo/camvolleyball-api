import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CourtService } from './court.service';
import { CreateCourtDto, UpdateCourtDto } from './dto/create-court.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Courts')
@ApiBearerAuth()
@Controller('courts')
export class CourtController {
    constructor(private readonly courtService: CourtService) { }

    @Get()
    @ApiOperation({ summary: 'List all courts' })
    findAll() {
        return this.courtService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get court details' })
    findOne(@Param('id') id: string) {
        return this.courtService.findOne(id);
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Create a new court' })
    create(@Request() req, @Body() dto: CreateCourtDto) {
        return this.courtService.create(req.user.userId, dto);
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Update court' })
    update(@Request() req, @Param('id') id: string, @Body() dto: UpdateCourtDto) {
        return this.courtService.update(req.user.userId, id, dto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Delete court' })
    remove(@Request() req, @Param('id') id: string) {
        return this.courtService.remove(req.user.userId, id);
    }
}
