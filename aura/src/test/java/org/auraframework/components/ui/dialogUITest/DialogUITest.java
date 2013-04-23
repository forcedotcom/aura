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

package org.auraframework.components.ui.dialogUITest;

import java.net.MalformedURLException;
import java.net.URISyntaxException;

import org.auraframework.test.WebDriverTestCase;
import org.auraframework.test.WebDriverUtil.BrowserType;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
public class DialogUITest  extends WebDriverTestCase {
    
    private final String URL_MODAL= "uitest/dialogModalTest.cmp";
    private final String URL_NON_MODAL= "uitest/dialogNonModalTest.cmp";
    private final String CLASSNAME = "return $A.test.getActiveElement().className";
    private final String TITLE = "return $A.test.getActiveElement().title";
    private final String SHIFT_TAB = Keys.SHIFT+""+Keys.TAB;
    private final String CONFIRM_STR = "Click to confirm";
    private final String CANCEL_STR = "Click to cancel";
    private final String CLOSE_STR = "Close this window";
    private final String SUBMITTED = "Data Submited";
    private final String NOT_SUBMITTED = "Data Not Submitted";
    private final String RESULT_LABEL = "input[class*='resultLabel']";
    private final String LAUNCH_DIALOG = "launchDialogButton default uiBlock uiButton";
    
    public DialogUITest(String name){
        super(name);
    }
    /***********************************************************************************************
     ***********************************HELPER FUNCTIONS********************************************
     ***********************************************************************************************/
    
    //Helper method used to make sure that enter is not used for Safari
    public void clickOnElementOrPressEnter(WebElement elm){
        if(checkBrowserType("SAFARI")){
            elm.click(); 
        }
        else{
            auraUITestingUtil.pressEnter(elm); 
        }
    }
    /*
     * Method opening up and making sure the Dialog box is opened correctly
     */
    private void openDialogBox(WebDriver driver){ 
        WebElement element = driver.findElement(By.cssSelector(RESULT_LABEL));      
        auraUITestingUtil.pressTab(element);
        element = driver.findElement(By.cssSelector("button[class*='"+LAUNCH_DIALOG+"']"));
        
        clickOnElementOrPressEnter(element);
        waitForComponentToChangeStatus("div[class*='dialog']","className","hidden", true);
        
        String dialogDivClass = driver.findElement(By.cssSelector("div[class*='medium uiDialog']")).getAttribute("className");
        assertTrue("DialogBox did not appear on the screen",!dialogDivClass.contains("hidden"));
        
    }
    //Gets the first Focusable item in a modal Dialog box
    private WebElement getFirstFocusableItemInModal(WebDriver driver){ 
        WebElement element = driver.findElement(By.cssSelector( "button[title*='"+CONFIRM_STR+"']"));
        assertEquals("Initial focus is not on the confirm button", CONFIRM_STR, element.getAttribute("title"));
    
        return element;
    }
    
    /*
     * Function that will check that the modal dialog box does not close when clicked outside the box 
     */
    private boolean tryToCloseBlockingDialog(WebElement elem)
    {
       try{
           elem.click();
       }catch(Exception e){
           if(e.getMessage().contains("Element is not clickable")){
               return true;
           }      
           return false;
       }
       return false;
    }
    
