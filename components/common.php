<?php

    function writeResponse($res, $success, $result){
        $sObj =new stdClass();
        $sObj->success = $success;
        $sObj->result = $result;
        $res->Set($sObj);
    }

?>