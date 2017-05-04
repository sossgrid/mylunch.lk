SOSSGRID.plugin().configure(function($instance){
    var routes = {
        home : "/home",
        notFound: "/notFound",
        partials : {
            "/home" : "partial-home",
            "/notFound" : "partial-404",
            "/default" : "partial-home",
            "/about" : "partial-about",
            "/cart" : "partial-cart",
            "/services":"partial-services",
            "/user":"partial-user",
            "/item":"partial-item",
            "/products" : "partial-products",
            "/admin" : "partial-admin",
            "/admin-allproducts" : "partial-admin-allproducts",
            "/admin-productform" : "partial-admin-productform",
            "/admin-allcategories" : "partial-admin-allcategories",
            "/admin-categoryform" : "partial-admin-categoryform"
        }
    };

    SOSSGRID.getPlugin("soss-routes").set (routes);
});