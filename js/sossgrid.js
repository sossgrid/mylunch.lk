(function (w){
    var settings = {
        plugins: {}
    };

    var onErrorCallback, statusChangeCallback, currentState = "IDLE";
    var cpInstance;

    function changeState(state, msg){
        if (statusChangeCallback)
            statusChangeCallback({state: currentState, message: msg});
    }

    var Helpers = (function(){
        return {
            startsWith: function(haystack,str){
                return(haystack.indexOf(str) == 0);
            }
        };
    })();

    function SOSSPromise(logicFunc,params){
        var callbacks ={};
        
        var ctrl = {
            resolve: function(data){
                if (callbacks.success)
                    callbacks.success(data);
            },
            reject: function(data){
                if (callbacks.error)
                    callbacks.error(data);
            }
        }
        function evaluate(){
            if (callbacks.success && callbacks.error)
                logicFunc(ctrl, params);
        }

        return {
            then: function(cb){
                callbacks.success= cb;
                evaluate();
                return this;
            },
            error: function (cb){
                callbacks.error = cb;
                evaluate();
                return this;
            }
        }   
    }

    function BackendRequestor(compId){

        function call(params){
            return new SOSSPromise(function(ctrl, params){
                var url = "components/" + compId + "/service/" + params.method;
                var stub = new AjaxRequestor(url);
                
                stub.success(function(result){
                    ctrl.resolve(result);
                })
                .error(function(result){
                    ctrl.reject(result);
                });
            }, params);
        }

        return {
            get: function(method,cb){
                return call({method: method, type: "GET"});
            },
            post:function (method,params,cb){
                return call({method: method, params: params, type: "POST"});
            }
        }
    }

    function PluginInstance(compId, descriptor){
        var regFunc, confFunc;
        var exports =  {
            getDescriptor: function(){return descriptor;},
            getId: function(){return compId;},
            register: function(f){
                regFunc = f;
                delete this.register;
            },
            configure: function(f){
                confFunc = f;
                return this;
            },
            onLoad: function(){
                if (regFunc)
                    regFunc(this);
            },
            onConfigure: function(){
                if (confFunc)
                    confFunc(this);
            },
            getComponent: function(c){
                return settings.plugins[c];
            },
            backend: function(o){
                return new BackendRequestor(compId);
            }
        }

        settings.plugins[compId] = exports;

        return exports;
    }

    function AjaxRequestor(url, postParams, method){
        var sendObj;
        var sf, ef;
        var retries = 1;

        function issueRequest(){
            changeState ("BUSY");
            $.ajax(sendObj);
        }

        function errorFunc(){
            retries++;
            if (retries ==3){
                changeState ("IDLE");
                ef();
            }
            else 
                issueRequest();
        }

        function successFunc(data){
            changeState ("IDLE");
            sf (data);
        }

        function callRest(){
            if (!sf || !ef) return;

            if (typeof (url) === "string"){
                sendObj = {
                    url: url,
                    xhrFields: {withCredentials: true},
                    contentType: "application/json",
                    success: successFunc,
                    error: errorFunc
                }
            }else{
                sendObj = url;
                sendObj.success = successFunc;
                sendObj.error = errorFunc;
            }

            issueRequest();
        }

        
        return {
            success: function (f){ sf = f; callRest(); return this;},
            error: function(f){ ef = f; callRest(); return this;}
        }
    }


    function AsyncIterator(arr){
        var callbacks = {};
        var index = -1;
        var results = [];

        var controller =  (function(){
            return {
                success: function(res){
                    var resObj = {index: index, object:arr[index], result: res, success: true};

                    results.push (resObj);

                    if (callbacks.completeOne)
                        callbacks.completeOne(resObj);

                    next();
                },
                error: function(res){
                    var resObj = {index: index, object:arr[index], result: res, success: false};
                    results.push (resObj);
                    
                    if (callbacks.completeOne)
                        callbacks.completeOne(resObj);

                    if (callbacks.error)
                        callbacks.error(resObj);
                    next();
                }
            }
        })();

        function next(){
            index++;

            if (index == arr.length){
                if (callbacks.complete)
                    callbacks.complete(results);
            }
            else
                callbacks.logic(arr[index], controller);
        }

        return {
            onComplete: function (cb){callbacks.complete = cb},
            onCompleteOne: function (cb){callbacks.completeOne = cb},
            onError: function (cb){ callbacks.error = cb },
            logic: function(cb){callbacks.logic = cb},
            start: next 
        }
    }

    var componentDownloader = (function(){

        function fixUrl(url,component){
            if (Helpers.startsWith(url,"http") || Helpers.startsWith(url,"https")){
                return url;
            }else {
                if (Helpers.startsWith(url,"//"))
                    return  window.location.protocol +  url;
                else 
                    return "components/" + component + "/file/" + url;
            }
        }
        
        function injectScript(location){
            var head= document.getElementsByTagName('head')[0];
            var script= document.createElement('script');
            script.type= 'text/javascript';
            script.src= location;
            head.appendChild(script);
        }

        function download(component, cb){           
            var requestor = new AjaxRequestor("components/" + component + "/object?object=desc")
            .success(function(desc){
                if (!desc.success)
                    cb(desc)
                else{
                    var res = desc.result.resources;
                    if (res){
                        if (res.files){
                            var downComponents = [];

                            if (res.js)
                                downComponents = downComponents.concat(res.js);
                            var hasScript = false, hasView =false;

                            for (var i=0;i<res.files.length;i++){
                                var file = res.files[i];
                                if (file.type){
                                    if (file.type.toLowerCase() === "mainscript"){
                                        hasScript=true;
                                        file.url = "components/" + component + "/file/" + file.location;
                                        desc.mainScript = file;
                                    }
                                    if (file.type.toLowerCase() === "mainview"){
                                        hasView=true;
                                        file.url = "components/" + component + "/file/" + file.location;
                                        desc.mainView = file;
                                    }
                                }
                                downComponents.push(file);
                            }

                            var iterator = new AsyncIterator(downComponents);
                            iterator.logic(function(obj,ctrl){
                                var url;
                                if (obj.type || obj.tag)
                                    url = fixUrl(obj.location, component);

                                if (url){
                                    var reqFile = new AjaxRequestor({url:url})
                                    .success(function(result){
                                        if (obj.type == "view" || obj.type == "mainView")
                                        obj.view = result;
                                        ctrl.success({success:true});
                                    })
                                    .error(function(result){
                                        ctrl.error({success:false});
                                    });

                                }else 
                                    ctrl.error({success:false, result: "Unknown file type in component descriptor"});
                                
                            });
                            iterator.onComplete(function(results){
                                cb(results,desc, cpInstance);
                            });
                            iterator.onCompleteOne(function(result){
                                if (result.success){
                                    var obj = result.object;
                                    if (obj.tag){
                                        
                                        if (!componentManager.hasLibrary(obj.tag))
                                            injectScript(fixUrl(obj.location, component));

                                        componentManager.registerLibrary(obj,component);

                                    }

                                    if (obj.type){
                                        switch (obj.type){
                                            case "mainScript":
                                            case "script":
                                                cpInstance = new PluginInstance(component, desc);
                                                injectScript(fixUrl(obj.location, component));
                                                break;
                                            default:
                                                break;
                                        }
                                    }
                                }
                            });
                            iterator.start();

                        }else
                            cb ({success: false, result: "No files available in component resources"}); 
                            
                    }else 
                        cb ({success: false, result: "No Resources found in component descriptor"});
                }
            })
            .error (function(desc){

            });
        }

        return {
            download: download 
        }
    })();

    var componentManager = (function (){
        
        var callbacks = {};
        var descriptor;
        var htmlComponents;

        function initialize(){
            var requestor = new AjaxRequestor("components/object/descriptor")
            .success(function(desc){
                if (!desc.success){
                    if (callbacks.init)
                        callbacks.init(desc);
                }
                else{
                    descriptor = desc.result;
                    downloadComponents();
                }
            })
            .error(function(error){
                
            });
        }

        function downloadComponents(){
            var downComponents = [];
            if (descriptor.loader){
                if (htmlComponents)
                    downComponents = downComponents.concat(htmlComponents);
                    
                if (descriptor.loader.onLoad)
                    downComponents = downComponents.concat(descriptor.loader.onLoad);
                
                var iterator = new AsyncIterator(downComponents);
                iterator.logic(function(obj, ctrl){
                    componentDownloader.download(obj, function(result,desc){
                        if (result.success)
                            ctrl.success(result.result);
                        else 
                            ctrl.error(result.result);
                    });
                });
                iterator.onComplete(function(results){
                    if(callbacks.init)
                        callbacks.init(descriptor);
                });
                iterator.start();

            }
        }

        var libraries = {};
        function registerLibrary(obj, component){
            var _3c = libraries;
            if (!_3c[obj.tag])
                _3c[obj.tag] = {components: []}
            
            _3c[obj.tag].components.push(component);
        }

        function hasLibrary(lib){
            return libraries[lib] !== undefined;
        }


        function getOnDemand(compId,cb){
            componentDownloader.download(compId, function(results,desc,instance){
                cb(results,desc,instance);
            });
        }

        return {
            initialize: initialize,
            onInitialized: function(cb){
                callbacks.init = cb;
            },
            registerLibrary: registerLibrary,
            hasLibrary: hasLibrary,
            getOnDemand:  getOnDemand,
            getDescriptor: function (){ return descriptor; },
            setHtmlComponents: function(a){ htmlComponents = a;}
        }
    })();


    w.SOSSGRID = {
        registerPlugin: function(p){
            this[p.name] = p;
            settings.plugins[p.name] = p;
        },
        getPlugin: function(n){
            return settings.plugins[n];
        },
        plugin: function(){
            return cpInstance;
        },
        callRest: function (url, params){
            return new AjaxRequestor(url, params);
        },
        onStatusChange: function(scf){
            statusChangeCallback = scf;
        },
        onError: function (onf){
            onErrorCallback = onf;
        },
        changeState: changeState,
        componentManager: componentManager
    };

     $(document).ready(function(){

        var componentList = $("[soss-component]");
        
        componentManager.onInitialized(function(descriptor){
            if (descriptor.description)
                if (descriptor.description.title)
                    document.title = descriptor.description.title;

            for (pk in settings.plugins)
                if (settings.plugins[pk].onConfigure)
                    settings.plugins[pk].onConfigure();

            for (pk in settings.plugins)
                if (settings.plugins[pk].onLoad)
                    settings.plugins[pk].onLoad();

            var viewPlugList = {};

            function renderViews(){

                $("[soss-component]").each(function(i,el){
                    var pk = $(this).attr("soss-component");
                    if (!viewPlugList[pk]){                
                        var plugObj = settings.plugins[pk];
                        var descObj = plugObj.getDescriptor();

                        if (descObj.mainView)
                        $(this).html(descObj.mainView.view);
                        
                        viewPlugList[pk] = {name:pk, obj:plugObj, el: $(this)};
                    }
                });
            }

            renderViews();
            renderViews();
/*
            for (pk in settings.plugins){
                var plugObj = settings.plugins[pk]; 

                if (plugObj.onReady){
                    if (plugObj.type == "component"){
                        if (viewPlugList[pk])
                            plugObj.onReady(viewPlugList[pk].el);
                    }
                    else{
                        if (plugObj.type == "shell" || plugObj.type == "service")
                            plugObj.onReady();
                    }

                }
            }
*/

            for (var pk in viewPlugList){
                var p = viewPlugList[pk];
                if (p.obj.onReady)
                    p.obj.onReady(p.el);
            }

        });

        var htmlComponents = [];
        componentList.each(function(i,el){
            htmlComponents.push($(this).attr("soss-component"));
        });
        componentManager.setHtmlComponents(htmlComponents);

        componentManager.initialize();
    });



})(window);