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

    //test icon background
	testIconBackgroundColorWithIcon: {
        test: function(cmp) {
        	var pillIcons = $A.test.select('.pillIcon');

            //there should only be one pill,  because the other two pills doesnt have iconUrl
            $A.test.assertEquals(
                1,
                pillIcons.length,
                'There should be only one pill icon on the page'
            );

            var elPillIcon = pillIcons[0];

            //assert background color
            var stylePillIcon = $A.test.getStyle(elPillIcon,"background-color");
 			var expectedStyle = "rgb(255, 0, 255)";
            $A.test.assertEquals(expectedStyle, stylePillIcon, '.pillIcon should have a background style. Found style: ' + stylePillIcon)
        }
	}
})