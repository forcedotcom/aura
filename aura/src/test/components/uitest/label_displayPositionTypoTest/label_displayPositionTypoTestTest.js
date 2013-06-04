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
     * Verify labelPosition must be one of the following values: 'top', 'right', 'bottom', 'left', 'hidden'
     */
    testThrowLabelPositionError: {
    	exceptionsAllowedDuringInit : ["labelPosition must be one of the following values: 'top', 'right', 'bottom', 'left', 'hidden'"],
    	test: function(component){
            $A.test.expectAuraError("labelPosition must be one of the following values: 'top', 'right', 'bottom', 'left', 'hidden'");
            var message = aura.util.getElement("auraErrorMessage");
            var errorMessage = "labelPosition must be one of the following values: 'top', 'right', 'bottom', 'left', 'hidden'";
            $A.test.assertTrue(aura.test.contains(aura.test.getText(message),errorMessage), "Expected " + errorMessage);
    	}
    }
})
