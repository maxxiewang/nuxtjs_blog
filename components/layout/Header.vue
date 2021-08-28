<template>
    <div class="mxg-header mxg-header-fixed">
        <div class="mxg-nav">
            <el-row type="flex" justify="space-between">
                <!-- 一共24个格子，利用:span进行分配 -->
                <!-- Logo， 任意宽度都是占4格-->
                <el-col class="logo" :xs="4" :sm="4" :md="4">
                    <nuxt-link to="/">
                        <img src="@/assets/images/logo.png" alt="" height="40px">
                    </nuxt-link>
                </el-col>
                <!-- 当<768px时(手机) 占用格子设置为0 :xs="0"-->
                <el-col class="hidden-sm-and-down" :md="10">
                    <el-menu 
                    :default-active="defaultActive"
                    router
                    active-text-color="#009A61"
                    background-color="#fafafa"
                     mode="horizontal">
                        <el-menu-item index="/">博客</el-menu-item>
                        <el-menu-item index="/question">问答</el-menu-item>
                        <el-menu-item index="/label">标签</el-menu-item>                        
                        </el-menu>
                </el-col>
                <!-- 登录、注册/头像 手机与平板坚屏都占18格，其他占8格-->
                <el-col class="nav-right" :xs="18" :sm="18" :md="8">
                    <div class="nav-sign">
                        <el-button type="text">管理后台</el-button>
                        <el-button v-if="!userInfo" type="text" @click="$store.dispatch('LoginPage')">登录</el-button>
                        <el-button v-if="!userInfo" type="primary" @click="$store.dispatch('LoginPage')" round size="small">注册</el-button>
                    </div>
                    <el-dropdown @command="handleCommand">
                        <div class="el-dropdown-link">
                            <el-avatar icon="el-icon-user-solid" :src="userInfo?userInfo.imageUrl:null"></el-avatar>
                        </div>
                        <el-dropdown-menu slot="dropdown">
                            <el-dropdown-item command="article">新建博客</el-dropdown-item>
                            <el-dropdown-item command="question">新建问题</el-dropdown-item>
                            <el-dropdown-item command="user">我的主页</el-dropdown-item>   
                            <el-dropdown-item v-if="userInfo" command="logout">退出</el-dropdown-item>                         
                        </el-dropdown-menu>
                    </el-dropdown>
                </el-col>
        </el-row>
        </div>
    </div>
</template>
<script>
export default {

    computed: {
        userInfo(){
            return this.$store.state.userInfo
        },
        //高度显示导航标签
        defaultActive(){
            // 获取当前请求的路由地址
            // console.log('获取当前请求的路由地址>',this.$route.matched[0].path)

            // 是否存在多级子路由，没有值则是首页 /
            let routePath = this.$route.matched[0].path || '/'

            //如果是动态路由，只取前面一级路由 /question/:id 或是 /article/:id?
            if (routePath.indexOf('/',1)!== -1) {
                // 不等于 -1 即为找到了 , 没有找到会返回 -1
                // 截取一级路由
                routePath = routePath.substring(0,routePath.indexOf('/',1))
            }
            // /article 传为/ 博客模块
            return routePath.indexOf('/article')!== -1 ?'/':routePath
        }
    },
    methods: {
        handleCommand(command){
            //这个$message是ele框架提供的
            // this.$message('点击了'+command)
            if(!this.userInfo){
                //如果没有登录，则跳转登录页，调用store里面的action
                return this.$store.dispatch('LoginPage')
            }
            switch(command){
                case'article':
                //以新窗口方式，打开文章窗口
                let routeData = this.$router.resolve('/article/edit')
                window.open(routeData.href,'_blank')
                //如果当前窗口，则是 this.$router.push('/article/edit')                
                break;
                case'question':
                //上面己经声明了routeData，只能直接引用，不可重复声明
                routeData = this.$router.resolve('/question/edit')
                window.open(routeData.href,'_blank')            
                break;
                case'user':
                routeData = this.$router.resolve('/user')
                window.open(routeData.href,'_blank')  
                break;
                case'logout':
                //触发UserLogout
                this.$store.dispatch('UserLogout')   
                break;
            }
            this.$message('点击了'+command)
        }
    },
}
</script>
<style scoped>
.mxg-header {
    width: 100%;
    height: 60px;
    background-color: #fafafa;
    border-top: 3px solid #009A61;
    box-shadow: 0 2px 10px rgba(0,0,0,.12);
    z-index: 1501
}
/* 固定头部 */
.mxg-header-fixed {
  position: fixed;
  top:0px;
}
/* 导航 */
.mxg-header .mxg-nav {
  max-width: 1140px;
  /* 居中 */
  margin: auto; 
  padding: 10px;
} 

.el-menu.el-menu--horizontal {
  /* 去除底部边框 */
  border-bottom: 0px;
  margin-top: -10px;
}

/* 导航右侧 */
.nav-right {
  text-align: right;
}
.nav-sign {
  position: absolute;
  right: 0;
  margin-right: 50px;
}

/* 防止点击头像有边框 */
div:focus {
  outline: none;  
}
</style>