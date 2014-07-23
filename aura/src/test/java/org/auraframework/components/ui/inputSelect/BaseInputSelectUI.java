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

import org.auraframework.test.WebDriverTestCase;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.Select;

public class BaseInputSelectUI extends WebDriverTestCase{
    private final String URL;

    private final String [] options;
    private final By SELECT_LOCATOR;
    private final String OPTION_LOCATOR_STRING;
    private final int SIZE_OF_OPTIONS;
    private final String SELECT_ID;
    
    public String getURL() {
        return URL;
    }

    
    public BaseInputSelectUI(String url, By sel_loc, String opt_loc, String [] opts, String sel_id) {
        super(url);
        // TODO Auto-generated constructor stub
        
        this.URL = url;
        this.SELECT_LOCATOR = sel_loc;
        this.OPTION_LOCATOR_STRING = opt_loc;
        this.SIZE_OF_OPTIONS = opts.length;
        this.options = opts;
        this.SELECT_ID = sel_id;
    }
    
    /**
     * Test verifying that the The DOM values and the value stored in the component are the same.
     */
    public void testSelectedOptionAndDOMMatch () throws Exception {
        String oldOption = options[1];
        String newOption = options[2];
        
        open(URL);
        // There should be 4 options with Option2 as selected
        assertEquals(4, selectOptionsSize());
        verifyOptionSelected(oldOption);
        
        String aura_selected_item =  auraUITestingUtil.getValueFromCmpRootExpression(SELECT_ID, "v.value");
        assertEquals(auraUITestingUtil.getEval(aura_selected_item), oldOption);
        // Select Option1
        selectOption(newOption);

        verifyOptionSelected(newOption);         
        assertEquals(auraUITestingUtil.getEval(aura_selected_item), newOption);          
    }
    /**
     * Selecting first option should work
     * 
     * @throws Exception
     */
    public void testSelectingFirstOption() throws Exception {

        open(URL);
        bodyOfTest(options[1], options[0]);
    }

    /**
     * Selecting last option should work
     * 
     * @throws Exception
     */
    public void testSelectingLastOption() throws Exception {

        open(URL);
        bodyOfTest(options[1], options[3]);
    }

    protected void bodyOfTest(String origOption, String newOpt){
        // There should be 4 options with Option2 as selected
        assertEquals(SIZE_OF_OPTIONS, selectOptionsSize());
        verifyOptionSelected(origOption);

        // Select Option1
        selectOption(newOpt);

        // There should be 4 options with Option4 as selected
        assertEquals(SIZE_OF_OPTIONS, selectOptionsSize());
        verifyOptionSelected(newOpt);
        verifyOptionDeselected(origOption);
    }
    
    
    private Select getInputSelect() {
        return new Select(findDomElement(SELECT_LOCATOR));
    }

    private int selectOptionsSize() {
        return getInputSelect().getOptions().size();
    }

    private void selectOption(String optionLabel) {
        Select inputSelect = getInputSelect();
		inputSelect.selectByValue(optionLabel);  
        verifyOptionSelected(optionLabel);
    }

    private void verifyOptionSelected(String optionLabel) {
        verifyOptionSelectDeselct(optionLabel, true);
    }

    private void verifyOptionDeselected(String optionLabel) {
        verifyOptionSelectDeselct(optionLabel, false);
    }

    private void verifyOptionSelectDeselct(String optionLabel, boolean isSelected) {
        WebElement option = findDomElement(By.xpath(String.format(OPTION_LOCATOR_STRING, optionLabel)));
        if (isSelected) {
            assertTrue("Option '" + optionLabel + "' should be selected", option.isSelected());
        } else {
            assertFalse("Option '" + optionLabel + "' should be deselected", option.isSelected());
        }
    }

}
