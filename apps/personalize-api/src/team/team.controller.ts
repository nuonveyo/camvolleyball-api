import { Controller, Post, Body, UseGuards, Request, Get, Param, Patch, ParseArrayPipe, Query } from '@nestjs/common';
import { TeamService } from './team.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { CreateTeamDto } from './dto/create-team.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { PaginationDto } from '@app/common';

@ApiTags('Teams')
@ApiBearerAuth()
@Controller('teams')
export class TeamController {
    constructor(private readonly teamService: TeamService) { }

    @UseGuards(JwtAuthGuard)
    @Post()
    @ApiOperation({ summary: 'Create a new team' })
    create(@Body() createTeamDto: CreateTeamDto, @Request() req) {
        return this.teamService.create(createTeamDto, req.user.userId);
    }

    @UseGuards(JwtAuthGuard)
    @Post(':id/members')
    @ApiOperation({ summary: 'Add members to the team' })
    @ApiBody({ type: [AddMemberDto] })
    addMembers(@Param('id') id: string, @Body(new ParseArrayPipe({ items: AddMemberDto })) dtos: AddMemberDto[], @Request() req) {
        return this.teamService.addMembers(id, dtos, req.user.userId);
    }

    @Get()
    @ApiOperation({ summary: 'List all teams' })
    @ApiResponse({ status: 200, description: 'Return all teams.' })
    findAll(@Query() paginationDto: PaginationDto, @Query('name') name?: string) {
        return this.teamService.findAll(paginationDto, name);
    }
}
