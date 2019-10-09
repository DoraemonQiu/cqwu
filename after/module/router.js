var option=require('./option');
var svg=require('svg-captcha');
module.exports={
    index:function(req,res){
      option.index(req,res);
    },
    detail:function(req,res){
      option.detail(req,res);
    },
    list:function(req,res){
      option.list(req,res);
    },
    pages:function(req,res){
      option.pages(req,res);
    },
    current:function(req,res){
      option.current(req,res);
    },
    s_current:function(req,res){
      option.s_current(req,res);
    },
    readImg:function (req,res) {
        option.readImg(req,res);
    },
    search:function (req,res) {
        option.search(req,res);
    },
    login:function (req,res) {
        option.login(req,res);
    },
    register:function (req,res) {
        option.register(req,res);
    },
    yzm:function (req,res) {
        var codeConfig = {
            size: 4,// 验证码长度
            ignoreChars: '0o1li', // 验证码字符中排除 0o1i
            noise: 4, // 干扰线条的数量
            height: 34
        };
        var captcha = svg.create(codeConfig);
        res.end(captcha.data);
    },
    media:function (req,res) {
        option.media(req,res);
    },
    s_pages:function (req,res) {
        option.s_pages(req,res);
    },
    down:function (req,res,id) {
        option.down(req,res,id);
    },
    show_file:function (req,res) {
        option.show_file(req,res);
    },
    fileUp:function (req,res) {
        option.fileUp(req,res);
    },
    add:function (req,res) {
        option.add(req,res);
    },
    getdel:function (req,res) {
        option.getdel(req,res);
    },
    del:function (req,res) {
        option.del(req,res);
    },
    get_edit:function (req,res) {
        option.get_edit(req,res);
    },
    edit:function (req,res) {
        option.edit(req,res);
    },
    change_img:function (req,res) {
        option.change_img(req,res);
    }
}