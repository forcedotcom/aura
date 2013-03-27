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
     * Verify for a parented element that removeElement will move it to the trashcan and then delete it on the next gc cycle.
     */
    testRemoveParentedDiv: {
        test: function(component){
            $A.test.setTestTimeout(30000);
            var element = component.find("auraDiv").getElement();
            $A.test.assertNotNull(element, "element not present");
            $A.test.assertEquals("my text", $A.test.getText(component.find("container").getElement()));
            $A.test.assertEquals(element, document.getElementById("domDiv"));
            $A.util.removeElement(element);
            var trash = element.parentNode;
            $A.test.assertEquals("", $A.test.getText(component.find("container").getElement()), "element not removed");
            $A.test.assertEquals(null, document.getElementById("domDiv"), "element found in document");
            $A.test.runAfterIf(function(){return trash !== element.parentNode;}); // check that element emptied from trash
        }
    },

    /**
     * Verify for a parented text node that removeElement will move it to the trashcan and then delete it on the next gc cycle.
     */
    testRemoveParentedText: {
        test: function(component){
            $A.test.setTestTimeout(30000);
            var element = component.find("auraDiv").getElement().childNodes[0];
            $A.test.assertNotNull(element, "element not present");
            $A.test.assertEquals("my text", $A.test.getText(component.find("container").getElement()));
            $A.util.removeElement(element);
            var trash = element.parentNode;
            $A.test.assertEquals("", $A.test.getText(component.find("container").getElement()), "element not removed");
            $A.test.assertEquals(0, document.getElementById("domDiv").childNodes.length, "element found in document");
            $A.test.runAfterIf(function(){return trash !== element.parentNode;}); // check that element emptied from trash
        }
    },

    /**
     * Verify for an unparented element that removeElement will move it to the trashcan and then delete it on the next gc cycle.
     */
    // TODO(W-1589587): these fail in prod mode since can't access util.$trash$. Figure out way to check that trash is empty
    testRemoveUnparentedDiv: {
        test: function(component){
            $A.test.setTestTimeout(30000);
            var element = component.find("auraDiv").getElement();
            element.parentNode.removeChild(element);
            $A.util.removeElement(element);
            //$A.test.assertTrue($A.util.$trash$.length > 0, "element never placed in trash");
            $A.test.assertEquals("", $A.test.getText(component.find("container").getElement()), "element not removed");
            //$A.test.runAfterIf(function(){return $A.util.$trash$.length === 0;}); // check that element emptied from trash
        }
    },

    /**
     * Verify for an unparented textnode that removeElement will do nothing to it.
     */
    // TODO(W-1589587): these fail in prod mode since can't access util.$trash$. Figure out way to check that trash is empty
    testRemoveUnparentedText: {
        test: function(component){
            $A.test.setTestTimeout(30000);
            var element = component.find("auraDiv").getElement().childNodes[0];
            element.parentNode.removeChild(element);
            $A.util.removeElement(element);
            if(document.implementation["createHTMLDocument"]){
                //$A.test.assertTrue($A.util.$trash$.length > 0, "element never placed in trash");
                $A.test.assertEquals("", $A.test.getText(component.find("container").getElement()), "element not removed");
                //$A.test.runAfterIf(function(){return $A.util.$trash$.length === 0;}); // check that element emptied from trash
            }else{
                $A.test.assertNull(element.parentNode);
            }

        }
    },

    /**
     * removeElement will send the target to the trash only once.
     */
    testRemoveElementTrashesOnce: {
        test: function(component){
            var elem = component.find("setup").getElement();
            $A.util.removeElement(elem);
            var trash = elem.parentNode;
            var log = [];
            var logRemove = [];
            var override = $A.test.addFunctionHandler(trash, trash.appendChild,
                function(){
                    var elem = arguments[0];
                    log.push(elem);
                }
            );
            try{
                var container = component.find("container");
                var expected = [];
                (function getElements(el){
                    expected.push(el);
                    var children = el.childNodes;
                    for(var c=0; c<children.length; c++){
                        getElements(children[c]);
                    }
                })(container.getElement());
                container.destroy();
                $A.test.assertEquals(expected.length, log.length, "each element should have been removed only once");
                for(var e=0; e < expected.length; e++){
                    $A.test.assertTrue(-1 < log.indexOf(expected[e]), "element was not removed: " + expected[e]);
                }
            } catch (e) {
            } finally {
                override.restore();
            }
        }
    }
})
