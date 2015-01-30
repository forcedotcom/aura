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
    testAttributeValueProviderReference:{
        test: [
	        /**
	         * Verify the returned component has the appropriate serialization ID set on it.
	         */
	        function(component) {
	        	var serialized = component.toJSON();
	        	var parsed = JSON.parse(serialized);

	        	$A.test.assertEquals(parsed.$serId, 0);
	        },

	        /** 
	         * Ensure the attribute value provider is serialized to point at itself.
	         * This used to cause a maximum call stack since the toJSON call would have
	         * Encountered itself and tried to start the serialization process over.
	         */
	        function(component) {
	        	var serialized = component.toJSON();
	        	var parsed = JSON.parse(serialized);

	        	$A.test.assertEquals(parsed.attributeValueProvider.$serRefId, parsed.$serId);
	        }
        ]
    }
 })