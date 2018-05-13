<?php

class ProductService {

    public function getAllProducts($req){
        
        
        if (isset($_GET["lat"]) && isset($_GET["lng"])){
            require_once (PLUGIN_PATH . "/sossdata/SOSSData.php");
            $mainObj = new stdClass();
            $mainObj->parameters = new stdClass();
            $mainObj->parameters->lat = $_GET["lat"];
            $mainObj->parameters->lng = $_GET["lng"];
            $mainObj->parameters->catid = $_GET["catid"];
            $resultObj = SOSSData::ExecuteRaw("nearproducts", $mainObj);
            for ($i=0;$i<sizeof($resultObj->response);$i++){
                $obj = $resultObj->response[$i];
                $obj->inventory = new stdClass();
                $obj->inventory->productid=1;
                $obj->inventory->locationid=1;
                $obj->inventory->qty=1;
                $obj->inventory->status="";
            }
            header("Content-type: application/json");
            $outObj = new stdClass();
            $outObj->success = true;
            $outObj->result = $resultObj->response;
            echo json_encode($outObj);
            exit();
            return $resultObj->response;
        } else {
            require_once (PLUGIN_PATH . "/transactions/transactions.php");

            $query = isset($_GET["catid"]) ? "catogory:$_GET[catid]" : null;
            $tranObj = TransactionManager::Create();
            $tranObj->Get->__invoke("products", $query, "@OBJ")
                    ->IterateAndJoin->__invoke("@OBJ", "_->_=#->inventory->/inventory->productid=#->itemid");
            $result = $tranObj->Execute();
    
            $objs = $result->processData->object;
    
            return $objs;
        }
    }
}

?>