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
    /** super has the flavorable, child is empty */
    _testBareChild: {
        test: function(cmp) {
            var target = cmp.find("bareChild");
            var el = target.getElement();

            var superCmp = target.getSuper();
            var expected = $A.util.buildFlavorClass(superCmp, "flavorA");
            $A.test.assertTrue($A.util.hasClass(el, expected));
        }
    },

    /** child has the flavorable, parent is empty */
    testBareParent: {
        test: function(cmp) {
            var target = cmp.find("bareParent");
            var el = target.getElement();
            var expected = $A.util.buildFlavorClass(target, "flavorA");
            $A.test.assertTrue($A.util.hasClass(el, expected));
        }
    },

    /** parent and child have flavorables */
    _testBothHaveFlavorable: {
        test: function(cmp) {
            $A.test.fail("unimplemented");
        }
    },

    /** TODO */
    _testOnlyText: {
        test: function(cmp) {
            $A.test.fail("unimplemented");
        }
    },

    /** TODO */
    _testNestedInner: {
        test: function(cmp) {
            $A.test.fail("unimplemented");
        }
    },

    /** TODO */
    _testNestedOuter: {
        test: function(cmp) {
            $A.test.fail("unimplemented");
        }
    },

    /** TODO */
    _testFlatOuter: {
        test: function(cmp) {
            $A.test.fail("unimplemented");
        }
    },

    /** TODO */
    _testPeers: {
        test: function(cmp) {
            $A.test.fail("unimplemented");
        }
    }

})
