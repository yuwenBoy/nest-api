// import { Connection } from "typeorm";
// import { Driver } from "./Driver";

 
// //驱动工厂类，用来根据连接创建指定类型数据库的驱动
// export class DriverFactory {
//     //驱动工厂根据连接实例创建驱动
//     create(connection: Connection): Driver {
//         //获取连接选项中的连接类型
//         const type = connection.options.type;
//         switch (type) {
//             case "mysql":
//                 return new MysqlDriver(connection);
//             case "postgres":
//                 return new PostgresDriver(connection);
//             case "mariadb":
//                 return new MysqlDriver(connection);
//             case "sqlite":
//                 return new SqliteDriver(connection);
//             case "cordova":
//                 return new CordovaDriver(connection);
//             case "sqljs":
//                 return new SqljsDriver(connection);
//             case "oracle":
//                 return new OracleDriver(connection);
//             case "mssql":
//                 return new SqlServerDriver(connection);
//             case "websql":
//                 return new WebsqlDriver(connection);
//             case "mongodb":
//                 return new MongoDriver(connection);
//             default:
//                 throw new MissingDriverError(type);
//         }
//     }
// }