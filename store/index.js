//nuxt 声明状态，必须是function
const state = () =>({
    userInfo: null,
    accessToken: null,
    refreshToken: null
})

// 改态状态值
const mutations = {
    //状态置空
    RESET_USER_STATE(){
        state.userInfo = null
        state.accessToken = null
        state.refreshToken = null
    },
    //更新状态
    UPDATE_ALL_STATE(state,data){
        state.userInfo = data.userInfo
        state.accessToken = data.accessToken
        state.refreshToken = data.refreshToken
    }
}

// 定义行为
const actions = {
    // nuxt提供的，每次发送请求都会先调用此方法，并且该方法的第二个参数是context，STORE为第一个参数    
    nuxtServerInit({commit},{app}){        
        const data={}
        data.userInfo = app.$cookies.get('userInfo')
        data.accessToken = app.$cookies.get('accessToken')
        data.refreshToken = app.$cookies.get('refreshToken')
        //更新状态值 
        commit('UPDATE_ALL_STATE',data)
    },
    //跳转登录页面
    LoginPage({commit}){
        commit('RESET_USER_STATE')
        //跳转认证客户端（登录页）， redirectURL作为请求参数，参数值是引发跳转的地址
        //window是属于浏览器的对象，所以在触发这个action时，只能在客户端进行解发，不能在服务端触发
        window.location.href = `${process.env.authURL}?redirectURL=${window.location.href}`
    },

    UserLogout({commit}){
        //1，重置状态
        commit('RESET_USER_STATE')
        //2，跳转认证客户端实现退出
        window.location.href = `${process.env.authURL}/logout?redirectURL=${window.location.href}`
    }
}

//不要忘记导出
export default {
    state,
    mutations,
    actions
}