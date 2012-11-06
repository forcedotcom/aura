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
package org.auraframework.http;

import org.auraframework.Aura;
import org.auraframework.controller.java.ServletConfigController;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.InterfaceDef;
import org.auraframework.system.AuraContext.Access;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.test.WebDriverTestCase;
import org.auraframework.test.annotation.UnAdaptableTest;
import org.junit.Ignore;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedCondition;
import org.openqa.selenium.support.ui.WebDriverWait;

/**
 * What should you see when something goes wrong.
 *
 *
 * @since 0.0.262
 */
@UnAdaptableTest
public class ExceptionHandlingUITest extends WebDriverTestCase {
    public ExceptionHandlingUITest(String name) {
        super(name);
    }

    private static final String baseAppTag = "<aura:application %s securityProvider='java://org.auraframework.components.security.SecurityProviderAlwaysAllows'>%s</aura:application>";

    private void setProdConfig() throws Exception {
        ServletConfigController.setProductionConfig(true);
        Aura.getContextService().startContext(Mode.DEV, Format.HTML, Access.AUTHENTICATED);
    }

    private void setProdContextWithoutConfig() throws Exception {
        Aura.getContextService().startContext(Mode.PROD, Format.HTML, Access.AUTHENTICATED);
    }

    private String getAppUrl(String attributeMarkup, String bodyMarkup) throws Exception {
        String appMarkup = String.format(baseAppTag, attributeMarkup, bodyMarkup);
        DefDescriptor<ApplicationDef> add = addSource(appMarkup, ApplicationDef.class);
        return String.format("/%s/%s.app", add.getNamespace(), add.getName());
    }

    private void assertNoStacktrace() throws Exception {
        String baseSelector = "div#auraErrorMessage";
        WebElement elem = findDomElement(By.cssSelector(baseSelector));
        if (elem == null) {
            fail("error message not found");
        }
        String actual = elem.getText().replaceAll("\\s+", " ");
        assertEquals("Unable to process your request", actual);
    }

    private void assertStacktrace(String messageStartsWith, String... causeStartsWith) throws Exception {
        String baseSelector = "div#auraErrorMessage";
        WebElement elem = findDomElement(By.cssSelector(baseSelector));
        if (elem == null) {
            fail("error message not found");
        }
        String actual = elem.getText().replaceAll("\\s+", " ");
        if (!actual.contains(messageStartsWith)) {
            fail("unexpected error message - expected <" + messageStartsWith + "> but got <" + actual + ">");
        }
        String childSelector = baseSelector;
        for (String expectedCause : causeStartsWith) {
            childSelector = childSelector + " > init";
            WebElement childElem = findDomElement(By.cssSelector(childSelector));
            if (childElem == null) {
                fail("cause not found");
            }
            actual = childElem.getText().replaceAll("\\s+", " ");
            if (!actual.contains(expectedCause)) {
                fail("unexpected cause - expected <" + expectedCause + "> but got <" + actual + ">");
            }
        }
    }

    /**
     * Generic error message displayed in PRODUCTION if component provider instantiation throws.
     */
    public void testProdCmpProviderThrowsDuringInstantiation() throws Exception {
        setProdConfig();
        DefDescriptor<?> cdd = addSource(
                "<aura:interface provider='java://org.auraframework.impl.java.provider.TestProviderThrowsDuringInstantiation'></aura:interface>",
                InterfaceDef.class);
        openNoAura(getAppUrl("", String.format("<%s:%s/>", cdd.getNamespace(), cdd.getName())));
        assertNoStacktrace();
    }

    /**
     * Stacktrace displayed in non-PRODUCTION if component provider instantiation throws.
     */
    public void testCmpProviderThrowsDuringInstantiation() throws Exception {
        setProdContextWithoutConfig();
        DefDescriptor<?> cdd = addSource(
                "<aura:interface provider='java://org.auraframework.impl.java.provider.TestProviderThrowsDuringInstantiation'></aura:interface>",
                InterfaceDef.class);
        openNoAura(getAppUrl("", String.format("<%s:%s/>", cdd.getNamespace(), cdd.getName())));
        assertStacktrace(
                "java.lang.RuntimeException: that was intentional at org.auraframework.impl.java.provider.TestProviderThrowsDuringInstantiation.",
                "(TestProviderThrowsDuringInstantiation.java:");
    }

