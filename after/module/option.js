var fs=require('fs');
var url=require('url');
var async=require('async');
var querystring=require('querystring');
var multiparty=require('multiparty');
var table=require('./optdb');
var Event=require('./event');
var event=new Event();
function recall(data,res,ext){
    if(!ext) ext='html';
    res.writeHead(200, {'Content-Type': 'text/' + ext + ';charset=utf-8'});
    res.end(data);
}
module.exports={
    index:function(req,res){
        var sql='select * from news order by id desc limit ?';
        table(sql,[3],function (rs) {
            res.end(JSON.stringify(rs));
        })
    },
    show_file:function(req,res){
        var sql='select * from file_store order by date desc';
        table(sql,[],function (rs) {
            res.end(JSON.stringify(rs));
        })
    },
    down:function(req,res,id){
        var sql='select * from file_store where id=?';
        table(sql,[id],function (rs) {
            var newFile=rs[0].new_name;
            fs.readFile(newFile,function (err,data) {
                res.end(data);
            })
        })
    },
    detail:function(req,res){
        var id=req.url.split('=')[1];
        var sql='select * from news where id=?';
        table(sql,[id],function (rs) {
            res.end(JSON.stringify(rs));
        })
    },
    list:function(req,res){
        var sql='select * from news order by id desc limit ?';
        table(sql,[5],function (rs) {
            res.end(JSON.stringify(rs));
        })
    },
    pages:function(req,res){
        var sql='select id from news';
        table(sql,[],function (rs) {
            res.end(JSON.stringify(rs.length));
        })
    },
    s_pages:function(req,res){
        var obj=url.parse(req.url,true).query;
        var key=obj.keyword;
        var sql=`select id from news where title like '%${key}%'`;
        table(sql,[],function (rs) {
            res.end(JSON.stringify(rs.length));
        })
    },
    current:function(req,res){
        var obj=url.parse(req.url,true).query;
        var start=obj.cur_page*5;
        var sql='select * from news order by id desc limit ?,?';
        table(sql,[start,5],function (rs) {
            res.end(JSON.stringify(rs));
        })
    },
    s_current:function(req,res){
        var obj=url.parse(req.url,true).query;
        var start=obj.cur_page*5;
        var key=obj.keyword;
        var sql=`select * from news where title like '%${key}%' order by id desc limit ?,?`;
        table(sql,[start,5],function (rs) {
            res.end(JSON.stringify(rs));
        })
    },
    readImg: function (req, res) {
        var path = url.parse(req.url).query;
        fs.readFile(path, 'binary', function (err, data) {
            if (err) {
                console.log(err);
                return;
            } else {
                res.writeHead(200, {'Content-Type': 'image/jpeg'});
                res.end(data, 'binary');
            }
        })
    },
    media: function (req, res) {
        var path = url.parse(req.url).query;
        arr=path.split('.');
        var ext=arr[arr.length-1];
        var readStream = fs.ReadStream(path);
        var contentType='';
        switch (ext) {
            case "mp4":
                contentType = "video/mp4";
                break;
            case "mp3":
                contentType = "audio/mp3";
                break;
        }
        res.writeHead(200, {
            'Content-Type' : contentType,
            'Accept-Ranges' : 'bytes',
        });
        readStream.on('close', function(err) {
            res.end();
        });
        readStream.pipe(res);
        readStream.on('error', function(err) {
            console.log('文件不存在');
            res.end();
        });
    },
    fileUp:function (req,res) {
        var form = new multiparty.Form();
        form.encoding = 'utf-8';
        form.uploadDir = "./uploadtemp";
        //设置单文件大小限制
        form.maxFilesSize = 2 * 1024 * 1024;
        //form.maxFields = 1000;  设置所有文件的大小总和
        form.parse(req, function(err, fields, files) {
            // fields是传过来的对象，title
            //files,文件对象
            var title=fields.title[0];

            var uploadurl='./file/';
            var fd=files['file'][0];
            var originalFilename=fd.originalFilename;//原始文件名
            var tempPath=fd.path;//临时文件路径

            var timestamp=new Date().getTime();
            uploadurl+=timestamp+originalFilename;

            var fileReadStream=fs.createReadStream(tempPath);
            var fileWriteStream=fs.createWriteStream(uploadurl);
            fileReadStream.pipe(fileWriteStream);
            fileWriteStream.on('close',function () {
                fs.unlinkSync(tempPath);
                var sql="insert into file_store (title,old_name,new_name,date) values (?,?,?,?)";
                table(sql,[title,originalFilename,uploadurl,timestamp],function (rs) {
                    res.end(JSON.stringify('上传成功'));
                })
            })
        });
    },
    login:function (req,res) {
        event.login(req,res);
    },
    /* register:function (req,res) {
         event.register(req,res);
         event.evEmit.once('success',function () {
             event.login(req,res);
         })
     }*/
//瀑布流方式注册
    register:function (req,res) {
        // res.end(JSON.stringify(123))
        async.waterfall([
            function (done) {
                var post='';
                req.on('data',function (d) {
                    post+=d;
                })
                console.log(post)
                var _this=this;
                req.on('end',function () {
                    post=querystring.parse(post);//解析收到的字符串
                    var sql='select id from user where username=? and pwd=?';
                    table(sql,[post.name,post.pwd],function (rs) {
                        if(rs.length===0){
                            sql='insert into user (username,pwd,nicheng) values (?,?,?)';
                            var param=[post.name,post.pwd,post.nc];
                            table(sql,param,function (rs) {
                                if(rs){
                                    var param1=[post.name,post.pwd];
                                    done(null,param1)
                                }
                            })
                        }else{
                            done(true)
                        }
                    })
                })
            },
            function (one_rs,done) {
                var sql='select id,username,nicheng from user where username=? and pwd=?';
                table(sql,one_rs,function (rs) {
                    if(rs){
                        done(null,rs)
                    }
                })
            }
        ],function (err,rs) {
            if(err){
                res.end(JSON.stringify(false));
            }else{
                res.end(JSON.stringify(rs));
            }
        })
    },
    add:function (req,res) {
        var form = new multiparty.Form();
        //设置编码
        form.encoding = 'utf-8';
        //设置临时文件存储路径
        form.uploadDir = "uploadtemp/";
        //设置单文件大小限制
        form.maxFilesSize = 10 * 1024 * 1024;
        // form.maxFields = 15 * 1024 * 1024;  //设置所以文件的大小总和

        form.parse(req, function (err, fields, files) {
            var uploadurl = 'upload/';//数据库使用路径
            var file1 = files['img'];
            var originalFilename = file1[0].originalFilename; //原始文件名
            var tempPath = file1[0].path;

            var timestamp = new Date().getTime(); //获取当前时间戳
            uploadurl += timestamp + originalFilename;//前端文件显示路径
            var newPath =  uploadurl;

            var fileReadStream = fs.createReadStream(tempPath);
            var fileWriteStream = fs.createWriteStream(newPath);
            fileReadStream.pipe(fileWriteStream); //管道流
            fileWriteStream.on('close', function () {
                fs.unlinkSync(tempPath);    //删除临时文件夹中的图片
                console.log('copy over');
                var sql = "INSERT INTO `news`(`title`, `content`, `imgpath`, `date`) VALUES (?,?,?,current_timestamp)";
                var params = [fields['title'][0],fields['content'][0],uploadurl];
                console.log(params)
                table(sql,params,function (err,rs) {
                    if (!err){
                        res.json(rs.affectedRows);
                    }
                });
            });
        });
    },
    getdel:function (req,res) {
        var sql='select * from news order by id desc';
        table(sql,[],function (err,rs) {
            if(!err){
                res.json(rs);
            }
        })
    },
    del:function (req,res) {
        var sql='DELETE FROM `news` WHERE id=?';
        table(sql,[req.query['id']],function (err,rs) {
            if(!err){
                res.json(rs);
            }
        })
    },
    get_edit:function (req,res) {
        var key=req.query['title'];
        console.log(key)
        var sql=`select * from news where title like '%${key}%' limit 1`;
        table(sql,[],function (err,rs) {
            if(!err){
                res.json(rs[0]);
            }
        })
    },
    edit:function (req,res) {
        var key=req.query['title'];
        var sql=`update news set title=?,content=? where id=?`;
        params=[req.query['title'],req.query['content'],req.query['id']]
        table(sql,params,function (err,rs) {
            if(!err){
                res.json(rs.affectedRows);
            }
        })
    },
    change_img:function (req,res) {
        var form = new multiparty.Form();
        //设置编码
        form.encoding = 'utf-8';
        //设置临时文件存储路径
        form.uploadDir = "uploadtemp/";
        //设置单文件大小限制
        form.maxFilesSize = 10 * 1024 * 1024;
        // form.maxFields = 15 * 1024 * 1024;  //设置所以文件的大小总和

        form.parse(req, function (err, fields, files) {
            var uploadurl = 'upload/';//数据库使用路径
            var file1 = files['img'];
            var originalFilename = file1[0].originalFilename; //原始文件名
            var tempPath = file1[0].path;

            var timestamp = new Date().getTime(); //获取当前时间戳
            uploadurl += timestamp + originalFilename;//前端文件显示路径
            var newPath = uploadurl;

            var fileReadStream = fs.createReadStream(tempPath);
            var fileWriteStream = fs.createWriteStream(newPath);
            fileReadStream.pipe(fileWriteStream); //管道流
            fileWriteStream.on('close', function () {
                fs.unlinkSync(tempPath);    //删除临时文件夹中的图片
                var oldSrc=fields['old_img'][0]
                fs.unlinkSync(oldSrc);    //删除原图片
                console.log('copy over');
                var sql = "update news set imgpath=? where id=?";
                var params = [uploadurl,fields['old_id']];
                table(sql,params,function (err,rs) {
                    if (!err){
                        console.log(rs);
                        res.json(rs.affectedRows);
                    }
                });
            });
        });
    }
}