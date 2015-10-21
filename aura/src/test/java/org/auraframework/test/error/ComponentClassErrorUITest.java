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
package org.auraframework.test.error;

import java.util.List;

import org.auraframework.test.util.WebDriverTestCase;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedCondition;

/**
 * ComponentClassErrorTest is mainly for verifying error message when we error out from component's helper/renderer
 */
public class ComponentClassErrorUITest extends WebDriverTestCase {

    public ComponentClassErrorUITest(String name) {
        super(name);
    }

    // /////////////////////////////// test with dynamic created component starts /////////////////////////////////////

    /*
     * @param componentDef create this component dynamically
     * @param webElementToClick click the button to create above component
     * @param errorOutFrom where we want the component to error out?
     */
    public void runTestDynamicCreatedCmpErrorOutFrom(String componentDef, String errorOutFrom,
            String webElementToClick, String expectErrorMessage, String expectLocation) throws Exception {
        String url = "auratest/componentClassLifecycleTest.cmp?componentDef=" + componentDef + "&errorOutFrom="
                + errorOutFrom;
        runTestErrorOut(url, webElementToClick, expectErrorMessage, expectLocation);
    }

    // create componentClassParent.cmp in controller dynamically, expect it to error out from render
    public void testDynamicCreatedCmpErrorOutFromRender() throws Exception {
        String expectLocation = "auratest$componentClassParent.render";
        String expectErrorMessage = "blahFromParentRerender is not defined";
        runTestDynamicCreatedCmpErrorOutFrom("markup://auratest:componentClassParent", "errorOutFromRender_Parent",
                ".uiButton_createCmp", expectErrorMessage, expectLocation);
    }

    // /////////////////////////////// test with parent component starts /////////////////////////////////////

    public void runTestParentErrorOutFrom(String errorOutFrom, String webElementToClick, String expectErrorMessage,
            String expectLocation) throws Exception {
        String url = "/auratest/componentClassParent.cmp?" + errorOutFrom + "=true";
        runTestErrorOut(url, webElementToClick, expectErrorMessage, expectLocation);
    }

    // load componentClassParent.cmp, error out from its re-render
    public void testParentErrorOutFromReRender() throws Exception {
        String expectLocation = "auratest$componentClassParent.rerender";
        String expectErrorMessage = "blahFromParentReRerender is not defined";
        runTestParentErrorOutFrom("errorOutFromReRender_Parent", ".uiButtonParent", expectErrorMessage, expectLocation);
    }

    // load componentClassParent.cmp, error out from its after-render
    public void testParentErrorOutFromAfterRender() throws Exception {
        String expectLocation = "auratest$componentClassParent.afterRender";
        String expectErrorMessage = "blahFromParentAfterRerender is not defined";
        runTestParentErrorOutFrom("errorOutFromAfterRender_Parent", "", expectErrorMessage, expectLocation);
    }

    // /////////////////////////////// test with grandChild component starts /////////////////////////////////////

    public void runTestGrandChildClientErrorOutFrom(String errorOutFrom, String expectErrorMessage,
            String expectLocation) throws Exception {
        String url = "/auratest/componentClassGrandChildClientProvider.cmp?" + errorOutFrom + "=true";
        runTestErrorOut(url, "", expectErrorMessage, expectLocation);
    }

    // load componentClassGrandChildClientProvider.cmp, error out from componentClassParent.cmp's render
    public void testGrandChildClientErrorOutFromParentRender() throws Exception {
        String expectLocation = "auratest$componentClassParent.render";
        String expectErrorMessage = "ReferenceError: blahFromParentRerender is not defined";
        runTestGrandChildClientErrorOutFrom("errorOutFromRender_Parent", expectErrorMessage, expectLocation);
    }

    // load componentClassGrandChildClientProvider.cmp, error out from componentClassChild.cmp's render
    public void testGrandChildClientErrorOutFromChildRender() throws Exception {
        String expectLocation = "auratest$componentClassGrandChildClientProvider.render";
        String expectErrorMessage = "ReferenceError: blahFromChildRerender is not defined";
        runTestGrandChildClientErrorOutFrom("errorOutFromRender_Child", expectErrorMessage, expectLocation);
    }

