<template>
    <div>
        <!-- 左（上下）右 -->
        <el-row type="flex">
            <!-- 左列 -->
            <el-col :md="18" :xs="24" :sm="24">
                <div class="article-left">
                    <el-card>
                        <!-- 标题 -->
                        <div class="article-title">
                            <h1>{{data.title}}</h1>
                            <div class="article-count">
                                <nuxt-link :to="`/user/${data.userId}`" target="_blank" class="nickname">
                                <i class="el-icon-user-solid"></i> {{data.nickName}}
                                </nuxt-link>
                                <span>
                                    <i class="el-icon-date"></i> {{getDateFormat(data.updateDate)}}
                                    <i class="el-icon-thumb"></i> {{data.thumhup}}
                                    <i class="el-icon-view"></i> {{data.viewCount}}
                                </span>
                                <!-- 跳转编辑 -->
                                <nuxt-link v-if="$store.state.userInfo && $store.state.userInfo.uid === data.userId" 
                                :to="{path:'/article/edit',query:{id:data.id}}" class="nickname">&nbsp;&nbsp;编辑</nuxt-link>
                            </div>
                            <el-tag style="margin:5px" v-for="item in data.labelList" :key="item.id" size="small">
                                {{item.name}}
                            </el-tag>
                        </div>
                        <!-- 文章内容 -->
                        <div class="article-content">
                            <!-- github的css文件，解析这个markdown-body标签 -->
                            <div class="markdown-body" v-html="data.htmlContent">
                                
                            </div>
                        </div>
                        <!-- 点赞 -->
                        <!-- plain为true时，不是深色，点赞为true，取消点赞为浅色 -->
                        <el-button @click="handleThumb" icon="el-icon-thumb" type="primary" size="small" :plain="!isThumb">
                            Like
                        </el-button>
                    </el-card>
                    <div>
                        <h2>评论区</h2>
                        <el-card v-if="!$store.state.userInfo">
                            <h4 >登录后参与交流、获取后续更新提醒 {{$store.state.userInfo}}</h4>
                            <div>
                                <!-- 这里面触发的是状态管里的方法，登录注册都一样 -->
                                <el-button @click="$store.dispatch('LoginPage')" type="primary" size="small">登录</el-button>
                                <el-button @click="$store.dispatch('LoginPage')" type="primary" size="small" plain>注册</el-button>
                            </div>
                        </el-card>
                        <!-- 引入评论组件 -->
                        <el-card>
                            <mxg-comment :userId="userId" :userImage="userImage"
                             :authorId="data.userId"
                             :showComment="$store.state.userInfo?true:false"
                             :commentList="commentList"
                             @doSend="doSend" @doChildSend="doChildSend"
                             @doRemove="doRemove"
                             >

                            </mxg-comment>
                        </el-card>
                    </div>
                </div>
            </el-col>
            <!-- 右列 -->
            <el-col :md="6" class="hidden-sm-and-down">
                <el-row>
                    <el-col>
                        <mxg-affix :offset="80">
                            <mxg-directory parentClass="article-content"></mxg-directory>
                        </mxg-affix>
                    </el-col>
                </el-row>
            </el-col>
        </el-row>
    </div>
</template>
<script>
//script下面也可以引入样式
import '@/assets/css/md/github-markdown.css'
import '@/assets/css/md/github-min.css'
import {dateFormat} from '@/utils/date.js'

//固钉
import MxgAffix from '@/components/common/Affix/index.vue'
//文章目录
import MxgDirectory from '@/components/common/Directory/index.vue'
//评论组件，默认找这个index.vue，可加可不加
import MxgComment from '@/components/common/Comment'

