package org.auraframework.test.performance;

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
import java.net.MalformedURLException;
import java.net.URISyntaxException;
import java.net.URLEncoder;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.auraframework.Aura;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.test.WebDriverTestCase;
import org.auraframework.test.perf.PerfWebDriverUtil;
import org.auraframework.util.json.Json;
import org.auraframework.util.test.annotation.PerfCmpTest;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.ui.ExpectedCondition;
import org.openqa.selenium.support.ui.WebDriverWait;

import com.google.common.collect.ImmutableMap;

@PerfCmpTest
public class PerfExecutorTest extends WebDriverTestCase {

    private static final Logger logger = Logger.getLogger(PerfExecutorTest.class.getSimpleName());
    private DefDescriptor<ComponentDef> def;

    public PerfExecutorTest(DefDescriptor<ComponentDef> def) {
        super("runTests");
        setDescriptor(def);
    }

    private void setDescriptor(DefDescriptor<ComponentDef> def) {
        this.def = def;
    }

    public void runTests() {
        try {
            runWithPerfApp(def);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void loadComponent(String url, DefDescriptor<ComponentDef> descriptor) throws MalformedURLException,
            URISyntaxException {
        openTotallyRaw(url);

        // wait for component loaded or aura error message
        final By componentRendered = By.cssSelector("div[class*='container performanceRunner testFinish']");
        final By auraErrorMessage = By.id("auraErrorMessage");

        // don't use the AuraUITestingUtil wait that does extra checks/processing
        ExpectedCondition<By> condition = new ExpectedCondition<By>() {
            @Override
            public By apply(WebDriver d) {
                if (d.findElement(auraErrorMessage).isDisplayed()) { return auraErrorMessage; }
                if (d.findElement(componentRendered) != null) {
                    // check for the case where both the componentRendered and auraErrorMessage are displayed
                    if (d.findElement(auraErrorMessage).isDisplayed()) { return auraErrorMessage; }
                    return componentRendered;
                }
                return null;
            }
        };
        By locatorFound = new WebDriverWait(currentDriver, 60).withMessage("Error loading " + descriptor).until(
                condition);

        if (locatorFound == auraErrorMessage) {
            fail("Error loading " + descriptor.getName() + ": " + currentDriver.findElement(auraErrorMessage).getText());
        }

        // check for internal errors
        if (locatorFound == componentRendered) {
            String text = currentDriver.findElement(componentRendered).getText();
            if (text != null && text.contains("internal server error")) {
                fail("Error loading " + descriptor.getDescriptorName() + ": " + text);
            }
        }
    }

    private void runWithPerfApp(DefDescriptor<ComponentDef> descriptor) throws Exception {
        try {
            Mode mode = Mode.STATS;
            setupContext(mode, AuraContext.Format.JSON, descriptor);

            String relativeUrl = "/performance/runner.app?";
            Map<String, String> hash = ImmutableMap.of("componentDef", descriptor.getQualifiedName());

            relativeUrl += "aura.mode=" + mode;
            relativeUrl += "#" + URLEncoder.encode(Json.serialize(hash), "UTF-8");
            String url = getAbsoluteURI(relativeUrl).toString();

            logger.info("invoking runner.app: " + url);

            try {
                loadComponent(url, descriptor);
            } catch (ThreadDeath td) {
                throw td;
            } catch (Throwable th) {
                if (PerfWebDriverUtil.isInfrastructureError(th)) {
                    // retry if a possible infrastructure error
                    logger.log(Level.WARNING, "infrastructure error, retrying", th);
                    loadComponent(url, descriptor);
                } else {
                    throw th;
                }
            }
        } finally {
            Aura.getContextService().endContext();
        }
    }

}
