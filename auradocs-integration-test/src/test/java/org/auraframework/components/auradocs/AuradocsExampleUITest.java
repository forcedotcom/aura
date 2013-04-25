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
package org.auraframework.components.auradocs;

import java.util.List;

import org.auraframework.system.AuraContext.Mode;
import org.auraframework.test.WebDriverTestCase;
import org.auraframework.util.AuraUITestingUtil;
import org.openqa.selenium.By;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.WebElement;

/**
 * A webdriver test for auradoc examples.
 */
public class AuradocsExampleUITest extends WebDriverTestCase {

    public AuradocsExampleUITest(String name) {
        super(name);
    }

    public void testAddClassTopicExampleProd() throws Exception {
        doHelloWorldExample(Mode.PROD);
    }

    public void testAddClassTopicExampleDev() throws Exception {
        doHelloWorldExample(Mode.DEV);
    }

    private long doHelloWorldExample(Mode mode) throws Exception {
        long start = System.currentTimeMillis();
        open("/auradocs#help?topic=helloWorld", mode);
        AuraUITestingUtil util = new AuraUITestingUtil(getDriver());
        WebElement exampleElement = util.findDomElement(By.cssSelector(".auradocsExample"));
        assertNotNull(exampleElement);
        assertTrue(exampleElement.isDisplayed());

        // Check we get two sane tabs:
        List<WebElement> tabs = exampleElement.findElements(By.className("uiTab"));
        assertEquals(2, tabs.size());
        List<WebElement> tabBodies = exampleElement.findElements(By.className("tabBody"));
        assertEquals(2, tabBodies.size());
        assertSaneTabState(0, tabs, tabBodies);

        // Check we get two appropriate displays. This will require switching
        // between the various iframes and returning to the top window.
        String topWindow = getDriver().getWindowHandle();
        WebElement element = tabBodies.get(0).findElement(By.tagName("iframe"));
        assertTrue("Example frame should be displayed initially", element.isDisplayed());
        try {
            getDriver().switchTo().frame(element);
            String bodyText = getDriver().findElement(By.tagName("body")).getText();
            assertTrue("Couldn't find Hello world! displayed (visible text of iframe is " + bodyText + ")",
                    bodyText.contains("Hello world!"));
        } finally {
            getDriver().switchTo().window(topWindow);
        }

        element = tabBodies.get(1).findElement(By.cssSelector(".CodeMirror-line-numbers"));
        assertNotNull("Can't find CodeMirror numbers", element);
        assertFalse("Source numbers should not be displayed initially", element.isDisplayed());
        element = tabBodies.get(1).findElement(By.tagName("iframe"));
        assertFalse("Source frame should not be displayed initially", element.isDisplayed());
        try {
            getDriver().switchTo().frame(element);
            String text = getDriver().findElement(By.cssSelector(".xml-tagname")).getText();
            assertTrue("Couldn't find aura:component in codemirror (visible text of span is " + text + ")",
                    text.contains("aura:component"));
            text = getDriver().findElement(By.cssSelector(".xml-text")).getText();
            assertTrue("Couldn't find Hello world! in codemirror (visible text of span is " + text + ")",
                    text.contains("Hello world!"));
        } finally {
            getDriver().switchTo().window(topWindow);
        }

        // Confirm that if we switch tabs, the right visibility happens:
        tabs.get(1).click();
        assertSaneTabState(1, tabs, tabBodies);
        assertFalse("Example frame should not be displayed after click",
                tabBodies.get(0).findElement(By.tagName("iframe")).isDisplayed());
        assertTrue("CodeMirror numbers should display after click",
                tabBodies.get(1).findElement(By.cssSelector(".CodeMirror-line-numbers")).isDisplayed());
        assertTrue("CodeMirror source should display after click", tabBodies.get(1).findElement(By.tagName("iframe"))
                .isDisplayed());
        return System.currentTimeMillis() - start;
    }

    public void testEventsNotifierExampleProd() throws Exception {
        doEventDemoExample(Mode.PROD);
    }

    public void testEventsNotifierExampleDev() throws Exception {
        doEventDemoExample(Mode.DEV);
    }

    private long doEventDemoExample(Mode mode) throws Exception {
        long start = System.currentTimeMillis();
        open("/auradocs#help?topic=eventsDemo", Mode.PROD);
        AuraUITestingUtil util = new AuraUITestingUtil(getDriver());

        WebElement exampleElement = util.findDomElement(By.cssSelector(".auradocsExample"));
        assertNotNull(exampleElement);
        assertTrue(exampleElement.isDisplayed());

        // Check we get four sane tabs:
        List<WebElement> tabs = exampleElement.findElements(By.className("uiTab"));
        assertEquals(4, tabs.size());
        List<WebElement> tabBodies = exampleElement.findElements(By.className("tabBody"));
        assertEquals(4, tabBodies.size());
        assertSaneTabState(0, tabs, tabBodies);

        tabs.get(2).click();
        assertSaneTabState(2, tabs, tabBodies);

        String topWindow = getDriver().getWindowHandle();
        WebElement element = tabBodies.get(2).findElement(By.tagName("iframe"));
        // We'll check height relations, as a poor proxy for "is scrollbar visible"
        Dimension tabBodySize = tabBodies.get(2).getSize();

        assertTrue("JS Controller frame should be displayed after click", element.isDisplayed());
        try {
            getDriver().switchTo().frame(element);
            WebElement frameBody = getDriver().findElement(By.tagName("body"));
            String bodyText = frameBody.getText();
            assertTrue("Couldn't find fireComponentEvent displayed (visible text of iframe is " + bodyText + ")",
                    bodyText.contains(" fireComponentEvent : function(cmp, event) {"));

            Dimension frameBodySize = frameBody.getSize();
            assertTrue(String.format("Sizes suggest scrollbar may not be visible (frame=%s, tabbody=%s)",
                    frameBodySize, tabBodySize), frameBodySize.getHeight() > tabBodySize.getHeight());

            // Oh, and let's check that codemirror did its spanning right:
            assertEquals("Didn't tag fireCompenentEvent as a js variable", "fireComponentEvent", getDriver()
                    .findElement(By.cssSelector(".js-variable")).getText());
        } finally {
            getDriver().switchTo().window(topWindow);
        }

        return System.currentTimeMillis() - start;
    }

    /**
     * Asserts various sanity checks on example rendering.
     * 
     * @param selected which tab index should be selected
     * @param tabs list of .uiTab elements, paired index-to-index with {@code tabBodies}
     * @param tabBodies list of .tabBody elements, paired index-to-index with {@code tabs}
     */
    private void assertSaneTabState(int selected, List<WebElement> tabs, List<WebElement> tabBodies) {
        assertEquals("Tabs and TabBodies should have same size", tabs.size(), tabBodies.size());
        assertTrue("Selection index should be between 0 and tabs.size(), but is " + selected + " of " + tabs.size(),
                selected >= 0 && selected < tabs.size());
        for (int i = 0; i < tabs.size(); i++) {
            if (i == selected) {
                assertTrue("Selected tab doesn't have 'active' class (" + tabs.get(i).getAttribute("class") + ")",
                        hasCssClass(tabs.get(i), "active"));
                assertEquals("block", tabBodies.get(i).getCssValue("display"));
            } else {
                assertFalse("Unselected tab has 'active' class (" + tabs.get(i).getAttribute("class") + ")",
                        hasCssClass(tabs.get(i), "active"));
                assertEquals("none", tabBodies.get(i).getCssValue("display"));
            }
        }
    }
}
