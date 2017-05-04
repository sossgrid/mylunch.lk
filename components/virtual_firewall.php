<?php

    class VirtualFirewall {
        public function CheckAuthentication($req,$res){
            $req->UserType = "Admin";
        }
    }

?>