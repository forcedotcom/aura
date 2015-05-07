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
    testOverrideStylesWithUse: {
        browsers: [ 'GOOGLECHROME'],
        test: function(cmp) {
            var child = cmp.find("child");
            var el = child.getElement();
            expected = $A.util.buildFlavorClass(child, "default");
            $A.test.assertTrue($A.util.hasClass(el, expected));

            // the original default flavor has 1px, that rule should be deleted and
            // the new flavor included via use sets it to 2px
            var style = $A.util.style;
            var margin = style.getCSSProperty(el, "margin");
            $A.test.assertEquals("2px", margin);
        }
    }
})
