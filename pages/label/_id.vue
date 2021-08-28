<template>
    <div>
        <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/label' }">标签</el-breadcrumb-item>
            <el-breadcrumb-item :to="{path:$route.path, query:{name :$route.query.name}}">
                {{$route.query.name}}
            </el-breadcrumb-item>
            <el-breadcrumb-item>标签动态</el-breadcrumb-item>
        </el-breadcrumb>

        <!--  -->
        <div class="label-tab">
            <el-tabs value="question" type="card" @tab-click="handleClick">
                <el-tab-pane label="技术问答" name="question">
                    <question-list name="question" :page="page" :listData="questionList" @fetch-data="fetchData"/>
                </el-tab-pane>
                <el-tab-pane label="博客文章" name="article">
                    <article-list name="article" :page="page" :listData="articleList" @fetch-data="fetchData"/>
                </el-tab-pane>
            </el-tabs>
        </div>
    </div>
</template>

<script>
import QuestionList from '@/components/question/List'
import ArticleList from '@/components/article/List'

export default {
    components:{QuestionList,ArticleList},
    //校验标签id
    validate({params}){
        return /^\d+$/.test(params.id)
    },
    data() {
        return {
            articleList:[]  // 文章列表数据
        }
    },

    methods: {
        handleClick(tab){
            //切换标签页查询对应第1页的数据
            this.fetchData(tab.paneName, 1)
        },

        //切换页码时，获取分页数据（标签名，当前页码）
        async fetchData(pageName,current){
            this.page.current = current
            //请求接口响应的对象
            let response = null
            switch (pageName) {
                case 'question':
                    response = await this.$getQuestionByLabelId(this.page, this.$route.params.id)
                    this.page.total = response.data.total
                    this.questionList = response.data.records
                    break;
                case 'article':
                    // 封装标签id和分页对象
                    // ES6语法，加三个点，进行对象的合并。
                    // 最后合并成 {current:1, size:20 ,total:0, labelId:10}
                    const query ={...this.page,labelId:this.$route.params.id}
                    response = await this.$getArticleList(query)
                    this.page.total = response.data.total
                    this.articleList = response.data.records
                    break;              
            }
        },
    },
    async asyncData({params,app}) {
        //首次加载页面，查询技术问题列表
        const page ={ //分页对象
            current:1,
            size:20,
            total:0
        }
        const {data} = await app.$getQuestionByLabelId(page,params.id)
        page.total = data.total
        return {page,questionList:data.records}
    },
}
</script>
<style scoped>
    .label-tab{
        margin-top:25px;

    }
</style>