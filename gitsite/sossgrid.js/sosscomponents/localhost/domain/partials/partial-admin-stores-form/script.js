SOSSGRID.plugin().register(function(exports){
    var scope;
    var handler;
    var pInstance, validatorInstance;
    var routeData;
    
    var bindData = {
        store:{},
        submitErrors: undefined
    };

    var validator;
    function loadValidator(){
        validator = validatorInstance.newValidator (scope);
        validator.map ("store.name",true, "You should enter a name");
        validator.map ("store.address",true, "You should enter an address");
        validator.map ("store.phone",true, "You should enter a phone number");
        validator.map ("store.latitude",true, "You should enter a latitude");
        validator.map ("store.longitude",true, "You should enter a longitude");
    }

    function submit(){
        scope.submitErrors = validator.validate(); 
        if (!scope.submitErrors){

            var promiseObj;
            if (routeData.storeid) promiseObj = handler.transformers.updateStore (bindData.store);
            else promiseObj = handler.transformers.insertStore (bindData.store);

            promiseObj
            .then(function(){
                gotoStores();
            })
            .error(function(){

            });
        }
    }

    function gotoStores(){
        location.href = "#/admin-allstores";
    }

    function loadStore(scope){
        if (routeData.storeid)
        handler.transformers.getStoreById(routeData.storeid)
        .then(function(result){
            if (result.response.length !=0){
                scope.store = result.response[0];
            }
        })
        .error(function(){
    
        });
    }

    var vueData =   {
        methods: {
            submit: submit,
            gotoStores: gotoStores
        },
        data : bindData,
        onReady: function(s){
            scope = s;
            handler = exports.getComponent("store-handler");
            pInstance = exports.getComponent ("soss-routes");
            validatorInstance = exports.getComponent ("soss-validator");
            routeData = pInstance.getInputData();
            loadValidator();
            if (routeData)
                loadStore(scope);
            $("body").css("background-image","none");
        }
    }

    exports.vue = vueData;
    exports.onReady = function(){
    }
});
