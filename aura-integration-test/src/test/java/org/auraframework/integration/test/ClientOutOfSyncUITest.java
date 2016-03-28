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
package org.auraframework.integration.test;

import java.util.ArrayList;
import java.util.Date;
import java.util.concurrent.TimeUnit;

import org.apache.commons.lang3.StringUtils;
import org.auraframework.Aura;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.ControllerDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.EventDef;
import org.auraframework.def.HelperDef;
import org.auraframework.def.IncludeDef;
import org.auraframework.def.InterfaceDef;
import org.auraframework.def.LibraryDef;
import org.auraframework.def.ProviderDef;
import org.auraframework.def.RendererDef;
import org.auraframework.def.StyleDef;
import org.auraframework.def.TokensDef;
import org.auraframework.test.util.WebDriverTestCase;
import org.auraframework.util.test.annotation.ThreadHostileTest;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedCondition;

import com.google.common.base.Function;

/**
 * Tests to verify that the client gets updated when we want it to get updated.
 */
public class ClientOutOfSyncUITest extends WebDriverTestCase {

    public ClientOutOfSyncUITest(String name) {
        super(name);
    }

    @Override
    public void setUp() throws Exception {
        super.setUp();
        // these tests trigger server recompilation which can take a bit of time
        getAuraUITestingUtil().setTimeoutInSecs(60);
    }

    private DefDescriptor<ComponentDef> setupTriggerComponent(String attrs, String body) {
        DefDescriptor<ComponentDef> cmpDesc = addSourceAutoCleanup(
                ComponentDef.class,
                String.format(
                        baseComponentTag,
                        "controller='java://org.auraframework.components.test.java.controller.JavaTestController' "
                                + attrs,
                        "<button onclick='{!c.post}'>post</button>" + body));
        DefDescriptor<?> controllerDesc = definitionService
                .getDefDescriptor(cmpDesc, DefDescriptor.JAVASCRIPT_PREFIX,
                        ControllerDef.class);
        addSourceAutoCleanup(
                controllerDesc,
                "{post:function(c){var a=c.get('c.getString');a.setParams({param:'dummy'});$A.enqueueAction(a);}}");
        return cmpDesc;
    }

    private boolean isIE() {
        switch (getBrowserType()) {
        case IE7:
        case IE8:
        case IE9:
        case IE10:
        case IE11:
            return true;
        default:
            break;
        }
        return false;
    }

    /**
     * Trigger a server action and wait for the browser to begin refreshing.
     */
    private void triggerServerAction() {
        // Careful. Android doesn't like more than one statement.
        getAuraUITestingUtil().getRawEval("document._waitingForReload = true;");

        // This test flaps on slower environments in IE. Give it a little more time to process the javascript.
        if (isIE()) {
            waitFor(3);
        }
        getAuraUITestingUtil().findDomElement(By.cssSelector("button")).click();
        if (isIE()) {
            waitFor(3);
        }
        getAuraUITestingUtil().waitUntil(new ExpectedCondition<Boolean>() {
            @Override
            public Boolean apply(WebDriver d) {
                Object ret = getAuraUITestingUtil().getRawEval("return !document._waitingForReload");
                if (ret != null && ((Boolean) ret).booleanValue()) {
                    return true;
                }
                return false;
            }
        }, "Page failed to refresh after server action triggered.");
        getAuraUITestingUtil().waitForDocumentReady();
        waitForAuraFrameworkReady();
    }

    public void testGetServerRenderingAfterMarkupChange() throws Exception {
        DefDescriptor<ComponentDef> cmpDesc = addSourceAutoCleanup(ComponentDef.class,
                String.format(baseComponentTag, "", "hi"));
        String url = getUrl(cmpDesc);
        openNoAura(url);
        assertEquals("hi", getText(By.cssSelector("body")));
        updateStringSource(cmpDesc, String.format(baseComponentTag, "", "bye"));
        // Firefox caches the response so we need to manually include a nonce to effect a reload
        openNoAura(url + "?nonce=" + System.nanoTime());
        getAuraUITestingUtil().waitForElementText(By.cssSelector("body"), "bye", true);
    }

    @ThreadHostileTest("NamespaceDef modification affects namespace")
    public void testGetClientRenderingAfterStyleChange() throws Exception {
        DefDescriptor<ComponentDef> cmpDesc = addSourceAutoCleanup(ComponentDef.class,
                String.format(baseComponentTag, "", "<div id='out'>hi</div>"));
        String className = cmpDesc.getNamespace() + StringUtils.capitalize(cmpDesc.getName());
        DefDescriptor<?> styleDesc = definitionService.getDefDescriptor(cmpDesc, DefDescriptor.CSS_PREFIX,
                StyleDef.class);
        addSourceAutoCleanup(styleDesc, String.format(".%s {font-style:italic;}", className));
        open(cmpDesc);
        assertEquals("italic",
                getAuraUITestingUtil().findDomElement(By.cssSelector("." + className)).getCssValue("font-style"));
        updateStringSource(styleDesc, String.format(".%s {font-style:normal;}", className));
        open(cmpDesc);
        assertEquals("normal",
                getAuraUITestingUtil().findDomElement(By.cssSelector("." + className)).getCssValue("font-style"));
    }

