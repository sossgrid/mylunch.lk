SOSSGRID.plugin().register(function(exports){
    var scope;

    function loadProducts(category, skip, take){
        var promiseObj;
        var handler = exports.getComponent("product-handler");

        if (category)
            promiseObj = handler.transformers.getByCategory(category);

        if (!promiseObj)
            promiseObj = handler.transformers.allProducts();

        promiseObj.then(function(result){
            scope.items = result.response;
        }).error(function(){
            
        });
    }
    

    var vueData = {
        methods:{
            navigatePage: function(){

            },
            deleteProduct: function(prod){
                var handler = exports.getComponent("product-handler");
                handler.transformers.deleteProduct(prod)
                .then(function(result){
                    for (var i=0;i<scope.items.length;i++)
                        if (scope.items[i].itemid == prod.itemid){
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
            loadProducts(undefined,0,100);
            $("body").css("background-image","none");
        }
    }    

    exports.vue = vueData;
    exports.onReady = function(){
    }
});
