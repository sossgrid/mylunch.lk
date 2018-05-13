SOSSGRID.plugin().register(function(exports){
    var scope;
    var handler;
    var pInstance, validatorInstance;
    var routeData;
    
    var bindData = {
        item:{},
        submitErrors: undefined
    };

    var validator;
    function loadValidator(){
        validator = validatorInstance.newValidator (scope);
        validator.map ("item.name",true, "You should enter a name");
        validator.map ("item.symbol",true, "You should enter a symbol");
    }

    function submit(){
        scope.submitErrors = validator.validate(); 
        if (!scope.submitErrors){

            var promiseObj;
            if (routeData.uomid) promiseObj = handler.transformers.updateUom (bindData.item);
            else promiseObj = handler.transformers.insertUom (bindData.item);

            promiseObj
            .then(function(){
                gotoUom();
            })
            .error(function(){

            });
        }
    }

    function gotoUom(){
        location.href = "#/admin-uom";
    }

    function loadCategory(scope){
        if (routeData.uomid)
        handler.transformers.getUomById(routeData.uomid)
        .then(function(result){
            if (result.response.length !=0){
                scope.item = result.response[0];
            }
        })
        .error(function(){
    
        });
    }

    var vueData =   {
        methods: {
            submit: submit,
            gotoUom: gotoUom
        },
        data : bindData,
        onReady: function(s){
            scope = s;
            handler = exports.getComponent("uom-handler");
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
