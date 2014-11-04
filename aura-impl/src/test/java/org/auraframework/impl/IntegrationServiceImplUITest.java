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
package org.auraframework.impl;

import java.net.MalformedURLException;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Map;

import org.auraframework.Aura;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.ControllerDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.HelperDef;
import org.auraframework.def.ProviderDef;
import org.auraframework.def.StyleDef;
import org.auraframework.test.AuraTestingMarkupUtil;
import org.auraframework.test.WebDriverTestCase;
import org.auraframework.test.WebDriverUtil.BrowserType;
import org.auraframework.util.AuraTextUtil;
import org.auraframework.util.json.Json;
import org.junit.Ignore;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;

import com.google.common.base.Function;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

/**
 *
 * UI test for usage of Integration Service.
 *
 */

public class IntegrationServiceImplUITest extends WebDriverTestCase {

    // defaultStubCmp : act as a container inject other components into, async is FALSE
    DefDescriptor<ComponentDef> defaultStubCmp;
    // use as id for cssSelector, where we put the injected component
    String defaultPlaceholderID = "placeholder";
    // aura id of injected component
    String defaultLocalId = "injectedComponent";

    AuraTestingMarkupUtil tmu;

    public IntegrationServiceImplUITest(String name) {
        super(name);
    }

    @Override
    public void setUp() throws Exception {
        super.setUp();
        defaultStubCmp = addSourceAutoCleanup(
            ComponentDef.class,
            getIntegrationStubMarkup(
                "java://org.auraframework.impl.renderer.sampleJavaRenderers.RendererForTestingIntegrationService",
                true, true, true));
        tmu = getAuraTestingMarkupUtil();
    }


    /**
     * Verify using IntegrationService to inject a simple component with a Java model, Javascript Controller and Java
     * Controller.
     */
    // Click is unsupported in these touch based platforms
    @ExcludeBrowsers({ BrowserType.IPAD, BrowserType.IPHONE})
    public void testSimpleComponentWithModelAndController() throws Exception {
        verifySimpleComponentWithModelControllerHelperandProvider(defaultStubCmp);
    }

    /**
     * Verify using IntegrationService to inject a simple component with a Java model, Javascript Controller and Java
     * Controller. (ASYNC)
     */
    @ExcludeBrowsers({ BrowserType.IPAD, BrowserType.IPHONE})
    public void testSimpleComponentWithModelAndControllerAsync() throws Exception {
        DefDescriptor<ComponentDef> stub = addSourceAutoCleanup(
            ComponentDef.class,
            getIntegrationStubMarkup(
                "java://org.auraframework.impl.renderer.sampleJavaRenderers.RendererForTestingIntegrationService",
                true, true, true, true));
        verifySimpleComponentWithModelControllerHelperandProvider(stub);
    }


    private void verifySimpleComponentWithModelControllerHelperandProvider(DefDescriptor<ComponentDef> stub) throws Exception {
        DefDescriptor<ComponentDef> cmpToInject = setupSimpleComponentWithModelControllerHelperAndProvider();
        Map<String, Object> attributes = Maps.newHashMap();
        attributes.put("strAttribute", "Oranges");
        String selectorForPlaceholder = String.format("div#%s", defaultPlaceholderID);

        openIntegrationStub(stub, cmpToInject, attributes);

        assertTrue("Injected component not found inside placeholder",
                isElementPresent(By.cssSelector(selectorForPlaceholder + ">" + "div.wrapper")));
        WebElement attrValue = findDomElement(By.cssSelector("div.dataFromAttribute"));
        assertEquals("Failed to see data from model of injected component", "Oranges", attrValue.getText());
        WebElement modelValue = findDomElement(By.cssSelector("div.dataFromModel"));
        assertEquals("Failed to initilize attribute value of injected component", "firstThingDefault",
                modelValue.getText());

        WebElement button = findDomElement(By.cssSelector(".btnHandleClick"));
        button.click();
        auraUITestingUtil.waitForElementText(By.cssSelector("div.dataFromController"), "TestController", true);

        // Access injected component through ClientSide API
        assertTrue(auraUITestingUtil.getBooleanEval(String.format(
                "return window.$A.getRoot().find('%s')!== undefined ;", defaultLocalId)));
        assertEquals(cmpToInject.toString(),
                (String) auraUITestingUtil.getEval(String.format(
                        "return window.$A.getRoot().find('%s').getDef().getDescriptor().toString()", defaultLocalId)));

        WebElement valueFromJsProvider = findDomElement(By.cssSelector("div.dataFromJSProvider"));
        assertEquals("Failed to see data from model of injected component",
        		"ValueFromJsProvider[ValueFromHelper]", valueFromJsProvider.getText());

        WebElement valueFromJavaProvider = findDomElement(By.cssSelector("div.dataFromJavaProvider"));
        assertEquals("Failed to see data from model of injected component",
        		"valueFromJavaProvider", valueFromJavaProvider.getText());

        WebElement buttonShowStyle = findDomElement(By.cssSelector(".btnShowStyle"));
        buttonShowStyle.click();
        auraUITestingUtil.waitForElementFunction(By.cssSelector("div.dataFromAttributeStyle"), 
        		new Function<WebElement, Boolean>() {
		            @Override
		            public Boolean apply(WebElement element) {
		                return element.getText().startsWith("rgb(255, 255, 255)")||element.getText().startsWith("#fff");
		            }
        	}
        );
    }

