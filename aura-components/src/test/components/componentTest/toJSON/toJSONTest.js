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
    /**
     * Test calling toJSON returns a serialized reference to itself.
     */
    testToJSONSerializesGlobalId:{
        test: function(component) {
            var serialized = component.toJSON();
            var expected = component.getGlobalId();

            $A.test.assertEquals(expected, serialized.globalId);
        }
    },

    /**
     * Test that toJSON() Does not return the concrete global id, but
     * the ID of the component at that level.
     * @type {Object}
     */
    testToJSONSerializesSelfGlobalId: {
        test: function(component) {
            var expected = component.getGlobalId();
            var serialized = component.getSuper().toJSON();

            $A.test.assertNotEquals(expected, serialized.globalId);
        }
    }

 })
