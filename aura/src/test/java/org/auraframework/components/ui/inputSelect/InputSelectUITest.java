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
package org.auraframework.components.ui.inputSelect;

import org.auraframework.test.annotation.PerfTest;
import org.openqa.selenium.By;

public class InputSelectUITest  extends BaseInputSelectUI{

    public InputSelectUITest() {
        super("/uitest/inputSelect_DynamicOptionsTest.cmp", By.xpath("//select[1]"), 
              "//select[1]/option[text()='%s']", new String[]{"Option1", "Option2", "Option3", "Option4"},
              "dynamicSelect");
    }

    /**
     * Selecting any option should work only want this test running for this test Class
     * 
     * @throws Exception
     */
    @PerfTest
    public void testSelectingOption() throws Exception {

        open(getURL());
        bodyOfTest("Option2", "Option3");
    }

}
   