    @ThreadHostileTest("NamespaceDef modification affects namespace")
    public void testGetClientRenderingAfterTokensChange() throws Exception {
        DefDescriptor<ComponentDef> cmpDesc = addSourceAutoCleanup(ComponentDef.class,
                String.format(baseComponentTag, "", "<div id='out'>hi</div>"));
        String className = cmpDesc.getNamespace() + StringUtils.capitalize(cmpDesc.getName());
        DefDescriptor<?> styleDesc = definitionService.getDefDescriptor(cmpDesc, DefDescriptor.CSS_PREFIX,
                StyleDef.class);
        addSourceAutoCleanup(styleDesc, String.format(".%s {font-size:t(fsize);}", className));
        DefDescriptor<?> tokensDesc = definitionService.getDefDescriptor(
                String.format("%s://%s:%sNamespace", DefDescriptor.MARKUP_PREFIX, cmpDesc.getNamespace(),
                        cmpDesc.getNamespace()),
                TokensDef.class);
        addSourceAutoCleanup(tokensDesc,
                "<aura:tokens><aura:token name='fsize' value='8px'/></aura:tokens>");
        open(cmpDesc);
        assertEquals("8px", getAuraUITestingUtil().findDomElement(By.cssSelector("." + className)).getCssValue("font-size"));
        updateStringSource(tokensDesc,
                "<aura:tokens><aura:token name='fsize' value='66px'/></aura:tokens>");
        open(cmpDesc);
        assertEquals("66px",
                getAuraUITestingUtil().findDomElement(By.cssSelector("." + className)).getCssValue("font-size"));
    }

    public void testGetClientRenderingAfterJsControllerChange() throws Exception {
        DefDescriptor<ComponentDef> cmpDesc = addSourceAutoCleanup(ComponentDef.class,
                String.format(baseComponentTag, "", "<div id='click' onclick='{!c.clicked}'>click</div>"));
        DefDescriptor<?> controllerDesc = definitionService.getDefDescriptor(cmpDesc,
                DefDescriptor.JAVASCRIPT_PREFIX, ControllerDef.class);
        addSourceAutoCleanup(controllerDesc, "{clicked:function(){window.tempVar='inconsequential'}}");
        open(cmpDesc);
        assertNull(getAuraUITestingUtil().getEval("return window.tempVar;"));
        getAuraUITestingUtil().findDomElement(By.cssSelector("#click")).click();
        getAuraUITestingUtil().waitUntil(new ExpectedCondition<Boolean>() {
            @Override
            public Boolean apply(WebDriver d) {
                return "inconsequential".equals(getAuraUITestingUtil().getEval("return window.tempVar;"));
            }
        });
        updateStringSource(controllerDesc, "{clicked:function(){window.tempVar='meaningful'}}");
        open(cmpDesc);
        assertNull(getAuraUITestingUtil().getEval("return window.tempVar;"));
        getAuraUITestingUtil().findDomElement(By.cssSelector("#click")).click();
        getAuraUITestingUtil().waitUntil(new ExpectedCondition<Boolean>() {
            @Override
            public Boolean apply(WebDriver d) {
                return "meaningful".equals(getAuraUITestingUtil().getEval("return window.tempVar;"));
            }
        });
    }

    public void testGetClientRenderingAfterJsProviderChange() throws Exception {
        DefDescriptor<ComponentDef> cmpDesc = getAuraTestingUtil().createStringSourceDescriptor(null,
                ComponentDef.class, null);
        DefDescriptor<?> providerDesc = definitionService.getDefDescriptor(cmpDesc,
                DefDescriptor.JAVASCRIPT_PREFIX, ProviderDef.class);
        addSourceAutoCleanup(cmpDesc, String.format(baseComponentTag,
                String.format("render='client' provider='%s'", providerDesc.getQualifiedName()),
                "<aura:attribute name='given' type='string' default=''/>{!v.given}"));
        addSourceAutoCleanup(providerDesc, "({provide:function(){return {attributes:{'given':'silver spoon'}};}})");
        open(cmpDesc);
        assertEquals("silver spoon", getText(By.cssSelector("body")));
        updateStringSource(providerDesc, "({provide:function(){return {attributes:{'given':'golden egg'}};}})");
        open(cmpDesc);
        assertEquals("golden egg", getText(By.cssSelector("body")));
    }

    public void testGetClientRenderingAfterJsHelperChange() throws Exception {
        DefDescriptor<?> helperDesc = addSourceAutoCleanup(HelperDef.class, "({getHelp:function(){return 'simply';}})");
        DefDescriptor<ComponentDef> cmpDesc = addSourceAutoCleanup(
                ComponentDef.class,
                String.format(baseComponentTag,
                        String.format("render='client' helper='%s'", helperDesc.getQualifiedName()), ""));
        open(cmpDesc);
        assertEquals("simply", getAuraUITestingUtil().getEval("return $A.getRoot().getDef().getHelper().getHelp();"));
        updateStringSource(helperDesc, "({getHelp:function(){return 'complicated';}})");
        open(cmpDesc);
        assertEquals("complicated", getAuraUITestingUtil().getEval("return $A.getRoot().getDef().getHelper().getHelp();"));
    }

