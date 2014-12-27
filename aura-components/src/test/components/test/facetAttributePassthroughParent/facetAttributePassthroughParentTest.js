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
    testFacetRenderedDefaultValue: {
        test: function(cmp) {
            var text = $A.test.getTextByComponent(cmp);
            $A.test.assertEquals("default string", text, "default value for attribute not passed through facets");
        }
    },

    testFacetRendered: {
        attributes: { something : "this here string" },
        test: function(cmp) {
            var text = $A.test.getTextByComponent(cmp);
            $A.test.assertEquals("this here string", text, "specific value for attribute not passed through facets");
        }
    }
})