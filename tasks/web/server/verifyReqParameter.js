/**
 * Created by lihui on 14-8-28.
 * 校验请求参数
 *
 */


module.exports = function(grunt){

    var fs = require('fs');
    var path = require('path');
    var colors = require('colors');

    return function(url,method,params,jsonData,ignoreField){
        jsonData.reqError = [];
        jsonData.docError = [];
        delete jsonData.methodError;

        if(method!==jsonData.interfaceType){
            jsonData.methodError ='请求类型异常请确认';
        }

        jsonData.requiredParameters.forEach(function(o){
          if(o.required && !!!params[o.name]){
            jsonData.reqError.push('请求参数［'+o.name+'］应该为必填项');
          }
        });

        //过滤出来请求参数有，而文档中该参数没有定义

        for(name in params){
            var _i = 0;
            jsonData.requiredParameters.forEach(function(o){
                if(o.name !== name){
                  _i++;
                }
            });
            if(_i === jsonData.requiredParameters.length && ignoreField.indexOf(name) === -1){
                jsonData.docError.push('接口文档缺少［'+ name +'］做为请求参数');
            }
        }


        if(jsonData.methodError || jsonData.reqError.length || jsonData.docError.length){
            grunt.log.writeln('+---------------------接口警告--------------------------'.red);
            grunt.log.writeln('| '.red + url.bold);
            if(jsonData.methodError){
                grunt.log.writeln('| '.red + '请求类型异常请确认'.red);
            }
            if(jsonData.reqError.length){
                jsonData.reqError.forEach(function(o){
                    grunt.log.writeln('| '.red + o.red);
                });
            }
            if(jsonData.docError.length){
                jsonData.docError.forEach(function(o){
                    grunt.log.writeln('| '.red + o.red);
                });
            }
            grunt.log.writeln('+-------------------------------------------------------'.red);
        }

        fs.open(path.resolve(global.options.database)+ url,"w",0644,function(e,fd){
            if(e){
                grunt.log.write(e);
            }{
                fs.write(fd,JSON.stringify(jsonData,undefined,5),0,'utf8',function(e){
                    if(e) throw e;
                    fs.closeSync(fd);
                })
            }
        });

    }
};