    public void testGetClientRenderingAfterJsRendererChange() throws Exception {
        DefDescriptor<?> rendererDesc = addSourceAutoCleanup(RendererDef.class,
                "({render:function(){return 'default';}})");
        DefDescriptor<ComponentDef> cmpDesc = addSourceAutoCleanup(ComponentDef.class,
                String.format(baseComponentTag, String.format("renderer='%s'", rendererDesc.getQualifiedName()), ""));
        open(cmpDesc);
        assertEquals("default", getText(By.cssSelector("body")));
        updateStringSource(rendererDesc, "({render:function(){return 'custom';}})");
        open(cmpDesc);
        assertEquals("custom", getText(By.cssSelector("body")));
    }

    public void testGetClientRenderingAfterEventChange() throws Exception {
        DefDescriptor<?> eventDesc = addSourceAutoCleanup(EventDef.class,
                "<aura:event type='APPLICATION'><aura:attribute name='explode' type='String' default='pow'/></aura:event>");
        DefDescriptor<ComponentDef> cmpDesc = addSourceAutoCleanup(
                ComponentDef.class,
                String.format(baseComponentTag, "render='client'",
                        String.format("<aura:registerevent name='end' type='%s'/>", eventDesc.getDescriptorName())));
        open(cmpDesc);
        assertEquals("pow", getAuraUITestingUtil().getEval(String.format(
                "return $A.getEvt('%s').getDef().getAttributeDefs().explode['default'];",
                eventDesc.getDescriptorName())));
        updateStringSource(eventDesc,
                "<aura:event type='APPLICATION'><aura:attribute name='explode' type='String' default='kaboom'/></aura:event>");
        open(cmpDesc);
        assertEquals("kaboom", getAuraUITestingUtil().getEval(String.format(
                "return $A.getEvt('%s').getDef().getAttributeDefs().explode['default'];",
                eventDesc.getDescriptorName())));
    }

    public void testGetServerRenderingAfterInterfaceChange() throws Exception {
        DefDescriptor<?> interfaceDesc = addSourceAutoCleanup(
                InterfaceDef.class,
                "<aura:interface support='GA' description=''><aura:attribute name='entrance' type='String' default='grand'/></aura:interface>");
        DefDescriptor<ComponentDef> cmpDesc = addSourceAutoCleanup(ComponentDef.class, String.format(baseComponentTag,
                String.format("implements='%s'", interfaceDesc.getQualifiedName()), "{!v.entrance}"));
        String url = getUrl(cmpDesc);
        openNoAura(url);
        assertEquals("grand", getText(By.cssSelector("body")));
        updateStringSource(
                interfaceDesc,
                "<aura:interface support='GA' description=''><aura:attribute name='entrance' type='String' default='secret'/></aura:interface>");
        // Firefox caches the response so we need to manually include a nonce to effect a reload
        openNoAura(url + "?nonce=" + System.nanoTime());
        getAuraUITestingUtil().waitForElementText(By.cssSelector("body"), "secret", true);
    }

    public void testGetClientRenderingAfterDependencyChange() throws Exception {
        DefDescriptor<?> depDesc = addSourceAutoCleanup(ComponentDef.class,
                String.format(baseComponentTag, "", "<aura:attribute name='val' type='String' default='initial'/>"));
        DefDescriptor<ComponentDef> cmpDesc = addSourceAutoCleanup(
                ComponentDef.class,
                String.format(baseComponentTag, "render='client'",
                        String.format("<aura:dependency resource='%s'/>", depDesc.getQualifiedName())));
        open(cmpDesc);
        assertEquals("initial", getAuraUITestingUtil().getEval(String.format(
                "return $A.componentService.newComponent('%s').get('v.val');", depDesc.getDescriptorName())));
        updateStringSource(depDesc,
                String.format(baseComponentTag, "", "<aura:attribute name='val' type='String' default='final'/>"));
        open(cmpDesc);
        assertEquals("final", getAuraUITestingUtil().getEval(String.format(
                "return $A.componentService.newComponent('%s').get('v.val');", depDesc.getDescriptorName())));
    }

    public void testPostAfterMarkupChange() throws Exception {
        DefDescriptor<ComponentDef> cmpDesc = setupTriggerComponent("", "<div id='sample'>free</div>");
        open(cmpDesc);
        assertEquals("free", getText(By.cssSelector("#sample")));
        updateStringSource(cmpDesc, String.format(baseComponentTag,
                "controller='java://org.auraframework.components.test.java.controller.JavaTestController'",
                "<button onclick='{!c.post}'>post</button><div id='sample'>deposit</div>"));
        triggerServerAction();
        getAuraUITestingUtil().waitForElementText(By.cssSelector("#sample"), "deposit", true);
    }

    @ThreadHostileTest("NamespaceDef modification affects namespace")
    public void testPostAfterStyleChange() throws Exception {
        DefDescriptor<ComponentDef> cmpDesc = setupTriggerComponent("", "<div id='out'>hi</div>");
        String className = cmpDesc.getNamespace() + StringUtils.capitalize(cmpDesc.getName());
        DefDescriptor<?> styleDesc = definitionService.getDefDescriptor(cmpDesc, DefDescriptor.CSS_PREFIX,
                StyleDef.class);
        addSourceAutoCleanup(styleDesc, String.format(".%s {font-style:italic;}", className));
        open(cmpDesc);
        assertEquals("italic",
                getAuraUITestingUtil().findDomElement(By.cssSelector("." + className)).getCssValue("font-style"));
        updateStringSource(styleDesc, String.format(".%s {font-style:normal;}", className));
        triggerServerAction();
        getAuraUITestingUtil().waitForElementFunction(By.cssSelector("." + className), new Function<WebElement, Boolean>() {
            @Override
            public Boolean apply(WebElement element) {
                return "normal".equals(element.getCssValue("font-style"));
            }
        });
    }

