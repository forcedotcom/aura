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

import org.auraframework.system.AuraContext.Mode;
import org.auraframework.test.util.WebDriverTestCase;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedCondition;

/**
 * A webdriver test for auradoc examples.
 */
public class AuradocsExampleUITest extends WebDriverTestCase {

    public AuradocsExampleUITest(String name) {
        super(name);
    }

    @Override
    public void perBrowserSetUp() {
        super.perBrowserSetUp();
        // This page, especially the reference tab, loads several components and
        // needs extra time in slower environments
        auraUITestingUtil.setTimeoutInSecs(60);
    }

    public void testBaseProd() throws Exception {
        doBase(Mode.PROD);
    }

    public void testBaseDev() throws Exception {
        doBase(Mode.DEV);
    }

    public void testReferenceProd() throws Exception {
        doReference(Mode.PROD);
    }

    public void testReferenceDev() throws Exception {
        doReference(Mode.DEV);
    }

    public void testComponentProd() throws Exception {
        doComponent(Mode.PROD);
    }

    public void testComponentDev() throws Exception {
        doComponent(Mode.DEV);
    }

    public void testAPIProd() throws Exception {
        doAPI(Mode.PROD);
    }

    public void testAPIDev() throws Exception {
        doAPI(Mode.DEV);
    }

    private long doBase(Mode mode) throws Exception {
        long start = System.currentTimeMillis();
        open("/auradocs", mode);
        WebElement content = getAuraUITestingUtil().findDomElement(
                By.cssSelector(".content"));
        assertNotNull("Should have content showing", content);
        assertTrue("Should have content displayed", content.isDisplayed());
        return System.currentTimeMillis() - start;
    }

    private long doReference(Mode mode) throws Exception {
        long start = System.currentTimeMillis();
        open("/auradocs#reference", mode);
        
        auraUITestingUtil.waitUntil(new ExpectedCondition<Boolean>() {
            @Override
            public Boolean apply(WebDriver d) {
            	WebElement sidebar = getAuraUITestingUtil().findDomElement(
                        By.xpath("//ol[contains(@class,'auradocsSidebar')]"));
                int totalMenuItems = sidebar.findElements(By.xpath("li")).size();
            	return totalMenuItems == 8;
            }
        }, "We expect 8 sidebar menu items");
        
        return System.currentTimeMillis() - start;
    }

    private long doComponent(Mode mode) throws Exception {
        long start = System.currentTimeMillis();
        open("/auradocs#reference?descriptor=aura:component&defType=component",
                mode);
        auraUITestingUtil.waitUntil(new ExpectedCondition<Boolean>() {
            @Override
            public Boolean apply(WebDriver d) {
            	WebElement tabset = getAuraUITestingUtil().findDomElement(
                        By.xpath("//ul[contains(@class,'tabs__nav')]"));
                int totalTabs = tabset.findElements(By.xpath("li")).size();
            	return totalTabs == 6;
            }
        }, "We expect 6 tabs in the component help");
        
        return System.currentTimeMillis() - start;
    }

    private long doAPI(Mode mode) throws Exception {
        long start = System.currentTimeMillis();
        open("/auradocs#reference?topic=api:Aura");
        // TODO: this should test more.
        WebElement content = getAuraUITestingUtil().findDomElement(
                By.cssSelector(".content"));
        assertNotNull("Should have content showing", content);
        assertTrue("Should have content displayed", content.isDisplayed());
        return System.currentTimeMillis() - start;
    }
}
