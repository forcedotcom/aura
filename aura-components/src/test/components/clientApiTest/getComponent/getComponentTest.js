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
    /*
     * Verify getting component by global Id
     */
    testGetComponentWithGlobalId : {
        test : function(cmp) {
            var expected = cmp.find('auraText');
            var textCmpGlobalId = cmp.find('auraText').getGlobalId();

            var actual = $A.getComponent(textCmpGlobalId);

            $A.test.assertEquals(expected, actual);
        }
    },

    /*
     * Verify getting component by html element
     */
    testGetComponentWithAuraRenderedElement : {
        test : function(cmp) {
            var expected = cmp.find('auraDiv');
            var element = document.getElementById('auraDiv');

            var actual = $A.getComponent(element);

            $A.test.assertEquals(expected, actual);
        }
    },

    /*
     * Verify getting component by html element
     */
    testGetComponentWithAuraRenderedInnerElement : {
        test : function(cmp) {
            var expected = cmp.find('innerDiv');
            var element = document.getElementById('innerDiv');

            var actual = $A.getComponent(element);

            $A.test.assertEquals(expected, actual);
        }
    },

    /*
     * Verify calling getComponent with undefined
     */
    testGetComponentWithUndefined : {
        test : function(cmp) {
            var cmp = $A.getComponent();

            $A.test.assertNull(cmp);
        }
    },

    /*
     * Verify calling getComponent with invalid global Id
     */
    testGetComponentWithInvalidGlobalId : {
        test : function(cmp) {
            var cmpGlobalId = 'invalid';

            var actual = $A.getComponent(cmpGlobalId);

            $A.test.assertUndefined(actual);
        }
    },

    /*
     * Verify using getComponent to get a destroyed component
     */
    testGetComponentWithDestroyedCmp : {
        test : function(cmp) {
            var component = cmp.find("destroyedComponent");
            var globalId = component.getGlobalId();
            // the componenet exists and can be retrieved
            var tempCmp = $A.getComponent(globalId);
            $A.test.assertEquals(component, tempCmp);
            try {
                component.destroy();
            } catch(e) {
                $A.test.fail("Component destroy() failed:" + e);
            }

            var actual = $A.getComponent(globalId);

            $A.test.assertUndefined(actual);
        }
    },

    /*
     * Verify using getComponent to get a destroyed element
     */
    testGetComponentWithDestroyedElement : {
        test : function(cmp) {
            var element = document.getElementById('destroyedElement');
            var component = cmp.find("destroyedElement");
            // Verify thet are same component
            var tempCmp = $A.getComponent(element);
            $A.test.assertEquals(component, tempCmp);

            component.destroy();
            var actual = $A.getComponent(element);

            $A.test.assertUndefinedOrNull(actual);
        }
    },

    /*
     * Verify using getComponent to get component by given a element without tag
     */
    testGetComponentWithNoTagElement : {
        test :function(cmp) {
            var expected = cmp.find('auraDiv');
            var textCmp = cmp.find('innerText');

            var actual = $A.getComponent(textCmp.getElement());

            $A.test.assertEquals(expected, actual);
        }
    },

    /*
     * Verify using getComponent to get a dynamically created component by using its
     * global ID
     */
    testGetComponentWithCreatedCmp : {
        test : [
            function(cmp) {
                var localId = "auraButton";
                var createdComponent;
                $A.createComponent("ui:button", {
                        "aura:id" : localId,
                        "label" : "button"
                    }, function(component) {
                            createdComponent = component;
                            cmp.set("v.cmpGlobalId", component.getGlobalId());
                        });

                $A.test.addWaitFor(true, function() {
                        return typeof createdComponent !== "undefined";
                    }, function() {
                        cmp.index(localId, createdComponent.getGlobalId());
                    });
            }, function(cmp) {
                var localId = "auraButton";
                var expected = cmp.find(localId);
                var globalId = cmp.get("v.cmpGlobalId");

                var actual = $A.getComponent(globalId);

                $A.test.assertEquals(expected, actual);
            }
        ]
    }

})