    /**
     * A routine to do _many_ iterations of a client out of sync test.
     *
     * This test really shouldn't be run unless one of the tests is flapping. It lets you iterate a number of times to
     * force a failure.... No guarantees, but without the _waitingForReload check in the trigger function, this will
     * cause a failure in very few iterations.
     */
    @ThreadHostileTest("NamespaceDef modification affects namespace")
    public void _testPostManyAfterStyleChange() throws Exception {
        DefDescriptor<ComponentDef> cmpDesc = setupTriggerComponent("", "<div id='out'>hi</div>");
        String className = cmpDesc.getNamespace() + StringUtils.capitalize(cmpDesc.getName());
        DefDescriptor<?> styleDesc = definitionService.getDefDescriptor(cmpDesc, DefDescriptor.CSS_PREFIX,
                StyleDef.class);
        addSourceAutoCleanup(styleDesc, String.format(".%s {font-style:italic;}", className));
        open(cmpDesc);
        assertEquals("italic",
                getAuraUITestingUtil().findDomElement(By.cssSelector("." + className)).getCssValue("font-style"));
        for (int i = 0; i < 1000; i++) {
            updateStringSource(styleDesc, String.format(".%s {font-style:normal;}", className));
            triggerServerAction();
            getAuraUITestingUtil().waitForElementFunction(By.cssSelector("." + className),
                    new Function<WebElement, Boolean>() {
                        @Override
                        public Boolean apply(WebElement element) {
                            return "normal".equals(element.getCssValue("font-style"));
                        }
                    });
            updateStringSource(styleDesc, String.format(".%s {font-style:italic;}", className));
            triggerServerAction();
            getAuraUITestingUtil().waitForElementFunction(By.cssSelector("." + className),
                    new Function<WebElement, Boolean>() {
                        @Override
                        public Boolean apply(WebElement element) {
                            return "italic".equals(element.getCssValue("font-style"));
                        }
                    });
        }
    }

    @ThreadHostileTest("NamespaceDef modification affects namespace")
    public void testPostAfterTokensChange() throws Exception {
        DefDescriptor<ComponentDef> cmpDesc = setupTriggerComponent("", "<div id='out'>hi</div>");
        String className = cmpDesc.getNamespace() + StringUtils.capitalize(cmpDesc.getName());
        DefDescriptor<?> styleDesc = definitionService.getDefDescriptor(cmpDesc, DefDescriptor.CSS_PREFIX,
                StyleDef.class);
        addSourceAutoCleanup(styleDesc, String.format(".%s {font-size:t(fsize);}", className));
        DefDescriptor<?> tokensDesc = definitionService.getDefDescriptor(
                String.format("%s://%s:%sNamespace", DefDescriptor.MARKUP_PREFIX, cmpDesc.getNamespace(),
                        cmpDesc.getNamespace()),
                TokensDef.class);
        addSourceAutoCleanup(tokensDesc,
                "<aura:tokens><aura:token name='fsize' value='8px'/></aura:tokens>");
        open(cmpDesc);
        assertEquals("8px", getAuraUITestingUtil().findDomElement(By.cssSelector("." + className)).getCssValue("font-size"));
        updateStringSource(tokensDesc,
                "<aura:tokens><aura:token name='fsize' value='66px'/></aura:tokens>");
        triggerServerAction();
        getAuraUITestingUtil().waitForElementFunction(By.cssSelector("." + className), new Function<WebElement, Boolean>() {
            @Override
            public Boolean apply(WebElement element) {
                return "66px".equals(element.getCssValue("font-size"));
            }
        });
    }

    public void testPostAfterJsControllerChange() throws Exception {
        DefDescriptor<ComponentDef> cmpDesc = addSourceAutoCleanup(
                ComponentDef.class,
                String.format(
                        baseComponentTag,
                        "controller='java://org.auraframework.components.test.java.controller.JavaTestController'",
                        "<button onclick='{!c.post}'>post</button><div id='click' onclick='{!c.clicked}'>click</div>"));
        DefDescriptor<?> controllerDesc = definitionService
                .getDefDescriptor(cmpDesc, DefDescriptor.JAVASCRIPT_PREFIX,
                        ControllerDef.class);
        addSourceAutoCleanup(
                controllerDesc,
                "{post:function(c){var a=c.get('c.getString');a.setParams({param:'dummy'});$A.enqueueAction(a);},clicked:function(){window.tempVar='inconsequential'}}");
        open(cmpDesc);
        assertNull(getAuraUITestingUtil().getEval("return window.tempVar;"));
        getAuraUITestingUtil().findDomElement(By.cssSelector("#click")).click();
        getAuraUITestingUtil().waitUntil(new ExpectedCondition<Boolean>() {
            @Override
            public Boolean apply(WebDriver d) {
                return "inconsequential".equals(getAuraUITestingUtil().getEval("return window.tempVar;"));
            }
        });
        updateStringSource(
                controllerDesc,
                "{post:function(c){var a=c.get('c.getString');a.setParams({param:'dummy'});$A.enqueueAction(a);},clicked:function(){window.tempVar='meaningful'}}");
        triggerServerAction();
        // wait for page to reload by checking that our tempVar is undefined again
        getAuraUITestingUtil().waitUntil(new ExpectedCondition<Boolean>() {
            @Override
            public Boolean apply(WebDriver input) {
                return (Boolean) getAuraUITestingUtil()
                        .getEval("return !window.tempVar;");
            }
        });
        getAuraUITestingUtil().findDomElement(By.cssSelector("#click")).click();
        getAuraUITestingUtil().waitUntil(new ExpectedCondition<Boolean>() {
            @Override
            public Boolean apply(WebDriver input) {
                return "meaningful".equals(getAuraUITestingUtil().getEval("return window.tempVar;"));
            }
        });
    }

