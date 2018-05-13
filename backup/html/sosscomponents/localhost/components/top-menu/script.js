SOSSGRID.plugin().register(function(exports){
    
    var mycart,login;

    toastr.options = {
        "closeButton": false,
        "debug": false,
        "newestOnTop": false,
        "progressBar": false,
        "positionClass": "toast-bottom-right",
        "preventDuplicates": false,
        "onclick": null,
        "showDuration": "300",
        "hideDuration": "500",
        "timeOut": "2000",
        "extendedTimeOut": "1000",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut"
    }

    function GetItemCount(){
        var itemsCount=0;
        if(localStorage.items){
            items=JSON.parse(localStorage.items);
            this.itemcount=0;
            for(i in items){
                itemsCount+=items[i].qty
            }
        }
        return itemsCount;
    }

    function createVue(element){

        function navigate(cat, isPage){
            $('.navbar-collapse').collapse('hide');
            if (!isPage)
                location.href="#/home?cat=" + cat;
            else
                location.href="#/" + cat;
        }

        function logout(isMobile){
            var self = this;
            var handler = exports.getComponent("login-handler");
            handler.services.logout()
            .then(function(result){
                localStorage.removeItem("loginData");
                self.isLogin=false;
                if (isMobile)
                    location.href="#/mobilewelcome";
            })
            .error(function(){
                toastr.error('Error logging out', 'Log out error');
            });
        }

        function loadInitialData(element){
            var handler = exports.getComponent("product-handler");

            handler.transformers.allCategories()
            .then(function(result){
                element.items = result.response;
            })
            .error(function(){
        
            });
        } 

        var navigator =new Vue({
            el: '#menuSection1',
            data:{},
            methods: {
                navigate:navigate,
                logout:logout
            }
        });

        var mobileMenu =new Vue({
            el: '#header-menu',
            data:{items:[]},
            methods: {
                navigate:navigate,
                logout:logout
            }
        });
        loadInitialData(mobileMenu);

        mycart=new Vue({
            el: '#header-cart',
            data:{itemcount:GetItemCount(),x:10},
            methods: {
                additems: function (items) {
                    this.itemcount=GetItemCount();
                    toastr.success('Item added to cart. Go eat it now...!');
                    
                }
            }
        });

       /*
        var closeButton = new Vue({
            el: '#idHeaderCloseButton',
            data:{},
            methods: {
                closeApp: function () {
                    window.close();
                }
            }
        });
        */

        login=new Vue({
            el: '#header-login',
            data:{isLogin:false,
                email:"",
                name:"",
                profileurl:"",password:"",
                isa:false 
            },
                
            methods: {
                checkSession: function(){
                    var loginData = localStorage.loginData ? JSON.parse(localStorage.loginData) : undefined;
                    
                    var self = this;
                    if(loginData){
                        var handler = exports.getComponent("login-handler");
                        
                        handler.services.getSession({token:loginData.token})
                        .then(function(result){
                            if (result.result)
                                result = result.result;
                            
                            if (result.error){
                                localStorage.removeItem("loginData");
                            }else{
                                var passhash = CryptoJS.MD5(result.email);
                                self.profileimage = "https://www.gravatar.com/avatar/" + passhash+"?s=200&r=pg&d=mm";
                                self.userid=result.userid;
                                self.email=result.email;
                                self.name=result.email;
                                self.isLogin=true;
                                self.password="";
                                console.log(result); 
                                console.log("result");
                                
                                if (loginData.email === "admin@mylunch.lk")
                                    self.isa = true;
                            }

                            
                        })
                        .error(function(){
                            self.isLogin=false;
                            self.password="";
                            toastr.error('Session is not valied.', 'Security!');
                            
                        });
                    }
                },
                logout:function(isMobile){
                    var self = this;
                    var handler = exports.getComponent("login-handler");
                    handler.services.logout()
                    .then(function(result){
                        localStorage.removeItem("loginData");
                        self.isLogin=false;
                        if (isMobile)
                            location.href="#/mobilewelcome";
                    })
                    .error(function(){
                        toastr.error('Error logging out', 'Log out error');
                    });
                },
                login: function () {
                    //this.isLogin=true;
                    var self = this;
                    var handler = exports.getComponent("login-handler");
                    handler.services.login({email: this.email,password:this.password,domain:window.location.hostname}).then(function(result){
                        if (result.result)
                            result = result.result;
                        if (!result.error){
                            var passhash = CryptoJS.MD5(result.email);
                            self.profileimage = "https://www.gravatar.com/avatar/" + passhash+"?s=200&r=pg&d=mm";
                            self.userid=result.userid;
                            self.email=result.email;
                            if (self.email === "admin@mylunch.lk")
                            self.isa = true;
                            self.name=result.email;
                            self.isLogin=true;
                            self.password="";
                            localStorage.loginData = JSON.stringify(result);
                            console.log(result); 

                            var profile = {address:{gpspoint:""},address2:{},address3:{}};
                            profile.email = result.email;
                            localStorage.deliverInfo = JSON.stringify(profile);

                            SOSSGRID.callRest("http://en.gravatar.com/"+self.email+".json")
                                .success(function(result){
                                    self.profileurl=result.thumbnailUrl;
                                })
                            .error(function(){
                                //this.isLogin=false;
                                //self.password="";
                                //toastr.error('please update your profile pic on gravatar.', 'profile!');
                                console.log("No Profile pic");
                                
                            }); 
                        }else {
                            toastr.error('email and password is incorrect.', 'Security!');    
                        }

 
                    }).error(function(){
                        this.isLogin=false;
                        self.password="";
                        toastr.error('email and password is incorrect.', 'Security!');
                    });
                }

            }
        });
        login.checkSession();

        exports.additems = mycart.additems;
    }
    
    exports.onReady = createVue;
    
});