    /*
     * this creates simple component with helper, JS controller, JS provider , Java provider and Java model in the
     * helper we have function return a string (returnAString) in the JS provider, we set attribute(valueFromJSProvider)
     * with the string we get from helper in the Java provider, we set attribute(valueFromJavaProvider) in the JS
     * controller, we handler click event , push text component to the body each it clicks
     */
    private DefDescriptor<ComponentDef> setupSimpleComponentWithModelControllerHelperAndProvider() {
        DefDescriptor<ComponentDef> cmpDesc = getAuraTestingUtil().createStringSourceDescriptor(null,
                ComponentDef.class);
        DefDescriptor<ControllerDef> jsControllerdesc = Aura.getDefinitionService()
                .getDefDescriptor(cmpDesc, DefDescriptor.JAVASCRIPT_PREFIX, ControllerDef.class);
        DefDescriptor<ProviderDef> jsProviderdesc = Aura.getDefinitionService()
                .getDefDescriptor(cmpDesc, DefDescriptor.JAVASCRIPT_PREFIX, ProviderDef.class);
    	DefDescriptor<HelperDef> jsHelperdesc = Aura.getDefinitionService()
                .getDefDescriptor(cmpDesc,  DefDescriptor.JAVASCRIPT_PREFIX, HelperDef.class);
    	DefDescriptor<StyleDef> CSSdesc = Aura.getDefinitionService()
                .getDefDescriptor(cmpDesc,  DefDescriptor.CSS_PREFIX, StyleDef.class);
    	//fill in component to be injected
        String jsProviderName = jsProviderdesc.getQualifiedName();
        String systemAttributes = "model='java://org.auraframework.impl.java.model.TestModel' "
                + "controller='java://org.auraframework.impl.java.controller.TestController' "
                + "provider='" + jsProviderName
                + ",java://org.auraframework.impl.java.provider.TestComponnetConfigProviderAIS' ";
        String bodyMarkup = "<aura:attribute name='strAttribute' type='String' default='Apple'/> "
        		+ "<aura:attribute name='valueFromJSProvider' type='String' default='Empty'/> "
        		+ "<aura:attribute name='valueFromJavaProvider' type='String' default='Empty'/> "
        		+ "<aura:attribute name='dataFromAttributeStyle' type='String' default='Empty'/> "
                + "<ui:button aura:id='btnHandleClick' class='btnHandleClick' label='clickMe' press='{!c.handleClick}'/>"
                + "<ui:button aura:id='btnShowStyle' class='btnShowStyle' label='showStyle' press='{!c.showStyle}'/>"
                + "<div class='wrapper'>"
                + "<div class='dataFromAttribute' aura:id='dataFromAttribute'>{!v.strAttribute}</div> "
                + "<div class='dataFromModel' aura:id='dataFromModel'>{!m.firstThing}</div> "
                + "<div class='dataFromController' aura:id='dataFromController'></div>"
                + "<div class='dataFromJSProvider' aura:id='dataFromJSProvider'>{!v.valueFromJSProvider}</div>"
                + "<div class='dataFromJavaProvider' aura:id='dataFromJavaProvider'>{!v.valueFromJavaProvider}</div>"
                + "<div class='dataFromAttributeStyle' aura:id='dataFromAttributeStyle'>{!v.dataFromAttributeStyle}</div> "
                + "</div>";
        addSourceAutoCleanup(cmpDesc, String.format(baseComponentTag, systemAttributes,bodyMarkup));
    	//fill in js controller
        addSourceAutoCleanup(jsControllerdesc,
        "{"
            + "  handleClick:function(cmp){"
            + "    var valueFromHelper = cmp.getDef().getHelper().returnAString();"
            + "    var a = cmp.get('c.getString');"
            + "    a.setCallback(cmp,function(a){ "
            + "    $A.componentService.newComponentAsync("
            + "      this, function(newCmp){"
            + "        var body = cmp.find('dataFromController').get('v.body');"
            + "        body.push(newCmp);"
            + "        cmp.find('dataFromController').set('v.body', body);"
            + "      },"
            + "      {componentDef: 'markup://aura:text', attributes:{ values:{ value: a.getReturnValue() }}}"
            + "    )});"
            + "    $A.enqueueAction(a);"
            + "  },"
            + "  showStyle: function(cmp) {"
            + "    var dfaElement = cmp.find('dataFromAttribute').getElement(); "
            + "    cmp.set('v.dataFromAttributeStyle','call getCSSProperty');"
            + "    var dfaStyle = $A.util.style.getCSSProperty(dfaElement,'color'); "
            + "    if(dfaStyle == undefined) { dfaStyle = 'get background return undefined!';} "
            + "    cmp.set('v.dataFromAttributeStyle',dfaStyle);"
            + "  }"
            + "}"
        );
        //fill in js provider
        addSourceAutoCleanup(jsProviderdesc,
          "{"
            + "  provide : function AisToInjectProvider(component) {"
            + "    var valueFromHelper = component.getDef().getHelper().returnAString();"
            + "    var returnvalue = 'ValueFromJsProvider['+valueFromHelper+']';"
            + "    return {"
            + "      attributes: {"
            + "        'valueFromJSProvider': returnvalue"
            + "      }"
            + "    };"
            + "  }"
		    + "}"
        );
        //fill in helper
        addSourceAutoCleanup(jsHelperdesc,
	        "{"
            + "  returnAString: function() {"
            + "    return 'ValueFromHelper';"
            + "  }"
	        + "}"
        );
        //fill in CSS
        addSourceAutoCleanup(CSSdesc, ".THIS .dataFromAttribute { color: #fff; } ");

        return cmpDesc;
    }

