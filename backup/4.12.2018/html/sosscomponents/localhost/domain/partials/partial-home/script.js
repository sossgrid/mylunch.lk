function partial_home_gmap_callback(){
    var plugObj = SOSSGRID.getPlugin("partial-home");
    var markerOldPosition,markerNewPosition, marker,map;

    var defaultLatLng = {
        lat:6.879618672440538,
        lng: 79.85974331143188
    };

    map = new google.maps.Map(document.getElementById('myLunchMapHome'), {
        center: defaultLatLng,
        zoom: 17
    });

    marker = new google.maps.Marker({
        position: defaultLatLng,
        map: map,
        title: 'You are Here',
        draggable:true
    });

    google.maps.event.addListener(marker, 'dragstart', function(evt) 
    {
        markerOldPosition = this.getPosition();
    });

    google.maps.event.addListener(marker, 'dragend', function(evt) 
    {
        markerNewPosition = this.getPosition();
        plugObj.updateMarkerPos(evt.latLng);
    });

    function updateMarker (pos){
        var latlng = new google.maps.LatLng(pos.lat,pos.lng);
        marker.setPosition(latlng);
        map.panTo(marker.position);
    }

    map.setZoom(17);
    map.panTo(marker.position);
    plugObj.completeTrigger(updateMarker);
}

SOSSGRID.plugin().register(function(exports){

    var bindData =  {
            message : "Works!!!",
            items: [],
            canShowSlider:true,
            gpspoint: "",
            isMapsLoaded : false
    };

    var services = {}

    var routeData;

    var updateLocationCallback;
    
    var defaultLatLng = {
        lat:6.879618672440538,
        lng: 79.85974331143188
    }

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
                promiseObj = services.product.services.allProducts({catid:routeData.cat, lat:routeData.lat, lng:routeData.lng});
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
            },
            getCurrentLocation: function(){
                navigator.geolocation.getCurrentPosition(function(pos){
                    defaultLatLng.lat = pos.coords.latitude;
                    defaultLatLng.lng = pos.coords.longitude;
                    updateLocationCallback(defaultLatLng);
                },function(){
                    
                });
            },
            selectLocation: function(){
                localStorage.setItem("defaultLocation", JSON.stringify(defaultLatLng));
                bindData.gpspoint = defaultLatLng;
                var plugObj = SOSSGRID.getPlugin("left-menu");
                plugObj.updateLocation(defaultLatLng);
                $("#idLocationPicker").modal("hide");
            }
        }
    }

    function checkGeoLocation(){
        var defLocation = localStorage.getItem("defaultLocation");
        if (defLocation){
            bindData.gpspoint = JSON.parse(defLocation);
            var plugObj = SOSSGRID.getPlugin("left-menu");
            plugObj.updateLocation(bindData.gpspoint);

        }else{
            $("#idLocationPicker").modal("show");

            if (!window.googleMapsLoaded){
                var head= document.getElementsByTagName('head')[0];
                var script= document.createElement('script');
                script.type= 'text/javascript';
                script.src= window.location.protocol + "//maps.googleapis.com/maps/api/js?key=AIzaSyBL3DJiw5bsubnv67q-mNfect1uHWjRiRE&callback=partial_home_gmap_callback";
                head.appendChild(script);
           }else{
                partial_home_gmap_callback();
                bindData.isMapsLoaded = true;
           }
        }

    }

    exports.vue = vueData;
    exports.onReady = function(){
        $("#idHeader").css("visibility","visible");
        $("#idFooter").css("visibility","visible");
        checkGeoLocation();
    }

    exports.updateMarkerPos = function(marker){
        defaultLatLng.lat = marker.lat();
        defaultLatLng.lng = marker.lng();
        bindData.gpspoint = defaultLatLng;
    }

    exports.completeTrigger = function(updateCb){
        bindData.isMapsLoaded = true;
        updateLocationCallback = updateCb;
    }
});
