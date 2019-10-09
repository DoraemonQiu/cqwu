var http=require('http');
var url=require('url');
var router=require('./module/router');
http.createServer(function (request,response) {
    if(request.url!=='/favicon.ico'){//清除二次访问
        try{
            response.setHeader("Access-Control-Allow-Origin","*");
            var flag=request.url.indexOf('down')>=0?true:false;
            if(flag){
                var str=request.url.split('?')[1];
                var id=str.split('=')[2];
                router.down(request,response,id);
            }else{
                var path =url.parse(request.url).pathname;
                if(path==='/')
                    path='index';
                else
                    path=path.substr(1)
                router[path](request,response);
            }
        }catch(e){
            response.writeHead(200, {'Content-Type': 'text/html;charset=utf-8'});
            response.end('路径不对');
        }
    }
}).listen(5000);
console.log('my server is running at 5000');