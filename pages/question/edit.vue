<template>
    <div>
    <!--ref类似于id，是唯一的标识  -->
        <el-form :rules="rules" ref="formData" :model="formData" label-width="100px" label-position="right">
            <el-form-item label="标题：" prop="title">
                <el-input v-model="formData.title" placeholder="请输入文章标题" maxlength="50" show-word-limit/>
            </el-form-item>
            <el-form-item label="标签：" prop="labelIds">
                    <el-cascader
                        style="display: block"
                        :options="labelOptions"
                        :show-all-levels="false"
                        :props="{ emitPath:false, multiple: true,children:'labelList',value:'id',label:'name' }"
                        filterable
                        clearable
                        v-model="formData.labelIds"
                        :disabled="disabled"
                        ></el-cascader>
            </el-form-item>
            <el-form-item label="编辑内容：" prop="content">
              <!-- 
                ref 就是唯一标识，相当于id
                v-model绑定的是markdown输入框的内容,autofocus="false"不会自动获取焦点
               -->
              <mavon-editor :autofocus="false" ref="md" v-model="formData.mdContent" @change="getMdHtml"
              @imgAdd="uploadContentImg" @imgDel="delContentImg"
              />
            </el-form-item>
        </el-form>
        <el-row type="flex" justify="center">
            <el-button type="primary" @click="submitForm('formData')">Commit</el-button>
        </el-row>
    </div>
</template>
<script>
  export default {
    //配置中间件（权限判断），拦截路由请求
    middleware:'auth',

    //validator可以接收context对象，context上下文里面有query对象，直接接收就可以
    validate({query}){
      //校验是否为数值，有数值则为修改界面
      if(query.id){
        return /^\d+$/.test(query.id)
      }

      return true
    },
    data() {
      //自定义校验器
      const validateLable=( rule,value,callback)=>{
          if(value && value.length>5){
            this.disabled = true //禁止选择
            callback(new Error('最多可选五个标签'))
          }else{
            this.disabled = false //可以选择
            callback()  //校验通过，放行
          }
      }

      const validateContent=(rule,value,callback)=>{
        if(this.formData.mdContent &&this.formData.htmlContent){
          callback()
        }else{
          callback(new Error('文章正文要输入哦'))
        }
      };

      return {
        rules:{
            title:[
              { required: true, message: '请输入标题', trigger: 'blur' },
              { min: 1, max: 100, message: '长度在 3 到 5 个字符', trigger: 'blur' }
            ],
            labelIds:[
              { required: true, message: '请选择标签', trigger: 'blur' },
              { validator:validateLable, trigger:'change'}
            ],
            content:[
              { validator:validateContent, trigger:'change'}
            ]
        },
        
        formData: {
          userId: this.$store.state.userInfo.uid,
          userImage: this.$store.state.userInfo.imageUrl,
          nickName: this.$store.state.userInfo.nickName,
          name: '',
          imageUrl:null,  //不写出不会被渲染
        },
        disabled:false, //标签选择框：false可以选择，true不可以选择
        // labelOptions:[]
      }
    },
    methods: {
      //表单提交后的校验
      submitForm(formName){
          //这个$refs[]值 ，就是上面ref定义的那个，submitForm('formData')传递过去
          //下面的这方法是ele框架提供的
          this.$refs[formName].validate((valid) => {
          if (valid) {
            this.submitData()
          } else {
            return false
          }
        })
      },

      //提交数据给后台
      async submitData(){
         let resp = null
         console.log("this.formData.......",this.formData)
        //有文章id则为修改，没有id则是新增
        if(this.formData.id){
          //修改
          resp = await this.$updateQuestion(this.formData)
        }else{
          //新增
          resp = await this.$addQuestion(this.formData)
        }

         if(resp.code === 20000){
           this.$message.success('发布成功')
           //提交成功后，跳转到此文章的详情页,resp.data获取的是此文章的id(接口定义好的)
           this.$router.push(`/question/${resp.data}`)
         }else{
           this.$message.error('发布失败')
         }
      },
      //上传图片方法
      uploadMainImg(file){
          // console.log("上传图片file:",file)
          const data = new FormData()
          data.append('file',file.file)
          this.$uploadImg(data).then(response =>{
            if(response.code === 20000){
              //删除原图片
              this.deleteImg()
              //回显上传后的图片
              this.formData.imageUrl = response.data
            }
          }).catch(error =>{
            this.$message.error('上传图片失败')
          })
      },
      //删除图片
      deleteImg(){
        if(this.formData.imageUrl){
          //如果有图片
          this.$deleteImg(this.formData.imageUrl)
        }
      },
      //mdContent md内容，htmlContent转成html的内容
      getMdHtml(mdContent,htmlContent){
        // console.log('mdContent',mdContent)
        // console.log('htmlContent',htmlContent)
        this.formData.mdContent = mdContent
        this.formData.htmlContent = htmlContent
      },
    
    //上传内容图片
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
    //删除内容图片
    delContentImg(urlAndFileArr){
      const fileUrl = urlAndFileArr[0]  //图片url
      const file = urlAndFileArr[1]  //File对象
      this.$deleteImg(fileUrl).then(response =>{
        if(response.code === 20000){
          console.log("删除成功")
        }
      })
    },
    },
    
    //query要加上
    async asyncData({app,query}) {
      //查询分类和标签
       const {data} = await app.$getCategoryAndLael()
       //查询文章详情
       //取一个别名，把这个data赋值给formData
       if(query.id){
        const {data:formData} = await app.$getArticleById(query.id)
        return {labelOptions:data,formData}
       }
       //以key和value的形式返回，即上面data可以不声明，因为会和vue里面的data进行合并
       return {labelOptions:data}
    },
  }
</script>
<style>
  .avatar-uploader .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }
  .avatar-uploader .el-upload:hover {
    border-color: #409EFF;
  }
  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 178px;
    height: 178px;
    line-height: 178px;
    text-align: center;
  }
  .avatar {
    width: 178px;
    height: 178px;
    display: block;
  }
</style>