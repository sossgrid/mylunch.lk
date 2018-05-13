SOSSGRID.plugin().register(function(exports){
    var scope;
    var bindData = {deliverToday:false};
    var vueData =  {
       data : bindData,
       onReady: function(){
            bindData.deliverToday = localStorage.deliverToday === 'true';
            localStorage.removeItem("deliverToday");

       }
    }
    

    exports.vue = vueData;
    exports.onReady = function(){
    }
});

