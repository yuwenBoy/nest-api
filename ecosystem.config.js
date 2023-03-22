module.exports = {
    // apps是一个json结构的数组 ，每一个数组成员对应一个pm2中运行的应用
    apps : [
      {
        // 应用程序名称
        name: 'nuxt-snow',
        // 执行文件
        script: 'index.js',
        // 应用程序所在的目录
        cwd: './',
        // 传递给脚本的参数
        args: '',
        // 指定的脚本解释器
        interpreter: '',
        // 传递给解释器的参数
        interpreter_args: '',
        // 是否启用监控模式，默认是false。如果设置成true，当应用程序变动时，pm2会自动重载。这里也可以设置你要监控的文件。
        watch: true, // watch: './',
        // 不用监听的文件
        ignore_watch: [
          'node_modules',
          'logs'
        ],
        // 应用程序启动模式，这里设置的是 cluster_mode（集群），默认是fork
        exec_mode: 'fork',
        // 应用启动实例个数，仅在cluster模式有效 默认为fork；或者 max
        instances: 1,
        // 最大内存限制数，超出自动重启
        max_memory_restart: 8,
        // 自定义应用程序的错误日志文件(错误日志文件)
        error_file: './logs/app-err.log',
        // 自定义应用程序日志文件(正常日志文件)
        out_file: './logs/app-out.log',
        // 设置追加日志而不是新建日志
        merge_logs: true,
        // 指定日志文件的时间格式
        log_date_format: 'YYYY-MM-DD HH:mm:ss',
        // 最小运行时间，这里设置的是60s即如果应用程序在* 60s内退出，pm2会认为程序异常退出，此时触发重启 max_restarts设置数量，应用运行少于时间被认为是异常启动
        min_uptime: '60s',
        // 设置应用程序异常退出重启的次数，默认15次（从0开始计数）,最大异常重启次数，即小于min_uptime运行时间重启次数；
        max_restarts: 10,
        // 启用/禁用应用程序崩溃或退出时自动重启，默认为true, 发生异常的情况下自动重启
        autorestart: true,
        // 定时启动，解决重启能解决的问题，crontab时间格式重启应用，目前只支持cluster模式;
        cron_restart: '',
        // 异常重启情况下，延时重启时间
        restart_delay: '60s',
        // 环境配置
        // env: {
        //   // 公共变量
        //   COMMON_VARIABLE: true
        // },
        // 生产环境配置
        // $ pm2 start app.js --env
        env: {
            // 环境参数，当前指定为开发环境
            NODE_ENV: 'development',
            DOTENV_CONFIG_PATH: '.env.development',
          },
          env_production: {
            // 环境参数,当前指定为生产环境
            NODE_ENV: 'production',
          },
          env_test: {
            // 环境参数,当前为测试环境
            NODE_ENV: 'test',
          },
      }
    ],
   
    // 环境部署
    deploy : {
      // 生成环境
      // 1、上传代码到云端仓库
      // 2、部署命令预览：
      // 首次部署: $ pm2 deploy ecosystem.json production setup 
      // 更新版本: $ pm2 deploy ecosystem.json production update 
      // 返回上一个版本: $ pm2 deploy ecosystem.json production revert 1 
      // 3、执行首次部署：$ pm2 deploy ecosystem.json production setup
      // 4、执行部署运行：$ pm2 deploy ecosystem.json production
      // 5、看到 success 成功，报错看错误自行百度
      production : {
        // ssh的用户名，登录远程服务器的用户名
        user : 'snow',
        // 要发布的机器，远程服务器的IP或hostname，此处可以是数组同步部署多个服务器
        host : '10.0.0.0',
        // 服务器端口
        port : 3000,
        // 要发布的代码分支，远端名称及分支名
        ref  : 'origin/master',
        // 代码Git仓库地址
        repo : 'git@gitlab.dzm.net:dzm/nuxt-test',
        // 服务器存储代码地址，远程服务器部署目录，需要填写user具备写入权限的目录，也就是服务器存放上面git库代码的地方
        // path : '/usr/local/var/www/production',
        // ssh权限配置
        // 'ssh_options': 'StrictHostKeyChecking=no',
        'ssh_options': ['StrictHostKeyChecking=no', 'PasswordAuthentication=no'],
        // 1、在 setup 前触发，如安装 git
        'pre-setup': '',
        // 2、在 setup 后触发，如做一些其他配置
        'post-setup': '',
        // 3、在 deploy 前触发，执行本地脚本
        'pre-deploy-local': '',
        // 4、在 deploy 前触发，执行远程脚本
        'pre-deploy': 'git fetch --all',
        // 5、在 deploy 后触发，执行远程脚本，如 npm install，部署后需要执行的命令
        // 'post-deploy' : 'npm install && pm2 startOrRestart ecosystem.config.js --env production',
        'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production',
        // 环境变量
        'env'  : {
          // 指定为生成环境
          'NODE_ENV': 'production'
        }
      }
    }
  };