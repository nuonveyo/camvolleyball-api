import { Controller, Post, Body, UseGuards, Request, Get, Param, Patch } from '@nestjs/common';
import { TeamService } from './team.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateTeamDto } from './dto/create-team.dto';

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
}
