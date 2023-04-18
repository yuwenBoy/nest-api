import { readFileSync } from 'fs'
import { join } from 'path'

const configFileNameObj = {
  development :'dev',
  test: 'test',
  production: 'prod',
  docker: 'docker'
}

const env = process.env.NODE_ENV

export default () => {
  let yaml = require("js-yaml");
  return yaml.load(readFileSync(join(__dirname, `./dev.yml`), 'utf8')) as Record<string, any>
  // return yaml.load(readFileSync(join(__dirname, `./${configFileNameObj[env]}.yml`), 'utf8')) as Record<string, any>
}
