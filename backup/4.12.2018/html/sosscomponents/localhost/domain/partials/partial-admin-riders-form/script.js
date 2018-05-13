SOSSGRID.plugin().register(function(exports){
    var scope;
    var handler;
    var pInstance, validatorInstance;
    var routeData;
    
    var bindData = {
        rider:{},
        submitErrors: undefined
    };

    var validator;
    function loadValidator(){
        validator = validatorInstance.newValidator (scope);
        validator.map ("rider.name",true, "You should enter a name");
        validator.map ("rider.username",true, "You should enter a name");
        validator.map ("rider.phonenumber1",true, "You should enter a name");
    }

    function submit(){
        scope.submitErrors = validator.validate(); 
        if (!scope.submitErrors){

            var promiseObj;
            if (routeData.riderid) promiseObj = handler.transformers.updateRider (bindData.rider);
            else promiseObj = handler.transformers.insertRider (bindData.rider);

            promiseObj
            .then(function(){
                gotoRiders();
            })
            .error(function(){

            });
        }
    }

    function gotoRiders(){
        location.href = "#/admin-allriders";
    }

    function loadRider(scope){
        if (routeData.riderid)
        handler.transformers.getRiderById(routeData.riderid)
        .then(function(result){
            if (result.response.length !=0){
                scope.rider = result.response[0];
            }
        })
        .error(function(){
    
        });
    }

    var vueData =   {
        methods: {
            submit: submit,
            gotoRiders: gotoRiders
        },
        data : bindData,
        onReady: function(s){
            scope = s;
            handler = exports.getComponent("rider-handler");
            pInstance = exports.getComponent ("soss-routes");
            validatorInstance = exports.getComponent ("soss-validator");
            routeData = pInstance.getInputData();
            loadValidator();
            if (routeData)
                loadRider(scope);
            $("body").css("background-image","none");
        }
    }

    exports.vue = vueData;
    exports.onReady = function(){
    }
});