    /***********************************************************************************************
     *******************************MODAL DIALOG BOX CHECK******************************************
     ***********************************************************************************************/
    @ExcludeBrowsers({ BrowserType.IE7, BrowserType.GOOGLECHROME, BrowserType.ANDROID_PHONE, BrowserType.ANDROID_TABLET, BrowserType.IPAD, BrowserType.IPHONE})
    public void testDialogModalEnterDefaultSubmit() throws MalformedURLException, URISyntaxException{
        open(URL_MODAL);
        
        WebDriver driver = getDriver();
        openDialogBox(driver);
        
        WebElement element = getFirstFocusableItemInModal(driver);
        
        //closeDialogBox
        clickOnElementOrPressEnter(element);
        
        //Wait for the dialog box to close
        waitForComponentToChangeStatus("div[class*='dialog']","className","hidden", false);
        
        //Check that the dialog box did close -- Redundent because the waitForDialogBoxToClose method will stop after 30 seconds
        // but necessary for a sanity check
        String dialogDivClass = driver.findElement(By.cssSelector("div[class*='medium uiDialog']")).getAttribute("className");
        assertTrue("DialogBox did not close",dialogDivClass.contains("hidden"));
        
        //Check the input text box and make sure that Data Submitted is now there
        element = driver.findElement(By.cssSelector(RESULT_LABEL));
        assertEquals("The enter button did not act as default submit", SUBMITTED, element.getAttribute("value"));
    }
    //Test making sure that focus stays in the modal
    @ExcludeBrowsers({ BrowserType.IE7, BrowserType.GOOGLECHROME, BrowserType.ANDROID_PHONE, BrowserType.ANDROID_TABLET, BrowserType.IPAD, BrowserType.IPHONE})
    public void testDialogModalFocusOnDialogBox() throws MalformedURLException, URISyntaxException{
        open(URL_MODAL);  
        WebDriver driver = getDriver();

        openDialogBox(driver);
        WebElement element = driver.findElement(By.cssSelector(RESULT_LABEL)); 
        
        //Making sure that after two clicks the dialog box does not close
        tryToCloseBlockingDialog(element);
        
        //Make sure DialogBox did not close
        element = driver.findElement(By.cssSelector("div[class*='mask uiDialog']"));
        boolean dialogStillUp = element.getAttribute("class").contains("fadeIn");
        assertTrue("The Modal Dialog box was closed by clicking outside of it", dialogStillUp);
    }
     
    /*Check if focus is returned to the Button that called dialog box did not actually lose focus to begin with*/
    @ExcludeBrowsers({ BrowserType.IE7, BrowserType.GOOGLECHROME, BrowserType.ANDROID_PHONE, BrowserType.ANDROID_TABLET, BrowserType.IPAD, BrowserType.IPHONE})
    public void testDialogModalFocusOnExit() throws MalformedURLException, URISyntaxException{
        open(URL_MODAL);
        
        WebDriver driver = getDriver();
        openDialogBox(driver);
        
        //Get focus on ok button and press it
        WebElement element = getFirstFocusableItemInModal(driver);
        clickOnElementOrPressEnter(element);
        
        //Wait for dialog box to close
        waitForComponentToChangeStatus("div[class*='dialog']","className","hidden", false);
        
        //Make sure focus is back on the ok button
        element = driver.findElement(By.cssSelector("button[class*='"+ auraUITestingUtil.getEval(CLASSNAME)+"']"));  
        assertEquals("Focus did not return to the element that called the dialog box", LAUNCH_DIALOG, element.getAttribute("className"));
    }
    
    //Check if escape button exits with submitting
    @ExcludeBrowsers({ BrowserType.IE7, BrowserType.GOOGLECHROME, BrowserType.ANDROID_PHONE, BrowserType.ANDROID_TABLET, BrowserType.IPAD, BrowserType.IPHONE})
    public void testDialogModalEscapeButton() throws MalformedURLException, URISyntaxException{
        open(URL_MODAL);
        
        WebDriver driver = getDriver();
        openDialogBox(driver);
        
        WebElement element = getFirstFocusableItemInModal(driver);
        element.sendKeys(Keys.ESCAPE);
        
       
        //Wait for dialog box to close
        waitForComponentToChangeStatus("div[class*='dialog']","className","hidden", false);

        //Make sure that no data was submitted by looking at the inputbox
        element = driver.findElement(By.cssSelector(RESULT_LABEL));     
        assertEquals("The escape button did not submit data", NOT_SUBMITTED, element.getAttribute("value"));
    }
    
