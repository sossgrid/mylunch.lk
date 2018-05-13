<?php

class ProductService {

    public function getAllProducts($req){
        require_once (LIB_PATH . "/transactions/transactions.php");
        
        $query = isset($_GET["catid"]) ? "catogory:$_GET[catid]" : null;
        $tranObj = TransactionManager::Create();
        $tranObj->Get->__invoke("products", $query, "@OBJ")
                ->IterateAndJoin->__invoke("@OBJ", "_->_=#->inventory->/inventory->productid=#->itemid");
        $result = $tranObj->Execute();

        $objs = $result->processData->object;

        return $objs;
    }

}

?>