export default {
    //把固钉和文章目录组件，作为子组件导入进来
    components:{MxgAffix,MxgDirectory,MxgComment},

    //校验id为数值才可访问此组件
    validate({params}){
        //必须是数值，不是数值返回false，即访问不到这个组件
        return /^\d+$/.test(params.id)
    },
    /* nuxtjs提供的方法 */

    head(){
        return {
            title: this.data.title //浏览器的标题
        }
    },



    async asyncData({params, app}) {
        //1、查询文章详情
        const {data} = await app.$getArticleById(params.id)
        //2、更新文章浏览数:将本次查询文章的id保存到cookie中，如果cookie存在此文章id，则不更新浏览时，如果不存在则更新
        //当浏览器关闭后，自动将此文章cookie的值删除，再次打浏览器访问文章时，浏览时+1
        

        //a.判断当前cookie中是否存在此文章id
        //状态管理时，serverinit里面有提过？？
        //取一个key值 
        const isView = app.$cookies.get(`article-view-${params.id}`)
        //判断是否浏览过，true还是false
        if(!isView){
            //没有值，更新浏览数
            const {code} = await app.$updateArticleViewCount(params.id)
            if(code === 20000){
                //浏览时+1
                data.viewCount++
                //保存cookie中，关闭浏览器后会被删除
                app.$cookies.set(`article-view-${params.id}`, true)
            }
        }

        /* 通过文章id查询评论列表信息 */
        // :commentList 动态绑定获得的数据，传递给子组件
        // 通过await返回来的值，会和Vue里面的data数据进行合并，所以data里面可以不声明
        const {data:commentList} = await app.$getCommentListByArticleId(params.id)
        return {data,commentList}
    },

    data(){
        return{
            //是否点赞，从cookie里面获取
            //如果是在服务端，则需要在上下的app里面获取
            isThumb:this.$cookies.get(`article-thumb-${this.$route.params.id}`) || false,
            userId:this.$store.state.userInfo && this.$store.state.userInfo.uid,
            userImage:this.$store.state.userInfo && this.$store.state.userInfo.imageUrl,
            commentList:[]
        }
    },

    methods: {
        getDateFormat(date){
            // console.log(this.isThumb)
            return dateFormat(date)
            
        },
        //点赞逻辑
        async handleThumb(){
            //取消点赞或是点赞
            this.isThumb = !this.isThumb
            // 1为点赞，-1为取消点赞
            const count = this.isThumb? 1:-1
            //获取当前的文章Id,articleId，普通方法，是在客户端的
            const articleId = this.$route.params.id
            //--- 客户端调用方法的示例
            const {code} = await this.$updateArticleThumb(articleId,count)
            if(code === 20000){
                //更新当前文章显示的点赞数，不查询数据库
                this.data.thumhup = (this.data.thumhup-0) + count
                //保存到cookie，永远保存
                this.$cookies.set(`article-thumb-${this.$route.params.id}`,this.isThumb,{
                    maxAge:60*60*24*365*5
                })
            }
        },
        /* 公共的评论区，把评论的内容传递过来 */
        doSend(content){
            // console.log('>>>>>>>>>>>',content)
            // const data = {
            //     //后台需要接收评论的内容，key和value一样，也可以用content直接表示
            //     content:content,
            //     //没有父评论就给一个-1，如果有就是具体的父评论id传递过来
            //     parentId:-1,
            //     articleId:this.$route.params.id,
            //     userId:this.userId,
            //     userImage:this.userImage,
            //     //如果store里面有值的话，取store里面的值
            //     nickName:this.$store.state.userInfo && this.$store.state.userInfo.nickName
            // }
            // this.$addComment(data).then(response =>{
            //     //新增评论成功
            //     console.log(response)
            //     if(response.code === 20000){
            //         //刷新评论信息
            //         this.refreshComment()
            //     }
            // })
            /* 直接调用回复组件，parentId给一个默认值-1 */
            this.doChildSend(content)
        },
        /* 回复 ,传参评论内容，和父级评论id*/
        doChildSend(content, parentId = "-1"){
            console.log('回复方法', content, parentId)
            const data = {
                content:content,
                parentId:parentId,
                articleId:this.$route.params.id,
                userId:this.userId,
                userImage:this.userImage,
                nickName:this.$store.state.userInfo && this.$store.state.userInfo.nickName
            }
            this.$addComment(data).then(response =>{
                //新增评论成功
                console.log(response)
                if(response.code === 20000){
                    //刷新评论信息
                    this.refreshComment()
                }
            })
        },
        /* 删除 */
        async doRemove(id){
            console.log('删除方法',id)
            const {code} = await this.$deleteCommentById(id)
            if(code === 20000){
                this.refreshComment()
            }
        },
        /* 抽取查询评论列表方法 */
        async refreshComment(){
            //取一个别名？？？？？？？？？
            const {data} = await this.$getCommentListByArticleId(this.$route.params.id)
            this.commentList = data
        }
    },
}
</script>
<style scoped>
@import '@/assets/css/blog/article.css';
</style>