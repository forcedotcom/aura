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
    clickAndCheck: function(cmp, order, expected) {
        var localId = [order, expected].join(" ");
        var button = cmp.find(localId);
        $A.test.clickOrTouch(button.getElement());
        this.checkOutput(cmp, expected, "error after click " + expected);
    },

    checkOutput: function(cmp, expected, msg) {
        $A.test.setTestTimeout(2000);
        $A.test.addWaitForWithFailureMessage(
            expected,
            function(){
                var output = cmp.find('output');
                var el = output.getElement();
                var text = $A.test.getText(el);
                var actual = $A.util.trim(text);
                return actual;
            },
            msg,
            null
        );
    },

    // Tests walking up the possible values, ensuring that each rerenders
    // correctly, and then back down.  This once failed because references
    // to "old" elements hung around in parents, and also exercises cases
    // where a parent is unrendering and re-rendering without confusing the
    // child state.
    // TODO: W-2406307: remaining Halo test failure
    _testWalkUpAndDown: {
        test: [ function(cmp) {
            this.clickAndCheck(cmp, "oi", "FT");
        }, function(cmp) {
            this.clickAndCheck(cmp, "oi", "TF");
        }, function(cmp) {
            this.clickAndCheck(cmp, "oi", "TT");
        }, function(cmp) {
            this.clickAndCheck(cmp, "oi", "TF");
        }, function(cmp) {
            this.clickAndCheck(cmp, "oi", "FT");
        }, function(cmp) {
            this.clickAndCheck(cmp, "oi", "FF");
        }]
    },

    // Same, but set the inner condition before the outer coundition.
    // TODO: W-2406307: remaining Halo test failure
    _testWalkUpAndDownInverse: {
        test: [ function(cmp) {
            this.clickAndCheck(cmp, "io", "FT");
        }, function(cmp) {
            this.clickAndCheck(cmp, "io", "TF");
        }, function(cmp) {
            this.clickAndCheck(cmp, "io", "TT");
        }, function(cmp) {
            this.clickAndCheck(cmp, "io", "TF");
        }, function(cmp) {
            this.clickAndCheck(cmp, "io", "FT");
        }, function(cmp) {
            this.clickAndCheck(cmp, "io", "FF");
        }]
    },

    // Tests some "random" skipping around, and especially all the
    // double-change permutations.
    // TODO: W-2406307: remaining Halo test failure
    _testSkipAround: {
        test: [ function(cmp) {
            this.clickAndCheck(cmp, "oi", "TT");
        }, function(cmp) {
            this.clickAndCheck(cmp, "oi", "TF");
        }, function(cmp) {
            this.clickAndCheck(cmp, "oi", "FT");
        }, function(cmp) {
            this.clickAndCheck(cmp, "oi", "TF");
        }, function(cmp) {
            this.clickAndCheck(cmp, "oi", "TT");
        }, function(cmp) {
            this.clickAndCheck(cmp, "oi", "FF");
        }]
    },

    // Same, but set the inner condition before the outer coundition.
    // TODO: W-2406307: remaining Halo test failure
    _testSkipAroundInverse: {
        test: [ function(cmp) {
            this.clickAndCheck(cmp, "io", "TT");
        }, function(cmp) {
            this.clickAndCheck(cmp, "io", "TF");
        }, function(cmp) {
            this.clickAndCheck(cmp, "io", "FT");
        }, function(cmp) {
            this.clickAndCheck(cmp, "io", "TF");
        }, function(cmp) {
            this.clickAndCheck(cmp, "io", "TT");
        }, function(cmp) {
            this.clickAndCheck(cmp, "io", "FF");
        }]
    },

    // Tests initial render is good default attributes
    testInitialStateDefault: {
        test: function(cmp) {
            this.checkOutput(cmp, "FF", "Default attributes should display FF");
        }
    },
    // Tests initial render is good with non-default attributes
    testInitialStateFF: {
        attributes : { outer: "false", inner: "false" },
        test: function(cmp) {
            this.checkOutput(cmp, "FF", "Attributes FF should display FF");
        }
    },
    // Tests initial render is good with non-default attributes
    testInitialStateTF: {
        attributes : { outer: "true", inner: "false" },
        test: function(cmp) {
            this.checkOutput(cmp, "TF", "Attributes TF should display TF");
        }
    },
    // Tests initial render is good with non-default attributes
    testInitialStateFT: {
        attributes : { outer: "false", inner: "true" },
        test: function(cmp) {
            this.checkOutput(cmp, "FT", "Attributes FT should display FT");
        }
    },
    // Tests initial render is good with non-default attributes
    testInitialStateTT: {
        attributes : { outer: "true", inner: "true" },
        test: function(cmp) {
            this.checkOutput(cmp, "TT", "Attributes TT should display TT");
        }
    },
})
