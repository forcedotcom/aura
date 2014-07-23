/*
 * Copyright (C) 2013 salesforce.com, inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
({
    assertNodesDeleted : function(nodes){
        if (!$A.util.isArray(nodes)){
            nodes = [nodes];
        }
        
        for(var i = 0; i < nodes.length; i++){
            $A.test.assertTrue($A.test.isNodeDeleted(nodes[i]), "node was not deleted: " + nodes[i]);
            $A.test.assertEquals(undefined, $A.getCmp(nodes[i].getAttribute("data-aura-rendered-by")), "parent component not destroyed");
        }
    },

    assertNodesNotDeleted : function(nodes){
        if (!$A.util.isArray(nodes)){
            nodes = [nodes];
        }
        
        for(var i = 0; i < nodes.length; i++){
            $A.test.assertFalse($A.test.isNodeDeleted(nodes[i]), "node was deleted: " + nodes[i]);
        }
    },

    /**
     * Setting iteration items value to another ArrayValue will rerender all the content.
     */
    testSetItems:{
        attributes:{ start:6, end:9 },
        test:function(cmp){
            var container = cmp.find("container").getElement();
            var children = $A.test.getNonCommentNodes(container.childNodes);
            $A.test.assertEquals(3, children.length);
            $A.test.assertEquals("6:ggg", $A.test.getText(children[0]));
            $A.test.assertEquals("7:hhh", $A.test.getText(children[1]));
            $A.test.assertEquals("8:iii", $A.test.getText(children[2]));

            // set to another ArrayValue
            cmp.get("c.setCapitalItems").runDeprecated();
            this.assertNodesDeleted(children);
            
            children = $A.test.getNonCommentNodes(container.childNodes);
            $A.test.assertEquals(3, children.length);
            $A.test.assertEquals("6:GGGGG", $A.test.getText(children[0]));
            $A.test.assertEquals("7:HHHHH", $A.test.getText(children[1]));
            $A.test.assertEquals("8:IIIII", $A.test.getText(children[2]));

            // then set to empty ArrayValue
            cmp.get("c.setOriginalItems").runDeprecated();
            this.assertNodesDeleted(children);
            children = $A.test.getNonCommentNodes(container.childNodes);
            $A.test.assertEquals(0, children.length);
        }
    },

    /**
     * Updating a single item in an iteration's items, does not update the other items
     */
    testUpdateOneItem:{
        attributes:{ start:9, end:12 },
        test:function(cmp){
            var container = cmp.find("container").getElement();
            var children = $A.test.getNonCommentNodes(container.childNodes);
            $A.test.assertEquals(3, children.length);
            $A.test.assertEquals("9:jjj", $A.test.getText(children[0]));
            $A.test.assertEquals("10:kkk", $A.test.getText(children[1]));
            $A.test.assertEquals("11:lll", $A.test.getText(children[2]));

            cmp.set("v.toChange", 10);
            cmp.set("v.newValue", "really?");
            cmp.get("c.changeOneValue").runDeprecated();

            var newchildren = $A.test.getNonCommentNodes(container.childNodes);
            $A.test.assertEquals(3, newchildren.length);
            $A.test.assertEquals("9:jjj", $A.test.getText(newchildren[0]));
            $A.test.assertEquals("10:really?", $A.test.getText(newchildren[1]));
            $A.test.assertEquals("11:lll", $A.test.getText(newchildren[2]));
            // $A.test.assertEquals(children[0], newchildren[0], "preceding element not preserved");
            // // children[1] may or may not change, but just want to check that the nonupdated nodes were not changed
            // $A.test.assertEquals(children[2], newchildren[2], "following element not preserved");
        }
    },

    /**
     * Inserting a single item in an iteration's items, does not update the other items
     */
    testInsertOneItem:{
        attributes:{ start:9, end:12 },
        test:function(cmp){
            var container = cmp.find("container").getElement();
            var children = $A.test.getNonCommentNodes(container.childNodes);
            $A.test.assertEquals(3, children.length);
            $A.test.assertEquals("9:jjj", $A.test.getText(children[0]));
            $A.test.assertEquals("10:kkk", $A.test.getText(children[1]));
            $A.test.assertEquals("11:lll", $A.test.getText(children[2]));

            cmp.set("v.toChange", 10);
            cmp.set("v.newValue", "really?");
            cmp.get("c.insertOneValue").runDeprecated();

            var newchildren = $A.test.getNonCommentNodes(container.childNodes);
            $A.test.assertEquals(3, newchildren.length);
            $A.test.assertEquals("9:jjj", $A.test.getText(newchildren[0]));
            $A.test.assertEquals("10:really?", $A.test.getText(newchildren[1]));
            $A.test.assertEquals("11:kkk", $A.test.getText(newchildren[2]));
            //$A.test.assertEquals(children[0], newchildren[0], "preceding element not preserved");
            //$A.test.assertEquals(children[1], newchildren[2], "following element not preserved");
        }
    },

    /**
     * Deleting a single item in an iteration's items, does not update the other items
     */
    testDeleteOneItem:{
        attributes:{ start:9, end:12 },
        test:function(cmp){
            var container = cmp.find("container").getElement();
            var children = $A.test.getNonCommentNodes(container.childNodes);
            $A.test.assertEquals(3, children.length);
            $A.test.assertEquals("9:jjj", $A.test.getText(children[0]));
            $A.test.assertEquals("10:kkk", $A.test.getText(children[1]));
            $A.test.assertEquals("11:lll", $A.test.getText(children[2]));

            cmp.set("v.toChange", 10);
            
            cmp.get("c.deleteOneValue").runDeprecated();

            var newchildren = $A.test.getNonCommentNodes(container.childNodes);
            $A.test.assertEquals(3, newchildren.length);
            $A.test.assertEquals("9:jjj", $A.test.getText(newchildren[0]));
            $A.test.assertEquals("10:lll", $A.test.getText(newchildren[1]));
            $A.test.assertEquals("11:mmm", $A.test.getText(newchildren[2]));
            //$A.test.assertEquals(children[0], newchildren[0], "preceding element not preserved");
            //$A.test.assertEquals(children[2], newchildren[1], "following element not preserved");
        }
    },

    /**
     * Changing an iteration's start range will rerender all items.
     */
    testStartChange:{
        attributes:{ start:11, end:12 },
        test:function(cmp){
            var container = cmp.find("container").getElement();
            var children = $A.test.getNonCommentNodes(container.childNodes);
            $A.test.assertEquals(1, children.length);
            $A.test.assertEquals("11:lll", $A.test.getText(children[0]));

            cmp.set("v.start", 9);
                        
            this.assertNodesNotDeleted(children);
            
            children = $A.test.getNonCommentNodes(container.childNodes);
            
            $A.test.assertEquals(3, children.length);
            $A.test.assertEquals("9:jjj", $A.test.getText(children[0]));
            $A.test.assertEquals("10:kkk", $A.test.getText(children[1]));
            $A.test.assertEquals("11:lll", $A.test.getText(children[2]));
        }
    },

    /**
     * Changing an iteration's end range will rerender all items.
     */
    testEndChange:{
        attributes:{ start:7, end:10 },
        test:function(cmp){
            var container = cmp.find("container").getElement();

            var children = $A.test.getNonCommentNodes(container.childNodes);
            $A.test.assertEquals(3, children.length);
            $A.test.assertEquals("7:hhh", $A.test.getText(children[0]));
            $A.test.assertEquals("8:iii", $A.test.getText(children[1]));
            $A.test.assertEquals("9:jjj", $A.test.getText(children[2]));

            cmp.set("v.end", 8);
            
            this.assertNodesNotDeleted(children[0]);
            this.assertNodesDeleted(children.slice(1));
            
            children = $A.test.getNonCommentNodes(container.childNodes);
            $A.test.assertEquals(1, children.length);
            $A.test.assertEquals("7:hhh", $A.test.getText(children[0]));
        }
    },

    /**
     * Change an iteration's range so that no items will be rendered.
     */
    testRangeChangeToEmpty:{
        attributes:{ start:7, end:10 },
        test:function(cmp){
            var container = cmp.find("container").getElement();

            var children = $A.test.getNonCommentNodes(container.childNodes);
            $A.test.assertEquals(3, children.length);
            $A.test.assertEquals("7:hhh", $A.test.getText(children[0]));
            $A.test.assertEquals("8:iii", $A.test.getText(children[1]));
            $A.test.assertEquals("9:jjj", $A.test.getText(children[2]));

            cmp.set("v.start", 8);
            cmp.set("v.end", 7);
            this.assertNodesDeleted(children);
            children = $A.test.getNonCommentNodes(container.childNodes);
            $A.test.assertEquals(0, children.length);
        }
    },

    /**
     * Change an iteration's range so that an empty iteration now renders some items.
     */
    testRangeChangeToNonEmpty:{
        attributes:{ start:-3, end:0 },
        test:function(cmp){
            var container = cmp.find("container").getElement();

            var children = $A.test.getNonCommentNodes(container.childNodes);
            $A.test.assertEquals(0, children.length);

            cmp.set("v.start", -2);
            cmp.set("v.end", 1);
            children = $A.test.getNonCommentNodes(container.childNodes);
            $A.test.assertEquals(1, children.length);
            $A.test.assertEquals("0:aaa", $A.test.getText(children[0]));
        }
    },

    /**
     * Clear an iteration and add more later.
     */
    testClearThenAddItems:{
        attributes:{ start:0, end:26 },
        test:[ function(cmp){
                var container = cmp.find("container").getElement();
                var children = $A.test.getNonCommentNodes(container.childNodes);
                $A.test.assertEquals(26, children.length);
                $A.test.assertEquals("0:aaa", $A.test.getText(children[0]));
                $A.test.assertEquals("25:zzz", $A.test.getText(children[25]));

                // then set to empty ArrayValue
                cmp.get("c.setOriginalItems").runDeprecated();
                this.assertNodesDeleted(children);
                children = $A.test.getNonCommentNodes(container.childNodes);
                $A.test.assertEquals(0, children.length);

                // Now, add a couple new items
                var data = cmp.get("m.data");
                data.push({stringy: "newaaa"});
                data.push({stringy: "newbbb"});
                cmp.set("m.data", data);
                
             }, function(cmp) {
                var container = cmp.find("container").getElement();
                var children = $A.test.getNonCommentNodes(container.childNodes);
                $A.test.assertEquals(2, children.length);
                $A.test.assertEquals("0:newaaa", $A.test.getText(children[0]));
                $A.test.assertEquals("1:newbbb", $A.test.getText(children[1]));
             }]
    },
})
