SOSSGRID.plugin().register(function(exports){
    var scope;
    var pInstance;
    var routeData;
    var validatorInstance;
    var handler;
    var bindData = {
        product:{},
        image:'',
        categories:[],
        uoms: [],
        submitErrors: undefined
    };


    var validator;

    function loadValidator(){
        validator = validatorInstance.newValidator (scope);
        validator.map ("product.name",true, "You should enter a name");
        validator.map ("product.caption",true, "You should enter a caption");
        validator.map ("product.price",true, "You should endter a price");
        validator.map ("product.price","number", "Price should be a number");
        validator.map ("product.catogory",true, "You should select a product category");
        validator.map ("image",true, "You should upload an image");
    }

    function submit(){
        scope.submitErrors = validator.validate(); 
        if (!scope.submitErrors){

            var promiseObj;
            if (routeData.productid) promiseObj = handler.transformers.updateProduct(bindData.product);
            else promiseObj = handler.transformers.insertProduct(bindData.product);

            promiseObj
            .then(function(result){
                var productId = result.response.generatedId;
                uploadFile(productId, function(){
                    gotoProducts();
                });
            })
            .error(function(){

            });
        }
    }

    function gotoProducts(){
        location.href = "#/admin-allproducts";
    }

    function loadProduct(scope){
        handler.transformers.getById(routeData.productid)
        .then(function(result){
            if (result.response.length !=0){
                scope.product = result.response[0];
                scope.image = "apis/fileuploader/get/products/" + scope.product.itemid;
            }
        })
        .error(function(){

        });
    }

    function loadInitialData(){
        handler.transformers.allCategories()
        .then(function(result){
            for (var i=0;i<result.response.length;i++)
            bindData.categories.push(result.response[i].name);
        })
        .error(function(){

        });

        uomhandler.transformers.allUom()
        .then(function(result){
            for (var i=0;i<result.response.length;i++)
            bindData.uoms.push(result.response[i]["symbol"]);
        })
        .error(function(){

        });
    }

    var newFile;
    function uploadFile(productId, cb){
        if (!newFile)cb();
        else{
            uploaderInstance.services.uploadFile(newFile, "products", productId)
            .then(function(result){
                cb();
            })
            .error(function(){
                cb();
            });
        }
    }

    var vueData = {
        methods: {
            submit: submit,
            gotoProducts: gotoProducts,
            onFileChange: function(e) {
                var files = e.target.files || e.dataTransfer.files;
                if (!files.length)
                    return;
                this.createImage(files[0]);
            },
            createImage: function(file) {
                newFile = file;
                var image = new Image();
                var reader = new FileReader();

                reader.onload = function (e) {
                    scope.image = e.target.result;
                };

                reader.readAsDataURL(file);
            },
            removeImage: function (e) {
                scope.image = '';
            }
        },
        data : bindData,
        onReady: function(s){
            pInstance = exports.getComponent ("soss-routes");
            routeData = pInstance.getInputData();
            validatorInstance = exports.getComponent ("soss-validator");
            handler = exports.getComponent ("product-handler");
            uomhandler = exports.getComponent ("uom-handler");
            uploaderInstance = exports.getComponent ("soss-uploader");

            scope = s;
            loadValidator();
            if (routeData.productid)
                loadProduct(scope);
            loadInitialData();
            $("body").css("background-image","none");
        }
    }

    exports.vue = vueData;
    exports.onReady = function(){
    }    
});

