<?php

    class ComponentManager {

        function __construct(){

        }

        private function getComponentDescriptor($req, $res, $asObject = true, $includeLocation = false){
            $componentName = $req->Params()->componentName;
            $appFile = APP_LOCATION . "/sossapp.json";
            $outObj;$success=false;;

            if (file_exists($appFile)){
                $appObj = json_decode(file_get_contents($appFile));
                
                if (isset($appObj)){
                    if (isset($appObj->components)){
                      if (isset($appObj->components->$componentName)){
                          $componentType = $appObj->components->$componentName->location;
                          $componentDescriptor = APP_LOCATION . "/$componentType/$componentName/component.json";

                          if (file_exists($componentDescriptor)){
                            if ($asObject){
                                $componentObj = json_decode(file_get_contents($componentDescriptor));
                                if ($includeLocation)
                                $componentObj->location = APP_LOCATION . "/$componentType/$componentName";
                            }
                            else    
                                $componentObj = file_get_contents($componentDescriptor);

                            return $componentObj;
                          }else {
                              $outObj =  Resources::$COMPONENT_DESCRIPTOR_NOT_FOUND . " $componentDescriptor";
                          }
                          
                      }else {
                        $outObj = Resources::$APP_DESCRIPTOR_COMPONENT_NOT_FOUND;  
                      }
                    }else{
                        $outObj = Resources::$APP_DESCRIPTOR_COMPONENT_NOT_FOUND;
                    }
                }else {
                    $outObj = Resources::$APP_DESCRIPTOR_INVALID_JSON;
                }
               
            }else {
                $outObj = Resources::$APP_DESCRIPTOR_NOT_FOUND;
            }

            writeResponse($res, $success, $outObj);
        }

        public function HandleFile($req,$res){
            $this->getFileInComponent($req, $res);
        }

        public function HandleTransformer($req,$res){
            require_once (__DIR__ . "/carbitetransform.php");

            $descObj = $this->getComponentDescriptor($req,$res, true, true);
            if ($descObj){
                $outObj;$success = false;
                if (isset($descObj->transformers)){
                    Carbite::Reset();
                    Carbite::SetAttribute("reqUri",$req->Params()->route);
                    Carbite::SetAttribute("no404",true);
                    
                    foreach ($descObj->transformers as $tk => $ts) {
                        CarbiteTransform::RESTROUTE($ts->method,$ts->route, $ts->destMethod, $ts->destUrl,(isset($ts->bodyTemplate) ? new PostBodyTemplate($ts->bodyTemplate): null), null,null);
                    }

                    $resObj = Carbite::Start();

                    if (!isset($resObj))
                        $outObj = Resources::$COMPONENT_TRANSFORMER_UNKNOWN;

                } else
                    $outObj = Resources::$COMPONENT_TRANSFORMER_NOT_FOUND;
                
                if (isset($outObj))
                    writeResponse($res, $success, $outObj);
            }
        }

        public function HandleService($req,$res){
            
            $descObj = $this->getComponentDescriptor($req,$res, true, true);
            //var_dump($descObj);

            if ($descObj){
                $outObj;$success = false;
                if (isset($descObj->serviceHandler)){
                        $handler = $descObj->serviceHandler;
                    if (isset($handler->file)){
                        if (isset($handler->class)){
                            $handlerFile = "$descObj->location/" .$handler->file;
                            if (file_exists($handlerFile)){
                                require_once($handlerFile);
                                $class = $handler->class;
                                if (class_exists($class)){
                                    $obj = new $class(array());
                                    $handlerName = $req->Params()->handlerName;
                                    $methodName = strtolower($_SERVER["REQUEST_METHOD"]). ucwords($handlerName);
                                    if(method_exists($obj, $methodName)){
                                        $outObj = $obj->$methodName($req);
                                        $success = true;
                                    }else 
                                        $outObj = Resources::$COMPONENT_SERVICE_HANDLER_METHOD_NOT_FOUND_PHP;
                                }else 
                                    $outObj = Resources::$COMPONENT_SERVICE_HANDLER_CLASS_NOT_FOUND_PHP;
                                
                            } else 
                                $outObj = Resources::$COMPONENT_SERVICE_HANDLER_FILENOT_FOUND;  
                        }else 
                            $outObj = Resources::$COMPONENT_SERVICE_HANDLER_CLASSNOT_FOUND;
                    }else
                        $outObj = Resources::$COMPONENT_SERVICE_HANDLER_FILENOT_FOUND_DESCRIPTOR;                
                }else 
                    $outObj = Resources::$COMPONENT_SERVICE_HANDLER_NOT_FOUND;


                writeResponse($res, $success, $outObj);
            }
        }

        public function HandleComponent($req,$res){
            $isObjectMode = false;
            $methodName;

            $outObj;$success = false;

            if (isset($_GET)){
                if (isset($_GET['object'])){
                    $methodName = "getObject" . ucwords($_GET['object']);
                }
            }

            if (!isset($methodName))
                $methodName = "handleComponentOperation";

            if (method_exists($this, $methodName)){
                $outObj = $this->$methodName($req,$res);
                $success = true;
            }else {
                $outObj = Resources::$UNKNOWN_OPERATION;
            }

            if (isset($outObj))
                writeResponse($res, $success, $outObj);
        }

        private function getFileInComponent($req, $res){
            $descObj = $this->getComponentDescriptor($req,$res, true, true);
            $location = $descObj->location;
            $filePath = $req->Params()->filePath;
            $fileName = "$location/$filePath";


            $outObj;$success=false;
            if (file_exists($fileName)){
                $outObj = file_get_contents($fileName);
                $expires = 60*60 *2;
                //header("Expires: " .gmdate('D, d M Y H:i:s', time()+$expires).'GMT');
                echo $outObj;
                exit();
            }else {
                $outObj = Resources::$COMPONENT_FILE_NOT_FOUND;
            }

            writeResponse($res, $success, $outObj);   
        }

        public function GetAppDescriptor($req, $res){
            $appLocation = APP_LOCATION . "/sossapp.json";
            $outObj;$success=false;
            
            if (file_exists($appLocation)){
                $jsonFile = file_get_contents($appLocation);
                $outObj = json_decode($jsonFile);
                $success = true;
            }
            else {
                $outObj = Resources::$APP_DESCRIPTOR_NOT_FOUND;
            }
            
            writeResponse($res, $success, $outObj);
        }

        private function handleComponentOperation($req,$res){
            $descObj = $this->getComponentDescriptor($req,$res, true, true);
            if (isset($descObj)){
                if (isset($descObj->handler)){
                    
                }else {
                    writeResponse($res, false, Resources::$COMPONENT_HANDLER_NOT_FOUND);
                }
            } 
        }

        private function getObjectDesc($req,$res){
            return $this->getComponentDescriptor($req,$res);
        }

    }

?>