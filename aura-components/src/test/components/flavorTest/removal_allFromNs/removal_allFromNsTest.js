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
    testRemoveAllNsDefaultFlavors: {
        test: function(cmp) {
            // todo add a flavored cmp from a different ns!
            var c1 = cmp.find("c1");
            var e1 = c1.getElement();

            var c2 = cmp.find("c2");
            var e2 = c2.getElement();

            $A.test.assertTrue(e1.className.indexOf("--") === -1);
            $A.test.assertTrue(e2.className.indexOf("--") === -1);

            $A.test.assertTrue($A.util.isEmpty(c1.getFlavor()));
            $A.test.assertTrue($A.util.isEmpty(c2.getFlavor()));
        }
    }
})
