<?php
    define ("CONFIG_FILE", dirname(__FILE__) . "/config.json");

    if (file_exists(CONFIG_FILE)){
        $configData = json_decode(file_get_contents(CONFIG_FILE));
        if (isset($configData)){
            if (isset($configData->variables)){
                foreach ($configData->variables as $key => $value)
                    define($key,$value);
            }
        }
    }else {      
        $protocol = stripos($_SERVER['SERVER_PROTOCOL'],'https') === true ? 'https://' : 'http://';
        header("Location: $protocol$_SERVER[HTTP_HOST]$_SERVER[REQUEST_URI]pages/install");
        exit();
    }

    if (!isset($configData))
        $configData = new stdClass();
        
    $GLOBALS["ENGINE_CONFIG"] = $configData;

    define ("HOST_NAME", $_SERVER["HTTP_HOST"]);
    define ("APP_LOCATION", COMPONENT_LOCATION . "/" . HOST_NAME);
    
    define ("BASE_PATH", dirname(__FILE__));
    define ("COMPONENT_PATH", dirname(__FILE__) . "/components");
    define ("PLUGIN_PATH", dirname(__FILE__) . "/plugins");
?>