    // load componentClassGrandChildClientProvider.cmp, error out from componentClassParent.cmp's helper
    public void testGrandChildClientErrorOutFromParentHelper() throws Exception {
        String expectLocation = "auratest$componentClassParent.Helper.getDelimiter";
        String expectErrorMessage = "ReferenceError: blahFromParentHelper is not defined";
        runTestGrandChildClientErrorOutFrom("errorOutFromHelper_Parent", expectErrorMessage, expectLocation);
    }

    // load componentClassGrandChildClientProvider.cmp, error out from componentClassParent.cmp's helper
    public void testGrandChildClientErrorOutFromChildHelper() throws Exception {
        String expectLocation = "auratest$componentClassChild.Helper.getDelimiter";
        String expectErrorMessage = "ReferenceError: blahFromChildHelper is not defined";
        runTestGrandChildClientErrorOutFrom("errorOutFromHelper_Child", expectErrorMessage, expectLocation);
    }

    /*
     * call this to test out client or server provided component
     * @param errorOutFrom : load componentClassGrandChildServerProvider through componentClassClientProvider.cmp, error
     * out from helper/render/etc
     */
    public void runTestProvidedGrandChildClientErrorOutFromChild(String clientOrServer, String errorOutFrom,
            String expectErrorMessage, String expectLocation) throws Exception {
        String url = "/auratest/componentClass" + clientOrServer + "Provider.cmp?" +
                "requestDescriptor=auratest:componentClassGrandChildServerProvider" +
                "&requestAttributes={'" + errorOutFrom + "':true}";
        runTestErrorOut(url, "", expectErrorMessage, expectLocation);
    }

    // //////////////////// test with client provided component starts /////////////////////////////////////

    // load componentClassGrandChildServerProvider through componentClassClientProvider.cmp, error out from
    // componentClassChild's helper
    public void testClientProvidedGrandChildClientErrorOutFromChildHelper() throws Exception {
        String errorOutFrom = "errorOutFromHelper_Child";
        String expectLocation = "auratest$componentClassChild.Helper.getDelimiter";
        String expectErrorMessage = "ReferenceError: blahFromChildHelper is not defined";
        runTestProvidedGrandChildClientErrorOutFromChild("Client", errorOutFrom, expectErrorMessage, expectLocation);
    }

    // load componentClassGrandChildServerProvider through componentClassClientProvider.cmp, error out from
    // componentClassParent's helper
    public void testClientProvidedGrandChildClientErrorOutFromParentHelper() throws Exception {
        String errorOutFrom = "errorOutFromHelper_Parent";
        String expectLocation = "auratest$componentClassParent.Helper.getDelimiter";
        String expectErrorMessage = "ReferenceError: blahFromParentHelper is not defined";
        runTestProvidedGrandChildClientErrorOutFromChild("Client", errorOutFrom, expectErrorMessage, expectLocation);
    }

    // load componentClassGrandChildServerProvider through componentClassClientProvider.cmp, error out from
    // componentClassChild's render
    public void testClientProvidedGrandChildClientErrorOutFromChildRender() throws Exception {
        String errorOutFrom = "errorOutFromRender_Child";
        String expectLocation = "auratest$componentClassChild.render";
        String expectErrorMessage = "ReferenceError: blahFromChildRerender is not defined";
        runTestProvidedGrandChildClientErrorOutFromChild("Client", errorOutFrom, expectErrorMessage, expectLocation);
    }

    // load componentClassGrandChildServerProvider through componentClassClientProvider.cmp, error out from
    // componentClassParent's render
    public void testClientProvidedGrandChildClientErrorOutFromParentRender() throws Exception {
        String errorOutFrom = "errorOutFromRender_Parent";
        String expectLocation = "auratest$componentClassParent.render";
        String expectErrorMessage = "ReferenceError: blahFromParentRerender is not defined";
        runTestProvidedGrandChildClientErrorOutFromChild("Client", errorOutFrom, expectErrorMessage, expectLocation);
    }