    //Making sure that tabing through the dialog box does not exit out
    @ExcludeBrowsers({ BrowserType.IE7, BrowserType.GOOGLECHROME, BrowserType.SAFARI, BrowserType.ANDROID_PHONE, BrowserType.ANDROID_TABLET, BrowserType.IPAD, BrowserType.IPHONE})
    public void testDialogModalTab() throws MalformedURLException, URISyntaxException, InterruptedException{
        open(URL_MODAL);
        
        WebDriver driver = getDriver();
        openDialogBox(driver);
        WebElement element = getFirstFocusableItemInModal(driver);
        
        //Tab to the close button
        auraUITestingUtil.pressTab(element);
        String classOfActiveElem = "button[class^='"+ auraUITestingUtil.getEval(CLASSNAME)+"']";

        element = driver.findElement(By.cssSelector(classOfActiveElem));
        assertEquals("Hitting tab once does not take us to our close button", CLOSE_STR, element.getAttribute("title"));
        
        //Tab to the ok button
        auraUITestingUtil.pressTab(element);
        classOfActiveElem = "button[title*='"+ auraUITestingUtil.getEval(TITLE)+"']";
        element = driver.findElement(By.cssSelector(classOfActiveElem));
        
        assertEquals("Hitting tab twice does not take us to our starting values", CONFIRM_STR, element.getAttribute("title"));
       }
    
    //Checking if Shift-Tab will close the dialog box
    @ExcludeBrowsers({ BrowserType.IE7, BrowserType.GOOGLECHROME, BrowserType.SAFARI, BrowserType.ANDROID_PHONE, BrowserType.ANDROID_TABLET, BrowserType.IPAD, BrowserType.IPHONE})
    public void testDialogModalShiftTab() throws MalformedURLException, URISyntaxException{
        open(URL_MODAL);
        
        WebDriver driver = getDriver();
        openDialogBox(driver);
        WebElement element = getFirstFocusableItemInModal(driver);
        
        //Tab to the close button
        auraUITestingUtil.pressTab(element);

        String classOfActiveElem = "button[class^='"+ auraUITestingUtil.getEval(CLASSNAME)+"']";

        element = driver.findElement(By.cssSelector(classOfActiveElem));
        assertEquals("Hitting tab once does not take us to our close button", CLOSE_STR, element.getAttribute("title"));
        auraUITestingUtil.pressTab(element);

        //Shift-tab back to the Ok button
        element.sendKeys(SHIFT_TAB);
        classOfActiveElem = "button[class^='"+ auraUITestingUtil.getEval(CLASSNAME)+"']";
       
        element = driver.findElement(By.cssSelector(classOfActiveElem));
        assertEquals("Hitting shift-tab once does not take us to the confirm button", CONFIRM_STR , element.getAttribute("title"));
        
    }
    
    /***********************************************************************************************
     ***************************NON-MODAL DIALOG BOX CHECK******************************************
     ***********************************************************************************************/
    @ExcludeBrowsers({ BrowserType.IE7,BrowserType.IE8, BrowserType.SAFARI, BrowserType.ANDROID_PHONE, BrowserType.ANDROID_TABLET, BrowserType.IPAD, BrowserType.IPHONE})
    public void testDialogNonModalCheckBoxes() throws MalformedURLException, URISyntaxException{
        open(URL_NON_MODAL);
        
        WebDriver driver = getDriver();
        openDialogBox(driver);
        
        WebElement element;
        String classOfActiveElem = "";
        
        //Going through checkBoxes
        for(int i=0;i<10;i++)
        {
            classOfActiveElem = "input[class*='"+ auraUITestingUtil.getEval(CLASSNAME)+"']";
            element = driver.findElement(By.cssSelector(classOfActiveElem)); 
            assertEquals("Did not move to next checkbox", element.getAttribute("class"), "checkBox"+(i+1)+" uiInputCheckbox uiInput");
            
            //Click on everyother checkbox
            if(i%2==0){
                element.click();
            }
            
            auraUITestingUtil.pressTab(element);
        }
        
        //getting Cancel Button
        classOfActiveElem = "button[title^='"+ auraUITestingUtil.getEval(TITLE)+"']";
        element = driver.findElement(By.cssSelector(classOfActiveElem)); 
        
        assertEquals("Went through all check boxees but did not get to the cancel button", CANCEL_STR, element.getAttribute("title"));
    
        auraUITestingUtil.pressTab(element);
        
        //Getting Ok button
        classOfActiveElem = "button[title^='"+ auraUITestingUtil.getEval(TITLE)+"']";
        element = driver.findElement(By.cssSelector(classOfActiveElem)); 
        assertEquals("Got to the cancel button but did not tab to confirm button", CONFIRM_STR, element.getAttribute("title"));
        
        auraUITestingUtil.pressEnter(element);
        
        //Getting the input text box to grab the value that was put in it
        element = driver.findElement(By.cssSelector(RESULT_LABEL));
        assertEquals("Values that were selected don't match the output given","Pudding Bananas Cheese Water Bottles Computers",element.getAttribute("value"));
    }

