var mysql=require("mysql");
function OptPool(){
    this.flag=true;
    this.pool=mysql.createPool({
        host:"localhost",
        user:"root",
        password:"",
        database:"db",
        port:3306
    });
    this.getPool=function(){
        if(this.flag){
            this.pool.on('connection',function(connection){
                connection.query("SET SESSION auto_increment_increment=1");
                this.flag=false
            });
        }
        return this.pool;
    }
}
module.exports=OptPool;