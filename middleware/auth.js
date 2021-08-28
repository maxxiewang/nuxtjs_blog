//运行在服务端的
export default ({store, route, redirect})=>{

    //权限判断，是否通过身份认证
    if(!store || !store.state.userInfo){
        //未认证，则跳转认证中心
        //服务端的不能用window对象，利用redirect
        //window.location.href = `${process.env.authURL}?redirectURL=${window.location.href}`
        //不可以写死，用环境变量
        //route.path //相对路径  /article/edit 没有域名 
        const redirectURL = process.env._AXIOS_BASE_URL_.replace('api', '') + route.path
        
        redirect(`${process.env.authURL}?redirectURL=${redirectURL}`)
    }
}