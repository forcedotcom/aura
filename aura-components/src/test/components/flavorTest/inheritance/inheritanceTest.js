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
    // TODO all of these need rerender tests!

    /** super has the flavorable, child is empty */
    testBareChild: {
        test: function(cmp) {
            var target = cmp.find("bareChild");
            var el = target.getElement();

            var expected = $A.util.buildFlavorClass(target.getSuper(), "flavorA");
            $A.test.assertTrue($A.util.hasClass(el, expected));
        }
    },

    /** super has the flavorable, child has non-flavored elements */
    testMarkupChild: {
        test: function(cmp) {
            var target = cmp.find("markupChild");
            var el = target.getElement();

            var expected = $A.util.buildFlavorClass(target.getSuper(), "flavorA");
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
    testBothHaveFlavorable: {
        test: function(cmp) {
            var target = cmp.find("both");
            var parent = target.getElement();
            var child = parent.firstChild;

            var parentExpected = $A.util.buildFlavorClass(target.getSuper(), "flavorA");
            var childExpected = $A.util.buildFlavorClass(target, "flavorA");

            $A.test.assertTrue($A.util.hasClass(parent, parentExpected));
            $A.test.assertTrue($A.util.hasClass(child, childExpected));
        }
    },

    /** parent has flavorables, child has text */
    testOnlyText: {
        test: function(cmp) {
            var target = cmp.find("textChild");
            var el = target.getElement();
            var expected = $A.util.buildFlavorClass(target.getSuper(), "flavorA");
            $A.test.assertTrue($A.util.hasClass(el, expected));
        }
    },

    /** parent has wrapper with v.body, child has flavorable */
    testFlatOuter: {
        test: function(cmp) {
            var target = cmp.find("flatChild");
            var el = target.getElement().firstChild;
            var expected = $A.util.buildFlavorClass(target, "flavorB");
            $A.test.assertTrue($A.util.hasClass(el, expected));

            // and the parent div should not have a flavor
            var parent = target.getElement();
            var notExpected = $A.util.buildFlavorClass(target.getSuper(), "flavorB");
            $A.test.assertFalse($A.util.hasClass(parent, expected));
            $A.test.assertFalse($A.util.hasClass(parent, notExpected));
        }
    },

    /** parent has wrapper with v.body, child has flavorable div */
    testNestedOuter: {
        test: function(cmp) {
            var target = cmp.find("outerChild");
            var el = target.getElement().firstChild;
            var nestedEl = el.firstChild;
            var expected = $A.util.buildFlavorClass(target, "flavorB");
            $A.test.assertTrue($A.util.hasClass(el, expected));
            $A.test.assertFalse($A.util.hasClass(nestedEl, expected));

            // and the parent div should not have a flavor
            var parent = target.getElement();
            var notExpected = $A.util.buildFlavorClass(target.getSuper(), "flavorB");
            $A.test.assertFalse($A.util.hasClass(parent, expected));
            $A.test.assertFalse($A.util.hasClass(parent, notExpected));
        }
    },

    /** parent has wrapper div with v.body, child has flavorable div nested in another non flavorable div */
    testNestedInner: {
        test: function(cmp) {
            var target = cmp.find("innerChild");
            var el = target.getElement().firstChild;
            var nestedEl = el.firstChild;
            var expected = $A.util.buildFlavorClass(target, "flavorB");
            $A.test.assertTrue($A.util.hasClass(nestedEl, expected));
            $A.test.assertFalse($A.util.hasClass(el, expected));

            // and the parent div should not have a flavor
            var parent = target.getElement();
            var notExpected = $A.util.buildFlavorClass(target.getSuper(), "flavorB");
            $A.test.assertFalse($A.util.hasClass(parent, expected));
            $A.test.assertFalse($A.util.hasClass(parent, notExpected));
        }
    },

    /** parent has a wrapper div with v.body, child has a flavorable div and other non-flavorables at the top level */
    testPeers: {
        test: function(cmp) {
            var target = cmp.find("peersChild");
            var el = target.getElement().firstChild;
            var expected = $A.util.buildFlavorClass(target, "flavorB");
            $A.test.assertTrue($A.util.hasClass(el, expected));

            // and the peers should not have a flavor
            var p1 = target.getElement().getElementsByClassName("peer1")[0];
            var p2 = target.getElement().getElementsByClassName("peer2")[0];
            $A.test.assertFalse($A.util.hasClass(p1, expected));
            $A.test.assertFalse($A.util.hasClass(p2, expected));

            // and the parent div should not have a flavor
            var parent = target.getElement();
            var notExpected = $A.util.buildFlavorClass(target.getSuper(), "flavorB");
            $A.test.assertFalse($A.util.hasClass(parent, expected));
            $A.test.assertFalse($A.util.hasClass(parent, notExpected));
        }
    }
})
