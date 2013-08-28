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
    assertNodesDeletedCscc : function(nodes){
        if (!$A.util.isArray(nodes)){
            nodes = [nodes];
        }
        for(var i = 0; i < nodes.length; i++){
            $A.test.assertTrue($A.test.isNodeDeleted(nodes[i]), "node was not deleted: " + nodes[i]);
            $A.test.assertEquals(undefined, $A.getCmp(nodes[i].getAttribute("data-aura-rendered-by")), "parent component not destroyed");
        }
    },

    /**
     * Setting iteration items value to another ArrayValue will rerender all the content.
     */
    // TODO(W-1787477): cannot wrap cmp inside iterationCscc inside HTML tag
    _testSetItemsCscc:{
        attributes:{ start:6, end:9 },
        test:function(cmp){
            var container = cmp.find("containerCscc").getElement();
            var children = $A.test.getNonCommentNodes(container.childNodes);
            $A.test.assertEquals(3, children.length);
            $A.test.assertEquals("6:ggg", $A.test.getText(children[0]));
            $A.test.assertEquals("7:hhh", $A.test.getText(children[1]));
            $A.test.assertEquals("8:iii", $A.test.getText(children[2]));

            // set to another ArrayValue
            cmp.get("c.setCapitalItems").runDeprecated();
            this.assertNodesDeletedCscc(children);
            children = $A.test.getNonCommentNodes(container.childNodes);
            $A.test.assertEquals(3, children.length);
            $A.test.assertEquals("6:GGGGG", $A.test.getText(children[0]));
            $A.test.assertEquals("7:HHHHH", $A.test.getText(children[1]));
            $A.test.assertEquals("8:IIIII", $A.test.getText(children[2]));

            // then set to empty ArrayValue
            cmp.get("c.setOriginalItems").runDeprecated();
            this.assertNodesDeletedCscc(children);
            children = $A.test.getNonCommentNodes(container.childNodes);
            $A.test.assertEquals(0, children.length);
        }
    },

    /**
     * Updating a single item in an iteration's items, does not update the other items
     */
    // TODO(W-1787477): cannot wrap cmp inside iterationCscc inside HTML tag
    _testUpdateOneItemCscc:{
        attributes:{ start:9, end:12 },
        test:function(cmp){
            var container = cmp.find("containerCscc").getElement();
            var children = $A.test.getNonCommentNodes(container.childNodes);
            $A.test.assertEquals(3, children.length);
            $A.test.assertEquals("9:jjj", $A.test.getText(children[0]));
            $A.test.assertEquals("10:kkk", $A.test.getText(children[1]));
            $A.test.assertEquals("11:lll", $A.test.getText(children[2]));

            cmp.getAttributes().getValue("toChange").setValue(10);
            cmp.getAttributes().getValue("newValue").setValue("really?");
            cmp.get("c.changeOneValue").runDeprecated();

            var newchildren = $A.test.getNonCommentNodes(container.childNodes);
            $A.test.assertEquals(3, newchildren.length);
            $A.test.assertEquals("9:jjj", $A.test.getText(newchildren[0]));
            $A.test.assertEquals("10:really?", $A.test.getText(newchildren[1]));
            $A.test.assertEquals("11:lll", $A.test.getText(newchildren[2]));
            $A.test.assertEquals(children[0], newchildren[0], "preceding element not preserved");
            // children[1] may or may not change, but just want to check that the nonupdated nodes were not changed
            $A.test.assertEquals(children[2], newchildren[2], "following element not preserved");
        }
    },

    /**
     * Inserting a single item in an iteration's items, does not update the other items
     */
    // TODO(W-1787477): cannot wrap cmp inside iterationCscc inside HTML tag
    _testInsertOneItemCscc:{
        attributes:{ start:9, end:12 },
        test:function(cmp){
            var container = cmp.find("containerCscc").getElement();
            var children = $A.test.getNonCommentNodes(container.childNodes);
            $A.test.assertEquals(3, children.length);
            $A.test.assertEquals("9:jjj", $A.test.getText(children[0]));
            $A.test.assertEquals("10:kkk", $A.test.getText(children[1]));
            $A.test.assertEquals("11:lll", $A.test.getText(children[2]));

            cmp.getAttributes().getValue("toChange").setValue(10);
            cmp.getAttributes().getValue("newValue").setValue("really?");
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
    // TODO(W-1787477): cannot wrap cmp inside iterationCscc inside HTML tag
    _testDeleteOneItemCscc:{
        attributes:{ start:9, end:12 },
        test:function(cmp){
            var container = cmp.find("containerCscc").getElement();
            var children = $A.test.getNonCommentNodes(container.childNodes);
            $A.test.assertEquals(3, children.length);
            $A.test.assertEquals("9:jjj", $A.test.getText(children[0]));
            $A.test.assertEquals("10:kkk", $A.test.getText(children[1]));
            $A.test.assertEquals("11:lll", $A.test.getText(children[2]));

            cmp.getAttributes().getValue("toChange").setValue(10);
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
    // TODO(W-1787477): cannot wrap cmp inside iterationCscc inside HTML tag
    _testStartChangeCscc:{
        attributes:{ start:11, end:12 },
        test:function(cmp){
            var container = cmp.find("containerCscc").getElement();
            var children = $A.test.getNonCommentNodes(container.childNodes);
            $A.test.assertEquals(1, children.length);
            $A.test.assertEquals("11:lll", $A.test.getText(children[0]));

            cmp.getAttributes().getValue("start").setValue(9);
            this.assertNodesDeletedCscc(children);
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
    // TODO(W-1787477): cannot wrap cmp inside iterationCscc inside HTML tag
    _testEndChangeCscc:{
        attributes:{ start:7, end:10 },
        test:function(cmp){
            var container = cmp.find("containerCscc").getElement();

            var children = $A.test.getNonCommentNodes(container.childNodes);
            $A.test.assertEquals(3, children.length);
            $A.test.assertEquals("7:hhh", $A.test.getText(children[0]));
            $A.test.assertEquals("8:iii", $A.test.getText(children[1]));
            $A.test.assertEquals("9:jjj", $A.test.getText(children[2]));

            cmp.getAttributes().getValue("end").setValue(8);
            this.assertNodesDeletedCscc(children);
            children = $A.test.getNonCommentNodes(container.childNodes);
            $A.test.assertEquals(1, children.length);
            $A.test.assertEquals("7:hhh", $A.test.getText(children[0]));
        }
    },

    /**
     * Change an iteration's range so that no items will be rendered.
     */
    // TODO(W-1787477): cannot wrap cmp inside iterationCscc inside HTML tag
    _testRangeChangeToEmptyCscc:{
        attributes:{ start:7, end:10 },
        test:function(cmp){
            var container = cmp.find("containerCscc").getElement();

            var children = $A.test.getNonCommentNodes(container.childNodes);
            $A.test.assertEquals(3, children.length);
            $A.test.assertEquals("7:hhh", $A.test.getText(children[0]));
            $A.test.assertEquals("8:iii", $A.test.getText(children[1]));
            $A.test.assertEquals("9:jjj", $A.test.getText(children[2]));

            cmp.getAttributes().getValue("start").setValue(8);
            cmp.getAttributes().getValue("end").setValue(7);
            this.assertNodesDeletedCscc(children);
            children = $A.test.getNonCommentNodes(container.childNodes);
            $A.test.assertEquals(0, children.length);
        }
    },

    /**
     * Change an iteration's range so that an empty iteration now renders some items.
     */
    // TODO(W-1787477): cannot wrap cmp inside iterationCscc inside HTML tag
    _testRangeChangeToNonEmptyCscc:{
        attributes:{ start:-3, end:0 },
        test:function(cmp){
            var container = cmp.find("containerCscc").getElement();

            var children = $A.test.getNonCommentNodes(container.childNodes);
            $A.test.assertEquals(0, children.length);

            cmp.getAttributes().getValue("start").setValue(-2);
            cmp.getAttributes().getValue("end").setValue(1);
            children = $A.test.getNonCommentNodes(container.childNodes);
            $A.test.assertEquals(1, children.length);
            $A.test.assertEquals("0:aaa", $A.test.getText(children[0]));
        }
    }
})