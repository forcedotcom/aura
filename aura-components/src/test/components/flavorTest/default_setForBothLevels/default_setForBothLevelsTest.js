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
    testBothLevels: {
        /** if parent and child both have flavorable elements, both should get the default */
        test: function(cmp) {
            var outer = $A.util.buildFlavorClass(cmp.getSuper(), "second");
            var inner = $A.util.buildFlavorClass(cmp, "second");
            $A.test.assertTrue($A.util.hasClass(cmp.getElement(), outer));
            $A.test.assertTrue($A.util.hasClass(cmp.getElement().firstChild, inner));
        }
    }
})
