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
    clickAndWait: function(cmp, string, emsg) {
        var button = cmp.find(string);
        $A.test.clickOrTouch(button.getElement());
        $A.test.addWaitForWithFailureMessage(
        		string, 
        		function(){
        			var div = cmp.getElements()[1];
        			var t = $A.test.getText(div);
        			return t;
        		},
        		emsg,
        		null
        );
    },

    checkOutput: function(cmp, string, msg) {
        var div = cmp.getElements()[1];
        var t = $A.test.getText(div);
        $A.test.assertEquals(string, t, msg);
    },

    // Tests walking up the possible values, ensuring that each rerenders
    // correctly, and then back down.  This once failed because references
    // to "old" elements hung around in parents, and also exercises cases
    // where a parent is unrendering and re-rendering without confusing the
    // child state.
    testWalkUpAndDown: {
        test: [ function(cmp) {
                this.checkOutput(cmp, "FF", "unexpected initial display");
                this.clickAndWait(cmp, "FT","error after click FT");
            }, function(cmp) {
                this.clickAndWait(cmp, "TF","error after click TF");
            }, function(cmp) {
                this.clickAndWait(cmp, "TT","error after click TT");
            }, function(cmp) {
                this.clickAndWait(cmp, "TF","error after click TF");
            }, function(cmp) {
                this.clickAndWait(cmp, "FT","error after click FT");
            }, function(cmp) {
                this.clickAndWait(cmp, "FF","error after click FF");
            }, function(cmp) {
                // We're good
            }]
    },

    // Tests some "random" skipping around, and especially all the
    // double-change permutations.
    testSkipAround: {
        test: [ function(cmp) {
                this.checkOutput(cmp, "FF", "unexpected initial display");
                this.clickAndWait(cmp, "TT","error after click TT");
            }, function(cmp) {
                this.clickAndWait(cmp, "TF","error after click TF");
            }, function(cmp) {
                this.clickAndWait(cmp, "FT","error after click FT");
            }, function(cmp) {
                this.clickAndWait(cmp, "TF","error after click TF");
            }, function(cmp) {
                this.clickAndWait(cmp, "TT","error after click TT");
            }, function(cmp) {
                this.clickAndWait(cmp, "FF","error after click FF");
            }, function(cmp) {
                // We're good
            }]
    },

    // Tests initial render is good with non-default attributes
    testInitialState: {
        attributes : { outer: "true", inner: "true" },
        test: [ function(cmp) {
                this.checkOutput(cmp, "TT", "unexpected initial display");
            } ]
    },

})