    public void testSimpleComponentWithExtension() throws Exception {
        verifySimpleComponentWithExtension(defaultStubCmp);
    }

    public void testSimpleComponentWithExtensionAsync() throws Exception {
        DefDescriptor<ComponentDef> stub = addSourceAutoCleanup(
            ComponentDef.class,
            getIntegrationStubMarkup("java://org.auraframework.impl.renderer.sampleJavaRenderers.RendererForTestingIntegrationService",
                true, true, true, true)
        );

        verifySimpleComponentWithExtension(stub);
    }

    private void verifySimpleComponentWithExtension(DefDescriptor<ComponentDef> stub) throws MalformedURLException, URISyntaxException {
    	DefDescriptor<ComponentDef> cmpToInject = setupSimpleComponentWithExtension();
        Map<String, Object> attributes = Maps.newHashMap();

        openIntegrationStub(stub, cmpToInject, attributes);

        WebElement attrValueInBaseCmp = findDomElement(By.cssSelector("div.attrInBaseCmp"));
        assertEquals("Expecting different attribute value in base cmp", "In BaseCmp : SimpleAttribute= We just Set it", attrValueInBaseCmp.getText());

        WebElement attrValueFromBaseCmp = findDomElement(By.cssSelector("div.attrFromBaseCmp"));
        assertEquals("Expecting different attribute value in extended cmp", "In BaseCmp : SimpleAttribute= We just Set it", attrValueFromBaseCmp.getText());

    }

    private DefDescriptor<ComponentDef> setupSimpleComponentWithExtension() {
    	DefDescriptor<ComponentDef> baseCmpDesc =  setupSimpleComponentToExtend();
    	DefDescriptor<ComponentDef> cmpDesc = getAuraTestingUtil().createStringSourceDescriptor(null,
                ComponentDef.class);
    	String systemAttributes=String.format("extends='%s:%s' ", baseCmpDesc.getNamespace(),baseCmpDesc.getName());
    	String bodyMarkup = "<aura:set attribute='SimpleAttribute'> We just Set it </aura:set> "
    			+ "<div class='attrFromBaseCmp'>In BaseCmp : SimpleAttribute={!v.SimpleAttribute}  </div>";
    	addSourceAutoCleanup(cmpDesc, String.format(baseComponentTag, systemAttributes,bodyMarkup));

    	return cmpDesc;
    }

    private DefDescriptor<ComponentDef> setupSimpleComponentToExtend() {
    	DefDescriptor<ComponentDef> cmpDesc = getAuraTestingUtil().createStringSourceDescriptor(null,
                ComponentDef.class);
    	String systemAttributes="extensible='true' ";
    	String bodyMarkup =
    	"<aura:attribute name='SimpleAttribute' type='String' default='DefaultStringFromBaseCmp'/>"
    	+ "{!v.body}"
        + "<div class='attrInBaseCmp'>In BaseCmp : SimpleAttribute={!v.SimpleAttribute} </div>";
    	addSourceAutoCleanup(cmpDesc, String.format(baseComponentTag, systemAttributes,bodyMarkup));

    	return cmpDesc;
    }

    /**
     * Verify use of integration service to inject a component and initialize various types of attributes. Disabled in
     * chrome because only this test fails with chromedriver 2.9 with a
     * "unknown error: Maximum call stack size exceeded" exception. It works fine in firefox, IE9.
     * https://code.google.com/p/chromedriver/issues/detail?id=887
     */
    @ExcludeBrowsers(BrowserType.GOOGLECHROME)
    public void testAttributesInitialization() throws Exception {
        verifyAttributesInitialization(defaultStubCmp);
    }

    /**
     * Verify use of integration service to inject a component and initialize various types of attributes. (ASYNC)
     * Disabled in chrome because only this test fails with chromedriver 2.9 with a
     * "unknown error: Maximum call stack size exceeded" exception. It works fine in firefox, IE9.
     * https://code.google.com/p/chromedriver/issues/detail?id=887
     */
    @ExcludeBrowsers(BrowserType.GOOGLECHROME)
    public void testAttributesInitializationAsync() throws Exception {
        DefDescriptor<ComponentDef> stub = addSourceAutoCleanup(
                ComponentDef.class,
                getIntegrationStubMarkup(
                        "java://org.auraframework.impl.renderer.sampleJavaRenderers.RendererForTestingIntegrationService",
                        true, true, true, true)
                );

        verifyAttributesInitialization(stub);
    }

