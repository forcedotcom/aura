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
package org.auraframework.impl.root.component.rendering;

import org.auraframework.test.WebDriverTestCase;
import org.auraframework.test.annotation.TestLabels;
import org.openqa.selenium.By;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.WebDriver;

import com.google.common.base.Function;

/**
 * This class has tests for rendering components on a page.
 * Components/applications can be renderer server side or client side. A
 * detection logic checks if a component can be rendered serverside. This
 * detection logic can be forces by including a "render = 'server'" attribute on
 * the top level component tag. By default the detection logic is auto on. This
 * 'render' specification overrides the detection logic. If render = 'server',
 * the aura servlet assumes the component can be rendered serverside and tries
 * to render it. If render = 'client', the aura servlet assumes the component
 * should be rendered clientside. In context of tests, Applications and
 * components can be used interchangeably.
 * 
 * @hierarchy Aura.Components.Renderer
 * @priority high
 * @userStory a07B0000000EWWg
 */
@TestLabels("auraSanity")
public class ComponentRenderingUITest extends WebDriverTestCase {
    public ComponentRenderingUITest(String name) {
        super(name);
    }

    /**
     * Verify that text, expressions and HTML can be rendered serverside. Text,
     * Expression and Html are the basic building blocks of aura. These can be
     * rendered server side. This test verifies that.
     */
    public void testServerSideRenderingOfBasicComponents() throws Exception {
        String xpath = "//div[contains(@class,'%s')]";
        String[][] htmlEntities = { { "nonBreakingSpace", " " }, { "copyRight", "©" },
                { "leftAngleQuotationMark", "«" }, { "degree", "°" }, { "spacingAcute", "´" },
                { "rightAngleQuotationMark", "»" }, { "apostrophe", "'" }, { "euro", "€" } };
        String[][] XMLEntities = { { "greaterThan", ">" }, { "lessThan", "<" }, { "ampersand", "&" } };
        openNoAura("/auratest/test_ServerRendering.app");
        // The component has no 'render' specification, redering logic should be
        // in auto detect mode.
        assertFalse("Aura client engine should not be present on page.", isAuraClientEnginePresentOnPage());
        // Verify HTML entities are rendered
        assertTrue(isElementPresent(By.xpath("//div[contains(@class,'textComponent')]")));
        // Verify the special HTML entities
        for (int i = 0; i < htmlEntities.length; i++) {
            assertEquals("Serverside Rendering: Following HTML entity not displayed as expected:", htmlEntities[i][1],
                    getText(By.xpath(String.format(xpath, htmlEntities[i][0]))));
        }
        for (int i = 0; i < XMLEntities.length; i++) {
            assertEquals("Serverside Rendering: Following XML entity not displayed as expected", XMLEntities[i][1],
                    getText(By.xpath(String.format(xpath, XMLEntities[i][0]))));
        }

        // Verify that Text is rendered
        assertEquals("Serverside Rendering: Text component not rendered.", getName(),
                getText(By.xpath("//div[contains(@class,'textComponent')]")));

        // Verify that expression is rendered
        assertEquals("Serverside Rendering: Expression not rendered.", getName(),
                getText(By.xpath("//div[contains(@class,'expressionComponent')]")));

    }

    /**
     * Verify that Components that have a server side renderer can still use the
     * render='client' specification.
     */
    public void testCmpWithJavaRendererButRenderEqualsClient() throws Exception {
        open("/test/test_ServerRendererOnly.cmp");
        assertTrue("Aura client engine not present on page. The component had a render='client' specification.",
                isAuraClientEnginePresentOnPage());
        assertTrue("Using java renderer failed.",
                getText(By.cssSelector("body")).contains("salesforce.com, inc, All rights reserved"));
        assertTrue("Using java renderer failed", isElementPresent(By.xpath("//a[@href='http://www.salesforce.com']")));

    }

    /**
     * Verify that an application that was rendered totally on the server.
     * <ol>
     * <li>Verify that Components that have a server side renderer and a
     * render='server' specification will be renderer server side. There will be
     * no aura client engine on the page.</li>
     * <li>Overriding facet specification for 'render': The sample
     * application(test_SimpleServerRenderedPage.app) has a component as facet:
     * test:test_JavaRndr_Component test:test_JavaRndr_Component has a
     * render='client' specification. But its body has nothing that cannot be
     * rendered serverside. So this component's render tag is not considered at
     * all.</li>
     * <li>The inner facet is an interface. This has both a client renderer and
     * server renderer. Only the server renderer is used.</li>
     * </ol>
     * 
     * <pre>
     *     test_SimpleServerRenderedPage.app   render = 'server'
     *     {
     *          test:test_JavaRndr_Component   render='client'
     *          {
     *              test:test_JavaRndr_Abstract  renderer="java://org.auraframework.impl.renderer.sampleJavaRenderers.TestSimpleRenderer"
     *                  /\
     *                  ||
     *                  test:test_JavaRndr_Impl renderer="js://test:test_JavaRndr_ImplRenderer.js"
     *          }
     *     }
     * </pre>
     */
    public void testFullServerRenderedPage() throws Exception {
        openNoAura("/auratest/test_SimpleServerRenderedPage.app");
        assertFalse(
                "Aura client engine should not be present on page. The component had a render='server' specification.",
                isAuraClientEnginePresentOnPage());
        assertTrue("Using java renderer failed.",
                getText(By.cssSelector("body")).contains("salesforce.com, inc, All rights reserved"));
        assertTrue("Using java renderer failed", isElementPresent(By.xpath("//a[@href='http://www.salesforce.com']")));
        // Verify that the remote renderer for test_JavaRndr_Impl is not used
        assertFalse("Server renderered component's dont use their remote renderer.",
                isElementPresent(By.xpath("//div[contains(@class,'javascriptRenderer')]")));

    }

    /**
     * Verify forcing interactive components to be rendered serverside does not
     * blow up aura. Test Cases:
     * <ol>
     * <li>Components/Application that should ideally be renderered client side
     * can be rendered server side by using the render='server' specification.
     * This will not blow up the page. It will just be unusable.</li>
     * <li>Specifying preload on the component has no significance.</li>
     * </ol>
     */
    public void testForcingServerRenderingOfInteractiveComponents() throws Exception {
        openNoAura("/test/test_ServerRenderingNegative.cmp");
        assertFalse(
                "Aura client engine should not be present on page. The component had a render='server' specification.",
                isAuraClientEnginePresentOnPage());
        assertTrue(getText(By.cssSelector("body")).contains(getName()));

    }

    private boolean isAuraClientEnginePresentOnPage() {
        try {
            return auraUITestingUtil.waitUntil(new Function<WebDriver, Boolean>() {
                @Override
                public Boolean apply(WebDriver input) {
                    return auraUITestingUtil.isAuraFrameworkReady();
                }
            }, 10); // give it only 10sec for these tests or they'll take too
                    // long for the neg cases
        } catch (TimeoutException e) {
            return false;
        }
    }
}
