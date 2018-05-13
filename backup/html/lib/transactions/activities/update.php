<?php
    class TRAN_OS_UPDATE {
        function __construct(){
            require_once (LIB_PATH . "/sossdata/SOSSData.php");
        }

        public function Process($stuff, $className, $path, $responsePath = null){
            $setVal = TransactionHelpers::GetObjectValue($stuff, $path);
            if (is_array($setVal)){
                if (isset($responsePath))
                    $resArray = array();

                for($i=0;$i<sizeof($setVal);$i++){
                    $response = SOSSData::Update($className, $setVal[$i]);
                    if (isset($responsePath))
                        array_push($resArray, $response->response);
                }

                if (isset($responsePath)){
                    TransactionHelpers::SetObjectValue($stuff, $responsePath, $resArray);
                }
            }
            else {
                $response = SOSSData::Update($className, $setVal);
                
                if (isset($responsePath)){
                    TransactionHelpers::SetObjectValue($stuff, $responsePath, $response->response);    
                }
            }
            return true;
        }

        public function Rollback(){

        }
    }

    TransactionManager::RegisterActivity ("TRAN_OS_UPDATE", "Update");
?>