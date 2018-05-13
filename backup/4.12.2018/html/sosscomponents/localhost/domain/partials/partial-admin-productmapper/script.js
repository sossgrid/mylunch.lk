SOSSGRID.plugin().register(function(exports){
    var scope;
    var productsLoaded=false;
    var mappingsLoaded=false;
    var storeid;

    function loadInitialData(){

        pInstance = exports.getComponent ("soss-routes");
        routeData = pInstance.getInputData();
        storeid = routeData.storeid;

        var handler = exports.getComponent("product-handler");

        handler.transformers.allProducts()
        .then(function(result){
            scope.products = result.response;
            productsLoaded = true;
            bindData();
        }).error(function(){
            
        });

        handler.transformers.getStoreMappings(storeid)
        .then(function(result){
            scope.mappings = result.response;
            mappingsLoaded = true;
            bindData();
        }).error(function(){
            scope.mappings = [];
            mappingsLoaded = true;
            bindData();
        });
    }

    function bindData(){
        if (productsLoaded && mappingsLoaded){

            for (var i=0;i<scope.products.length;i++){
                var isFound = false;

                for (var j=0;j<scope.mappings.length;j++)
                if (scope.mappings[j].productid == scope.products[i].itemid){
                    isFound = true;
                    break;
                }

                scope.products[i].checked = isFound;
                scope.allProducts.push(scope.products[i]);
            }
        }
        console.log(scope.products);
    }
    

    function submit(){
        var createMappings = [];
        var deleteMappings = [];

        for (var i=0;i<scope.products.length;i++){
            
            if (scope.products[i].checked){
                isNew = true;

                for (var j=0;j<scope.mappings.length;j++){
                    if (scope.products[i].itemid == scope.mappings[j].productid){
                        isNew = false;
                        break;
                    }
                }
    
                if (isNew){
                    createMappings.push({
                        storeid:storeid,
                        productid:scope.products[i].itemid
                    })
                }
            }
        }

        for (var i=0;i<scope.products.length;i++){
            
            if (!scope.products[i].checked){
                isDelete = false;

                for (var j=0;j<scope.mappings.length;j++){
                    if (scope.products[i].itemid == scope.mappings[j].productid){
                        isDelete = true;
                        break;
                    }
                }
    
                if (isDelete){
                    deleteMappings.push({
                        storeid:storeid,
                        productid:scope.products[i].itemid
                    })
                }
            }
        }

        if (createMappings.length >0)
            callCreateMappings(createMappings);
        else
            isCreateCalled = true;

        if (deleteMappings.length >0)
            callDeleteMappings(deleteMappings);
        else
            isDeleteCalled = true;

        if (createMappings.length ==0 && deleteMappings.length ==0)
            endCallback();
    }

    isCreateCalled=false;
    isDeleteCalled=false;
    function callCreateMappings(mappings){
        var handler = exports.getComponent("product-handler");

        handler.transformers.createStoreMappings(mappings)
        .then(function(result){
            isCreateCalled = true;
            endCallback();
        })
        .error(function(){
            isCreateCalled = true;
            endCallback();
        });
    }

    function callDeleteMappings(mappings){
        var handler = exports.getComponent("product-handler");

        handler.transformers.deleteStoreMappings(mappings)
        .then(function(result){
            isDeleteCalled = true;
            endCallback();
        })
        .error(function(){
            isCreateCalled = true;
            endCallback();
        });
    }

    function endCallback(){
        if(isCreateCalled && isDeleteCalled)
            location.href = "#/admin-allstores";
    }

    function navigateToStores(){
        
    }

    var vueData = {
        methods:{
            submit:submit,
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
            products : [],
            allProducts:[]
        },
        onReady: function(s){
            scope = s;
            loadInitialData();
            $("body").css("background-image","none");
        }
    }    

    exports.vue = vueData;
    exports.onReady = function(){
    }
});
