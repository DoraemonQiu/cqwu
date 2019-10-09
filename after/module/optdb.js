var Pool=require('./pool');
var pool=new Pool();
var pooldb=pool.getPool();//接收一个池子
module.exports=function(sql,param,recall){
    pooldb.getConnection(function (err,con) {
        if(!err){
            con.query(sql,param,function (err,rs) {
                if(!err){
                    recall(rs);
                }
            })//获取连接后操作
            con.release();//释放连接到连接池
        }
    })
}

