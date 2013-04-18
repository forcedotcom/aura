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
    /**
     * Accepts a map of localid:qualifiedName of components to be lazy loaded.
     * For example: {'textNode':'markup://aura:text',
     * "numNode":'markup://ui:outputNumber'}
     */
    verifyLazyLoading : function(component, expectedContentAfterLayoutLoad) {
        var lazyCmpId_qualifiedName_map = {
            'containerA' : 'markup://loadLevelTest:serverComponent',
            'containerB' : 'markup://loadLevelTest:serverComponent',
            'containerC' : 'markup://loadLevelTest:serverComponent'
        };
        // Verify that each facet marked to load lazily initially has a
        // placeholder
        for ( var lazyCmpId in lazyCmpId_qualifiedName_map) {
            $A.test.assertEquals("markup://aura:placeholder",
                            component.find(lazyCmpId).getDef().getDescriptor().getQualifiedName(),
                            "Expected component with local id '"
                                    + lazyCmpId
                                    + "' to be initially represented by a placeholder.");
        }
        // Wait till all specified facets marked with aura:load are replaced by
        // actual components, and then call callbackAfterLoad()
        $A.test.addWaitFor(true, function() {
            var ret = true;
            for (lazyCmpId in lazyCmpId_qualifiedName_map) {
                ret = ret && (lazyCmpId_qualifiedName_map[lazyCmpId] == component.find(lazyCmpId).getDef().getDescriptor().getQualifiedName());
            }
            return ret;
        },
        // CallbackAfterLazyLoad
        function() {
            this.waitForLayoutItems(component,
            // Call back after layout Items loaded
            function(){
                aura.test.assertEquals(expectedContentAfterLayoutLoad["containerA"],
                        $A.test.getText(component.find("containerA").getElement()), "A content not expected");
                aura.test.assertEquals(expectedContentAfterLayoutLoad["containerB"], $A.test.getText(component.find("containerB").getElement()),
                        "B content not expected");
                aura.test.assertEquals(expectedContentAfterLayoutLoad["containerC"], $A.test.getText(component.find("containerB").getElement()),
                        "C content not expected");
            });
        });
    },
    /**
     * After the lazy components are loaded, verify that layouts come into
     * effect.
     */
    waitForLayoutItems : function(component, callback) {
        aura.test.runAfterIf(function() {
                return $A.util.hasClass(component.find("ready").getElement(),  "layoutDone");
            }, callback);
    },

    /**
     * layout item contains just markup
     */
    //W-1278839
    _test_LazyLoad_Markup : {
        attributes : {
            dummy : '#markup'
        },
        test : [ function(component) {
            // var waitForLayoutItems = this.waitForLayoutItems;
            this.verifyLazyLoading(component,{"containerA":"text1text2","containerB":"","containerC":"text3"});
        } ]
    },

    /**
     * layout item references action that returns one component
     */
    //W-1278839
    _test_LazyLoad_ActionSingleComponent : {
        attributes : {
            dummy : '#action?input=1'
        },
        test : [function(component) {
            this.verifyLazyLoading(component,{"containerA":"action:java:0","containerB":"","containerC":"action:java:0"});
        }]
    },

    /**
     * layout item references action that returns multiple components
     */
    //W-1278839
    _test_LazyLoad_ActionMultipleComponents : {
        attributes : {
            dummy : '#action?input=3'
        },
        test : [function(component) {
            this.verifyLazyLoading(component,{"containerA":"action:java:2action:java:1action:java:0",
                                              "containerB":"",
                                              "containerC":"action:java:2action:java:1action:java:0"});
        }]
    },

    /**
     * layout item references action that returns no component
     */
    //W-1278839
    _test_LazyLoad_ActionNoComponent : {
        attributes : {
            dummy : '#action?input=0'
        },
        test : [function(component) {
            this.verifyLazyLoading(component,{"containerA":"", "containerB":"", "containerC":""});
        }]
    },

    /**
     * layout has item referencing action that returns one component and item
     * with markup
     */
    //W-1278839
    _test_LazyLoad_ActionSingleComponentAndMarkup : {
        attributes : {
            dummy : '#actionAndMarkup?input=1'
        },
        test : function(component) {
            this.verifyLazyLoading(component,{"containerA":"actionAndMarkup:java:0", "containerB":"text", "containerC":""});
        }
    },

    /**
     * layout has item referencing action that returns multiple components and
     * item with markup
     */
    //W-1278839
    _test_LazyLoad_ActionMultipleComponentsAndMarkup : {
        attributes : {
            dummy : '#actionAndMarkup?input=3'
        },
        test : function(component) {
            this.verifyLazyLoading(component,{"containerA":"actionAndMarkup:java:2actionAndMarkup:java:1actionAndMarkup:java:0",
                                              "containerB":"text", "containerC":""});
        }
    },

    /**
     * layout has item referencing action that returns no component and item
     * with markup
     */
    //W-1278839
    _test_LazyLoad_ActionNoComponentAndMarkup : {
        attributes : {
            dummy : '#actionAndMarkup?input=0'
        },
        test : function(component) {
            this.verifyLazyLoading(component,{"containerA":"", "containerB":"text", "containerC":""});
        }
    }
})
