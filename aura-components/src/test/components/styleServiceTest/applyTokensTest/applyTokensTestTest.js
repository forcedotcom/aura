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

    // test multiple css files

    /** test utility */
    map: {
        "#DECC8C": "rgb(222, 204, 140)",
        "#DE986D": "rgb(222, 152, 109)",
        "#AB6890": "rgb(171, 104, 144)",
        "#68AB9F": "rgb(104, 171, 159)",
        "#DEC371": "rgb(222, 195, 113)",
        "#39CCCC": "rgb(57, 204, 204)",
        "#F012BE": "rgb(240, 18, 190)",
        "#776C8E": "rgb(119, 108, 142)"
    },

    /** test utility */
    assertColors: function(elements, color1, color2, color3, color4, color5) {
        // test assumptions
        $A.assert($A.util.isArray(elements), "missing elements");
        $A.assert(elements.length === 5, "should have 5 elements");
        $A.assert(!$A.util.isUndefinedOrNull(color1), "missing color");
        $A.assert(!$A.util.isUndefinedOrNull(color2), "missing color");
        $A.assert(!$A.util.isUndefinedOrNull(color3), "missing color");
        $A.assert(!$A.util.isUndefinedOrNull(color4), "missing color");
        $A.assert(!$A.util.isUndefinedOrNull(color5), "missing color");
        $A.assert(!$A.util.isUndefinedOrNull(this.map[color1]), "invalid color");
        $A.assert(!$A.util.isUndefinedOrNull(this.map[color2]), "invalid color");
        $A.assert(!$A.util.isUndefinedOrNull(this.map[color3]), "invalid color");
        $A.assert(!$A.util.isUndefinedOrNull(this.map[color4]), "invalid color");
        $A.assert(!$A.util.isUndefinedOrNull(this.map[color5]), "invalid color");

        // actual test assertions
        var style = $A.util.style;
        var c1 = style.getCSSProperty(elements[0], "color");
        var c2 = style.getCSSProperty(elements[1], "color");
        var c3 = style.getCSSProperty(elements[2], "color");
        var c4 = style.getCSSProperty(elements[3], "color");
        var c5 = style.getCSSProperty(elements[4], "color");

        // browsers handle colors differently
        if (c1.indexOf("rgb") > -1) {
            $A.test.assertEquals(this.map[color1], c1);
            $A.test.assertEquals(this.map[color2], c2);
            $A.test.assertEquals(this.map[color3], c3);
            $A.test.assertEquals(this.map[color4], c4);
            $A.test.assertEquals(this.map[color5], c5);
        } else {
            $A.test.assertEquals(color1, c1.toUpperCase());
            $A.test.assertEquals(color2, c2.toUpperCase());
            $A.test.assertEquals(color3, c3.toUpperCase());
            $A.test.assertEquals(color4, c4.toUpperCase());
            $A.test.assertEquals(color5, c5.toUpperCase());
        }
    },

    /** test applying a single token def at once */
    testSingleDef: {
        test: function(component) {
            var loaded = false;
            var colors = component.getElements();

            $A.styleService.applyTokens("styleServiceTest:colorTokens1", {
                callback: function() {loaded = true}
            });

            $A.test.addWaitFor(true, function() {return loaded}, function() {
                // first three overridden, last two remain from default
                this.assertColors(colors, "#39CCCC", "#39CCCC", "#39CCCC", "#68AB9F", "#DEC371");
            });
        }
    },

    /** test applying multiple token defs at once */
    testMultipleDefs: {
        test: function(component) {
            var loaded = false;
            var colors = component.getElements();

            var toApply = [
                "styleServiceTest:colorTokens1",
                "styleServiceTest:colorTokens2"
            ];

            $A.styleService.applyAllTokens(toApply, {
                callback: function() {loaded = true}
            });

            $A.test.addWaitFor(true, function() {return loaded}, function() {
                // first three overridden from first, last three overridden from second
                this.assertColors(colors, "#39CCCC", "#39CCCC", "#F012BE", "#F012BE", "#F012BE");
            });
        }
    },

    /** test with multiple token defs in succession, default behavior (should be equal to replaceExisting true) */
    testMultipleTokenDefsReplaceExistingDefault: {
        test: function(component) {
            var loaded = false;
            var colors = component.getElements();

            $A.styleService.applyTokens("styleServiceTest:colorTokens1", {
                callback: function() {
                    $A.styleService.applyTokens("styleServiceTest:colorTokens2", {
                        callback: function() {loaded = true}
                    })
                }
            });

            $A.test.addWaitFor(true, function() {return loaded}, function() {
                // first two from default, last three overridden from second
                this.assertColors(colors, "#DECC8C", "#DE986D", "#F012BE", "#F012BE", "#F012BE");
            });
        }
    },

    /** test with multiple token defs in succession, replaceExisting explicitly false */
    testMultipleTokenDefsReplaceExistingExplicitlyFalse: {
        test: function(component) {
            var loaded = false;
            var colors = component.getElements();

            $A.styleService.applyTokens("styleServiceTest:colorTokens1", {
                callback: function() {
                    $A.styleService.applyTokens("styleServiceTest:colorTokens2", {
                        replaceExisting: false,
                        callback: function() {loaded = true}
                    })
                }
            });

            $A.test.addWaitFor(true, function() {return loaded}, function() {
                // first three overridden from first, last three overridden from second
                this.assertColors(colors, "#39CCCC", "#39CCCC", "#F012BE", "#F012BE", "#F012BE");
            });
        }
    },

    /** test with multiple token defs in succession, replaceExisting explicitly true */
    testMultipleTokenDefsReplaceExistingExplicitlyTrue: {
        test: function(component) {
            var loaded = false;
            var colors = component.getElements();

            $A.styleService.applyTokens("styleServiceTest:colorTokens1", {
                callback: function() {
                    $A.styleService.applyTokens("styleServiceTest:colorTokens2", {
                        replaceExisting: true,
                        callback: function() {loaded = true}
                    })
                }
            });

            $A.test.addWaitFor(true, function() {return loaded}, function() {
                // first two from default, last three overridden from second
                this.assertColors(colors, "#DECC8C", "#DE986D", "#F012BE", "#F012BE", "#F012BE");
            });
        }
    },

    /** test with client loaded style def. client loaded styles should be included in overrides from server */
    testWithClientLoadedStyleDefs: {
        test: function(component) {
            var loaded = false;
            var addedCmp;

            // dynamically load a cmp
            $A.createComponent(
                "styleServiceTest:asyncLoaded", {},
                function(newCmp){
                    addedCmp = newCmp;
                    //Add the new cmp to the body array
                    var body = component.get("v.body");
                    body.push(newCmp);
                    component.set("v.body", body);

                    // after adding, apply theme
                    $A.styleService.applyTokens("styleServiceTest:colorTokens1", {
                        callback: function() {loaded = true}
                    });
                }
            );

            $A.test.addWaitFor(true, function() {return loaded}, function() {
                // we are testing that a client loaded cmp's styles are included in what css
                // comes back from the server, when applicable
                var toTest = addedCmp.getElement();

                var actual = $A.util.style.getCSSProperty(toTest, "color");
                var expected = actual.indexOf("rgb"  > -1) ? this.map["#39CCCC"] : "#39cccc";
                $A.test.assertEquals(expected, actual);
            });
        }
    },

    /** test unapply multiple tokens */
    testRemoveTokens: {
        test: function(component) {
            var loaded = false;
            var colors = component.getElements();

            $A.styleService.applyTokens("styleServiceTest:colorTokens1", {
                callback: function() {
                    $A.styleService.applyTokens("styleServiceTest:colorTokens2", {
                        replaceExisting: false,
                        callback: function() {loaded = true}
                    })
                }
            });

            $A.test.addWaitFor(true, function() {return loaded}, function() {
                $A.styleService.removeTokens();
                // should be defaults
                this.assertColors(colors, "#DECC8C", "#DE986D", "#AB6890", "#68AB9F", "#DEC371");
            });
        }
    },

    /** test with a map provider def */
    testUsingMapProvided: {
        test: function(component) {
            var loaded = false;
            var colors = component.getElements();

            $A.styleService.applyTokens("styleServiceTest:mapProvidedTokens", {
                callback: function() {loaded = true}
            });

            $A.test.addWaitFor(true, function() {return loaded}, function() {
                // first three overridden, last two remain from default
                this.assertColors(colors, "#776C8E", "#DE986D", "#AB6890", "#68AB9F", "#DEC371");
            });
        }
    },

    /** test customHandler */
    testCustomHandler: {
        test: function(component) {
            var loaded = false;
            var ret = null;
            var colors = component.getElements();

            $A.styleService.applyTokens("styleServiceTest:colorTokens1", {
                customHandler: function(css) {loaded = true; ret = css;}
            });

            $A.test.addWaitFor(true, function() {return loaded}, function() {
                // none overridden
                this.assertColors(colors, "#DECC8C", "#DE986D", "#AB6890", "#68AB9F", "#DEC371");

                // should have received some css
                $A.test.assertNotUndefinedOrNull(ret, "didn't get return value");
            });
        }
    }
})