/*
 * Copyright (C) 2012 salesforce.com, inc.
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
package org.auraframework.impl;

import java.net.MalformedURLException;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Map;

import org.auraframework.Aura;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.ControllerDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.test.AuraTestingUtil;
import org.auraframework.test.WebDriverTestCase;
import org.auraframework.test.WebDriverTestCase.ExcludeBrowsers;
import org.auraframework.test.WebDriverUtil.BrowserType;
import org.auraframework.util.AuraTextUtil;
import org.auraframework.util.AuraUtil;
import org.auraframework.util.json.Json;
import org.junit.Ignore;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

/**
 * 
 * UI test for usage of Integration Service.
 * 
 */
@ExcludeBrowsers({BrowserType.IPAD, BrowserType.IPHONE})
public class IntegrationServiceImplUITest extends WebDriverTestCase {
    private static final AuraTestingUtil auraTestingUtil = AuraUtil.get(AuraTestingUtil.class);

    public IntegrationServiceImplUITest(String name) {
        super(name);
    }

    DefDescriptor<ComponentDef> defaultStubCmp;
    String defaultPlaceholderID = "placeholder";
    String defaultLocalId = "injectedComponent";

    @Override
    public void setUp() throws Exception {
        super.setUp();
        defaultStubCmp = addSourceAutoCleanup(ComponentDef.class,
                getIntegrationStubMarkup("java://org.auraframework.impl.renderer.sampleJavaRenderers.RendererForTestingIntegrationService", true, true, true));
    }

    /**
     * Verify using IntegrationService to inject a simple component with a Java
     * model, Javascript Controller and Java Controller.
     */
    public void testSimpleComponentWithModelAndController() throws Exception {
        DefDescriptor<ComponentDef> cmpToInject = setupSimpleComponentWithModelAndController();
        Map<String, Object> attributes = Maps.newHashMap();
        attributes.put("strAttribute", "Oranges");
        openIntegrationStub(cmpToInject, attributes);

        String selectorForPlaceholder = String.format("div#%s", defaultPlaceholderID);
        assertTrue("Injected component not found inside placeholder", isElementPresent(By.cssSelector(selectorForPlaceholder + ">" + "div.wrapper")));
        WebElement attrValue = findDomElement(By.cssSelector("div.dataFromAttribute"));
        assertEquals("Failed to see data from model of injected component", "Oranges", attrValue.getText());
        WebElement modelValue = findDomElement(By.cssSelector("div.dataFromModel"));
        assertEquals("Failed to initilize attribute value of injected component", "firstThingDefault", modelValue.getText());

        WebElement button = findDomElement(By.cssSelector("button.uiButton"));
        button.click();
        WebElement controllerValue = findDomElement(By.cssSelector("div.dataFromController"));
        waitForElementTextPresent(controllerValue, "TestController");

        // Access injected component through ClientSide API
        assertTrue(auraUITestingUtil.getBooleanEval(String.format("return window.$A.getRoot().find('%s')!== undefined ;", defaultLocalId)));
        assertEquals(cmpToInject.toString(),
                (String) auraUITestingUtil.getEval(String.format("return window.$A.getRoot().find('%s').getDef().getDescriptor().toString()", defaultLocalId)));
    }

    private DefDescriptor<ComponentDef> setupSimpleComponentWithModelAndController() {
        String systemAttributes = "model='java://org.auraframework.impl.java.model.TestModel' "
            + "controller='java://org.auraframework.impl.java.controller.TestController'";
        String bodyMarkup = "<aura:attribute name='strAttribute' type='String' default='Apple'/> " + "<ui:button label='clickMe' press='{!c.handleClick}'/>"
        + "<div class='wrapper'>" + "<div class='dataFromAttribute' aura:id='dataFromAttribute'>{!v.strAttribute}</div> "
        + "<div class='dataFromModel' aura:id='dataFromModel'>{!m.firstThing}</div> "
        + "<div class='dataFromController' aura:id='dataFromController'></div>" + "</div>";
        DefDescriptor<ComponentDef> cmpDesc = auraTestingUtil.addSourceAutoCleanup(ComponentDef.class,
                String.format(AuraImplTestCase.baseComponentTag, systemAttributes, bodyMarkup));
        DefDescriptor<ControllerDef> jsControllerdesc = Aura.getDefinitionService().getDefDescriptor(
                String.format("%s://%s.%s", DefDescriptor.JAVASCRIPT_PREFIX, cmpDesc.getNamespace(), cmpDesc.getName()), ControllerDef.class);
        auraTestingUtil.addSourceAutoCleanup(jsControllerdesc, "{" + "handleClick:function(cmp){" + "var a = cmp.get('c.getString');"
                + "a.setCallback(cmp,function(a){" + "cmp.find('dataFromController').getValue('v.body').push("
                + "$A.newCmp({componentDef: 'markup://aura:text'," + "attributes:{" + "values:{value:a.getReturnValue()}" + "}" + "}));" + "});"
                + "a.runAfter(a);" + "}" + "}");
        return cmpDesc;
    }