    //Checking if Dialog box will will close after having all elements tabbed through
    @ExcludeBrowsers({ BrowserType.IE7, BrowserType.SAFARI, BrowserType.ANDROID_PHONE, BrowserType.ANDROID_TABLET, BrowserType.IPAD, BrowserType.IPHONE})
    public void testDialogNonModalTab() throws MalformedURLException, URISyntaxException{
        open(URL_NON_MODAL);
        
        WebDriver driver = getDriver();
        openDialogBox(driver);
        WebElement element;
        String classOfActiveElem = "";
        
        //Going through checkBoxes
        for(int i=0;i<10;i++){
            classOfActiveElem = "input[class*='"+ auraUITestingUtil.getEval(CLASSNAME)+"']";
            element = driver.findElement(By.cssSelector(classOfActiveElem)); 
            assertEquals("Did not move to next checkbox", element.getAttribute("class"), "checkBox"+(i+1)+" uiInputCheckbox uiInput");
            auraUITestingUtil.pressTab(element);
        }
        
        //getting Cancel Button
        classOfActiveElem = "button[title^='"+ auraUITestingUtil.getEval(TITLE)+"']";
        element = driver.findElement(By.cssSelector(classOfActiveElem)); 
        
        assertEquals("Went through all check boxees but did not get to the cancel button", CANCEL_STR, element.getAttribute("title"));
    
        auraUITestingUtil.pressTab(element);
        
        //Getting Ok button
        classOfActiveElem = "button[title^='"+ auraUITestingUtil.getEval(TITLE)+"']";
        element = driver.findElement(By.cssSelector(classOfActiveElem)); 
        assertEquals("Got to the cancel button but did not tab to confirm button", CONFIRM_STR, element.getAttribute("title"));
        auraUITestingUtil.pressTab(element);
        
        //Getting close button
        classOfActiveElem = "button[title^='"+ auraUITestingUtil.getEval(TITLE)+"']";
        element = driver.findElement(By.cssSelector(classOfActiveElem)); 
        assertEquals("Got to the confirm button but did not tab to close button", CLOSE_STR, element.getAttribute("title"));
        auraUITestingUtil.pressTab(element);
        
        //Getting the item that called it
        classOfActiveElem = "button[class*='"+ auraUITestingUtil.getEval(CLASSNAME)+"']";
        element = driver.findElement(By.cssSelector(classOfActiveElem)); 
        
        assertEquals("Hitting tab did not go to item that called the dialog box", LAUNCH_DIALOG, element.getAttribute("className"));
    }
    
    //Checking that the Escape button should not submit with submiting
    @ExcludeBrowsers({ BrowserType.IE7,  BrowserType.IE8, BrowserType.ANDROID_PHONE, BrowserType.ANDROID_TABLET, BrowserType.IPAD, BrowserType.IPHONE})
    public void testDialogNonModalEscapeButton() throws MalformedURLException, URISyntaxException{
        open(URL_NON_MODAL);
        
        WebDriver driver = getDriver();
        openDialogBox(driver);

        //Grab the focused element, then press escape to close dialog box
        WebElement element = driver.findElement(By.cssSelector("input[class*='"+ auraUITestingUtil.getEval(CLASSNAME)+"']")); 
        element.sendKeys(Keys.ESCAPE);
        
       // element = driver.findElement(By.cssSelector("div[class*='medium uiDialog']"));
        //Wait for DialogBox to close
        waitForComponentToChangeStatus("div[class*='dialog']","className","hidden", false);
        
        //Make sure no data was submitted
        element = driver.findElement(By.cssSelector(RESULT_LABEL));     
        assertEquals("The escape button did not submit data", NOT_SUBMITTED, element.getAttribute("value"));
    }
     
