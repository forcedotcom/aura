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

import org.auraframework.integration.test.util.WebDriverTestCase;
import org.auraframework.util.test.annotation.ThreadHostileTest;
import org.junit.Test;
import org.auraframework.util.test.annotation.UnAdaptableTest;
import org.openqa.selenium.By;

@UnAdaptableTest("We don't run access check test across browsers")
@ThreadHostileTest("Tests modify what namespaces are Internal or not and locker service enabled")
public class GetDefinitionAccessCheckUITest extends WebDriverTestCase {

    @Override
    public void setUp() throws Exception {
        super.setUp();
        
        // TODO: remove when $A.createComponent is exposed in the locker
        getMockConfigAdapter().setLockerServiceEnabled(false);
    }

    @Test
    public void testGetEventDefinitionWithoutAccess() throws Exception {
        open("/testCustomNS1/getDefinition.cmp");
        findDomElement(By.cssSelector(".getEventDefinitionWithoutAccessButton")).click();
        getAuraUITestingUtil().waitForElementText(By.cssSelector("div[id='complete']"), "true", true,
                "did not complete", false);

        String actual = getText(By.cssSelector(".definitionNameOutput .element0"));
        assertEquals("null", actual);
    }

    @Test
    public void testGetComponentDefinitionWithoutAccess() throws Exception {
        open("/testCustomNS1/getDefinition.cmp");
        findDomElement(By.cssSelector(".getComponentDefinitionWithoutAccessButton")).click();
        getAuraUITestingUtil().waitForElementText(By.cssSelector("div[id='complete']"), "true", true,
                "did not complete", false);

        String actual = getText(By.cssSelector(".definitionNameOutput .element0"));
        assertEquals("null", actual);
    }

    @Test
    public void testGetMultipleDefinitionsWithoutAccess() throws Exception {
        open("/testCustomNS1/getDefinition.cmp");
        findDomElement(By.cssSelector(".getDefinitionsWithoutAccessButton")).click();
        getAuraUITestingUtil().waitForElementText(By.cssSelector("div[id='complete']"), "true", true,
                "did not complete", false);

        String actual = getText(By.cssSelector(".definitionNameOutput .element0"));
        assertEquals("The definition with index 0 should be null when access check failed.", "null", actual);
        actual = getText(By.cssSelector(".definitionNameOutput .element1"));
        assertEquals("The definition with index 1 should be null when access check failed.", "null", actual);
    }
}