    /**
     * Verify use of integration service to inject a component and initialize
     * various types of attributes.
     */
    public void testAttributesInitialization() throws Exception {
        String attributeMarkup = "<aura:attribute name='strAttr' type='String'/>" + "<aura:attribute name='booleanAttr' type='Boolean'/>"
        + "<aura:attribute name='strList' type='List'/>" + "<aura:attribute name='stringArray' type='String[]'/>"
        + "<aura:attribute name='obj' type='Object'/>";
        String attributeWithDefaultsMarkup = "<aura:attribute name='strAttrDefault' type='String' default='Apple'/>"
            + "<aura:attribute name='booleanAttrDefault' type='Boolean' default='true'/>"
            + "<aura:attribute name='strListDefault' type='List' default='Apple,Orange'/>"
            + "<aura:attribute name='stringArrayDefault' type='String[]' default='Melon,Berry,Grapes'/>"
            + "<aura:attribute name='objDefault' type='Object' default='Banana'/>";
        DefDescriptor<ComponentDef> cmpToInject = auraTestingUtil.addSourceAutoCleanup(ComponentDef.class,
                String.format(AuraImplTestCase.baseComponentTag, "", attributeMarkup + attributeWithDefaultsMarkup));

        Map<String, Object> attributes = Maps.newHashMap();
        attributes.put("strAttr", "Oranges");
        attributes.put("booleanAttr", false);
        List<String> strList = Lists.newArrayList("Pear", "Melon");
        attributes.put("strList", strList);
        List<String> stringList = Lists.newArrayList("Persimon", "Kiwi");
        attributes.put("stringArray", stringList.toArray());
        attributes.put("obj", "Object");

        openIntegrationStub(cmpToInject, attributes);
        // Access injected component through ClientSide API
        assertTrue(auraUITestingUtil.getBooleanEval(String.format("return window.$A.getRoot().find('%s')!== undefined ;", defaultLocalId)));

        String attributeEvalScript = "return window.$A.getRoot().find('%s').get('v.%s');";
        // Provided attributes
        assertEquals("Oranges", auraUITestingUtil.getEval(String.format(attributeEvalScript, defaultLocalId, "strAttr")));
        assertFalse(auraUITestingUtil.getBooleanEval(String.format(attributeEvalScript, defaultLocalId, "booleanAttr")));
        assertEquals("Object", auraUITestingUtil.getEval(String.format(attributeEvalScript, defaultLocalId, "obj")));
        assertEquals(strList, auraUITestingUtil.getEval(String.format(attributeEvalScript, defaultLocalId, "strList")));
        assertEquals(stringList, auraUITestingUtil.getEval(String.format(attributeEvalScript, defaultLocalId, "stringArray")));

        // Attributes with Default values
        assertEquals("Apple", auraUITestingUtil.getEval(String.format(attributeEvalScript, defaultLocalId, "strAttrDefault")));
        assertTrue(auraUITestingUtil.getBooleanEval(String.format(attributeEvalScript, defaultLocalId, "booleanAttrDefault")));
        assertEquals("Banana", auraUITestingUtil.getEval(String.format(attributeEvalScript, defaultLocalId, "objDefault")));
        assertEquals(Lists.newArrayList("Apple", "Orange"), auraUITestingUtil.getEval(String.format(attributeEvalScript, defaultLocalId, "strListDefault")));
        assertEquals(Lists.newArrayList("Melon", "Berry", "Grapes"),
                auraUITestingUtil.getEval(String.format(attributeEvalScript, defaultLocalId, "stringArrayDefault")));
    }