    private void verifyAttributesInitialization(DefDescriptor<ComponentDef> stub) throws Exception {
        String attributeMarkup = tmu.getCommonAttributeMarkup(true, true, true, false)
                + tmu.getCommonAttributeListMarkup(true, true, false, false, false);
        String attributeWithDefaultsMarkup =
                tmu.getCommonAttributeWithDefaultMarkup(true, true, true, false,
                        "'Apple'", "'true'", "'Banana'", "") +
                        tmu.getCommonAttributeListWithDefaultMarkup(true, true, false, false, false,
                                "'Apple,Orange'", "'Melon,Berry,Grapes'", "", "", "");

        DefDescriptor<ComponentDef> cmpToInject = addSourceAutoCleanup(ComponentDef.class,
                String.format(AuraImplTestCase.baseComponentTag, "", attributeMarkup + attributeWithDefaultsMarkup));

        Map<String, Object> attributes = Maps.newHashMap();
        attributes.put("strAttr", "Oranges");
        attributes.put("booleanAttr", false);
        List<String> strList = Lists.newArrayList("Pear", "Melon");
        attributes.put("strList", strList);
        List<String> stringList = Lists.newArrayList("Persimon", "Kiwi");
        attributes.put("stringList", stringList.toArray());
        attributes.put("objAttr", "Object");

        String attributeEvalScript = "return window.$A.getRoot().find('%s').get('v.%s');";

        openIntegrationStub(stub, cmpToInject, attributes);

        // Access injected component through ClientSide API
        assertTrue(auraUITestingUtil.getBooleanEval(String.format(
                "return window.$A.getRoot().find('%s')!== undefined ;", defaultLocalId)));

        // Provided attributes
        assertEquals("Oranges",
                auraUITestingUtil.getEval(String.format(attributeEvalScript, defaultLocalId, "strAttr")));
        assertFalse(auraUITestingUtil.getBooleanEval(String.format(attributeEvalScript, defaultLocalId, "booleanAttr")));
        assertEquals("Object", auraUITestingUtil.getEval(String.format(attributeEvalScript, defaultLocalId, "objAttr")));
        assertEquals(strList, auraUITestingUtil.getEval(String.format(attributeEvalScript, defaultLocalId, "strList")));
        assertEquals(stringList,
                auraUITestingUtil.getEval(String.format(attributeEvalScript, defaultLocalId, "stringList")));

        // Attributes with Default values
        assertEquals("Apple",
                auraUITestingUtil.getEval(String.format(attributeEvalScript, defaultLocalId, "strAttrDefault")));
        assertTrue(auraUITestingUtil.getBooleanEval(String.format(attributeEvalScript, defaultLocalId,
                "booleanAttrDefault")));
        assertEquals("Banana",
                auraUITestingUtil.getEval(String.format(attributeEvalScript, defaultLocalId, "objAttrDefault")));
        assertEquals(Lists.newArrayList("Apple", "Orange"),
                auraUITestingUtil.getEval(String.format(attributeEvalScript, defaultLocalId, "strListDefault")));
        assertEquals(Lists.newArrayList("Melon", "Berry", "Grapes"),
                auraUITestingUtil.getEval(String.format(attributeEvalScript, defaultLocalId, "stringListDefault")));

    }

    /**
     * Verify we can fire custom event from injected component, then handle it in top application level Note in
     * RendererWithExtendedApp, we are not using the aura:integrationServiceApp, instead we are using its extension
     * (ASYNC) Click is unsupported in these touch based platforms
     */
    @ExcludeBrowsers({ BrowserType.IPAD, BrowserType.IPHONE })
    public void testExtendedAppWithRegisteredEventsAsync() throws Exception {
        DefDescriptor<ComponentDef> stub = addSourceAutoCleanup(
                ComponentDef.class,
                getIntegrationStubMarkup(
                        "java://org.auraframework.impl.renderer.sampleJavaRenderers.RendererWithExtendedApp",
                        true, true, true, true)
                );
        verifyComponentWithRegisteredEvents(stub, true);
    }

    /**
     * Verify use of integration service to inject a component and initialize events with javascript function handlers.
     */
    // Click is unsupported in these touch based platforms
    @ExcludeBrowsers({ BrowserType.IPAD, BrowserType.IPHONE })
    public void testComponentWithRegisteredEvents() throws Exception {
        DefDescriptor<ComponentDef> stub = addSourceAutoCleanup(
                ComponentDef.class,
                getIntegrationStubMarkup(
                        "java://org.auraframework.impl.renderer.sampleJavaRenderers.RendererForAISWithCustomJScript",
                        true, true, true)
                );
        verifyComponentWithRegisteredEvents(stub, false);
    }

    /**
     * Verify use of integration service to inject a component and initialize events with javascript function handlers.
     * (ASYNC)
     */
    @ExcludeBrowsers({ BrowserType.IPAD, BrowserType.IPHONE })
    public void testComponentWithRegisteredEventsAsync() throws Exception {
        DefDescriptor<ComponentDef> stub = addSourceAutoCleanup(
                ComponentDef.class,
                getIntegrationStubMarkup(
                        "java://org.auraframework.impl.renderer.sampleJavaRenderers.RendererForAISWithCustomJScript",
                        true, true, true, true)
                );
        verifyComponentWithRegisteredEvents(stub, false);
    }