    public void testPostAfterJsProviderChange() throws Exception {
        DefDescriptor<ComponentDef> cmpDesc = getAuraTestingUtil()
                .createStringSourceDescriptor(null, ComponentDef.class, null);
        DefDescriptor<?> providerDesc = definitionService
                .getDefDescriptor(cmpDesc, DefDescriptor.JAVASCRIPT_PREFIX,
                        ProviderDef.class);
        addSourceAutoCleanup(
                cmpDesc,
                String.format(
                        baseComponentTag,
                        String.format(
                                "controller='java://org.auraframework.components.test.java.controller.JavaTestController' provider='%s'",
                                providerDesc.getQualifiedName()),
                        "<button onclick='{!c.post}'>post</button><aura:attribute name='given' type='string' default=''/><div id='result'>{!v.given}</div>"));
        DefDescriptor<?> controllerDesc = definitionService
                .getDefDescriptor(cmpDesc, DefDescriptor.JAVASCRIPT_PREFIX,
                        ControllerDef.class);
        addSourceAutoCleanup(
                controllerDesc,
                "{post:function(c){var a=c.get('c.getString');a.setParams({param:'dummy'});$A.enqueueAction(a);}}");
        addSourceAutoCleanup(providerDesc,
                "({provide:function(){return {attributes:{'given':'silver spoon'}};}})");
        open(cmpDesc);
        assertEquals("silver spoon", getText(By.cssSelector("#result")));
        updateStringSource(providerDesc,
                "({provide:function(){return {attributes:{'given':'golden egg'}};}})");
        triggerServerAction();
        getAuraUITestingUtil().waitForElementText(By.cssSelector("#result"),
                "golden egg", true);
    }

    public void testPostAfterJsHelperChange() throws Exception {
        DefDescriptor<?> helperDesc = addSourceAutoCleanup(HelperDef.class, "({getHelp:function(){return 'simply';}})");
        DefDescriptor<ComponentDef> cmpDesc = setupTriggerComponent(
                String.format("helper='%s'", helperDesc.getQualifiedName()), "");
        open(cmpDesc);
        assertEquals("simply", getAuraUITestingUtil().getEval("return $A.getRoot().getDef().getHelper().getHelp();"));
        updateStringSource(helperDesc, "({getHelp:function(){return 'complicated';}})");
        triggerServerAction();
        getAuraUITestingUtil().waitUntil(new ExpectedCondition<Boolean>() {
            @Override
            public Boolean apply(WebDriver input) {
                getAuraUITestingUtil().waitForDocumentReady();
                getAuraUITestingUtil().waitForAuraFrameworkReady(null);
                return "complicated".equals(getAuraUITestingUtil()
                        .getEval("return window.$A && $A.getRoot() && $A.getRoot().getDef().getHelper().getHelp();"));
            }
        });
    }

    public void testPostAfterJsRendererChange() throws Exception {
        DefDescriptor<?> rendererDesc = addSourceAutoCleanup(
                RendererDef.class,
                "({render:function(){var e=document.createElement('div');e.id='target';e.appendChild(document.createTextNode('default'));var r=this.superRender();r.push(e);return r;}})");
        DefDescriptor<ComponentDef> cmpDesc = setupTriggerComponent(
                String.format("renderer='%s'", rendererDesc.getQualifiedName()), "");
        open(cmpDesc);
        assertEquals("default", getText(By.cssSelector("#target")));
        updateStringSource(
                rendererDesc,
                "({render:function(){var e=document.createElement('div');e.id='target';e.appendChild(document.createTextNode('custom'));var r=this.superRender();r.push(e);return r;}})");
        triggerServerAction();
        getAuraUITestingUtil().waitForElementText(By.cssSelector("#target"), "custom", true);
    }