    /**
     * Verify use of integration service to inject a component and initialize a
     * Aura.Component[] type attribute.
     * 
     * @throws Exception
     */
    @Ignore("W-1498384")
    public void testComponentArrayAsAttribute() throws Exception {
        String attributeMarkup = "<aura:attribute name='cmps' type='Aura.Component[]'/>{!v.cmps}";
        String attributeWithDefaultsMarkup = "<aura:attribute name='cmpsDefault' type='Aura.Component[]'>" + "<div class='divDefault'>Div as default</div>"
        + "<span class='spanDefault'>Span component as default</span>" + "</aura:attribute>{!v.cmpsDefault}";
        DefDescriptor<ComponentDef> cmpToInject = auraTestingUtil.addSourceAutoCleanup(ComponentDef.class,
                String.format(AuraImplTestCase.baseComponentTag, "", attributeMarkup + attributeWithDefaultsMarkup));

        DefDescriptor<ComponentDef> customStub = addSourceAutoCleanup(
                ComponentDef.class,
                getIntegrationStubMarkup("java://org.auraframework.impl.renderer.sampleJavaRenderers.RendererToInjectComponentAsAttributes", false, false,
                        false));

        openIntegrationStub(customStub, cmpToInject, null);

        // Access injected component through ClientSide API
        assertTrue("Failed to locate injected component on page.",
                auraUITestingUtil.getBooleanEval(String.format("return window.$A.getRoot().find('%s')!== undefined ;", "localId")));

        // Default values for attributes of type Aura.Component[]
        WebElement devDefault = findDomElement(By.cssSelector("div.divDefault"));
        assertEquals("Failed to initializing attribute of type Aura.Component[]", "Div as default", devDefault.getText());
        WebElement spanDefault = findDomElement(By.cssSelector("span.spanDefault"));
        assertEquals("Failed to initializing attribute of type Aura.Component[]", "Span component as default", spanDefault.getText());

        // Attribute value passing for Aura.Component[] type attributes
        assertTrue("Failed passing value to Aura.Component[] type attributes",
                isElementPresent(By.xpath("//div[@id='placeholder' and contains(.,'Water Melon')]")));
        assertTrue(isElementPresent(By.xpath("//div[@id='placeholder' and contains(.,'Grape Fruit')]")));
    }

    /**
     * Verify the behavior of injectComponent when the placeholder specified is
     * missing.
     */
    public void testMissingPlaceholder() throws Exception {
        DefDescriptor<ComponentDef> cmpToInject = auraTestingUtil.addSourceAutoCleanup(ComponentDef.class,
                String.format(AuraImplTestCase.baseComponentTag, "", ""));
        DefDescriptor<ComponentDef> customStubCmp = addSourceAutoCleanup(
                ComponentDef.class,
                getIntegrationStubMarkup("java://org.auraframework.impl.renderer.sampleJavaRenderers.RendererToInjectCmpInNonExistingPlaceholder", true, true,
                        true));

        openIntegrationStub(customStubCmp, cmpToInject, null, "fooBared");

        assertTrue("IntegrationService failed to display error message when no locatorDomId was specified",
                isElementPresent(By.xpath("//span[contains(@title,'Invalid locatorDomId specified - no element found in the DOM with id=fooBared')]")));
    }

    /**
     * Verify that specifying localId(aura:id) for an injected component is
     * allowed.
     */
    public void testMissingLocalId() throws Exception {
        DefDescriptor<ComponentDef> cmpToInject = Aura.getDefinitionService().getDefDescriptor("aura:text", ComponentDef.class);
        DefDescriptor<ComponentDef> customStubCmp = addSourceAutoCleanup(ComponentDef.class,
                getIntegrationStubMarkup("java://org.auraframework.impl.renderer.sampleJavaRenderers.RendererToInjectCmpWithNullLocalId", true, true, false));
        Map<String, Object> attributes = Maps.newHashMap();
        attributes.put("value", "No Local Id");
        openIntegrationStub(customStubCmp, cmpToInject, attributes, null);
        assertTrue("IntegrationService failed to inject component when no localId was specified",
                isElementPresent(By.xpath("//div[@id='placeholder' and contains(.,'No Local Id')]")));
    }

    /**
     * Verify that exceptions that happen during component instance creation are
     * surfaced on the page.
     */
    public void testExceptionDuringComponentInitialization() throws Exception {
        DefDescriptor<ComponentDef> cmpWithReqAttr = addSourceAutoCleanup(ComponentDef.class,
                String.format(AuraImplTestCase.baseComponentTag, "", "<aura:attribute name='reqAttr' required='true' type='String'/>"));
        Map<String, Object> attributes = Maps.newHashMap();
        openIntegrationStub(cmpWithReqAttr, attributes);

        assertTrue("IntegrationService failed to display error message",
                isElementPresent(By.xpath("//span[contains(@title,\"is missing required attribute 'reqAttr'\")]")));
    }

