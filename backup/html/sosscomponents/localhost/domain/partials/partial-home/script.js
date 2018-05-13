SOSSGRID.plugin().register(function(exports){

    var bindData =  {
            message : "Works!!!",
            items: [],
            canShowSlider:true
    };

    var services = {}

    var routeData;

    var vueData =  {
        data : bindData,
        onReady: function(app){

            $("#idHeader").css("visibility","visible");
            $("#idFooter").css("visibility","visible");
            
            var pInstance = exports.getComponent ("soss-routes");
            routeData = pInstance.getInputData();

            services.product = exports.getComponent("product-handler");
            services.topMenu = exports.getComponent("top-menu");

            var promiseObj;
            
            if (routeData)
            if (routeData.cat){
                promiseObj = services.product.services.allProducts({catid:routeData.cat});
                app.canShowSlider = false;
            }

            if (!promiseObj)
                promiseObj = services.product.services.allProducts();

            promiseObj.then(function(result){
                bindData.items = result.result;
            }).error(function(){
                console.log(result);
            });

            $('.carousel').carousel({
                interval: 2000
            });
        },
        methods:{
            additem:function(item,isOrder){
                items=[];
                if(localStorage.items){           
                    items=JSON.parse(localStorage.items);
                }
                x=0;
                for(i in items){
                    if(items[i].itemid===item.itemid){
                        items[i].qty++;
                        items[i].isOrder = isOrder;
                        localStorage.items=JSON.stringify(items);
                        services.topMenu.additems(items[i]);
                        return;
                    }
                    x++;
                }
                item.qty=1;
                item.isOrder = isOrder;
                items.push(item);
                localStorage.items=JSON.stringify(items);
                services.topMenu.additems(items);
            }
        }
    }

    exports.vue = vueData;
    exports.onReady = function(){
        $("#idHeader").css("visibility","visible");
        $("#idFooter").css("visibility","visible");
    }
});
