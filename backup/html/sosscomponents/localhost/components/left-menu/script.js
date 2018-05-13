SOSSGRID.plugin().register(function(exports){
    
    function createVue(element){

        prodCategories=new Vue({
        el: '#idProdCategories',
        data:{categories:[], activeItem: ""},
        methods: {
            load: function (items) {
                var self = this;

                var handler = exports.getComponent("product-handler");

                var pInstance = exports.getComponent ("soss-routes");
                var routeData = pInstance.getInputData();
                if (routeData)
                if (routeData.cat)
                    self.activeItem = routeData.cat;

                handler.transformers.allCategories()
                .then(function(result){
                    for (var i=0;i<result.response.length;i++){
                        if (i==0 && !self.activeItem)
                            self.activeItem = result.response[0];
                        self.categories.push(result.response[i]);
                    }
                })
                .error(function(){
            
                });
            },
            navigatePage: function(name){
                this.activeItem = name;
                window.location ="#/home?cat=" + name;
            }
        }
        });

        prodCategories.load();   
    }
    
    exports.onReady = createVue;
});
