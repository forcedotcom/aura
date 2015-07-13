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
	owner:"sle",


    //make sure show more has invisible class on load
	testShowMoreInitialVisibility: {
        test: [function(cmp) {
            //test visibility of show more button
        	$A.test.assertTrue(
        		$A.util.hasClass(
	    			cmp.find('showMore').getElement(),// element
	    			'invisible'// className
				),
        		'Show More Button in Pill Container should be invisible on page load'
    		)
        }]
    }
})