    /**
     * Generic error message displayed in PRODUCTION if application provider instantiation throws.
     */
    public void testProdAppProviderThrowsDuringInstantiation() throws Exception {
        setProdConfig();
        openNoAura(getAppUrl("provider='java://org.auraframework.impl.java.provider.TestProviderThrowsDuringInstantiation'", ""));
        assertNoStacktrace();
    }

    /**
     * Stacktrace displayed in non-PRODUCTION if application provider instantiation throws.
     */
    public void testAppProviderThrowsDuringInstantiation() throws Exception {
        setProdContextWithoutConfig();
        openNoAura(getAppUrl("provider='java://org.auraframework.impl.java.provider.TestProviderThrowsDuringInstantiation'", ""));
        assertStacktrace("that was intentional at org.auraframework.impl.java.provider.TestProviderThrowsDuringInstantiation.");
    }

    /**
     * Generic error message displayed in PRODUCTION if component provider instantiation throws.
     */
    public void testProdCmpProviderThrowsDuringProvide() throws Exception {
        setProdConfig();
        DefDescriptor<?> cdd = addSource(
                "<aura:interface provider='java://org.auraframework.impl.java.provider.TestProviderThrowsDuringProvide'></aura:interface>",
                InterfaceDef.class);
        openNoAura(getAppUrl("", String.format("<%s:%s/>", cdd.getNamespace(), cdd.getName())));
        assertNoStacktrace();
    }

    /**
     * Stacktrace displayed in non-PRODUCTION if component provider instantiation throws.
     */
    public void testCmpProviderThrowsDuringProvide() throws Exception {
        setProdContextWithoutConfig();
        DefDescriptor<?> cdd = addSource(
                "<aura:interface provider='java://org.auraframework.impl.java.provider.TestProviderThrowsDuringProvide'></aura:interface>",
                InterfaceDef.class);
        openNoAura(getAppUrl("", String.format("<%s:%s/>", cdd.getNamespace(), cdd.getName())));
        assertStacktrace("java.lang.RuntimeException: out of stock at .(org.auraframework.impl.java.provider.TestProviderThrowsDuringProvide)");
    }

    /**
     * Generic error message displayed in PRODUCTION if component model instantiation throws.
     */
    public void testProdCmpModelThrowsDuringInstantiation() throws Exception {
        setProdConfig();
        DefDescriptor<?> cdd = addSource(
                "<aura:component model='java://org.auraframework.impl.java.model.TestModelThrowsDuringInstantiation'></aura:component>",
                ComponentDef.class);
        openNoAura(getAppUrl("", String.format("<%s:%s/>", cdd.getNamespace(), cdd.getName())));
        assertNoStacktrace();
    }

    /**
     * Stacktrace displayed in non-PRODUCTION if component model instantiation throws.
     */
    public void testCmpModelThrowsDuringInstantiation() throws Exception {
        setProdContextWithoutConfig();
        DefDescriptor<?> cdd = addSource(
                "<aura:component model='java://org.auraframework.impl.java.model.TestModelThrowsDuringInstantiation'></aura:component>",
                ComponentDef.class);
        openNoAura(getAppUrl("", String.format("<%s:%s/>", cdd.getNamespace(), cdd.getName())));
        assertStacktrace(
                "java.lang.RuntimeException: surprise! at org.auraframework.impl.java.model.TestModelThrowsDuringInstantiation.",
                "(TestModelThrowsDuringInstantiation.java:");
    }

    /**
     * Generic error message displayed in PRODUCTION if component renderer instantiation throws.
     */
    public void testProdCmpRendererThrowsDuringInstantiation() throws Exception {
        setProdConfig();
        DefDescriptor<?> cdd = addSource(
                "<aura:component renderer='java://org.auraframework.impl.renderer.sampleJavaRenderers.TestRendererThrowsDuringInstantiation'></aura:component>",
                ComponentDef.class);
        openNoAura(getAppUrl("", String.format("<%s:%s/>", cdd.getNamespace(), cdd.getName())));
        assertNoStacktrace();
    }