    /*
     * this function create component to inject, it registers three custom events(two component one application), fire
     * them in its controller. for container component to catch these events, one needs to add key->value
     * pair(eventName-->handlerFunctionName), then in container's markup, find a way to inject the hander functions
     * within <script>...</script>
     */
    private void verifyComponentWithRegisteredEvents(DefDescriptor<ComponentDef> stub, boolean checkAppEvt)
            throws Exception {
        // create injected component with custom events.
        String bodyMarkup = "<aura:attribute name='attr' type='String' default='Oranges'/> "
                + "<aura:registerevent name='press' type='ui:press'/>"
                + "<aura:registerevent name='change' type='ui:change'/>"
                + "<aura:registerevent name='appEvtFromInjectedCmp' type='handleEventTest:applicationEvent'/>"
                + "<div class='dataFromAttribute' aura:id='dataFromAttribute'>{!v.attr}</div>"
                + "<div class='click_t' onclick='{!c.clickHndlr}'>Click Me</div>"
                + "<input class='change_t' onchange='{!c.changeHndlr}' type='text'/>"
                + "<div class='click2_t' onclick='{!c.click2Hndlr}'>Click Me2</div>"
                + "<div class='click3_t' onclick='{!c.click3Hndlr}'>Click Me3</div>";
        DefDescriptor<ComponentDef> cmpToInject = addSourceAutoCleanup(ComponentDef.class,
                String.format(AuraImplTestCase.baseComponentTag, "", bodyMarkup));
        DefDescriptor<ControllerDef> jsControllerdesc = Aura.getDefinitionService()
                .getDefDescriptor(
                        String.format("%s://%s.%s", DefDescriptor.JAVASCRIPT_PREFIX, cmpToInject.getNamespace(),
                                cmpToInject.getName()), ControllerDef.class
                );
        // create controller to fire events
        addSourceAutoCleanup(jsControllerdesc,
                "{"
                + "   clickHndlr: function(cmp, evt){var e = cmp.getEvent('press');e.setParams({'domEvent': evt});e.fire();},"
                + "   changeHndlr: function(cmp, evt){var e = cmp.getEvent('change');e.fire();},"
                + "   click2Hndlr: function(cmp, evt){var e = cmp.getEvent('appEvtFromInjectedCmp'); e.fire();},"
                + "   click3Hndlr: function(cmp, evt){var e = $A.getEvt('handleEventTest:applicationEvent'); e.setParams({'strAttr': 'event fired from click3Hndlr'}); e.fire();}"
                + "}"
        );
        // associate custom event name to handler function name using attribute map
        Map<String, Object> attributes = Maps.newHashMap();
        attributes.put("attr", "Apples");
        attributes.put("press", "clickHandler__t");
        attributes.put("change", "changeHandler__t");
        attributes.put("appEvtFromInjectedCmp", "click2Handler__t");

        openIntegrationStub(stub, cmpToInject, attributes);

        WebElement attrValue = findDomElement(By.cssSelector("div.dataFromAttribute"));
        assertEquals("Failed to see data from model of injected component", "Apples", attrValue.getText());

        // component event 1
        WebElement clickNode = findDomElement(By.cssSelector("div.click_t"));
        clickNode.click();
        assertTrue("expect _clickHandlerCalled to be true",
                auraUITestingUtil.getBooleanEval("return document._clickHandlerCalled"));
        assertEquals("press", auraUITestingUtil.getEval("return document.__clickEvent.getName()"));

        WebElement textNode = findDomElement(By.cssSelector("input.change_t"));
        textNode.sendKeys("YeeHa!");
        clickNode.click(); // This will take the focus out of input element and trigger the onchange handler
        waitForCondition("return !!document._changeHandlerCalled");
        assertEquals("Custom JS Code", auraUITestingUtil.getEval("return document._changeHandlerCalled"));
        assertEquals("change", auraUITestingUtil.getEval("return document.__changeEvent.getName()"));

        // component event 2
        WebElement clickNode2 = findDomElement(By.cssSelector("div.click2_t"));
        clickNode2.click();
        assertTrue("clickHandler2Called should be true after container cmp handle the evt from injected cmp",
                auraUITestingUtil.getBooleanEval("return document._click2HandlerCalled"));
        assertEquals("didn't get expect event name from Click Me2",
                "appEvtFromInjectedCmp",
                auraUITestingUtil.getEval("return document.__click2Event.getName()"));

        // application event
        if (checkAppEvt) {
            WebElement clickNode3 = findDomElement(By.cssSelector("div.click3_t"));
            clickNode3.click();
            assertTrue("clickHandler3Called should be true after container cmp handle the evt from injected cmp",
                    auraUITestingUtil.getBooleanEval("return document._click3HandlerCalled"));
            assertEquals("didn't get expect event param from Click Me3",
                    "event fired from click3Hndlr",
                    auraUITestingUtil.getEval("return document.__click3EventParam"));
        }

    }

