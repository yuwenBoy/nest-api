
import { join } from 'path';
export default {
    type: 'mysql', // 数据库类型
    host: '127.0.0.1',
    port: 3306, // 端口
    username: 'root',
    password: '123456',
    database: 'zj_db_system',
    entities: [join(__dirname, './entities', '**/**.entity{.ts,.js}')],// 扫描本项目中.entity.ts 或者.entity.js的文件
    synchronize: false, // 定义数据库表结构与实体类字段同步（这里一旦数据库少了字段就会自动加入，根据需要来使用）
};