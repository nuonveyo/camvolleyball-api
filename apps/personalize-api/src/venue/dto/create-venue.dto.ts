import { IsString, IsOptional, IsNumber, IsArray, IsDecimal, IsEmail, IsUrl, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SportType } from '@app/common/database/enums/sport-type.enum';

export class CreateVenueDto {
    @ApiProperty({ example: 'Riverside Volleyball Court' })
    @IsString()
    name: string;

    @ApiProperty({ enum: SportType, required: false, default: SportType.VOLLEYBALL })
    @IsEnum(SportType)
    @IsOptional()
    sportType?: SportType;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ required: false })
    @IsArray()
    @IsOptional()
    @IsString({ each: true })
    images?: string[];

    @ApiProperty({ required: false })
    @IsArray()
    @IsOptional()
    @IsString({ each: true })
    videos?: string[];

    @ApiProperty({ default: 1 })
    @IsNumber()
    @IsOptional()
    numberOfPitches?: number;

    // Location
    @ApiProperty({ required: false })
    @IsNumber()
    @IsOptional()
    latitude?: number;

    @ApiProperty({ required: false })
    @IsNumber()
    @IsOptional()
    longitude?: number;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    addressDetail?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    city?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    country?: string;

    // Contact
    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    phoneNumber?: string;

    // Booking & Pricing
    @ApiProperty({ example: ['on_demand', 'fixed', 'set'] })
    @IsArray()
    @IsString({ each: true })
    bookingTypes: string[];

    @ApiProperty({ example: { on_demand: { price: 5, currency: 'USD' } } })
    @IsOptional()
    pricingPolicy?: any;
}

export class UpdateVenueDto extends CreateVenueDto { }
