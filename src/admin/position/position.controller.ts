import { Controller} from '@nestjs/common';

import { PositionService } from './position.service';

/***
 * author：zhao.jian
 * createTime：2023-3-8 21:39:18
 * description：职位控制器模块
 */
@Controller('position')
export class PositionController {
  constructor(private readonly positionService: PositionService) {}
}
