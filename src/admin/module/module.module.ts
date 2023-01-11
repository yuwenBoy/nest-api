import { Module as NESTModule } from '@nestjs/common';

import { ModuleController } from './module.controller';
import {  ModuleService } from './module.service';

import { TypeOrmModule } from '@nestjs/typeorm';
import { Module} from '../../entities/t_module.entity';

@NESTModule({
  imports: [TypeOrmModule.forFeature([Module])],
  controllers: [ModuleController],
  providers: [ModuleService],
})
export class ModuleNESTModule {}
