SOSSGRID.plugin().register(function(exports){

    var w = window;
    var pInstance = w.SOSSGRID.getPlugin ("soss-routes");
    

    var exports = {
        inject: function (data, instance, cb){
            if (!data)
                return;
                
            try {
                var routeSettings = pInstance.getSettings();
                var renderDiv = $("#" + routeSettings.routes.renderDiv);

                var vueData, view;        
                for (var i=0;i<data.length;i++)
                if (data[i].object.type === "mainView")
                    view = data[i].object.view;

                renderDiv.html(view);

                if (!instance)
                    return;

                if (instance.onLoad)
                    instance.onLoad(instance);
                
                vueData = instance.vue; 
                
                if (vueData.onBeforeRender)
                    vueData.onBeforeRender();
                
                vueData.el = '#' + routeSettings.routes.renderDiv;

                var app = new Vue(vueData);
                if (vueData.onReady)
                    vueData.onReady(app, renderDiv);
                cb (data);
            } catch (e){
                console.log ("Error Occured While Loading...");
                console.log (e);
                cb();
            }
        }
    };
    pInstance.configure ("inject-engine", exports);
});