SOSSGRID.plugin().register(function(exports){
    var scope;

    function loadProductCategories(skip, take){
        var handler = exports.getComponent("uom-handler");
        
        handler.transformers.allUom()
        .then(function(result){
            scope.items = result.response;
        })
        .error(function(){
    
        });
    }

    var vueData =  {
        methods:{
            navigatePage: function(){

            }
        },
        data :{
            items : []
        },
        onReady: function(s){
            scope = s;
            loadProductCategories(0,100);
            $("body").css("background-image","none");
        }
    } 

    exports.vue = vueData;
    exports.onReady = function(){
    }
});
