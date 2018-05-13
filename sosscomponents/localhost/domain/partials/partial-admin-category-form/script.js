SOSSGRID.plugin().register(function(exports){
    var scope;
    var handler;
    var pInstance, validatorInstance;
    var routeData;
    
    var bindData = {
        product:{},
        submitErrors: undefined
    };

    var validator;
    function loadValidator(){
        validator = validatorInstance.newValidator (scope);
        validator.map ("product.name",true, "You should enter a name");
    }

    function submit(){
        scope.submitErrors = validator.validate(); 
        if (!scope.submitErrors){

            var promiseObj;
            if (routeData.catid) promiseObj = handler.transformers.updateCategory (bindData.product);
            else promiseObj = handler.transformers.insertCategory (bindData.product);

            promiseObj
            .then(function(){
                gotoProducts();
            })
            .error(function(){

            });
        }
    }

    function gotoProducts(){
        location.href = "#/admin-allcategories";
    }

    function loadCategory(scope){
        if (routeData.catid)
        handler.transformers.getCategoryById(routeData.catid)
        .then(function(result){
            if (result.response.length !=0){
                scope.product = result.response[0];
            }
        })
        .error(function(){
    
        });
    }

    var vueData =   {
        methods: {
            submit: submit,
            gotoProducts: gotoProducts
        },
        data : bindData,
        onReady: function(s){
            scope = s;
            handler = exports.getComponent("product-handler");
            pInstance = exports.getComponent ("soss-routes");
            validatorInstance = exports.getComponent ("soss-validator");
            routeData = pInstance.getInputData();
            loadValidator();
            if (routeData)
                loadCategory(scope);
            $("body").css("background-image","none");
        }
    }

    exports.vue = vueData;
    exports.onReady = function(){
    }
});
