<?php
    require_once ("../config.php");
    require_once (dirname(__FILE__) . "/common.php");
    require_once (dirname(__FILE__) . "/resources.php");
    require_once (dirname(__FILE__) . "/carbite.php");
    require_once (dirname(__FILE__) . "/component_manager.php");
    require_once (dirname(__FILE__) . "/virtual_firewall.php");

    $componentManager = new ComponentManager();
    $virtualFirewall = new VirtualFirewall();

    
    
    Carbite::GET("/object/descriptor", [$componentManager,"GetAppDescriptor"]);
    Carbite::GET("/@componentName/file/*filePath", [$componentManager,"HandleFile"], [[$virtualFirewall,"CheckAuthentication"]]);
    Carbite::GET("/@componentName/service/@handlerName", [$componentManager,"HandleService"], [[$virtualFirewall,"CheckAuthentication"]]);
    Carbite::GET("/@componentName/object", [$componentManager,"HandleComponent"], [[$virtualFirewall,"CheckAuthentication"]]);
    Carbite::GET("/@componentName/transform/*route", [$componentManager,"HandleTransformer"], [[$virtualFirewall,"CheckAuthentication"]]);
    Carbite::POST("/@componentName/transform/*route", [$componentManager,"HandleTransformer"], [[$virtualFirewall,"CheckAuthentication"]]);    
    Carbite::Start();
?>