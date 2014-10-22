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
        var output = cmp.find(id);
        var els = output.getElements();

        var actual = [];

        for (var i = 0; i < els.length; i++) {
            var text = $A.test.getText(els[i]);
            actual.push(text.split("\n").join(";"));
        }

        aura.test.assertEquals(expected.join(";"), actual.join(";"), "Value not expected in "+ id);        

    },

    /**
     *  This test validates that Aura handles default attributes values properly.
     * Before, default values were shared amongst all instances of a components.
     */
    testDefaultValueNotShared: {
        test: [ function(cmp) {
            this.checkOutput(cmp, "loop", 
                ["0. blue #0","0. green #0","0. yellow #0","0. orange #0","0. red #0"]);

            this.checkOutput(cmp, "aqua", ["0. aqua #0"]);
            this.checkOutput(cmp, "black", ["0. Default A","1. Default B","2. black #2"]);
            this.checkOutput(cmp, "brown", ["0. Default A","1. Default B","2. brown #2"]);
        }]
    }
})
