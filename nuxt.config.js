
export default {
  mode: 'universal',

  env:{
    //认证客户端url, process.env.authURL
    authURL:process.env.NODE_ENV === 'dev'? '//localhost:7000':'//106.15.63.69'
  },

  /*
  ** Headers of the page
  */
  head: {
    title: '博客社区',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'IT技术社区，白愁河博士' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },
  /*
  ** Customize the progress-bar color
  */
  loading: { color: '#fff' },
  /*
  ** 全局引入样式
  */
  css: [
    //针对element-ui组件的各种样式
    'element-ui/lib/theme-chalk/index.css',
    //引入自定义主题样式
    '@/assets/theme/index.css',
    //关于布局样式
    'element-ui/lib/theme-chalk/display.css',
    //项目自定义的全局样式
    '@/assets/css/global.css',
    //mavon-editor的全局样式，这种方式加载效率更高
    'mavon-editor/dist/css/index.css',
  ],
  /*
  ** Plugins to load before mounting the App
  安装后，饿了么UI实际是以插件的方式引入
  */
  plugins: [
    '@/plugins/element-ui.js',
    '@/plugins/interceptor.js',
    '@/api/article.js',
    '@/api/common.js',
    '@/api/question.js',
    '@/api/user.js',
    //注意：只能在客户端使用，window，MD编辑插件
    {src:'@/plugins/mavon-edit.js',mode:'client'}
  ],
  /*
  ** Nuxt.js dev-modules
  */
  buildModules: [
  ],
  /*
  ** Nuxt.js modules
  */
  // Modules (https://go.nuxtjs.dev/config-modules)
  //引入axios模块
  modules: [
    '@nuxtjs/axios',
    'cookie-universal-nuxt',  //针对服务端操作cookie
  ],
  axios:{
    proxy :true,//开启代理
    prefix: '/api' //请求接口添加前缀/api  例如访问test自动加上/api/test
  },
  proxy:{ //代理转发
    '/api':{
      target:'http://mengxuegu.com:7300/mock/5f6cac3e8d90085e5b584c61/blog-web',
      pathRewrite:{'^/api':''}  //去掉/api的操作
    },
  },
  /*
  ** Build configuration
  */
  build: {
    /*
    ** You can extend webpack config here
    将位于node)modules目下的element-ui导出，
    导出的时候需要将elementUI一起导出，transpile选择要匹配的文件
    */
    transpile:[/^element-ui/],
    //webpack自定义的配置
    extend (config, ctx) {
    }
  }
}
