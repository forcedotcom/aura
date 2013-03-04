/*
 * Copyright (C) 2012 salesforce.com, inc.
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
    /**
     * Various iteration item types
     */
    testTypes:{
        test:function(cmp){
            var container, containerElement, children, realchildren;

            // null
            container = cmp.find("null");
            containerElement = container.getElement();
            children = $A.test.getNonCommentNodes(containerElement.childNodes);
            $A.test.assertEquals(0, container.get("v.body")[0].get("v.realbody").length);
            $A.test.assertEquals("", $A.test.getText(containerElement));
            $A.test.assertEquals(0, children.length);

            // empty
            container = cmp.find("empty");
            containerElement = container.getElement();
            children = $A.test.getNonCommentNodes(containerElement.childNodes);
            $A.test.assertEquals(0, container.get("v.body")[0].get("v.realbody").length);
            $A.test.assertEquals("", $A.test.getText(containerElement));
            $A.test.assertEquals(0, children.length);

            // strings
            container = cmp.find("strings");
            containerElement = container.getElement();
            children = $A.test.getNonCommentNodes(containerElement.childNodes);
            $A.test.assertEquals(3, container.get("v.body")[0].get("v.realbody").length);
            $A.test.assertEquals(3, children.length);
            $A.test.assertEquals("one7", children[0].value);
            $A.test.assertEquals("two7", children[1].value);
            $A.test.assertEquals("three7", children[2].value);

            // numbers
            container = cmp.find("numbers");
            containerElement = container.getElement();
            children = $A.test.getNonCommentNodes(containerElement.childNodes);
            $A.test.assertEquals(3, container.get("v.body")[0].get("v.realbody").length);
            $A.test.assertEquals(3, children.length);
            $A.test.assertEquals("3", children[0].value);
            $A.test.assertEquals(3, children[0].size);
            $A.test.assertEquals(126, children[0].maxLength);
            $A.test.assertEquals("4", children[1].value);
            $A.test.assertEquals(4, children[1].size);
            $A.test.assertEquals(1002, children[1].maxLength);
            $A.test.assertEquals("5", children[2].value);
            $A.test.assertEquals(5, children[2].size);
            $A.test.assertEquals(669, children[2].maxLength);

            // booleans
            container = cmp.find("booleans");
            containerElement = container.getElement();
            children = $A.test.getNonCommentNodes(containerElement.childNodes);
            $A.test.assertEquals(3, container.get("v.body")[0].get("v.realbody").length);
            $A.test.assertEquals(3, children.length);
            $A.test.assertEquals("0", children[0].value);
            $A.test.assertEquals(true, children[0].disabled);
            $A.test.assertEquals("1", children[1].value);
            $A.test.assertEquals(false, children[1].disabled);
            $A.test.assertEquals("2", children[2].value);
            $A.test.assertEquals(true, children[2].disabled);

            // lists
            container = cmp.find("lists");
            containerElement = container.getElement();
            children = $A.test.getNonCommentNodes(containerElement.childNodes);
            $A.test.assertEquals(3, container.get("v.body")[0].get("v.realbody").length);
            $A.test.assertEquals(9, children.length);
            $A.test.assertEquals("one is from [0,0]", children[0].value);
            $A.test.assertEquals("two is from [0,1]", children[1].value);
            $A.test.assertEquals("three is from [0,2]", children[2].value);
            $A.test.assertEquals("un is from [1,0]", children[3].value);
            $A.test.assertEquals("do is from [1,1]", children[4].value);
            $A.test.assertEquals("tres is from [1,2]", children[5].value);
            $A.test.assertEquals("ek is from [2,0]", children[6].value);
            $A.test.assertEquals("do is from [2,1]", children[7].value);
            $A.test.assertEquals("theen is from [2,2]", children[8].value);

            // barecomponents
            // container = cmp.find("barecomponents");
            // containerElement = container.getElement();
            // children = $A.test.getNonCommentNodes(containerElement.childNodes);
            // $A.test.assertEquals(3,
            // container.get("v.body")[0].get("v.realbody").length);
            // $A.test.assertEquals("text0text1text2",
            // $A.test.getText(containerElement));
            // $A.test.assertEquals(3, children.length);

        }
    },
    //Aura.Component[] as items
    testIterationThroughAuraComponentArray:{
        test:function(cmp){
            var container = cmp.find("componentArray");
            var elements = $A.test.getNonCommentNodes(container.getElements());
            $A.test.assertEquals(2, elements.length);
            //Verify that iteration component's body has only two components.
            $A.test.assertEquals(2, container.find("iteration").get("v.realbody").length);

            $A.test.assertTrue($A.test.isInstanceOfText(elements[0]));
            $A.test.assertEquals("textOnBody" , $A.test.getText(elements[0]));

            $A.test.assertTrue($A.test.isInstanceOfDivElement(elements[1]));

        }
    },
    //Aura.Component[] as items
    testIterationThroughEmptyComponentArray:{
        test:function(cmp){
            //Aura.Component[] as items
            var container = cmp.find("emptyComponentArray");
            var elements = $A.test.getNonCommentNodes(container.getElements());
            $A.test.assertEquals(0, elements.length);
            $A.test.assertEquals(0, container.find("iteration").get("v.realbody").length);
        }
    }
})
