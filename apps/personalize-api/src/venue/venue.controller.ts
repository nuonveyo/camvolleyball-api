import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { VenueService } from './venue.service';
import { CreateVenueDto } from './dto/create-venue.dto';
import { UpdateVenueDto } from './dto/create-venue.dto';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PaginationDto } from '@app/common';
import { Sector } from '@app/common/database/enums/sector.enum';

@ApiTags('Venues')
@Controller('venues')
export class VenueController {
    constructor(private readonly venueService: VenueService) { }

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new venue' })
    create(@Body() createVenueDto: CreateVenueDto, @Request() req) {
        return this.venueService.create(createVenueDto, req.user.userId);
    }

    @Get()
    @ApiOperation({ summary: 'List all venues' })
    @ApiQuery({ name: 'sector', enum: Sector, required: false })
    findAll(@Query() paginationDto: PaginationDto, @Query('sector') sector?: Sector) {
        return this.venueService.findAll(paginationDto, sector);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get venue details' })
    findOne(@Param('id') id: string) {
        return this.venueService.findOne(id);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update a venue' })
    update(@Param('id') id: string, @Body() updateVenueDto: UpdateVenueDto, @Request() req) {
        return this.venueService.update(id, updateVenueDto, req.user.userId);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete a venue' })
    remove(@Param('id') id: string, @Request() req) {
        return this.venueService.remove(id, req.user.userId);
    }
}