    /**
     * Verify that using multiple integration objects on page does not duplicate
     * Aura Framework injection.
     */
    @Ignore("W-1498404")
    public void testMultipleIntegrationObjectsOnSamePage() throws Exception {
        DefDescriptor<ComponentDef> cmpToInject = setupSimpleComponentWithModelAndController();
        Map<String, Object> attributes = Maps.newHashMap();
        String facets[] = new String[] { "Panda", "Tiger" };
        String facetMarkup = "";
        for (String facet : facets) {
            attributes.put("strAttribute", facet);
            facetMarkup = facetMarkup
            + String.format("<%s:%s desc='%s:%s' attrMap='%s' placeholder='%s' localId='%s'/>", defaultStubCmp.getNamespace(),
                    defaultStubCmp.getName(), cmpToInject.getNamespace(), cmpToInject.getName(), Json.serialize(attributes), "Animal" + facet, facet);

        }

        DefDescriptor<ComponentDef> customStubCmp = addSourceAutoCleanup(ComponentDef.class,
                String.format(AuraImplTestCase.baseComponentTag, "render='server'", facetMarkup));

        openIntegrationStub(customStubCmp, cmpToInject, null, null);
        assertTrue(isElementPresent(By.xpath("//div//script[contains(@src,'aura_dev.js')]")));
        assertEquals("Framework loaded multiple times", 1, getDriver().findElements(By.xpath("//div//script[contains(@src,'aura_dev.js')]")).size());

        WebElement attrValue = findDomElement(By.cssSelector("#AnimalPanda div.dataFromAttribute"));
        assertEquals("Failed to locate first component injected.", "Panda", attrValue.getText());

        attrValue = findDomElement(By.cssSelector("#AnimalTiger div.dataFromAttribute"));
        assertEquals("Failed to locate second component injected.", "Tiger", attrValue.getText());

    }

    @Ignore("W-1498404 - Based on the fix, this test case should be implemented")
    public void testMultipleIntegrationObjectsOnSamePageWithDifferentModes() throws Exception {

    }

    /**
     * Utility method to obtain the required markup of the integration stub
     * component.
     */
    private String getIntegrationStubMarkup(String javaRenderer, Boolean attributeMap, Boolean placeHolder, Boolean localId) {
        String stubMarkup = String.format("<aura:component render='server' renderer='%s'>" + "<aura:attribute name='desc' type='String'/>" + "%s %s %s"
                + "</aura:component>", javaRenderer, attributeMap ? "<aura:attribute name='attrMap' type='Map'/>" : "",
                        placeHolder ? String.format("<aura:attribute name='placeholder' type='String' default='%s'/>", defaultPlaceholderID) : "",
                                localId ? String.format("<aura:attribute name='localId' type='String' default='%s'/>", defaultLocalId) : "");
        return stubMarkup;
    }

    /**
     * Pass the descriptor and attributes map of the component to be injected to
     * a Stub component. Open the stub component using webdriver.
     */
    private void openIntegrationStub(DefDescriptor<ComponentDef> stub, DefDescriptor<ComponentDef> toInject, Map<String, Object> attributeMap,
            String placeholder) throws MalformedURLException, URISyntaxException {
        String url = String.format("/%s/%s.cmp", stub.getNamespace(), stub.getName());
        url = url + "?desc=" + String.format("%s:%s", toInject.getNamespace(), toInject.getName());
        if (attributeMap != null) {
            url = url + "&" + "attrMap=" + AuraTextUtil.urlencode(Json.serialize(attributeMap));
        } else {
            url = url + "&" + "attrMap=" + AuraTextUtil.urlencode(Json.serialize(Maps.newHashMap()));
        }
        if (placeholder != null) {
            url = url + "&placeholder=" + placeholder;
        }
        openNoAura(url);
        // Wait for page to be ready
        waitForDocumentReady();
        // Wait for Aura framework(injected) to be ready
        waitForAuraFrameworkReady();
    }

    private void openIntegrationStub(DefDescriptor<ComponentDef> stub, DefDescriptor<ComponentDef> toInject, Map<String, Object> attributeMap)
    throws MalformedURLException, URISyntaxException {
        openIntegrationStub(stub, toInject, attributeMap, null);
    }

    private void openIntegrationStub(DefDescriptor<ComponentDef> toInject, Map<String, Object> attributeMap) throws MalformedURLException, URISyntaxException {
        openIntegrationStub(defaultStubCmp, toInject, attributeMap, null);
    }

}