    public void testPostAfterEventChange() throws Exception {
        final DefDescriptor<?> eventDesc = addSourceAutoCleanup(EventDef.class,
                "<aura:event type='APPLICATION'><aura:attribute name='explode' type='String' default='pow'/></aura:event>");
        DefDescriptor<ComponentDef> cmpDesc = setupTriggerComponent("",
                String.format("<aura:registerevent name='end' type='%s'/>", eventDesc.getDescriptorName()));
        open(cmpDesc);
        assertEquals("pow", getAuraUITestingUtil().getEval(String.format(
                "return $A.getEvt('%s').getDef().getAttributeDefs().explode['default'];",
                eventDesc.getDescriptorName())));
        updateStringSource(eventDesc,
                "<aura:event type='APPLICATION'><aura:attribute name='explode' type='String' default='kaboom'/></aura:event>");
        triggerServerAction();
        getAuraUITestingUtil().waitUntil(new ExpectedCondition<Boolean>() {
            @Override
            public Boolean apply(WebDriver input) {
                getAuraUITestingUtil().waitForDocumentReady();
                getAuraUITestingUtil().waitForAuraFrameworkReady(null);
                String eval = String
                        .format("return ((window.$A && $A.getEvt('%s')) && (window.$A && $A.getEvt('%s')).getDef().getAttributeDefs().explode['default']);",
                                eventDesc.getDescriptorName(), eventDesc.getDescriptorName());
                return "kaboom".equals(getAuraUITestingUtil().getEval(eval));
            }
        });
    }

    public void testPostAfterInterfaceChange() throws Exception {
        DefDescriptor<?> interfaceDesc = addSourceAutoCleanup(
                InterfaceDef.class,
                "<aura:interface support='GA' description=''><aura:attribute name='entrance' type='String' default='grand'/></aura:interface>");
        DefDescriptor<ComponentDef> cmpDesc = setupTriggerComponent(
                String.format("implements='%s'", interfaceDesc.getQualifiedName()),
                "<div id='target'>{!v.entrance}</div>");
        open(cmpDesc);
        assertEquals("grand", getText(By.cssSelector("#target")));
        updateStringSource(
                interfaceDesc,
                "<aura:interface support='GA' description=''><aura:attribute name='entrance' type='String' default='secret'/></aura:interface>");
        triggerServerAction();
        getAuraUITestingUtil().waitForElementText(By.cssSelector("#target"), "secret", true);
    }

    public void testPostAfterDependencyChange() throws Exception {
        final DefDescriptor<?> depDesc = addSourceAutoCleanup(ComponentDef.class,
                String.format(baseComponentTag, "", "<aura:attribute name='val' type='String' default='initial'/>"));
        DefDescriptor<ComponentDef> cmpDesc = setupTriggerComponent("",
                String.format("<aura:dependency resource='%s'/>", depDesc.getQualifiedName()));
        open(cmpDesc);
        assertEquals("initial", getAuraUITestingUtil().getEval(String.format(
                "return $A.componentService.getDef('%s').getAttributeDefs().getDef('val').getDefault();",
                depDesc.getDescriptorName())));
        updateStringSource(depDesc,
                String.format(baseComponentTag, "", "<aura:attribute name='val' type='String' default='final'/>"));
        triggerServerAction();
        getAuraUITestingUtil().waitUntil(new ExpectedCondition<Boolean>() {
            @Override
            public Boolean apply(WebDriver input) {
                getAuraUITestingUtil().waitForDocumentReady();
                getAuraUITestingUtil().waitForAuraFrameworkReady(null);
                return "final".equals(getAuraUITestingUtil().getEval(String
                        .format("return window.$A && $A.componentService.getDef('%s').getAttributeDefs().getDef('val').getDefault();",
                                depDesc.getDescriptorName())));
            }
        });
    }

    public void testGetClientRenderingAfterIncludeChange() throws Exception {
        DefDescriptor<?> helperDesc = addSourceAutoCleanup(HelperDef.class, "({})");
        DefDescriptor<?> libraryDesc = getAuraTestingUtil().createStringSourceDescriptor(null, LibraryDef.class, null);
        DefDescriptor<?> includeDesc = getAuraTestingUtil().createStringSourceDescriptor(null, IncludeDef.class,
                libraryDesc);
        addSourceAutoCleanup(includeDesc, "function(){return 'initialized'}");
        addSourceAutoCleanup(libraryDesc,
                String.format("<aura:library><aura:include name='%s'/></aura:library>", includeDesc.getName()));
        DefDescriptor<ComponentDef> cmpDesc = addSourceAutoCleanup(
                ComponentDef.class,
                String.format(baseComponentTag,
                        String.format("render='client' helper='%s'", helperDesc.getQualifiedName()),
                        String.format("<aura:import library='%s' property='mylib'/>",
                                libraryDesc.getDescriptorName())));

        open(cmpDesc);
        assertEquals("initialized", getAuraUITestingUtil().getEval(String.format(
                "return $A.getRoot().getDef().getHelper().mylib.%s;", includeDesc.getName())));

        updateStringSource(includeDesc, "function(){return 'updated'}");

        open(cmpDesc);
        assertEquals("updated", getAuraUITestingUtil().getEval(String.format(
                "return $A.getRoot().getDef().getHelper().mylib.%s;", includeDesc.getName())));
    }

