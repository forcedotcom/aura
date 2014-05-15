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
import org.openqa.selenium.By;

//TODO: ADD CASE FOR OPTIONS IN BODY AS WELL SINCE OPTIONS IN BODY AND OPTION IN v.options GO THROUGH DIFFERENT PATHS
public class InputSelectBodyUITest   extends BaseInputSelectUI{

  public InputSelectBodyUITest() {
      super("/uitest/InputSelect_OptionsInBodyInitValue.cmp", 
            By.xpath("//select[1]"), 
            "//select[1]/option[@value='%s']", 
            new String[]{"Tiger", "Lion", "Bear", "Moose"},
            "Value_Undef_With_Default");
  }
  
  
}
   