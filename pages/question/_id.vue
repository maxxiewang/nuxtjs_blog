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
                                :to="{path:'/question/edit',query:{id:data.id}}" class="nickname">&nbsp;&nbsp;编辑</nuxt-link>
                            </div>
                            <el-tag style="margin:5px" v-for="item in data.labelList" :key="item.id" size="small">
                                {{item.name}}
                            </el-tag>
                        </div>
                        <!-- 问题内容 -->
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
                        <h2>精彩评论</h2>
                        <!-- 引入评论组件 -->
                        <el-card v-if="!commentList ||commentList.length ===0">
                            暂无回答
                        </el-card>
                        <!-- 每个回答是一个card -->
                        <el-card v-else v-for="comment in commentList" :key="comment.id">
                            <!-- 评论组件渲染出口 -->
                            <mxg-comment :showComment="false" :commentList="[comment]" 
                             :userId="userId" :userImage="userImage"
                             :authorId="data.userId"
                             @doChildSend="doChildSend"
                             @doRemove="doRemove"
                             >
                            </mxg-comment>
                        </el-card> 
                    </div>
                    <div>
                        <h2>编写回答</h2>
                        <el-card v-if="!$store.state.userInfo">
                            <h4 >登录后参与交流、获取后续更新提醒 {{$store.state.userInfo}}</h4>
                            <div>
                                <!-- 这里面触发的是状态管里的方法，登录注册都一样 -->
                                <el-button @click="$store.dispatch('LoginPage')" type="primary" size="small">登录</el-button>
                                <el-button @click="$store.dispatch('LoginPage')" type="primary" size="small" plain>注册</el-button>
                            </div>
                        </el-card>
                        <div v-else>
                            <!-- 
                                ref 就是唯一标识，相当于id
                                v-model绑定的是markdown输入框的内容
                            -->
                            <mavon-editor ref="md" v-model="mdContent" @change="getMdHtml"
                                @imgAdd="uploadContentImg" @imgDel="delContentImg"
                                />
                            <el-row style="margin-top:20px" type="flex" justify="center">
                                <el-button type="primary" @click="submitReplay">Commit</el-button>
                            </el-row>
                        </div>
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
//问题目录
import MxgDirectory from '@/components/common/Directory/index.vue'
//评论组件，默认找这个index.vue，可加可不加
import MxgComment from '@/components/common/Comment'

export default {
    //把固钉和问题目录组件，作为子组件导入进来
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
        //1、查询问题详情
        const {data} = await app.$getQuestionById(params.id)
        
        //2、更新问题浏览数
        const isView = app.$cookies.get(`question-view-${params.id}`)
        //判断是否浏览过，true还是false
        if(!isView){
            //没有值，更新浏览数
            const {code} = await app.$updateQuestionViewCount(params.id)
            if(code === 20000){
                //浏览数+1
                data.viewCount++
                //保存cookie中，关闭浏览器后会被删除
                app.$cookies.set(`question-view-${params.id}`, true)
            }
        }

        //3、通过问题id查询所有回答列表信息
        const {data:commentList} = await app.$getReplayByQuestionById(params.id)
        return {data,commentList}
    },

    data(){
        return{
            //是否点赞，从cookie里面获取
            //如果是在服务端，则需要在上下文的app里面获取
            isThumb:this.$cookies.get(`question-thumb-${this.$route.params.id}`) || false,
            userId:this.$store.state.userInfo && this.$store.state.userInfo.uid,
            userImage:this.$store.state.userInfo && this.$store.state.userInfo.imageUrl,
            commentList:[],
            mdContent:'',   //回答内容，md格式
            htmlContent:''  //html格式
        }
    },

    methods: {
        getDateFormat(date){
            return dateFormat(date)
            
        },
        //点赞逻辑
        async handleThumb(){
            //取消点赞或是点赞
            this.isThumb = !this.isThumb
            // 1为点赞，-1为取消点赞
            const count = this.isThumb? 1:-1
            //获取当前的问题Id，questionId，普通方法，是在客户端的
            const questionId = this.$route.params.id
            //--- 客户端调用方法的示例
            const {code} = await this.$updateQuestionThumb(questionId,count)
            if(code === 20000){
                //更新当前问题显示的点赞数，不查询数据库
                this.data.thumhup = (this.data.thumhup-0) + count
                //保存到cookie，永远保存
                this.$cookies.set(`question-thumb-${this.$route.params.id}`,this.isThumb,{
                    maxAge:60*60*24*365*5
                })
            }
        },
        
        /* 回复 ,传参评论内容，和父级评论id*/
        doChildSend(htmlContent, parentId = "-1",mdContent=''){
            const data = {
                htmlContent,    //存放回复信息，回答中的md格式内容也是传到这个属性中
                mdContent,      //md格式内容
                parentId:parentId,
                questionId:this.$route.params.id,
                userId:this.userId,
                userImage:this.userImage,
                nickName:this.$store.state.userInfo && this.$store.state.userInfo.nickName
            }
            this.$addReplay(data).then(response =>{
                //新增评论成功
                if(response.code === 20000){
                    //刷新评论信息
                    this.refreshReplay()
                }
            })
        },
        /* 删除 */
        async doRemove(id){
            console.log('删除方法',id)
            const {code} = await this.$deleteReplayById(id)
            if(code === 20000){
                this.refreshReplay()
            }
        },
        /* 抽取查询评论列表方法 */
        async refreshReplay(){
            //取一个别名？？？？？？？？？
            const {data} = await this.$getReplayByQuestionById(this.$route.params.id)
            console.log(data)
            this.commentList = data
        },
        //获取问答输入框的内容
        getMdHtml(mdContent, htmlContent){
            this.mdContent = mdContent
            this.htmlContent = htmlContent
        },
        //上传回答内容图片
        uploadContentImg(pos,file){
             // console.log('上传内容图片：',file,pos)
        // 封装表单数据
        const fd = new FormData()
        fd.append('file',file)
        this.$uploadImg(fd).then(response =>{
            if(response.code === 20000){
          //上传成功，回显
          console.log('上传成功，回显>>>>>',pos,response.data)
          this.$refs.md.$img2Url(pos,response.data)
            }
         })
        },
        //删除回答内容图片
        delContentImg(urlAndFileArr){
            const fileUrl = urlAndFileArr[0]  //图片url
            const file = urlAndFileArr[1]  //File对象
            this.$deleteImg(fileUrl).then(response =>{
                if(response.code === 20000){
                console.log("删除成功")
                }
            })
        },
        //提交问答
        submitReplay(){
            //发送回答信息
            if(this.htmlContent){
                this.doChildSend(this.htmlContent, -1, this.mdContent)
            }else{
                this.$message.error('请输入内容')
            }
        }
    },
}
</script>
<style scoped>
@import '@/assets/css/blog/article.css';
</style>