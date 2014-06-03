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
package org.auraframework.test.perf.core;

import java.net.URLEncoder;
import java.util.logging.Logger;

import org.auraframework.Aura;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.test.WebDriverTestCase;
import org.openqa.selenium.By;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.ui.ExpectedCondition;
import org.openqa.selenium.support.ui.WebDriverWait;

public abstract class AbstractPerfTestCase extends WebDriverTestCase {

    protected static final Logger logger = Logger.getLogger(AbstractPerfTestCase.class.getSimpleName());

    private String testName;

    public AbstractPerfTestCase(String name) {
        super(name);
        // needs to temporarily be set to something non-null as getName() should never return null
        testName = name;
    }

    public void setTestName(String testName) {
        this.testName = testName;
    }

    @Override
    public final String getName() {
        return testName;
    }

    @Override
    public final boolean isPerfTest() {
        return true;
    }

    /**
     * Don't store details to decrease gold files size
     */
    @Override
    public final boolean storeDetailsInGoldFile() {
        return false;
    }

    /**
     * @return 5 runs (3 was too little)
     */
    @Override
    protected int numPerfTimelineRuns() {
        return 5;
    }

    @Override
    protected final Dimension getWindowSize() {
        // use same size as OnePhoneContext.java: 548x320 (1/2 iPhone 5?)
        return new Dimension(320, 548);
    }

    protected final void runWithPerfApp(DefDescriptor<ComponentDef> descriptor) throws Exception {
        String relativeUrl = "/perfTest/perf.app?";
        currentAuraMode = isPerfRunForAuraStats ? Mode.STATS : Mode.PROD;
        relativeUrl += "aura.mode=" + currentAuraMode;
        relativeUrl += "#" + URLEncoder.encode("{\"componentDef\":\"" + descriptor + "\"}", "UTF-8");
        String url = getAbsoluteURI(relativeUrl).toString();
        logger.info("testRun: " + url);

        openTotallyRaw(url);

        // wait for component loaded or aura error message
        final By componentLoaded = By.cssSelector("[data-app-rendered-component]");
        final By auraErrorMessage = By.id("auraErrorMessage");

        // don't use the AuraUITestingUtil wait that does extra checks/processing
        ExpectedCondition<By> condition = new ExpectedCondition<By>() {
            @Override
            public By apply(WebDriver d) {
                if (d.findElement(auraErrorMessage).isDisplayed()) {
                    return auraErrorMessage;
                }
                if (d.findElement(componentLoaded) != null) {
                    return componentLoaded;
                }
                return null;
            }
        };
        By locatorFound = new WebDriverWait(currentDriver, 60).withMessage("Error loading " + descriptor).until(
                condition);

        if (locatorFound == auraErrorMessage) {
            fail("Error loading " + descriptor.getName() + ": " + currentDriver.findElement(auraErrorMessage).getText());
        }
    }

    protected static final DefDescriptor<ComponentDef> getDefDescriptor(String qualifiedName) {
        return Aura.getDefinitionService().getDefDescriptor(qualifiedName, ComponentDef.class);
    }

    protected void profileStart(String name) {
        auraUITestingUtil.getRawEval(String.format("$A.PERFCORE.profileStart('%s');", name));
    }

    protected void profileEnd(String name) {
        auraUITestingUtil.getRawEval(String.format("$A.PERFCORE.profileEnd('%s');", name));
    }
}
