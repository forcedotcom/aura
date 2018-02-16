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
    testSettingStringAttributeInJavaProvider: {
        test: function(cmp) {
            var actual = cmp.get("v.stringValue");
            $A.test.assertEquals("String from Java provider", actual);
        }
    },

    testSettingIntegerAttributeInJavaProvider: {
        test: function(cmp) {
            var actual = cmp.get("v.numberValue");
            $A.test.assertEquals(123, actual);
        }
    },

    /**
     * Verify that when an attribute is set as null is Java provider,
     * it becomes undefined on concrete component.
     */
    testAttributeIsUndefinedIfSetAsNullInJavaProvider: {
        test: function(cmp) {
            var actual = cmp.get("v.nullValue");
            $A.test.assertUndefined(actual);
        }
    },

    testSettingArrayAttributeInJavaProvider: {
        test: function(cmp) {
            var actual = cmp.get("v.arrayValue");
            $A.test.assertTrue($A.util.isArray(actual));
            $A.test.assertEquals(2, actual.length);
            $A.test.assertEquals("val1", actual[0]);
            $A.test.assertEquals("val2", actual[1]);
        }
    },

    testExistingAttributeValueCanBeUsedInJavaProvider: {
        attributes: {'existingValue': 'existing string value'},
        test: function(cmp) {
            var actual = cmp.get("v.stringValue");
            $A.test.assertEquals("existing string value", actual);
        }
    },

    testValueSetInJavaProviderOverrideExistingValue: {
        attributes: {'numberValue': 321},
        test: function(cmp) {
            var actual = cmp.get("v.numberValue");
            $A.test.assertEquals(123, actual);
        }
    }
})
