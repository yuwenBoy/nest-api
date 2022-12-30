 
// //驱动接口
// export interface Driver {
//     //基本连接选项
//     options: BaseConnectionOptions;
//     //数据库名，当开启复制模式时，作为执行写操作的主数据库
//     database?: string;
//     //是否开启复制
//     isReplicated: boolean;
//     //指明驱动是否支持树表
//     treeSupport: boolean;
//     //驱动支持的列数据类型
//     supportedDataTypes: ColumnType[];
//     //长度、标度、精度的默认值，当长度、标度、精度未指定时使用
//     dataTypeDefaults: DataTypeDefaults;
//     //这个驱动中支持length属性的数据库列类型
//     withLengthColumnTypes: ColumnType[];
//     //orm指定的数据库列
//     mappedDataTypes: MappedColumnTypes;
//     //执行连接到数据库，根据数据库类型，可能创建一个连接池
//     connect(): Promise<void>;
//     //连接之后钩子
//     afterConnect(): Promise<void>;
//     //断开连接
//     disconnect(): Promise<void>;
//     //同步数据库模式
//     createSchemaBuilder(): SchemaBuilder;
//     //创建查询运行器，可以指定主从模式
//     createQueryRunner(mode: "master"|"slave"): QueryRunner;
//     //替换sql语句中的参数
//     escapeQueryWithParameters(sql: string, parameters: ObjectLiteral): [string, any[]];
//     //转义表名、列名
//     escape(tableName: string): string;
//     //根据元数据，将给定值转换为要被持久化的值
//     preparePersistentValue(value: any, column: ColumnMetadata): any;
//     //?
//     prepareHydratedValue(value: any, column: ColumnMetadata): any;
//     //转换给定列类型为数据库列类型
//     normalizeType(column: { type?: ColumnType, length?: number | string, precision?: number, scale?: number, isArray?: boolean }): string;
//     //规范化列的默认值
//     normalizeDefault(column: ColumnMetadata): string;
//     //规范化unique属性
//     normalizeIsUnique(column: ColumnMetadata): boolean;
//     //考虑默认长度值，计算列长度
//     getColumnLength(column: ColumnMetadata): string;
//     //?
//     createFullType(column: TableColumn): string;
//     //从主数据库获取一个新的数据库连接，用来进行复制
//     obtainMasterConnection(): Promise<any>;
//     //从从属数据库获取一个新的数据库连接
//     obtainSlaveConnection(): Promise<any>;
// }