//导出默认实例
export default({$axios},inject) =>{

    //查询技术频道列表接口
    //即为将getCategoryList方法注入到context/vue/store当中去，以插件的形式
    inject('getCategoryList',()=>$axios.$get('/article/api/category/list'))

    //获取指定位置的广告信息
    inject('getAdverLIst',position =>$axios.$get(`/article/api/advert/show/${position}`))

    //文章列表分页接口
    inject('getArticleList',query =>$axios.$post('/article/api/article/list',query))

    //查询文章详情
    inject('getArticleById',id =>$axios.$get(`/article/api/article/${id}`))

    //更新文章浏览数
    inject('updateArticleViewCount',id =>$axios.$put(`article/api/article/viewCount/${id}`))

    //更新点赞数
    inject('updateArticleThumb',(articleId, count) =>$axios.$put(`article/article/thumb/${articleId}/${count}`))

    //通过文章id查询评论列表
    inject('getCommentListByArticleId',(articleId) =>$axios.$get(`article/api/comment/list/${articleId}`))

    //新增评论
    inject('addComment',data =>$axios.$post(`/article/comment`,data))

    //删除评论
    inject('deleteCommentById',id =>$axios.$delete(`/article/comment/${id}`))

    //获取所有正常状态的分类及标签
    inject('getCategoryAndLael',() =>$axios.$get(`/article/api/category/label/list`))

    //新增文章 /article/article
    inject('addArticle', data =>$axios.$post(`/article/article`,data))

    //更新文章 
    inject('updateArticle', data =>$axios.$put(`/article/article`,data))
}