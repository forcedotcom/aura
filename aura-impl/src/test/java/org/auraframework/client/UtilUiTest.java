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
package org.auraframework.client;

import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.test.WebDriverTestCase;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.ui.ExpectedCondition;

public class UtilUiTest extends WebDriverTestCase {

    public UtilUiTest(String name) {
        super(name);
    }

    public void testRemoveOn() throws Exception {
        DefDescriptor<ComponentDef> cmpDesc = addSourceAutoCleanup(
                ComponentDef.class, String.format(baseComponentTag,
                        "render='client'",
                        "<div aura:id='div' class='target'>handled</div>"));
        By target = By.cssSelector(".target");
        open(cmpDesc);

        // check that test properties are unset, then add two handlers to the same event
        getDriver().findElement(target).click();
        assertTrue(
                "Test setup failure, properties already defined on window",
                auraUITestingUtil
                        .getBooleanEval("return window['handledByTest'] === undefined && window['2ndHandledByTest'] === undefined"));
        auraUITestingUtil
                .getEval("var handler=function(){window['handledByTest']=true;};var handler2=function(){window['2ndHandledByTest']=true};window['testHandler']=handler;var elem=$A.getRoot().find('div').getElement();$A.util.on(elem, 'click', handler, false);$A.util.on(elem, 'click', handler2, false);");

        // trigger handlers, then check that test properties are now set, reset the test properties after checking
        getDriver().findElement(target).click();
        auraUITestingUtil.waitUntil(new ExpectedCondition<Boolean>() {
            @Override
            public Boolean apply(WebDriver d) {
                return auraUITestingUtil
                        .getBooleanEval("var res = window['handledByTest'] && window['2ndHandledByTest'];window['handledByTest']=undefined;window['2ndhandledByTest']=undefined;return res===true;");
            }
        });

        // remove one one of the handlers, trigger event and verify only the non-removed handler is called
        auraUITestingUtil
                .getEval("$A.util.removeOn($A.getRoot().find('div').getElement(), 'click', window['testHandler'], false);");
        getDriver().findElement(target).click();
        auraUITestingUtil.waitUntil(new ExpectedCondition<Boolean>() {
            @Override
            public Boolean apply(WebDriver d) {
                return auraUITestingUtil
                        .getBooleanEval("return window['2ndHandledByTest'] === true");
            }
        });
        assertTrue("Handler was not removed",
                auraUITestingUtil.getBooleanEval("return window['handledByTest'] ===  undefined"));
    }
}