    public void testGetClientRenderingAfterLibraryChange() throws Exception {
        DefDescriptor<?> helperDesc = addSourceAutoCleanup(HelperDef.class, "({})");
        DefDescriptor<?> libraryDesc = getAuraTestingUtil().createStringSourceDescriptor(null, LibraryDef.class, null);
        DefDescriptor<?> includeDesc = getAuraTestingUtil().createStringSourceDescriptor(null, IncludeDef.class,
                libraryDesc);
        addSourceAutoCleanup(includeDesc, "function(){return 'firstpick'}");
        DefDescriptor<?> includeOtherDesc = getAuraTestingUtil().createStringSourceDescriptor(null, IncludeDef.class,
                libraryDesc);
        addSourceAutoCleanup(includeOtherDesc, "function(){return 'secondpick'}");
        addSourceAutoCleanup(libraryDesc,
                String.format("<aura:library><aura:include name='%s'/></aura:library>", includeDesc.getName()));
        DefDescriptor<ComponentDef> cmpDesc = addSourceAutoCleanup(
                ComponentDef.class,
                String.format(baseComponentTag,
                        String.format("render='client' helper='%s'", helperDesc.getQualifiedName()),
                        String.format("<aura:import library='%s' property='mylib'/>",
                                libraryDesc.getDescriptorName())));

        open(cmpDesc);
        assertEquals("firstpick", getAuraUITestingUtil().getEval(String.format(
                "return $A.getRoot().getDef().getHelper().mylib.%s;", includeDesc.getName())));

        updateStringSource(libraryDesc,
                String.format("<aura:library><aura:include name='%s'/></aura:library>", includeOtherDesc.getName()));

        open(cmpDesc);
        assertEquals("secondpick", getAuraUITestingUtil().getEval(String.format(
                "return $A.getRoot().getDef().getHelper().mylib.%s;", includeOtherDesc.getName())));
    }

    public void testPostAfterIncludeChange() throws Exception {
        DefDescriptor<?> helperDesc = addSourceAutoCleanup(HelperDef.class, "({})");
        DefDescriptor<?> libraryDesc = getAuraTestingUtil().createStringSourceDescriptor(null, LibraryDef.class, null);
        final DefDescriptor<?> includeDesc = getAuraTestingUtil().createStringSourceDescriptor(null, IncludeDef.class,
                libraryDesc);
        addSourceAutoCleanup(includeDesc, "function(){return 'initialized'}");
        addSourceAutoCleanup(libraryDesc,
                String.format("<aura:library><aura:include name='%s'/></aura:library>", includeDesc.getName()));
        DefDescriptor<ComponentDef> cmpDesc = setupTriggerComponent(
                String.format("render='client' helper='%s'", helperDesc.getQualifiedName()),
                String.format("<aura:import library='%s' property='mylib'/>", libraryDesc.getDescriptorName()));

        open(cmpDesc);
        assertEquals("initialized", getAuraUITestingUtil().getEval(String.format(
                "return $A.getRoot().getDef().getHelper().mylib.%s;", includeDesc.getName())));

        updateStringSource(includeDesc, "function(){return 'updated'}");

        triggerServerAction();
        getAuraUITestingUtil().waitUntil(new ExpectedCondition<Boolean>() {
            @Override
            public Boolean apply(WebDriver input) {
                getAuraUITestingUtil().waitForDocumentReady();
                getAuraUITestingUtil().waitForAuraFrameworkReady(null);
                return "updated".equals(getAuraUITestingUtil().getEval(String.format(
                        "return $A.getRoot().getDef().getHelper().mylib.%s;", includeDesc.getName())));
            }
        });
    }

    public void testPostAfterLibraryChange() throws Exception {
        DefDescriptor<?> helperDesc = addSourceAutoCleanup(HelperDef.class, "({})");
        DefDescriptor<?> libraryDesc = getAuraTestingUtil().createStringSourceDescriptor(null, LibraryDef.class, null);
        DefDescriptor<?> includeDesc = getAuraTestingUtil().createStringSourceDescriptor(null, IncludeDef.class,
                libraryDesc);
        addSourceAutoCleanup(includeDesc, "function(){return 'firstpick'}");
        final DefDescriptor<?> includeOtherDesc = getAuraTestingUtil().createStringSourceDescriptor(null,
                IncludeDef.class, libraryDesc);
        addSourceAutoCleanup(includeOtherDesc, "function(){return 'secondpick'}");
        addSourceAutoCleanup(libraryDesc,
                String.format("<aura:library><aura:include name='%s'/></aura:library>", includeDesc.getName()));
        DefDescriptor<ComponentDef> cmpDesc = setupTriggerComponent(
                String.format("render='client' helper='%s'", helperDesc.getQualifiedName()),
                String.format("<aura:import library='%s' property='mylib'/>", libraryDesc.getDescriptorName()));

        open(cmpDesc);
        assertEquals("firstpick", getAuraUITestingUtil().getEval(String.format(
                "return $A.getRoot().getDef().getHelper().mylib.%s;", includeDesc.getName())));

        updateStringSource(libraryDesc,
                String.format("<aura:library><aura:include name='%s'/></aura:library>", includeOtherDesc.getName()));

        triggerServerAction();
        getAuraUITestingUtil().waitUntil(new ExpectedCondition<Boolean>() {
            @Override
            public Boolean apply(WebDriver input) {
                getAuraUITestingUtil().waitForDocumentReady();
                getAuraUITestingUtil().waitForAuraFrameworkReady(null);
                return "secondpick".equals(getAuraUITestingUtil().getEval(String.format(
                        "return $A.getRoot().getDef().getHelper().mylib.%s;", includeOtherDesc.getName())));
            }
        });
    }

