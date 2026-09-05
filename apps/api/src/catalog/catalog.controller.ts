import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseEnumPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { PartTopic } from '@jw/shared';
import { CatalogService } from './catalog.service';
import { CreatePartTypeDto } from './dto/create-part-type.dto';
import { UpdatePartTypeDto } from './dto/update-part-type.dto';

@Controller('catalog/part-types')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get()
  list(
    @Query(
      'topic',
      new ParseEnumPipe(PartTopic, { optional: true }),
    )
    topic?: PartTopic,
  ) {
    return this.catalogService.list(topic);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.catalogService.getById(id);
  }

  @Post()
  create(@Body() dto: CreatePartTypeDto) {
    return this.catalogService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePartTypeDto) {
    return this.catalogService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.catalogService.remove(id);
  }
}
