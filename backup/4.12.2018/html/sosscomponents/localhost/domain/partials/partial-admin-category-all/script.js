SOSSGRID.plugin().register(function(exports){
    var scope;

    function loadProductCategories(skip, take){
        var handler = exports.getComponent("product-handler");
        
        handler.transformers.allCategories()
        .then(function(result){
            scope.items = result.response;
        })
        .error(function(){
    
        });
    }

    var vueData =  {
        methods:{
            navigatePage: function(){

            },
            deleteCategory: function(cat){
                var handler = exports.getComponent("product-handler");
                handler.transformers.deleteCategory(cat)
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
            loadProductCategories(0,100);
            $("body").css("background-image","none");
        }
    } 

    exports.vue = vueData;
    exports.onReady = function(){
    }
});
