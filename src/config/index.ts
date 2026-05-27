import { readFileSync } from 'fs';
import { join } from 'path';

const configFileNameObj = {
  development: 'dev',
  test: 'test',
  production: 'prod',
  docker: 'docker',
};

const env = process.env.NODE_ENV || 'development';

export default () => {
  const yaml = require('js-yaml');

  // 关键：打包后，代码运行在 dist/ 目录下
  // __dirname 在打包后是 dist/config/，所以需要向上一层到 dist/，再找 config/xxx.yml
  const configPath = join(__dirname, `${configFileNameObj[env]}.yml`);
  console.log('当前读取配置文件路径：', configPath);

  return yaml.load(readFileSync(configPath, 'utf8')) as Record<string, any>;
};