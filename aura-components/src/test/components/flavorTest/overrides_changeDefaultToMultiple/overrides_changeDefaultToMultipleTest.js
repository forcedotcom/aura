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
    /** test specifying multiple flavors as the default */
    testUseMultipleFlavors: {
        test: function(cmp) {
            var usingDefault = cmp.find("usingDefault");
            var usingDefaultEl = usingDefault.getElement();
            var expected = $A.util.buildFlavorClass(usingDefault, "base, neutral").split(" ");
            $A.test.assertTrue($A.util.hasClass(usingDefaultEl, expected[0]));
            $A.test.assertTrue($A.util.hasClass(usingDefaultEl, expected[1]));

            var usingExplicit = cmp.find("usingExplicit");
            var usingExplicitEl = usingExplicit.getElement();
            expected = $A.util.buildFlavorClass(usingExplicit, "base");
            $A.test.assertTrue($A.util.hasClass(usingExplicitEl, expected))
        }
    }
})
