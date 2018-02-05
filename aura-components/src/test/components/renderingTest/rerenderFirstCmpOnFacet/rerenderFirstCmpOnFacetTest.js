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
    testRerenderFirstComponentOnFacetWithEmptyNextSibling: {
        test: [
            function rerenderFacet(cmp) {
                var text = "I am the first element";

                $A.createComponent("aura:text", {
                        "value": text
                    }, function(newCmp) {
                        cmp.set("v.cmp", newCmp);
                    });

                $A.test.addWaitForWithFailureMessage(true, function() {
                        return $A.test.getText(document.body).indexOf(text) > -1;
                    },
                    "The new component on expression didn't get rendered");
            },
            function unrenderFirstComponentFacet(cmp) {
                // this will trigger a rerender of the expression. the existing cmps on expression's facet
                // will be unrendered and expression will render a text node with empty string as its marker
                cmp.set("v.cmp", null);

                $A.test.addWaitForWithFailureMessage(true, function() {
                        return $A.test.getText(document.body).indexOf("I am the first element") < 0;
                    },
                    "The new component on expression didn't get unrendered",
                    function() {
                        var targetComponent = cmp.find("emptyCmp");
                        $A.test.assertNull(targetComponent.getElement(), "Empty component should not contain any element");

                        var marker = $A.renderingService.getMarker(targetComponent);
                        var rootMarker = $A.renderingService.getMarker(cmp);
                        $A.test.assertTrue(marker !== rootMarker, "Root component should not share marker with the second component on its facet");
                    });
            }
        ]
    }
})
