SOSSGRID.plugin().register(function(exports){

    var bindData =  {
            message : "Works!!!",
            items: []
    };

    var services = {}

    var routeData;

    var vueData =  {
        data : bindData,
        onReady: function(app){
            
            services.product = exports.getComponent("product-handler");
            services.topMenu = exports.getComponent("top-menu");

            services.product.test().then(function(result){
                bindData.items = result.result;
            }).error(function(){
                console.log(result);
            });
            /*
            var reqUrl;
            if (routeData) if (routeData.cat) reqUrl = "apis/products/bycat/" + routeData.cat;
            if (!reqUrl) reqUrl = "apis/products/all";
                
            $.ajax({url: reqUrl, success: function(result){
                bindData.items = result.response;
            }});
            */
        },
        methods:{
            additem:function(item){
                items=[];
                if(localStorage.items){           
                    items=JSON.parse(localStorage.items);
                }
                x=0;
                for(i in items){
                    console.log(i);
                    if(items[i].itemid===item.itemid){
                        items[i].qty++;
                        //console.log(i.qty);
                        console.log(items[i]);
                       
                        localStorage.items=JSON.stringify(items);
                        services.topMenu.additems(items[i]);
                        return
                    }
                    x++;
                }
                item.qty=1;
                items.push(item);
                localStorage.items=JSON.stringify(items);
                console.log(items);
                services.topMenu.additems(items);
            }
        }
    }

    exports.vue = vueData;
    exports.onReady = function(){
        var pInstance = window.SOSSGRID.getPlugin ("routes");
        routeData = pInstance.getInputData();
    }
});
