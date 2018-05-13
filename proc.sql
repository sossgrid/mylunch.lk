DELIMITER ;;
CREATE PROCEDURE `getnearproducts`(IN `param_lat` DECIMAL(10,8), IN `param_lng` DECIMAL(11,8), IN `param_catid` TEXT, IN `param_radius` INT)
BEGIN
DECLARE var_lan1 decimal(11,8);
DECLARE var_lan2 decimal(11,8);
DECLARE var_lat1 decimal(10,8);
DECLARE var_lat2 decimal(10,8);
SET var_lan1 =param_lng-(1/111*param_radius);
SET var_lan2 =param_lng+(1/111*param_radius);
SET var_lat1 =param_lat-(1/111*param_radius);
SET var_lat2 =param_lat+(1/111*param_radius);
SELECT * FROM ((products INNER JOIN storeproductmapping ON products.itemid=storeproductmapping.productid) INNER JOIN store ON store.id = storeproductmapping.Storeid) where store.latitude between var_lat1 and var_lat2 and store.longitude between var_lan1 and var_lan2 AND products.catogory=param_catid;
END
;;
