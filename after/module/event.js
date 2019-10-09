var event=require('events');
var url=require('url');
var querystring=require('querystring');
var table=require('./optdb');
//事件机制
module.exports=function () {
    this.evEmit=new event.EventEmitter();
    this.register=function (req,res){
        var post='';
        req.on('data',function (d) {
            post+=d;
        })
        var _this=this;
        req.on('end',function () {
            post=querystring.parse(post);//解析收到的字符串
            var sql='insert into user (username,pwd,nicheng) values (?,?,?)';
            var param=[post.name,post.pwd,post.nc];
            table(sql,param,function (rs) {
                if(rs){
                    req.userData={name:post.name,pwd:post.pwd};//在req中保存信息
                    _this.evEmit.emit('success');
                }
            })
        })
    }
    this.login=function (req,res) {
        var sql='select id,username,nicheng from user where username=? and pwd=?';
        if(req.userData){
            var param=[req.userData.name,req.userData.pwd];
            table(sql,param,function (rs) {
                delete req.userData;
                res.end(JSON.stringify(rs));
            })
        }else{
            var query=url.parse(req.url,true).query;
            var param=[query.name,query.pwd];
            table(sql,param,function (rs) {
                res.end(JSON.stringify(rs));
            })
        }
    }
}