    // ////////////////////test with server provided component starts/////////////////////////////////////

    // load componentClassGrandChildServerProvider through componentClassClientProvider.cmp, error out from
    // componentClassChild's helper
    public void testServerProvidedGrandChildClientErrorOutFromChildHelper() throws Exception {
        String errorOutFrom = "errorOutFromHelper_Child";
        String expectLocation = "auratest$componentClassChild.Helper.getDelimiter";
        String expectErrorMessage = "ReferenceError: blahFromChildHelper is not defined";
        runTestProvidedGrandChildClientErrorOutFromChild("Server", errorOutFrom, expectErrorMessage, expectLocation);
    }

    // load componentClassGrandChildServerProvider through componentClassClientProvider.cmp, error out from
    // componentClassParent's helper
    public void testServerProvidedGrandChildClientErrorOutFromParentHelper() throws Exception {
        String errorOutFrom = "errorOutFromHelper_Parent";
        String expectLocation = "auratest$componentClassParent.Helper.getDelimiter";
        String expectErrorMessage = "ReferenceError: blahFromParentHelper is not defined";
        runTestProvidedGrandChildClientErrorOutFromChild("Server", errorOutFrom, expectErrorMessage, expectLocation);
    }

    // load componentClassGrandChildServerProvider through componentClassClientProvider.cmp, error out from
    // componentClassChild's render
    public void testServerProvidedGrandChildClientErrorOutFromChildRender() throws Exception {
        String errorOutFrom = "errorOutFromRender_Child";
        String expectLocation = "auratest$componentClassChild.render";
        String expectErrorMessage = "ReferenceError: blahFromChildRerender is not defined";
        runTestProvidedGrandChildClientErrorOutFromChild("Server", errorOutFrom, expectErrorMessage, expectLocation);
    }

    // load componentClassGrandChildServerProvider through componentClassServerProvider.cmp, error out from
    // componentClassParent's render
    public void testServerProvidedGrandChildClientErrorOutFromParentRender() throws Exception {
        String errorOutFrom = "errorOutFromRender_Parent";
        String expectLocation = "auratest$componentClassParent.render";
        String expectErrorMessage = "ReferenceError: blahFromParentRerender is not defined";
        runTestProvidedGrandChildClientErrorOutFromChild("Server", errorOutFrom, expectErrorMessage, expectLocation);
    }

    /*
     * @param url load the url and trigger the error
     * @param expectErrorMessage error message we expect
     * @param expectLocation where we expect the error being throw from ? helper/render/etc
     * @param webElementToClick we need to click on something to trigger the error
     */
    public void runTestErrorOut(String url, String webElementToClick, String expectErrorMessage, String expectLocation)
            throws Exception {
        openNoAura(url);
        auraUITestingUtil.waitForDocumentReady();
        if (webElementToClick.length() > 0) {
            WebElement btn = findDomElement(By.cssSelector(webElementToClick));
            btn.click();
        }
        List<WebElement> errorBoxes = getDriver().findElements(By.cssSelector(".auraForcedErrorBox"));
        assertEquals("Renderer element found", 0, errorBoxes.size());

        errorBoxes = auraUITestingUtil.waitUntil(new ExpectedCondition<List<WebElement>>() {
            @Override
            public List<WebElement> apply(WebDriver d) {
                List<WebElement> errors = getDriver().findElements(By.cssSelector(".auraErrorBox"));
                if (errors.size() > 0 && errors.get(0).isDisplayed()) {
                    return errors;
                }
                return null;
            }
        });

        assertNotNull(errorBoxes);
        assertTrue("we are expecting one errorBox, but get " + errorBoxes.size() + " instead", errorBoxes.size() == 1);
        String errorBoxText = errorBoxes.get(0).getText();
        assertTrue("we are expecting error message :" + expectErrorMessage + "\n but get this instead:" + errorBoxText,
                errorBoxText.contains(expectErrorMessage));
        assertTrue("we are expecting error come from :" + expectLocation + "\n but get this instead:" + errorBoxText,
                errorBoxText.contains(expectLocation));
    }
}