    /**
     * Verify use of integration service to inject a component and initialize a Aura.Component[] type attribute.
     *
     * @throws Exception
     */
    @Ignore("W-1498384")
    public void testComponentArrayAsAttribute() throws Exception {
        String attributeMarkup = "<aura:attribute name='cmps' type='Aura.Component[]'/>{!v.cmps}";
        String attributeWithDefaultsMarkup = "<aura:attribute name='cmpsDefault' type='Aura.Component[]'>"
                + "<div class='divDefault'>Div as default</div>"
                + "<span class='spanDefault'>Span component as default</span>" + "</aura:attribute>{!v.cmpsDefault}";
        DefDescriptor<ComponentDef> cmpToInject = addSourceAutoCleanup(ComponentDef.class,
                String.format(AuraImplTestCase.baseComponentTag, "", attributeMarkup + attributeWithDefaultsMarkup));

        DefDescriptor<ComponentDef> customStub = addSourceAutoCleanup(
                ComponentDef.class,
                getIntegrationStubMarkup(
                        "java://org.auraframework.impl.renderer.sampleJavaRenderers.RendererToInjectComponentAsAttributes",
                        false, false,
                        false));

        openIntegrationStub(customStub, cmpToInject, null);

        // Access injected component through ClientSide API
        assertTrue("Failed to locate injected component on page.",
                auraUITestingUtil.getBooleanEval(String.format("return window.$A.getRoot().find('%s')!== undefined ;",
                        "localId")));

        // Default values for attributes of type Aura.Component[]
        WebElement devDefault = findDomElement(By.cssSelector("div.divDefault"));
        assertEquals("Failed to initializing attribute of type Aura.Component[]", "Div as default",
                devDefault.getText());
        WebElement spanDefault = findDomElement(By.cssSelector("span.spanDefault"));
        assertEquals("Failed to initializing attribute of type Aura.Component[]", "Span component as default",
                spanDefault.getText());

        // Attribute value passing for Aura.Component[] type attributes
        assertTrue("Failed passing value to Aura.Component[] type attributes",
                isElementPresent(By.xpath("//div[@id='placeholder' and contains(.,'Water Melon')]")));
        assertTrue(isElementPresent(By.xpath("//div[@id='placeholder' and contains(.,'Grape Fruit')]")));
    }

    /**
     * Verify the behavior of injectComponent when the placeholder specified is missing.
     */
    public void testMissingPlaceholder() throws Exception {
        DefDescriptor<ComponentDef> stub = addSourceAutoCleanup(
                ComponentDef.class,
                getIntegrationStubMarkup(
                        "java://org.auraframework.impl.renderer.sampleJavaRenderers.RendererToInjectCmpInNonExistingPlaceholder",
                        true, true, true)
                );
        verifyMissingPlaceholder(stub);
    }

    /**
     * Verify the behavior of injectComponent when the placeholder specified is missing. (ASYNC)
     */
    public void testMissingPlaceholderAsync() throws Exception {
        DefDescriptor<ComponentDef> stub = addSourceAutoCleanup(
                ComponentDef.class,
                getIntegrationStubMarkup(
                        "java://org.auraframework.impl.renderer.sampleJavaRenderers.RendererToInjectCmpInNonExistingPlaceholder",
                        true, true, true, true)
                );
        verifyMissingPlaceholder(stub);
    }

    private void verifyMissingPlaceholder(DefDescriptor<ComponentDef> stub) throws Exception {
        DefDescriptor<ComponentDef> cmpToInject = addSourceAutoCleanup(ComponentDef.class,
                String.format(AuraImplTestCase.baseComponentTag, "", ""));

        String badPlaceholder = "fooBared";
        String expectedErrorMessage = String.format(
                "Invalid locatorDomId specified - no element found in the DOM with id=%s", badPlaceholder);

        openIntegrationStub(stub, cmpToInject, null, badPlaceholder);

        boolean isErrorPresent = findDomElement(By.cssSelector("span[class='uiOutputText']")).getText().contains(
                expectedErrorMessage);
        assertTrue("IntegrationService failed to display error message when invalid locatorDomId was specified",
                isErrorPresent);
    }

    /**
     * Verify that specifying localId(aura:id) for an injected component is allowed.
     */
    public void testMissingLocalId() throws Exception {
        DefDescriptor<ComponentDef> stub = addSourceAutoCleanup(
                ComponentDef.class,
                getIntegrationStubMarkup(
                        "java://org.auraframework.impl.renderer.sampleJavaRenderers.RendererToInjectCmpWithNullLocalId",
                        true, true, false)
                );

        verifyMissingLocalId(stub);
    }

    /**
     * Verify that specifying localId(aura:id) for an injected component is allowed. (ASYNC)
     */
    public void testMissingLocalIdAsync() throws Exception {
        DefDescriptor<ComponentDef> stub = addSourceAutoCleanup(
                ComponentDef.class,
                getIntegrationStubMarkup(
                        "java://org.auraframework.impl.renderer.sampleJavaRenderers.RendererToInjectCmpWithNullLocalId",
                        true, true, false, true)
                );

        verifyMissingLocalId(stub);
    }