    /**
     * After every server action response we persist in storage what apps/cmps have been loaded from the server
     * that weren't included in the initial load. When we start a new context on the client, we load this info
     * from storage so the server can know on the next request if the client is out of sync or not.
     *
     * This test verifies that behavior by retrieving a component from the server, modifying its source on the server,
     * reloading the page, then requesting the same component from the server, asserting that the new source is returned.
     * Without persisting the context on the client, the server would never know the client's version of the component
     * we're loading is out of date and after a page reload the old component would be displayed.
     *
     * See W-2909975 for additional details.
     */
    public void testReloadAfterMarkupChange() throws Exception {
        DefDescriptor<ComponentDef> cmpDesc = addSourceAutoCleanup(
                ComponentDef.class,
                String.format(
                        baseComponentTag,
                        "",
                        "<div>cmp" + new Date().getTime() + "</div>"));

        DefDescriptor<ApplicationDef> appDesc = addSourceAutoCleanup(
                ApplicationDef.class,
                String.format(
                        baseApplicationTag,
                        "template='auraStorageTest:componentDefStorageTemplate'",
                        "<ui:button label='loadCmp' press='{!c.loadCmp}'/><div id='container' aura:id='container'>app</div>"));

        String cmpDefString = cmpDesc.getNamespace() + ":" + cmpDesc.getName();
        DefDescriptor<?> controllerDesc = Aura.getDefinitionService()
                .getDefDescriptor(appDesc, DefDescriptor.JAVASCRIPT_PREFIX,
                        ControllerDef.class);
        addSourceAutoCleanup(
                controllerDesc,
                "{loadCmp:function(cmp){$A.createComponent('" + cmpDefString
                        + "', {}, function(newCmp) {cmp.find('container').set('v.body', newCmp);});}}");

        open(appDesc);

        // Grab whatever context is currently persisted in storage to compare later
        final String getPersistedContextScript = "var callback = arguments[arguments.length - 1];" +
                "if ($A && $A.storageService.getStorage('actions')){" +
                "var storage = $A.storageService.getStorage('actions');" +
                "storage.get('$AuraContext$').then(function(item) { callback(item ? item.value : null) })" +
                "} else { callback(null);}";

        getDriver().manage().timeouts().setScriptTimeout(getAuraUITestingUtil().getTimeout(), TimeUnit.SECONDS);
        final Object initialLoaded = ((JavascriptExecutor) getDriver()).executeAsyncScript(getPersistedContextScript);

        // Retrieve cmp from server and wait for callback output
        getAuraUITestingUtil().findDomElement(By.cssSelector("button")).click();
        getAuraUITestingUtil().waitUntil(new ExpectedCondition<Boolean>() {
            @Override
            public Boolean apply(WebDriver d) {
                String text = getText(By.cssSelector("#container"));
                return text.startsWith("cmp");
            }
        }, "Text of app never updated after retrieving component from server");

        // Update the source of the component we retrieve from storage
        String newCmpText = "<div>cmpNew" + new Date().getTime() + "</div>";
        updateStringSource(cmpDesc, String.format(baseComponentTag, "", newCmpText));

        // Wait for the context returned from server during the cmp retrieval to be persisted on the client. We wait
        // until what was in the storage before the server call has changed.
        getAuraUITestingUtil().waitUntil(new ExpectedCondition<Boolean>() {
            @Override
            public Boolean apply(WebDriver d) {
                Object newLoaded = ((JavascriptExecutor) getDriver()).executeAsyncScript(getPersistedContextScript);
                return initialLoaded != newLoaded;
            }
        }, "Context never persisted on client after server call");

        getDriver().navigate().refresh();

        // After refresh, the page will fire the getApplication bootstrap action, which will get a ClientOutOfSync
        // as the response, dump the storages and reload. Instead of trying to wait for the double reload, wait for
        // the storages to clear.
        getAuraUITestingUtil().waitUntil(new ExpectedCondition<Boolean>() {
            @Override
            public Boolean apply(WebDriver d) {
                String script = "var callback = arguments[arguments.length - 1];" +
                        "if ($A && $A.storageService.getStorage('ComponentDefStorage')){" +
                        "var storage = $A.storageService.getStorage('ComponentDefStorage');" +
                        "storage.getAll().then(function(items){ callback(items) })" +
                        "} else { callback(null);}";
                Object result = null;
                try {
                    result = ((JavascriptExecutor) getDriver()).executeAsyncScript(script);
                } catch (WebDriverException e) {
                    // If the page reloads during our script WebDriver will throw an error.
                    if (!e.getMessage().contains("document unloaded while waiting for result")) {
                        throw e;
                    }
                }
                return result != null && ((ArrayList<?>) result).size() == 0;
            }
        }, "Storages never cleared after reload");

        // The page will reload after the storage is cleared so wait for it to be fully initialized then retrieve
        // the original component from the server and verify it has the updated source.
        getAuraUITestingUtil().waitForAuraInit();
        getAuraUITestingUtil().findDomElement(By.cssSelector("button")).click();
        getAuraUITestingUtil().waitForElementTextContains(By.cssSelector("#container"), "cmpNew", true);
    }
}
