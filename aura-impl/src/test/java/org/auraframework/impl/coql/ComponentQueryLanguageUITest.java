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
package org.auraframework.impl.coql;

import org.auraframework.controller.java.ServletConfigController;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.test.WebDriverTestCase;
import org.auraframework.test.annotation.ThreadHostileTest;
import org.auraframework.test.annotation.UnAdaptableTest;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.ui.ExpectedCondition;

/**
 * Automation for COQL (Component Query Language). COQL is available in all modes except PRODUCTION
 */
public class ComponentQueryLanguageUITest extends WebDriverTestCase {
    public ComponentQueryLanguageUITest(String name) {
        super(name);
    }

    /**
     * Verify that query language is not available in PROD mode.
     */
    @ThreadHostileTest("PRODUCTION")
    public void testQueryLanguageNotAvailableInprodMode() throws Exception {
        ServletConfigController.setProductionConfig(true);
        open("/test/laxSecurity.app", Mode.PROD);
        Object query = auraUITestingUtil.getEval("return window.$A.getQueryStatement");
        assertNull("Query language should not be available in PROD mode.", query);
    }

    /**
     * Verify that query language is available in non prod mode. For the rest of the test cases, look at
     * js://cmpQueryLanguage.query
     */
    public void testQueryLanguageAvailableInNonprodMode() throws Exception {
        open("/test/laxSecurity.app");
        Boolean query = auraUITestingUtil.getBooleanEval("return $A.hasOwnProperty('getQueryStatement');");
        assertTrue("Query language should be available in non-PROD mode.", query);
        query = auraUITestingUtil.getBooleanEval("return 'query' in $A.getQueryStatement();");
        assertTrue("$A.getQueryStatement() should have 'query' property.", query);
    }

    /**
     * Verify we can use COQL to view rerendering data. This must be a WebDriver test because the rerendering query is
     * only available in STATS mode.
     */
    @UnAdaptableTest("SFDC iOS autobuilds seem to be having issues. Passes locally and when run on iOS SauceLabs.")
    public void testRerenderingsQuery() throws Exception {
        final String rowQuery = "return $A.getQueryStatement().from('rerenderings').query().rowCount;";
        open("/attributesTest/simpleValue.cmp", Mode.STATS);

        Long rowCount = (Long) auraUITestingUtil.getEval(rowQuery);
        assertEquals("Rerenders query should be empty on load.", 0, rowCount.intValue());

        findDomElement(By.cssSelector(".uiButton")).click();
        auraUITestingUtil.waitUntil(new ExpectedCondition<Boolean>() {
            @Override
            public Boolean apply(WebDriver d) {
                Long rowCount = (Long) auraUITestingUtil.getEval(rowQuery);
                return rowCount.intValue() == 1;
            }
        }, "Expecting one rerender query entry after attribute value change.");

        String descr = (String) auraUITestingUtil
                .getEval("return $A.getQueryStatement().from('rerenderings').query().rows[0].components['1:2.a'].descr;");
        assertEquals("Unexpected component was rerendered.", "markup://attributesTest:simpleValue", descr);
        String whyName = (String) auraUITestingUtil
                .getEval("return $A.getQueryStatement().from('rerenderings').query().rows[0].components['1:2.a'].why[0].name;");
        assertEquals("Unexpected cause for rerender.", "intAttribute", whyName);

        findDomElement(By.cssSelector(".uiButton")).click();
        auraUITestingUtil.waitUntil(new ExpectedCondition<Boolean>() {
            @Override
            public Boolean apply(WebDriver d) {
                Long rowCount = (Long) auraUITestingUtil.getEval(rowQuery);
                return rowCount.intValue() == 2;
            }
        }, "Expecting two rerender query entry after attribute value change.");
    }
}
