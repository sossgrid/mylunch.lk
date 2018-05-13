SOSSGRID.plugin().register(function(exports){
    var scope;

    function loadGrns(category, skip, take){
        
        var promiseObj;
        var handler = exports.getComponent("inventory-handler");

        handler.transformers.allGrn().then(function(result){
            scope.items = result.response;
        }).error(function(){
            
        });
        
        
    }

    var vueData = {
        methods:{
            navigatePage: function(){

            }
        },
        data :{
            items : []
        },
        onReady: function(s){
            scope = s;
            loadGrns(undefined,0,100);
            $("body").css("background-image","none");
        }
    }    

    exports.vue = vueData;
    exports.onReady = function(){
    }
});
