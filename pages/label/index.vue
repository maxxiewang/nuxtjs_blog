<template>
    <div class="label-main">
        <el-row :gutter="10">
            <el-col :xs="24" :sm="24" :md="6" v-for="category in data" :key="category.id">
                <el-card shadow="hover">
                    <div slot="header">
                        <!-- 分类名 -->
                        <span>{{category.name}}</span>
                    </div>
                        <!-- 分类下的标签 -->
                    <div>
                        <nuxt-link :to="{path: `/label/${label.id}`,query:{name: label.name}}" 
                        v-for="label in category.labelList" :key="label.id">                       
                            <el-tag size="small">{{label.name}}</el-tag>
                        </nuxt-link>
                    </div>
                </el-card>
            </el-col>
        </el-row>
    </div>
</template>
<script>
export default {
    async asyncData({app}) {
        //查询分类的和标签
        const {data} = await app.$getCategoryAndLael()
        return {data}
    },
}
</script>
<style scoped>
.label-main{
    margin: 0 10px;
}
.el-col {
    margin-bottom: 20px;
}
.el-tag {
    margin-right: 5px;
}
.el-tag:hover {
    border-bottom: 1px solid #345DC2;
}
.el-card {
    height: 200px;
}
</style>