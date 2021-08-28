<template>
    <div>
        <el-tabs value="hot" type="card" @tab-click="handleClick">
            <el-tab-pane label="热门回答" name="hot"> 
                 <List name="hot" :listData="listData" :page="page" @fetch-data="fetchData"/> 
            </el-tab-pane>
            <el-tab-pane label="最新问答" name="new">
                 <List name="new" :listData="listData" :page="page" @fetch-data="fetchData"/> 
            </el-tab-pane>
            <el-tab-pane label="等待回答" name="wait">
                 <List name="wait" :listData="listData" :page="page" @fetch-data="fetchData"/> 
            </el-tab-pane>
        </el-tabs>
    </div>
</template>
<script>
//评论子组件
import List from '@/components/question/list.vue'

export default {

    components:{List},

    methods: {
        //方法接收一个tab对象，通过tab.paneName获取name值 
        handleClick(tab){
            // console.log(tab.paneName)
            this.fetchData(tab.paneName, 1)
        },
        // 获取分页数据（标签名，当前页码）
        async fetchData(pageName,current){
            //分页查询数据
            this.page.current = current
            switch (pageName) {
                case 'hot':
                    //查询热门
                    var response = await this.$getHotList(this.page)
                    break;
                case 'new':
                    //查询最新
                    var response = await this.$getNewList(this.page)
                    break;
                case 'wait':
                    //查询等待回答
                    var response = await this.$getWaitList(this.page)
                    break;
                default:
                    break;
            }
            if(response && response.code === 20000){
                //查询成功后，更新总记录数
                this.page.total = response.data.total
                this.listData = response.data.records
            }
        },
    },

    async asyncData({app}) {
        var page = {
            size:20,    //每页20条
            total:0,    //总记录数，还没开始查，所以定义为1
            current:1,  //当前页码            
        }
        const {data} = await app.$getHotList(page)
        //赋值总记录数
        page.total = data.total
        
        return {page,listData: data.records}
    },
}
</script>