    private void verifyMissingLocalId(DefDescriptor<ComponentDef> stub) throws Exception {
        DefDescriptor<ComponentDef> cmpToInject = Aura.getDefinitionService().getDefDescriptor("aura:text",
                ComponentDef.class);
        Map<String, Object> attributes = Maps.newHashMap();
        attributes.put("value", "No Local Id");

        openIntegrationStub(stub, cmpToInject, attributes, null);
        assertTrue("IntegrationService failed to inject component when no localId was specified",
                isElementPresent(By.xpath("//div[@id='placeholder' and contains(.,'No Local Id')]")));

    }

    /**
     * Verify that exceptions that happen during component instance creation are surfaced on the page.
     */
    public void testExceptionDuringComponentInitialization() throws Exception {
        DefDescriptor<ComponentDef> stub = addSourceAutoCleanup(
                ComponentDef.class,
                getIntegrationStubMarkup(
                        "java://org.auraframework.impl.renderer.sampleJavaRenderers.RendererForTestingIntegrationService",
                        true, true, true)
                );
        verifyExceptionDuringComponentInitialization(stub);
    }

    /**
     * Verify that exceptions that happen during component instance creation are surfaced on the page. (ASYNC)
     */
    public void testExceptionDuringComponentInitializationAsync() throws Exception {
        DefDescriptor<ComponentDef> stub = addSourceAutoCleanup(
                ComponentDef.class,
                getIntegrationStubMarkup(
                        "java://org.auraframework.impl.renderer.sampleJavaRenderers.RendererForTestingIntegrationService",
                        true, true, true, true)
                );
        verifyExceptionDuringComponentInitialization(stub);
    }

    private void verifyExceptionDuringComponentInitialization(DefDescriptor<ComponentDef> stub) throws Exception {
        DefDescriptor<ComponentDef> cmpWithReqAttr = addSourceAutoCleanup(ComponentDef.class,
                String.format(AuraImplTestCase.baseComponentTag, "",
                        "<aura:attribute name='reqAttr' required='true' type='String'/>"));
        Map<String, Object> attributes = Maps.newHashMap();
        String expectedErrorMessage = "is missing required attribute 'reqAttr'";

        openIntegrationStub(stub, cmpWithReqAttr, attributes);

        boolean isErrorPresent = findDomElement(By.cssSelector("span[class='uiOutputText']")).getText().contains(
                expectedErrorMessage);
        assertTrue("IntegrationService failed to display error message", isErrorPresent);
    }

    /**
     * Verify that using multiple integration objects on page does not duplicate Aura Framework injection.
     */
    @Ignore("W-1498404")
    public void testMultipleIntegrationObjectsOnSamePage() throws Exception {
        DefDescriptor<ComponentDef> cmpToInject = setupSimpleComponentWithModelControllerHelperAndProvider();
        Map<String, Object> attributes = Maps.newHashMap();
        String facets[] = new String[] { "Panda", "Tiger" };
        String facetMarkup = "";
        for (String facet : facets) {
            attributes.put("strAttribute", facet);
            facetMarkup = facetMarkup
                    + String.format("<%s:%s desc='%s:%s' attrMap='%s' placeholder='%s' localId='%s'/>",
                            defaultStubCmp.getNamespace(),
                            defaultStubCmp.getName(), cmpToInject.getNamespace(), cmpToInject.getName(),
                            Json.serialize(attributes), "Animal" + facet, facet);

        }

        DefDescriptor<ComponentDef> customStubCmp = addSourceAutoCleanup(ComponentDef.class,
                String.format(AuraImplTestCase.baseComponentTag, "render='server'", facetMarkup));

        openIntegrationStub(customStubCmp, cmpToInject, null, null);
        assertTrue(isElementPresent(By.xpath("//div//script[contains(@src,'aura_dev.js')]")));
        assertEquals("Framework loaded multiple times", 1,
                getDriver().findElements(By.xpath("//div//script[contains(@src,'aura_dev.js')]")).size());

        WebElement attrValue = findDomElement(By.cssSelector("#AnimalPanda div.dataFromAttribute"));
        assertEquals("Failed to locate first component injected.", "Panda", attrValue.getText());

        attrValue = findDomElement(By.cssSelector("#AnimalTiger div.dataFromAttribute"));
        assertEquals("Failed to locate second component injected.", "Tiger", attrValue.getText());

    }

    @Ignore("W-1498404 - Based on the fix, this test case should be implemented")
    public void testMultipleIntegrationObjectsOnSamePageWithDifferentModes() throws Exception {

    }

    /**
     * LayoutService is not initialized for a page which is using Integration service. This test verifies that calling
     * LayoutService APIs don't cause Javascript Errors on the page.
     */
    @Ignore("W-1506261")
    public void testLayoutServiceAPIs() throws Exception {
        DefDescriptor<ComponentDef> cmpToInject = addSourceAutoCleanup(ComponentDef.class,
                String.format(AuraImplTestCase.baseComponentTag, "", "Injected Component"));

        openIntegrationStub(cmpToInject, null);
        auraUITestingUtil.getEval("$A.layoutService.changeLocation('forward')");
        assertTrue("Failed to change window location using set()",
                getDriver().getCurrentUrl().endsWith("#forward"));

        // Execute all the public APIs of layoutService and make sure there are no Javascript errors
        auraUITestingUtil.getEval("$A.layoutService.refreshLayout()");

        auraUITestingUtil.getEval("$A.layoutService.pop()");

        auraUITestingUtil.getEval("$A.layoutService.back()");

        auraUITestingUtil.getEval("$A.layoutService.clearHistory()");

        auraUITestingUtil.getEval("$A.layoutService.setCurrentLayoutTitle('Integration Service')");

        auraUITestingUtil.getEval("$A.layoutService.layout('moreForward')");
    }

