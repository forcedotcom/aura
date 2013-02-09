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
import org.auraframework.test.annotation.ThreadHostileTest;
import org.auraframework.test.annotation.UnAdaptableTest;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedCondition;
import org.openqa.selenium.support.ui.WebDriverWait;

/**
 * What should you see when something goes wrong. {@link ThreadHostile} due to
 * setProdConfig and friends.
 * 
 * @since 0.0.262
 */
@UnAdaptableTest
@ThreadHostileTest
public class ExceptionHandlingUITest extends WebDriverTestCase {
    public ExceptionHandlingUITest(String name) {
        super(name);
    }

    private static final String baseAppTag = "<aura:application %s securityProvider='java://org.auraframework.components.security.SecurityProviderAlwaysAllows'>%s</aura:application>";

    private void setProdConfig() throws Exception {
        ServletConfigController.setProductionConfig(true);
        Aura.getContextService().endContext();
        Aura.getContextService().startContext(Mode.DEV, Format.HTML, Access.AUTHENTICATED);
    }

    private void setProdContextWithoutConfig() throws Exception {
        Aura.getContextService().endContext();
        Aura.getContextService().startContext(Mode.PROD, Format.HTML, Access.AUTHENTICATED);
    }

    private String getAppUrl(String attributeMarkup, String bodyMarkup) throws Exception {
        String appMarkup = String.format(baseAppTag, attributeMarkup, bodyMarkup);
        DefDescriptor<ApplicationDef> add = addSourceAutoCleanup(ApplicationDef.class, appMarkup);
        return String.format("/%s/%s.app", add.getNamespace(), add.getName());
    }

    /**
     * Due to duplicate div#auraErrorMessage on exceptions from server
     * rendering, use different CSS selector to check exception message.
     * W-1308475 - Never'd removal/change of duplicate div#auraErrorMessage
     */
    private void assertNoStacktraceServerRendering() throws Exception {
        WebElement elem = findDomElement(By
                .xpath("//div[@class='auraMsgMask auraForcedErrorBox']//div[@id='auraErrorMessage']"));
        if (elem == null) {
            fail("error message not found");
        }
        String actual = elem.getText().replaceAll("\\s+", " ");
        assertEquals("Unable to process your request", actual);
    }

    private void assertNoStacktrace() throws Exception {
        String actual = getQuickFixMessage().replaceAll("\\s+", " ");
        assertEquals("Unable to process your request", actual);
    }

    /**
     * Due to duplicate div#auraErrorMessage on exceptions from server
     * rendering, use different CSS selector to check exception message.
     * W-1308475 - Never'd removal/change of duplicate div#auraErrorMessage
     */
    private void assertStacktraceServerRendering(String messageStartsWith, String... causeStartsWith) throws Exception {
        WebElement elem = findDomElement(By
                .xpath("//div[@class='auraMsgMask auraForcedErrorBox']//div[@id='auraErrorMessage']"));
        if (elem == null) {
            fail("error message not found");
        }
        String actual = elem.getText().replaceAll("\\s+", " ");
        assertStacktraceCommon(actual, messageStartsWith, causeStartsWith);
    }

    private void assertStacktrace(String messageStartsWith, String... causeStartsWith) throws Exception {
        String actual = getQuickFixMessage().replaceAll("\\s+", " ");
        assertStacktraceCommon(actual, messageStartsWith, causeStartsWith);
    }

