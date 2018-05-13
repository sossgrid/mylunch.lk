SOSSGRID.plugin().register(function(exports){

    var bindData = {
        items: [
            {
                href : "#/admin-uom",
                imgSrc:  "img/admin/uom.png",
                name: "UOM",
                description : "Manage the Unit of Meature"

            },
            {
                href : "#/admin-allcategories",
                imgSrc:  "img/admin/categorymanage.png",
                name: "Product Categories",
                description : "Manage all the products categories"

            },
            {
                href : "#/admin-allproducts",
                imgSrc:  "img/admin/prodmanage.png",
                name: "Products",
                description : "Manage all the products in the inventory"

            },
            {
                href : "#/admin-allriders",
                imgSrc:  "img/admin/rider.png",
                name: "Riders",
                description : "Manage all the riders in the company"

            },
            {
                href : "#/admin-grn",
                imgSrc:  "img/admin/grn.jpg",
                name: "GRN",
                description : "Create/View GRN"

            },
            {
                href : "#/admin-inventory",
                imgSrc:  "img/admin/inventory.png",
                name: "Inventory",
                description : "Manage all the products in the inventory"

            },
            {
                href : "#/admin-orders",
                imgSrc:  "img/admin/order.png",
                name: "Orders",
                description : "Manage Orders"

            }
        ]
    }

    var vueData =  {
        data : bindData,
        onReady: function(app){
            $("body").css("background-image","none");
        },
        methods:{

        }
    }

    exports.vue = vueData;
    exports.onReady = function(){
    }
});