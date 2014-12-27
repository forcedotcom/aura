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

    checkOutput: function(cmp, id, expected) {
        var el = document.getElementById(id);
        var els = el.childNodes;

        var actual = [];
        for (var i = 0; i<els.length; i++) {
            var text = $A.test.getText(els[i]);
            actual.push(text.split("\n").join(";"));
        }

        aura.test.assertEquals(expected.join(";"), actual.join(";"), "Value not expected in "+ id);        

    },

    /**
     *  This test validates that Aura handles attributes set by children.
     */
    testAttributeSetByChildDefault: {
        test: function(cmp) {
            this.checkOutput(cmp, "parent-address",  ["Seattle (default child)", "Washington (default child)"]);
            this.checkOutput(cmp, "child-address",  ["Seattle (default child)", "Washington (default child)"]);
        }
    },

    /**
     *  This test validates that Aura handles attributes set by children.
     */
    // TODO: W-2406307: remaining Halo test failure
    _testAttributeSetByChildPassed: {
        attributes: {city: "Miami (set child)", state: "Florida (set child)"},
        test: function(cmp) {
            this.checkOutput(cmp, "parent-address",  ["Miami (set child)", "Florida (set child)"]);
            this.checkOutput(cmp, "child-address",  ["Miami (set child)", "Florida (set child)"]);
        }
    }
})