    private void assertStacktraceCommon(String actual, String messageStartsWith, String... causeStartsWith)
            throws Exception {
        if (!actual.contains(messageStartsWith)) {
            fail("unexpected error message - expected <" + messageStartsWith + "> but got <" + actual + ">");
        }
        String childSelector = "#auraErrorMessage";
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
     * Generic error message displayed in PRODUCTION if component provider
     * instantiation throws.
     */
    public void testProdCmpProviderThrowsDuringInstantiation() throws Exception {
        setProdConfig();
        DefDescriptor<?> cdd = addSourceAutoCleanup(
                InterfaceDef.class,
                "<aura:interface provider='java://org.auraframework.impl.java.provider.TestProviderThrowsDuringInstantiation'></aura:interface>");
        openRaw(getAppUrl("", String.format("<%s:%s/>", cdd.getNamespace(), cdd.getName())));
        assertNoStacktrace();
    }

    /**
     * Stacktrace displayed in non-PRODUCTION if component provider
     * instantiation throws.
     */
    public void testCmpProviderThrowsDuringInstantiation() throws Exception {
        setProdContextWithoutConfig();
        DefDescriptor<?> cdd = addSourceAutoCleanup(
                InterfaceDef.class,
                "<aura:interface provider='java://org.auraframework.impl.java.provider.TestProviderThrowsDuringInstantiation'></aura:interface>");
        openRaw(getAppUrl("", String.format("<%s:%s/>", cdd.getNamespace(), cdd.getName())));
        assertStacktrace(
                "java.lang.RuntimeException: that was intentional at org.auraframework.impl.java.provider.TestProviderThrowsDuringInstantiation.",
                "(TestProviderThrowsDuringInstantiation.java:");
    }

    /**
     * Generic error message displayed in PRODUCTION if application provider
     * instantiation throws.
     */
    public void testProdAppProviderThrowsDuringInstantiation() throws Exception {
        setProdConfig();
        openRaw(getAppUrl(
                "provider='java://org.auraframework.impl.java.provider.TestProviderThrowsDuringInstantiation'", ""));
        assertNoStacktrace();
    }

    /**
     * Stacktrace displayed in non-PRODUCTION if application provider
     * instantiation throws.
     */
    public void testAppProviderThrowsDuringInstantiation() throws Exception {
        setProdContextWithoutConfig();
        openRaw(getAppUrl(
                "provider='java://org.auraframework.impl.java.provider.TestProviderThrowsDuringInstantiation'", ""));
        assertStacktrace("that was intentional at org.auraframework.impl.java.provider.TestProviderThrowsDuringInstantiation.");
    }

    /**
     * Generic error message displayed in PRODUCTION if component provider
     * instantiation throws.
     */
    public void testProdCmpProviderThrowsDuringProvide() throws Exception {
        setProdConfig();
        DefDescriptor<?> cdd = addSourceAutoCleanup(
                InterfaceDef.class,
                "<aura:interface provider='java://org.auraframework.impl.java.provider.TestProviderThrowsDuringProvide'></aura:interface>");
        openRaw(getAppUrl("", String.format("<%s:%s/>", cdd.getNamespace(), cdd.getName())));
        assertNoStacktrace();
    }

    /**
     * Stacktrace displayed in non-PRODUCTION if component provider
     * instantiation throws.
     */
    public void testCmpProviderThrowsDuringProvide() throws Exception {
        setProdContextWithoutConfig();
        DefDescriptor<?> cdd = addSourceAutoCleanup(
                InterfaceDef.class,
                "<aura:interface provider='java://org.auraframework.impl.java.provider.TestProviderThrowsDuringProvide'></aura:interface>");
        openRaw(getAppUrl("", String.format("<%s:%s/>", cdd.getNamespace(), cdd.getName())));
        assertStacktrace("java.lang.RuntimeException: out of stock at .(org.auraframework.impl.java.provider.TestProviderThrowsDuringProvide)");
    }

    /**
     * Generic error message displayed in PRODUCTION if component model
     * instantiation throws.
     */
    public void testProdCmpModelThrowsDuringInstantiation() throws Exception {
        setProdConfig();
        DefDescriptor<?> cdd = addSourceAutoCleanup(ComponentDef.class,
                "<aura:component model='java://org.auraframework.impl.java.model.TestModelThrowsDuringInstantiation'></aura:component>");
        openRaw(getAppUrl("", String.format("<%s:%s/>", cdd.getNamespace(), cdd.getName())));
        assertNoStacktrace();
    }

    /**
     * Stacktrace displayed in non-PRODUCTION if component model instantiation
     * throws.
     */
    public void testCmpModelThrowsDuringInstantiation() throws Exception {
        setProdContextWithoutConfig();
        DefDescriptor<?> cdd = addSourceAutoCleanup(ComponentDef.class,
                "<aura:component model='java://org.auraframework.impl.java.model.TestModelThrowsDuringInstantiation'></aura:component>");
        openRaw(getAppUrl("", String.format("<%s:%s/>", cdd.getNamespace(), cdd.getName())));
        assertStacktrace(
                "java.lang.RuntimeException: surprise! at org.auraframework.impl.java.model.TestModelThrowsDuringInstantiation.",
                "(TestModelThrowsDuringInstantiation.java:");
    }

    /**
     * Generic error message displayed in PRODUCTION if component renderer
     * instantiation throws.
     */
    public void testProdCmpRendererThrowsDuringInstantiation() throws Exception {
        setProdConfig();
        DefDescriptor<?> cdd = addSourceAutoCleanup(
                ComponentDef.class,
                "<aura:component renderer='java://org.auraframework.impl.renderer.sampleJavaRenderers.TestRendererThrowsDuringInstantiation'></aura:component>");
        openRaw(getAppUrl("", String.format("<%s:%s/>", cdd.getNamespace(), cdd.getName())));
        assertNoStacktrace();
    }

    /**
     * Stacktrace displayed in non-PRODUCTION if component renderer
     * instantiation throws.
     */
    public void testCmpRendererThrowsDuringInstantiation() throws Exception {
        setProdContextWithoutConfig();
        DefDescriptor<?> cdd = addSourceAutoCleanup(
                ComponentDef.class,
                "<aura:component renderer='java://org.auraframework.impl.renderer.sampleJavaRenderers.TestRendererThrowsDuringInstantiation'></aura:component>");
        openRaw(getAppUrl("", String.format("<%s:%s/>", cdd.getNamespace(), cdd.getName())));
        assertStacktrace(
                "java.lang.Error: invisible me at org.auraframework.impl.renderer.sampleJavaRenderers.TestRendererThrowsDuringInstantiation.",
                "(TestRendererThrowsDuringInstantiation.java:");
    }

    /**
     * Generic error message displayed in PRODUCTION if component renderer
     * throws.
     */
    public void testProdCmpRendererThrowsDuringRender() throws Exception {
        setProdConfig();
        DefDescriptor<?> cdd = addSourceAutoCleanup(
                ComponentDef.class,
                "<aura:component renderer='java://org.auraframework.impl.renderer.sampleJavaRenderers.TestRendererThrowingException'></aura:component>");
        openRaw(getAppUrl("", String.format("<%s:%s/>", cdd.getNamespace(), cdd.getName())));
        assertNoStacktraceServerRendering();
    }

    /**
     * Stacktrace displayed in non-PRODUCTION if component renderer throws.
     */
    public void testCmpRendererThrowsDuringRender() throws Exception {
        setProdContextWithoutConfig();
        DefDescriptor<?> cdd = addSourceAutoCleanup(
                ComponentDef.class,
                "<aura:component renderer='java://org.auraframework.impl.renderer.sampleJavaRenderers.TestRendererThrowingException'></aura:component>");
        openRaw(getAppUrl("", String.format("<%s:%s/>", cdd.getNamespace(), cdd.getName())));
        assertStacktraceServerRendering("org.auraframework.throwable.AuraExecutionException: org.auraframework."
                + "renderer.ComponentRenderer: org.auraframework.throwable.AuraExecutionException: org.auraframework."
                + "renderer.HtmlRenderer: org.auraframework.throwable.AuraExecutionException: org.auraframework."
                + "renderer.HtmlRenderer: org.auraframework.throwable.AuraExecutionException: org.auraframework."
                + "renderer.ExpressionRenderer: org.auraframework.throwable.AuraExecutionException: org.auraframework."
                + "renderer.ComponentRenderer: org.auraframework.throwable.AuraExecutionException: org.auraframework."
                + "impl.renderer.sampleJavaRenderers.TestRendererThrowingException: java.lang.ArithmeticException at");
    }

    /**
     * Parse error stack trace for application includes filename along with
     * row,col
     */
    public void testAppThrowsWithFileName() throws Exception {
        setProdContextWithoutConfig();
        // load the defination in the loader
        DefDescriptor<?> add = addSourceAutoCleanup(
                ApplicationDef.class,
                "<aura:application securityProvider='java://org.auraframework.components.security.SecurityProviderAlwaysAllows''></aura:application>");
        openRaw(String.format("/%s/%s.app", add.getNamespace(), add.getName()));
        assertStacktrace("org.auraframework.throwable.AuraUnhandledException: "
                + String.format("markup://%s:%s:1,111: ParseError at [row,col]:[2,111]", add.getNamespace(),
                        add.getName()));
    }

    /**
     * Parse error stack trace for controller includes filename along with
     * row,col
     */

    public void testCntrlThrowsWithFileName() throws Exception {
        String fileName = "auratest/parseError";
        openRaw(fileName + ".cmp");
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
        assertTrue("Page was not changed after client action", isElementPresent(By.cssSelector(".reloadMarker")));

        // make server POST call with outdated lastmod
        findDomElement(By.cssSelector(".trigger")).click();

        // Wait till prior prior client-side change is gone indicating page
        // reload
        WebDriverWait wait = new WebDriverWait(getDriver(), 15000);
        wait.until(new ExpectedCondition<Boolean>() {
            @Override
            public Boolean apply(WebDriver d) {
                return !isElementPresent(By.cssSelector(".reloadMarker"));
            }
        });
        // Wait for page to reload and aura framework initialization
        waitForAuraInit();
        waitForElementText(findDomElement(By.cssSelector(".uiOutputText")), "initial", true, 3000);
    }
}
