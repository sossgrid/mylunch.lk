SOSSGRID.plugin().register(function(exports){
    var scope;

    function loadRiders(skip, take){
        var promiseObj;
        var handler = exports.getComponent("store-handler");

        if (!promiseObj)
            promiseObj = handler.transformers.allStores();

        promiseObj.then(function(result){
            scope.items = result.response;
        }).error(function(){
            
        });
    }
    

    var vueData = {
        methods:{
            navigatePage: function(){

            },
            deleteStore: function(cat){
                var handler = exports.getComponent("store-handler");
                handler.transformers.deleteStore(cat)
                .then(function(result){
                    for (var i=0;i<scope.items.length;i++)
                        if (scope.items[i].id == cat.id){
                            scope.items.splice(i,1);
                            break;
                        }
                })
                .error(function(){
            
                });
            }
        },
        data :{
            items : []
        },
        onReady: function(s){
            scope = s;
            loadRiders(0,100);
            $("body").css("background-image","none");
        }
    }    

    exports.vue = vueData;
    exports.onReady = function(){
    }
});
