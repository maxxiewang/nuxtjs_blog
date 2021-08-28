<template>
    <div>
        <ul class="note-list">
            <!-- 样式动态绑定了:item.imageUrl，如果是空则没有样式 -->           
            <li :class="{'have-img':item.imageUrl}" v-for="item in articleList" :key="item.id">
                <div class="content">
                    <nuxt-link :to="`/article/${item.id}`" target="_blank">
                    <p class="title">{{item.title}}</p>
                    <p class="abstract">
                        {{item.summary}}
                    </p>
                    </nuxt-link>
                    <div class="meta">
                        <nuxt-link :to="`/user/${item.userId}`" target="_blank" class="nickname">
                        <i class="el-icon-user-solid"></i>{{item.nickName}}
                        </nuxt-link>
                        <span><i class="el-icon-thumb"></i>{{item.thumhup}}</span>
                        <span><i class="el-icon-view"></i>{{item.viewCount}}</span>
                    </div>
                    <!-- 用v-if加个判断 -->
                    <div v-if="item.imageUrl">
                        <!-- 图片展示 -->
                        <nuxt-link :to="`/article/${item.id}`" target="_blank" class="wrap-img">
                            <img :src="item.imageUrl" alt="">
                        </nuxt-link>
                    </div>
                </div>
            </li>
        </ul>
        <!-- 为了这个按钮居中 -->
        <el-row type="flex" justify="center">
            <el-tag v-if="noMore" type="success">没有更多数据了</el-tag>
            <el-button v-else @click="load" type="primary" :loading="loading"  size="small" round>
                {{loading ? '加载中...':'点击加载更多'}}
            </el-button>
        </el-row>
    </div>
</template>
<script>
export default {
    data(){
        return {
            loading:false, //是否加载中
            noMore:false //判断数据是否查询完，为true则没有数据了
        }
    },
    //校验路由参数是否有效
    validate({params}){
        const id = params.id ? params.id :0
        //必须是数值，不是数值返回false，即访问不到这个组件
        return /^\d+$/.test(id)
    },
    //params用来获取请求参数 , app用来调用接口api
    async asyncData({params, app}) {
        //分类id为空，则表示推荐
        const categoryId = params.id ?params.id :null
        //查询文章列表
        const query = {categoryId,current:1,size:20}
        const {data} = await app.$getArticleList(query)
        // console.log('data>>>>>',data.records)
        // 这个query返回了，会data里面一起组合，不需要声明，直接this.query
        return {query, articleList:data.records}
    },
    methods: {
        //点击按钮，分页查询数据
        async load(){
            this.loading = true
            //将页码加1
            this.query.current++
            //这里面是客户端的方法，不能接收app
            const {data} = await this.$getArticleList(this.query)
            //判断是否有数据，这个data为上面结构赋值定义的
            if(data.records && data.records.length >0){
                this.noMore = false
                //将新数据追加到原有的数组中
                this.articleList = this.articleList.concat(data.records)

            }else{
                this.noMore = true
            }

            //当前加载完了
            this.loading = false
        }
    },
}
</script>

<style scoped>
@import '@/assets/css/blog/list.css'
</style>

