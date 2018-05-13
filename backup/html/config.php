<?php
//error_reporting(E_ALL);
//ini_set('display_errors', '1');

    define ("COMPONENT_LOCATION","/var/sosscomponents");
    define ("MEDIA_FOLDER", "/var/media");
    define ("HOST_NAME", $_SERVER["HTTP_HOST"]);
    define ("APP_LOCATION", COMPONENT_LOCATION . "/" . HOST_NAME);
    
    define ("BASE_PATH", dirname(__FILE__));
    define ("COMPONENT_PATH", dirname(__FILE__) . "/components");
    define ("LIB_PATH", dirname(__FILE__) . "/lib");

    define ("OS_URL", "http://localhost:9000/data");
?>
