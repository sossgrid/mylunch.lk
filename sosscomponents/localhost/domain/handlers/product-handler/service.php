<?php

class ProductService {

    public function getTest(){
        $jsonStr = '[{"itemid":1,"name":"product1","caption":"bla bla","price":23.90,"imgurl":"http://placehold.it/320x150"},
{"itemid":2,"name":"product1","caption":"bla bla","price":23.90,"imgurl":"http://placehold.it/320x150"},
{"itemid":3,"name":"product1","caption":"bla bla","price":23.90,"imgurl":"http://placehold.it/320x150"},
{"itemid":4,"name":"product1","caption":"bla bla","price":23.90,"imgurl":"http://placehold.it/320x150"},
{"itemid":5,"name":"product1","caption":"bla bla","price":23.90,"imgurl":"http://placehold.it/320x150"},
{"itemid":6,"name":"product1","caption":"bla bla","price":23.90,"imgurl":"http://placehold.it/320x150"},
{"itemid":7,"name":"product1","caption":"bla bla","price":23.90,"imgurl":"http://placehold.it/320x150"},
{"itemid":8,"name":"product1","caption":"bla bla","price":23.90,"imgurl":"http://placehold.it/320x150"},
{"itemid":9,"name":"product1","caption":"bla bla","price":23.90,"imgurl":"http://placehold.it/320x150"},
{"itemid":10,"name":"product1","caption":"bla bla","price":23.90,"imgurl":"http://placehold.it/320x150"},
{"itemid":11,"name":"product1","caption":"bla bla","price":23.90,"imgurl":"http://placehold.it/320x150"},
{"itemid":12,"name":"product1","caption":"bla bla","price":23.90,"imgurl":"http://placehold.it/320x150"},
{"itemid":13,"name":"product1","caption":"bla bla","price":23.90,"imgurl":"http://placehold.it/320x150"},{"itemid":15,"name":"product1","caption":"bla bla","price":23.90,"imgurl":"http://placehold.it/320x150"},
{"itemid":14,"name":"product1","caption":"bla bla","price":23.90,"imgurl":"http://placehold.it/320x150"}]';
        return json_decode($jsonStr);
    }

    public function getTestcategories(){
        $jsonStr = '[{"id":1, "name":"Lunch"},{"id":2, "name":"Dinner"}]';

        return json_decode($jsonStr);
    }

}

?>