    //Check that shift tab does not break nonModal Dialog boxes
    @ExcludeBrowsers({ BrowserType.IE7, BrowserType.SAFARI,BrowserType.ANDROID_PHONE, BrowserType.ANDROID_TABLET, BrowserType.IPAD, BrowserType.IPHONE})
    public void testDialogNonModalShiftTab() throws MalformedURLException, URISyntaxException{
        open(URL_NON_MODAL);
        
        WebDriver driver = getDriver();
     
        openDialogBox(driver);
        WebElement element = getFirstFocusableItemInModal(driver);
        
        //Getting first Checkbox and tabing from this
        String classOfActiveElem = "input[class*='"+ auraUITestingUtil.getEval(CLASSNAME)+"']";
        element = driver.findElement(By.cssSelector(classOfActiveElem)); 
        assertTrue("Did not move to next checkbox", element.getAttribute("className").contains("checkBox1"));
        element.sendKeys(SHIFT_TAB);
        
        //Getting the item that called it
        classOfActiveElem = "button[class*='"+ auraUITestingUtil.getEval(CLASSNAME)+"']";
        element = driver.findElement(By.cssSelector(classOfActiveElem)); 
        
        assertEquals("Hitting tab did not go to item that called the dialog box", LAUNCH_DIALOG, element.getAttribute("className"));
    }
    
    /***********************************************************************************************
     **************************MODAL/NON-MODAL MOBILE TESTS*****************************************
     ***********************************************************************************************/
    private void mobileBrowserAide(WebDriver driver, String cssSel, String assertString, String correctStr){
        WebElement element = driver.findElement(By.cssSelector("button[class*='"+LAUNCH_DIALOG+"']"));
        element.click();
        
        //Opening dialog box
        waitForComponentToChangeStatus("div[class*='dialog']","className","hidden", true);
        
        //Find and click on specific element to close dialog box
        element = driver.findElement(By.cssSelector(cssSel));
        element.click();
        
        //Wait for it to close
        waitForComponentToChangeStatus("div[class*='dialog']","className","hidden", false);
        
        
        //Make sure that that closes the dialog box sent in the correct data
        element = driver.findElement(By.cssSelector(RESULT_LABEL));     
        assertEquals(assertString, correctStr, element.getAttribute("value"));
    }
    
     @TargetBrowsers({ BrowserType.IPAD, BrowserType.IPHONE})
     public void testMobilePhoneModal() throws MalformedURLException, URISyntaxException{
         open(URL_MODAL);
         WebDriver driver = getDriver();
        
         //Open dialog box, press ok to check that it submitted data. 
         mobileBrowserAide(driver, "button[title*='"+CONFIRM_STR+"']","The ok button did not submit data", SUBMITTED);
         //Does the same for close window button, except it checks to make sure that it did not submit 
         mobileBrowserAide(driver, "button[title*='"+CLOSE_STR+"']","The close window button should not have submitted data", NOT_SUBMITTED);
     }
    
     @TargetBrowsers({ BrowserType.IPAD, BrowserType.IPHONE})
     public void testMobilePhoneNonModal() throws MalformedURLException, URISyntaxException{
         open(URL_NON_MODAL);
         WebDriver driver = getDriver();
         //Open dialog box, press ok to check that it submitted data. 
         mobileBrowserAide(driver, "button[title*='"+CONFIRM_STR+"']","The ok button did not submit data", SUBMITTED);
         //Does the same for close window button, except it checks to make sure that it did not submit 
         mobileBrowserAide(driver, "button[title*='"+CLOSE_STR+"']", "The close window button should not have submitted data", NOT_SUBMITTED); 
         //Does the same for cancel window button, except it checks to make sure that it did not submit 
         mobileBrowserAide(driver, "button[title*='"+CANCEL_STR+"']", "The cancel window should not have submitted data", NOT_SUBMITTED);

     }
    
    
    
     
     
     
     
     
     
     
     
     
     
     
     
     
     
     
     
     
     
     
     
     
     
     
     
     
     
     
     
     
     
     
     
     
     
     
     
     
     
     
     
     
}