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
    /** test that each top level element should get the flavor class name */
    testMultipleTopLevelElements: {
        test: function(cmp) {
            var target1 = cmp.find("target1");
            var target2 = cmp.find("target2");
            var target3 = cmp.find("target3");
            var inner = cmp.find("inner");

            var expected = $A.util.buildFlavorClass(cmp.getSuper(), "default");
            $A.test.assertTrue($A.util.hasClass(target1.getElement(), expected), "target1 element didn't get flavor class");
            $A.test.assertTrue($A.util.hasClass(target2.getElement(), expected), "target2 element didn't get flavor class");
            $A.test.assertTrue($A.util.hasClass(target3.getElement(), expected), "target3 element didn't get flavor class");
            $A.test.assertFalse($A.util.hasClass(inner.getElement(), expected), "inner should NOT get flavor class");
        }
    }
})