    /**
     * HistoryService is not initialized for a page which is using Integration service. This test verifies that calling
     * HistoryService APIs don't cause Javascript Errors on the page. HistoryService initialization takes care of
     * attaching a event handler for # changes in the URL. In case of integration service, this initialization is
     * skipped. So changing url # should not fire aura:locationChange event
     */
    // History Service is not supported in IE7 or IE8
    @ExcludeBrowsers({ BrowserType.IE7, BrowserType.IE8 })
    public void testHistoryServiceAPIs() throws Exception {
        String expectedTxt = "";
        openIntegrationStub(
                Aura.getDefinitionService().getDefDescriptor("integrationService:noHistoryService", ComponentDef.class),
                null);
        String initialUrl = getDriver().getCurrentUrl();
        // open("/integrationService/noHistoryService.cmp");
        assertEquals("At page initialization, aura:locationChange event should not be fired.", expectedTxt,
                getText(By.cssSelector("div.testDiv")));

        // historyService.set() to a new location - W-1506261
        auraUITestingUtil.getEval("$A.historyService.set('forward')");
        assertTrue("Failed to change window location using set()",
                getDriver().getCurrentUrl().endsWith("#forward"));

        // historyService.get()
        assertEquals("get() failed to retrieve expected token",
                "forward", auraUITestingUtil.getEval("return $A.historyService.get().token"));

        // historyService.back()
        auraUITestingUtil.getEval("$A.historyService.back()");
        assertEquals("Failed to revert back to previous URL", initialUrl, getDriver().getCurrentUrl());
        assertEquals("History service failed to go back",
                "", auraUITestingUtil.getEval("return $A.historyService.get().token"));

        // historyService.forward()
        auraUITestingUtil.getEval("$A.historyService.forward()");
        assertEquals("History service does provided unexpected # token",
                "forward", auraUITestingUtil.getEval("return $A.historyService.get().token"));
        assertTrue("Window location does not end with expected #", getDriver().getCurrentUrl().endsWith("#forward"));

        // Manually firing locationChange event
        expectedTxt = "Location Change fired:1";
        auraUITestingUtil.getEval("$A.eventService.newEvent('aura:locationChange').fire()");
        assertEquals("Manully firing locationChange event failed",
                expectedTxt, getText(By.cssSelector("div.testDiv")));
    }

    private String getIntegrationStubMarkup(String javaRenderer, Boolean attributeMap, Boolean placeHolder,
            Boolean localId) {
        return this.getIntegrationStubMarkup(javaRenderer, attributeMap, placeHolder, localId, false);
    }

    /**
     * Utility method to obtain the required markup of the integration stub component.
     */
    private String getIntegrationStubMarkup(String javaRenderer, Boolean attributeMap, Boolean placeHolder,
            Boolean localId, Boolean useAsync) {
        String stubMarkup = String.format(
                "<aura:component render='server' renderer='%s'>"
                + "<aura:attribute name='desc' type='String'/>"
                + "%s %s %s %s"
                + "</aura:component>",
                javaRenderer,
                attributeMap ? "<aura:attribute name='attrMap' type='Map'/>" : "",
                placeHolder ? String.format("<aura:attribute name='placeholder' type='String' default='%s'/>",
                        defaultPlaceholderID) : "",
                localId ? String.format("<aura:attribute name='localId' type='String' default='%s'/>", defaultLocalId)
                        : "",
                String.format("<aura:attribute name='useAsync' type='Boolean' default='%s'/>", useAsync));
        return stubMarkup;
    }

    /**
     * Pass the descriptor and attributes map of the component to be injected to a Stub component. Open the stub
     * component using webdriver.
     */
    private void openIntegrationStub(DefDescriptor<ComponentDef> stub, DefDescriptor<ComponentDef> toInject,
            Map<String, Object> attributeMap, String placeholder)
            throws MalformedURLException, URISyntaxException {
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
        auraUITestingUtil.waitForDocumentReady();
        // Wait for Aura framework(injected) to be ready
        waitForAuraFrameworkReady();
    }

    private void openIntegrationStub(DefDescriptor<ComponentDef> stub, DefDescriptor<ComponentDef> toInject,
            Map<String, Object> attributeMap)
            throws MalformedURLException, URISyntaxException {
        openIntegrationStub(stub, toInject, attributeMap, null);
    }

    private void openIntegrationStub(DefDescriptor<ComponentDef> toInject, Map<String, Object> attributeMap)
            throws MalformedURLException, URISyntaxException {
        openIntegrationStub(defaultStubCmp, toInject, attributeMap, null);
    }

}
