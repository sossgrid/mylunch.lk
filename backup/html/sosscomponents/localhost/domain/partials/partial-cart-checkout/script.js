
function partial_cart_checkout_gmap_callback() {
    var map, marker;
    var markerOldPosition,markerNewPosition;
    //var bounds = new google.maps.LatLngBounds(sw, ne);
    
    var plugObj = SOSSGRID.getPlugin("partial-cart-checkout");
    window.googleMapsLoaded = true;
    function onInitMap(lat,lng){
        if (!map){
            map = new google.maps.Map(document.getElementById('myLunchMap'), {
                center: {lat: lat, lng: lng},
                zoom: 17
            });

            marker = new google.maps.Marker({
                position: {lat: lat, lng: lng},
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

            map.setZoom(17);
            map.panTo(marker.position);
        }else {
            var latlng = new google.maps.LatLng(lat,lng);
            marker.setPosition(latlng);
            map.panTo(marker.position);
        }
        
    }

    if (plugObj.latLng) //geolocation loaded first
        onInitMap(plugObj.latLng.lat,plugObj.latLng.lng); 
    else //google maps loaded first
        plugObj.onInitMap = onInitMap; 
}

SOSSGRID.plugin().register(function(exports){
    var scope;
    var validator;

    function createHistoryObject(){
        var hasItem = false;

        var currentItem = scope.profile;
        var equalArray = [];
        for (var i=0;i<scope.deliveryHistory.length;i++){
            var histItem = scope.deliveryHistory[i];
            var isEqual = true;

            if (currentItem.name !== histItem.name) isEqual = false;
            if (currentItem.contactno1 !== histItem.contactno1) isEqual = false;
            if (currentItem.contactno2 !== histItem.contactno2) isEqual = false;
            if (currentItem.email !== histItem.email) isEqual = false;
            if (currentItem.remarks !== histItem.remarks) isEqual = false;
            if (currentItem.address && histItem.address){
                if (currentItem.address.addressline1 !== histItem.address.addressline1) isEqual = false;
                if (currentItem.address.addressline2 !== histItem.address.addressline2) isEqual = false;
                if (currentItem.address.city !== histItem.address.city) isEqual = false;
                if (currentItem.address.gpspoint !== histItem.address.gpspoint) isEqual = false;
            }
            
            if (isEqual){
                hasItem = true;
                break;
            }
        }

        if (!hasItem)
            scope.deliveryHistory.push(scope.profile);
        
        localStorage.deliveryHistory = JSON.stringify(scope.deliveryHistory);
    }

    function submit(){       
        scope.submitErrors = validator.validate(); 
        if (!scope.submitErrors){
            createHistoryObject();
            if(localStorage.items)
                scope.profile.items=JSON.parse(localStorage.items);

            localStorage.deliverInfo = JSON.stringify(scope.profile);
            location.href="#/payment";
        }
    }

    var bindData = {
            profile: {address:{gpspoint:""},address2:{},address3:{}},
            submitErrors : [],
            cities:[],
            deliveryHistory:[]
    };

    if (localStorage.deliveryHistory)
        bindData.deliveryHistory = JSON.parse(localStorage.deliveryHistory);

    for (var i=1;i<=15;i++){
        bindData.cities.push ("Colombo - "  + i);
    }

    if (localStorage.deliverInfo)
        bindData.profile = JSON.parse(localStorage.deliverInfo);

    function loadValidator(){
        var validatorInstance = exports.getComponent ("soss-validator");
        validator = validatorInstance.newValidator (scope);
        validator.map ("profile.name",true, "You should enter your full name");
        validator.map ("profile.contactno1",true, "You should enter your contact number");
        validator.map ("profile.email",true, "You should enter your email");
        validator.map ("profile.address.addressline1",true, "You should enter an address");
        //validator.map ("profile.address.addressline2",true, "You should enter address line 2");
        validator.map ("profile.address.city",true, "You should select a colombo region");

        validator.map ("profile.contactno1","numeric", "The contact number field should only contain numbers");
        //validator.map ("profile.email","email", "Invalid email address");

    }

    function upadteLocationInMap(lat,lng){
        if (exports.onInitMap) //google maps loaded first
            exports.onInitMap(lat,lng);
        else //geolocation loaded first
            exports.latLng = {lat:lat ,lng:lng};
    }

    var defaultLatLng = {
        lat:6.879618672440538,
        lng: 79.85974331143188
    }

    function getMyLocation(){
        var lat = defaultLatLng.lat,lng = defaultLatLng.lng;
        
        if (navigator.geolocation) {
            
            var watchId = navigator.geolocation.watchPosition(function(position){
                if (position.coords){
                    lat = position.coords.latitude;
                    lng = position.coords.longitude;
                    defaultLatLng.lat = lat;
                    defaultLatLng.lng = lng;
                }

                scope.profile.address.gpspoint = lat + ","  + lng;
                
                upadteLocationInMap(lat,lng);
                navigator.geolocation.clearWatch(watchId);
            }, function(err){
                console.log(err);
                scope.profile.address.gpspoint = lat + ","  + lng;
                upadteLocationInMap(lat,lng);    
            },{timeout: 10000, enableHighAccuracy: false});
        } else {
            scope.profile.address.gpspoint = lat + ","  + lng;
            upadteLocationInMap(lat,lng);
        }
    }

    var vueData =  {
       data : bindData,
       onReady: function(s){
           scope = s;
           var self = this;
           loadValidator();

           if (!window.googleMapsLoaded){
                var head= document.getElementsByTagName('head')[0];
                var script= document.createElement('script');
                script.type= 'text/javascript';
                script.src= window.location.protocol + "//maps.googleapis.com/maps/api/js?key=AIzaSyBL3DJiw5bsubnv67q-mNfect1uHWjRiRE&callback=partial_cart_checkout_gmap_callback";
                head.appendChild(script);
           }else{
                partial_cart_checkout_gmap_callback();
           }

           getMyLocation();

       },
       methods:{
            closeModal: function(){
                $('#modalOrderHistory').modal('hide');
            },
            cardClick: function(event){
                event.stopPropagation();
            },
            submit:submit,
            getMyLocation:getMyLocation,
            showDeliveryHistory: function(){
                $('#modalOrderHistory').modal('show');
            },
            selectDeliveryLocation: function(obj){
                scope.profile = obj;

                if (obj.address)
                if (obj.address.gpspoint){
                    $('#modalOrderHistory').modal('hide');
                    if (obj.address.gpspoint !== undefined)
                    if (obj.address.gpspoint.indexOf(",") !== -1){
                        var splitData = obj.address.gpspoint.split(",");
                        upadteLocationInMap(parseFloat(splitData[0]), parseFloat(splitData[1]));
                    }
                }
                
            }
        }
    }

    exports.vue = vueData;
    exports.onReady = function(){

    }
    exports.updateMarkerPos = function(marker){
        defaultLatLng.lat = marker.lat();
        defaultLatLng.lng = marker.lng();
        bindData.profile.address.gpspoint = marker.lat() + ","  + marker.lng();
    }

});

