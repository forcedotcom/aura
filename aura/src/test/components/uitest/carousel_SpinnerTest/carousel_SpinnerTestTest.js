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
 	 * Verify spinner element is present.
 	 */
 	testCarouselSpinnerComponent : {
 		browsers: ["-IE7","-IE8"],
 		test : function(cmp){
			var spinnerCmp = cmp.find("testSpinner");
			$A.test.assertFalse($A.util.isUndefinedOrNull(spinnerCmp), "Spinner component was not set properly");
        }
    },
    
    /**
     * Verify spinner appears then disappears.
     */
    testCarouselSpinnerAppearsDisappears : {
    	browsers: ["-IE7","-IE8"],
 		test : function(cmp){
			var spinnerElement = cmp.find("testSpinner").getElement();
			$A.test.assertFalse($A.util.hasClass(spinnerElement,"hideEl"));
			$A.test.addWaitFor("true", function() {
				var elm = cmp.find("testSpinner").getElement();
				return $A.util.hasClass(elm,"hideEl").toString();
			});
        }
    }
})