    /**
     * Stacktrace displayed in non-PRODUCTION if component renderer instantiation throws.
     */
    public void testCmpRendererThrowsDuringInstantiation() throws Exception {
        setProdContextWithoutConfig();
        DefDescriptor<?> cdd = addSource(
                "<aura:component renderer='java://org.auraframework.impl.renderer.sampleJavaRenderers.TestRendererThrowsDuringInstantiation'></aura:component>",
                ComponentDef.class);
        openNoAura(getAppUrl("", String.format("<%s:%s/>", cdd.getNamespace(), cdd.getName())));
        assertStacktrace(
                "java.lang.Error: invisible me at org.auraframework.impl.renderer.sampleJavaRenderers.TestRendererThrowsDuringInstantiation.",
                "(TestRendererThrowsDuringInstantiation.java:");
    }

    /**
     * Generic error message displayed in PRODUCTION if component renderer throws.
     */
    @Ignore("W-1308475: there is a dupe div#auraErrorMessage")
    public void testProdCmpRendererThrowsDuringRender() throws Exception {
        setProdConfig();
        DefDescriptor<?> cdd = addSource(
                "<aura:component renderer='java://org.auraframework.impl.renderer.sampleJavaRenderers.TestRendererThrowingException'></aura:component>",
                ComponentDef.class);
        openNoAura(getAppUrl("", String.format("<%s:%s/>", cdd.getNamespace(), cdd.getName())));
        assertNoStacktrace();
    }

    /**
     * Stacktrace displayed in non-PRODUCTION if component renderer throws.
     */
    @Ignore("W-1308475: there is a dupe div#auraErrorMessage")
    public void testCmpRendererThrowsDuringRender() throws Exception {
        setProdContextWithoutConfig();
        DefDescriptor<?> cdd = addSource(
                "<aura:component renderer='java://org.auraframework.impl.renderer.sampleJavaRenderers.TestRendererThrowingException'></aura:component>",
                ComponentDef.class);
        openNoAura(getAppUrl("", String.format("<%s:%s/>", cdd.getNamespace(), cdd.getName())));
        assertStacktrace("org.auraframework.throwable.AuraExecutionException: org.auraframework.throwable.AuraExecutionException: org.auraframework.throwable.AuraExecutionException: org.auraframework.throwable.AuraExecutionException: org.auraframework.throwable.AuraExecutionException: org.auraframework.throwable.AuraExecutionException: java.lang.ArithmeticException at .(org.auraframework.renderer.ComponentRenderer)");
    }

    /**
     * Parse error stack trace for application includes filename along with row,col
     */
    public void testAppThrowsWithFileName() throws Exception {
        setProdContextWithoutConfig();
        //load the defination in the loader
        DefDescriptor<?> add = addSource(
                "<aura:application securityProvider='java://org.auraframework.components.security.SecurityProviderAlwaysAllows''></aura:application>",
                ApplicationDef.class);
        openNoAura(String.format("/%s/%s.app", add.getNamespace(), add.getName()));
        assertStacktrace("org.auraframework.throwable.AuraUnhandledException: "+ String.format("markup://%s:%s:1,111: ParseError at [row,col]:[2,111]", add.getNamespace(), add.getName()));
    }

    /**
     * Parse error stack trace for controller includes filename along with row,col
     */

    public void testCntrlThrowsWithFileName() throws Exception{
        String fileName = "auratest/parseError";
        openNoAura(fileName + ".cmp");
        assertStacktrace("org.auraframework.throwable.AuraRuntimeException: ");
        assertStacktrace("auratest/parseError/parseErrorController.js");
    }

    /**
     * Default handler for ClientOutOfSync will reload the page.
     */
    public void testClientOutOfSyncDefaultHandler() throws Exception {
        open("/updateTest/updateWithoutHandling.cmp?text=initial");

        // make a client-side change to the page
        findDomElement(By.cssSelector(".update")).click();
        waitForElementText(findDomElement(By.cssSelector(".uiOutputText")), "modified", true, 3000);

        // make server POST call with outdated lastmod
        findDomElement(By.cssSelector(".trigger")).click();

        // check that page is reloaded by seeing that prior client-side change is gone
        WebDriverWait wait = new WebDriverWait(getDriver(), 30000);
        wait.until(new ExpectedCondition<Boolean>() {
            @Override
            public Boolean apply(WebDriver d) {
                WebElement elem = findDomElement(By.cssSelector(".uiOutputText"));
                return (elem != null) && "initial".equals(elem.getText());
            }
        });
    }
}
