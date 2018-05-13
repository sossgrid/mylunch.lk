(function (w){
    var settings = {
        plugins: {},
        orderedPlugins : [],
        callbacks : {}
    };

    var currentState = "loading";
    var cpInstance;

    function changeState(state, msg){
        currentState = state;
        if (settings.callbacks.onStatusChange)
            settings.callbacks.onStatusChange({state: state, message: msg});

        if (state === "loaded"){
            if (settings.callbacks.onReady)
                settings.callbacks.onReady();
        }
    }

    var Helpers = (function(){
        return {
            startsWith: function(haystack,str){
                return(haystack.indexOf(str) == 0);
            },
            paramsToArray : function (arr, argu, skipFirst){
                for (var i=0;i<argu.length;i++)
                if (!(i==0 && skipFirst))
                    arr.push(argu[i]);
                return arr;
            },
            getNested : function (obj, path){
                var paths = path.split (".");
                var cObj = obj;

                for (var i=0;i<paths.length;i++){
                    cObj = paths[i];
                    if (!cObj)
                        break;
                }

                return cObj;
            },
            contains : function(value, searchFor){
                return (value || '').indexOf(searchFor) > -1;
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

    function BackendRequestor(compId, type){

        function call(params){
            return new SOSSPromise(function(ctrl, params){
                var url = "components/" + compId + "/" + type + "/" + params.method;
                var stub = new AjaxRequestor(url, params.params ? params.params : undefined, params.type ? params.type : "GET");
                
                stub.success(function(result){
                    ctrl.resolve(result);
                })
                .error(function(result){
                    ctrl.reject(result);
                });
            }, params);
        }

        return {
            get: function(method){
                return call({method: method, type: "GET"});
            },
            post:function (method, params){
                return call({method: method, params: params, type: "POST"});
            }
        }
    }

    function BackendFunction(compId, type, sk,sv, extraParams){
        var br = new BackendRequestor(compId, type);
        var meth = sv.method.toLowerCase();              
        
        function call(){

            var routeObj = sv.route;
            if (!routeObj){
                routeObj = sk;
                
                if(extraParams && arguments.length > 0){
                    var getString = "?";
                    var paramObj = arguments[(meth === "get") ? 0 : 1];
                    var isFirst = true;
                    
                    for (var i=0;i<extraParams.length;i++){
                        var value = paramObj[extraParams[i]];
                        if (value){
                            if (!isFirst) getString+="&";
                            else isFirst = false;
                            getString += (extraParams[i] + "=" + value);
                        }
                    }
                    if (!isFirst)
                        routeObj += getString;   
                }
            }

            if (Helpers.contains(routeObj, "@")){
               var splitData = routeObj.split("/");
               var si = (meth === "get") ? 0 : 1;
               routeObj = "";
               for (var i=0;i<splitData.length;i++){
                   if (i > 0) routeObj +="/";

                   if (splitData[i][0] == "@"){
                       if (arguments.length > si)
                           routeObj += arguments[si];
                       si++;
                   }else {
                       routeObj += splitData[i];
                   }
               }
            }

            if (routeObj[0] === "/")
                routeObj = routeObj.substring(1);

            if (meth === "get"){
                var parm = Helpers.paramsToArray([routeObj], arguments, false);
                return br.get.apply(this,parm);
            }
            else{
                var parm = Helpers.paramsToArray([routeObj, arguments[0]], arguments, true);
                return br.post.apply(this,parm);
            }
        }

        return call; 
    }

    function PluginInstance(compId, descriptor){
        var regFunc, confFunc;
        var exports =  {
            getDescriptor: function(){return descriptor;},
            getId: function(){return compId;},
            register: function(f){
                regFunc = f;
                //delete this.register;
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
            backend: function(o, type){
                if(!type)
                    type="service";
                return new BackendRequestor(compId, type);
            },
            componentId: compId
        }

        function injectBackendFunction(exportKey, type, mObj){
            exports[exportKey] = {}; 
            for (var sk in mObj){
                var sv = mObj[sk];
                if (sv.method)
                    exports[exportKey][sk] = new BackendFunction(compId, type, sk,sv, sv.parameters);
            }
        }

        if (descriptor.serviceHandler){
            var mObj = descriptor.serviceHandler.methods; 
            if (mObj)
            injectBackendFunction("services","service", mObj);
        }

        if (descriptor.transformers){
            var mObj = descriptor.transformers; 
            injectBackendFunction("transformers","transform", mObj);
        }

        settings.plugins[compId] = exports;

        return exports;
    }

    function AjaxRequestor(url, postParams, method){
        var sendObj;
        var sf, ef;
        var retries = 1;

        function issueRequest(){
            changeState ("busy");
            $.ajax(sendObj);
        }

        function errorFunc(){
            retries++;
            if (retries ==3){
                changeState ("idle");
                ef();
            }
            else 
                issueRequest();
        }

        function successFunc(data){
            changeState ("idle");
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
                
                if (postParams){
                    var isFile = (postParams instanceof File) || (postParams instanceof Blob);

                    if (isFile){
                        sendObj.data = postParams;
                        sendObj.processData = false;
                    }
                    else {
                        if (typeof(postParams) === "string")
                            sendObj.data = postParams;
                        else
                            sendObj.data = JSON.stringify(postParams);
                    }
                    

                }

                if (method)
                    sendObj.method = method;

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


    function ParallelAsyncIterator(arr, callbacks){
        var results = [];
       
        function evaluate(){
            if (results.length == arr.length){
                if (callbacks.complete)
                    callbacks.complete(results);
            }
        }

        function ParallelController(index){
            return {
                success: function(res){
                    var resObj = {index: index, object:arr[index], result: res, success: true};

                    results.push (resObj);

                    if (callbacks.completeOne)
                        callbacks.completeOne(resObj);
                    
                    evaluate();
                },
                error: function(res){
                    var resObj = {index: index, object:arr[index], result: res, success: false};
                    results.push (resObj);
                    
                    if (callbacks.completeOne)
                        callbacks.completeOne(resObj);

                    if (callbacks.error)
                        callbacks.error(resObj);

                    evaluate();
                }
            }
        };

        function next(){
            
            for (var i=0;i<arr.length;i++){
                    var controller = new ParallelController(i);
                    callbacks.logic(arr[i], controller);
            }

        }

        return {
            start: next
        }
    }

    function SequentialAsyncIterator(arr, callbacks){
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
            start: next
        }
    }

    function AsyncIterator(arr, isParallel=true){
        var callbacks = {};
        var iterator = isParallel ? new ParallelAsyncIterator(arr, callbacks) : new SequentialAsyncIterator(arr, callbacks);

        return {
            onComplete: function (cb){callbacks.complete = cb},
            onCompleteOne: function (cb){callbacks.completeOne = cb},
            onError: function (cb){ callbacks.error = cb },
            logic: function(cb){callbacks.logic = cb},
            start: iterator.start 
        }
    }

    var componentDownloader = (function(){

        var callbacks = {};
        var loadingScripts = {};

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
        
        function download(component, injectQueue, cb){           
            var requestor = new AjaxRequestor("components/" + component + "/object?object=desc")
            .success(function(desc){
                if (!desc.success)
                    cb(desc)
                else{
                    var res = desc.result.resources;
                    if (res){
                        if (res.files || res.js || res.css){
                            var downComponents = [];

                            if (res.js)
                                downComponents = downComponents.concat(res.js);
                            
                            if (res.css)
                                downComponents = downComponents.concat(res.css);

                            var hasScript = false, hasView =false;
                            
                            if (res.files)
                            for (var i=0;i<res.files.length;i++){
                                var file = res.files[i];
                                if (file.type){
                                    if (file.type.toLowerCase() === "mainscript"){
                                        hasScript=true;
                                        file.url = "components/" + component + "/file/" + file.location;
                                        desc.result.mainScript = file;
                                    }
                                    if (file.type.toLowerCase() === "mainview"){
                                        hasView=true;
                                        file.url = "components/" + component + "/file/" + file.location;
                                        desc.result.mainView = file;
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
                                    if (Helpers.startsWith(url,"http") || Helpers.startsWith(url,"https")){
                                        ctrl.success({success:true});
                                    }
                                    else {

                                        if (obj.tag){
                                            if (!componentManager.hasLibrary(obj.tag)){
                                                var injector = new Injector(false);
                                                injector.script(url);
                                                componentManager.registerLibrary(obj,component);
                                            }
                                            ctrl.success({success:true});                                           
                                        } else {

                                            switch (obj.type){
                                                case "mainScript":
                                                case "script":
                                                    ctrl.success({success:true});
                                                    break;
                                                case "css":
                                                    var injector = new Injector();
                                                    injector.css(url);
                                                    ctrl.success({success:true});
                                                    break;
                                                default:
                                                    var reqFile = new AjaxRequestor({url:url})
                                                    .success(function(result){
                                                        if (obj.type == "view" || obj.type == "mainView")
                                                        obj.view = result;
                                                        ctrl.success({success:true});
                                                    })
                                                    .error(function(result){
                                                        ctrl.error({success:false});
                                                    });
                                                    break;
                                            }

                                        }
                                    }

                                }else 
                                    ctrl.error({success:false, result: "Unknown file type in component descriptor"});
                                
                            });
                            iterator.onComplete(function(results){
                                cb(results,desc.result, cpInstance);
                            });
                            iterator.onCompleteOne(function(result){
                                if (result.success){
                                                                      
                                    var obj = result.object;

                                    if (obj.type){
                                        switch (obj.type){
                                            case "mainScript":
                                                injectQueue.push({type:"mainScript", component: component, url: fixUrl(obj.location, component), descriptor: desc.result});
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
            download: download,
            onScriptsLoaded: function(f){
                callbacks.onScriptsLoaded = f;
            }
        }
    })();

    function Injector (hasCallback=true){

        var cb;

        function injectScript(location){
            var head= document.getElementsByTagName('head')[0];
            var script= document.createElement('script');
            script.type= 'text/javascript';
            script.src= location;

            if (hasCallback)
                script.onload = function(){
                    cb(script);
                }

            head.appendChild(script);
        }

        function injectCss(location){
            var head= document.getElementsByTagName('head')[0];
            var fileref = document.createElement("link");
            fileref.rel = "stylesheet";
            fileref.type = "text/css";
            fileref.href = location;
            head.appendChild(fileref);
        }

        return {
            css: injectCss,
            script: injectScript,
            onScriptLoaded: function(c){
                cb = c;
            }
        }
    }

    var componentManager = (function (){
        
        var callbacks = {};
        var descriptor;
        var htmlComponents;
        var injectQueue = [];

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

        function injectComponents(cb){
            var iterator_injector = new AsyncIterator(injectQueue,false);
            iterator_injector.logic(function(obj, ctl){
                
                switch(obj.type){
                    case "mainScript":
                        var injector = new Injector();
                        if (!settings.plugins[obj.component])
                            cpInstance = new PluginInstance(obj.component, obj.descriptor);
                        else
                            cpInstance = settings.plugins[obj.component];
                        var injector = new Injector();
                        injector.onScriptLoaded(function(){
                            delete cpInstance;
                            ctl.success(true);
                        });

                        injector.script(obj.url);
                        break;
                }

            });

            iterator_injector.onComplete(function(results){
                injectQueue = [];
                cb(results);
            });

            iterator_injector.start();
        }

        function downloadComponents(){
            var downComponents = [];
            if (descriptor.loader){
                if (htmlComponents)
                    downComponents = downComponents.concat(htmlComponents);
                    
                if (descriptor.loader.onLoad)
                    downComponents = downComponents.concat(descriptor.loader.onLoad);
                
                settings.orderedPlugins = downComponents;

                var iterator = new AsyncIterator(downComponents);
                iterator.logic(function(obj, ctrl){
                    componentDownloader.download(obj, injectQueue, function(result,desc){
                        if (result.success)
                            ctrl.success(result.result);
                        else 
                            ctrl.error(result.result);
                    });
                });
                iterator.onComplete(function(results){
                    injectComponents(function(){
                        if(callbacks.init)
                            callbacks.init(descriptor);
                    });
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
            componentDownloader.download(compId, injectQueue, function(results,desc){
                injectComponents(function(res){
                    var instance = settings.plugins[compId];
                    cb(results,desc,instance);
                });
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
        onStatusChange: function(f){
            settings.callbacks.onStatusChange = f;
        },
        onError: function (f){
            settings.callbacks.onError = f;
        },
        onReady: function(f){
            settings.callbacks.onReady = f;
        },
        componentManager: componentManager
    };

     $(document).ready(function(){

        var componentList = $("[soss-component]");
        
        componentManager.onInitialized(function(descriptor){
            if (descriptor.description)
                if (descriptor.description.title)
                    document.title = descriptor.description.title;

            for (var i=0; i<settings.orderedPlugins.length;i++){
                var plugObj = settings.plugins[settings.orderedPlugins[i]];
                if (plugObj)
                if (plugObj.onConfigure)
                    plugObj.onConfigure();
            }

            for (var i=0; i<settings.orderedPlugins.length;i++){
                var plugObj  = settings.plugins[settings.orderedPlugins[i]];
                if (plugObj)
                if (plugObj.onLoad)
                    plugObj.onLoad();
            }

            var viewPlugList = {};

            function renderViews(){

                $("[soss-component]").each(function(i,el){
                    var pk = $(this).attr("soss-component");
                    if (!viewPlugList[pk]){                
                        var plugObj = settings.plugins[pk];
                        if (plugObj){
                            var descObj = plugObj.getDescriptor();

                            if (descObj.mainView)
                            $(this).html(descObj.mainView.view);
                            
                            viewPlugList[pk] = {name:pk, obj:plugObj, el: $(this)};
                        }else {
                            
                        }
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
                if (p.obj.onReady){
                    if (!p.obj.onReadyCalled){
                        p.obj.onReady(p.el);
                        p.obj.onReadyCalled = true;
                    }
                }
            }

            changeState("loaded");

        });

        var htmlComponents = [];
        componentList.each(function(i,el){
            htmlComponents.push($(this).attr("soss-component"));
        });
        componentManager.setHtmlComponents(htmlComponents);

        componentManager.initialize();

    });



})(window);