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
    assertColors: function(elements, color1, color2, color3) {
        // test assumptions
        $A.assert($A.util.isArray(elements), "wrong argument type");
        $A.assert(!$A.util.isUndefinedOrNull(color1), "missing color");
        $A.assert(!$A.util.isUndefinedOrNull(color2), "missing color");
        $A.assert(!$A.util.isUndefinedOrNull(color3), "missing color");
        $A.assert(!$A.util.isUndefinedOrNull(this.map[color1]), "invalid color");
        $A.assert(!$A.util.isUndefinedOrNull(this.map[color2]), "invalid color");
        $A.assert(!$A.util.isUndefinedOrNull(this.map[color3]), "invalid color");

        // actual test assertions
        var style = $A.util.style;
        var c1 = style.getCSSProperty(elements[0], "color");
        var c2 = style.getCSSProperty(elements[1], "color");
        var c3 = style.getCSSProperty(elements[2], "color");


        // browsers handle colors differently
        if (c1.indexOf("rgb") > -1) {
            $A.test.assertEquals(this.map[color1], c1);
            $A.test.assertEquals(this.map[color2], c2);
            $A.test.assertEquals(this.map[color3], c3);

        } else {
            $A.test.assertEquals(color1, c1.toUpperCase());
            $A.test.assertEquals(color2, c2.toUpperCase());
            $A.test.assertEquals(color3, c3.toUpperCase());
        }
    },

    /** test overriding var with cross reference */
    testCrossReference: {
        test: function(component) {
            var loaded = false;
            var colors = component.getElements();

            $A.styleService.applyTokens("styleServiceTest:crossReferenceOverride", {
                callback: function() {loaded = true}
            });

            $A.test.addWaitFor(true, function() {return loaded}, function() {
                this.assertColors(colors, "#F012BE", "#F012BE", "#DE986D");
            });
        }
    }
})