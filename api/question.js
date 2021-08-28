export default ({$axios},inject)=>{

    //获取热门问答
    inject('getHotList',page =>$axios.$post('/question/api/question/hot',page))

    //获取最新问答
    inject('getNewList',page =>$axios.$post('/question/api/question/new',page))

    //获取等待问答
    inject('getWaitList',page =>$axios.$post('/question/api/question/wait',page))

    //通过id查询问题详情
    inject('getQuestionById',id =>$axios.$get(`/question/api/question/${id}`))

    //更新问题浏览数
    inject('updateQuestionViewCount',id =>$axios.$put(`/question/api/question/viewCount/${id}`))
    
    //通过问题id查询回复数据接口
    inject('getReplayByQuestionById', questionId =>$axios.$get(`/question/api/replay/list/${questionId}`))

    //更新点赞数
    inject('updateQuestionThumb', (questionId,count) =>$axios.$put(`/question/question/thumb/${questionId}/${count}`))

    //新增问题回答内容
    inject('addReplay', data =>$axios.$post('/question/replay',data))

    //删除回答内容，id 是回答内容的id
    inject('deleteReplayById',id =>$axios.$delete(`/question/replay/${id}`))

    //新增问题接口
    inject('addQuestion',data =>$axios.$post(`/question/question`,data))

    //更新问题接口
    inject('updateQuestion',data =>$axios.$put(`/question/question`,data))

    //通过标签id查询问题列表
    inject('getQuestionByLabelId',(page,labelId) =>$axios.$post(`/question/api/question/list/${labelId}`,page))

    //通过标签id查询问题列表
    inject('getQuestionByLabelId',(page,labelId) =>$axios.$post(`/question/api/question/list/${labelId}`,page))

}