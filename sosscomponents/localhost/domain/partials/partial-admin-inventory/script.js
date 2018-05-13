SOSSGRID.plugin().register(function(exports){
    var scope;

    function loadGrns(category, skip, take){
        
        var promiseObj;
        var handler = exports.getComponent("inventory-handler");

        handler.services.allInventory().then(function(result){
            scope.items = result.result;
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
