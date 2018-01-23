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
package org.auraframework.integration.test.http;

import org.auraframework.def.ApplicationDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.integration.test.util.WebDriverTestCase;
import org.auraframework.test.util.WebDriverUtil.BrowserType;
import org.junit.Test;
import org.openqa.selenium.By;

import static org.hamcrest.CoreMatchers.containsString;
import static org.junit.Assert.assertNotEquals;
import static org.junit.Assert.assertThat;

public class AppCacheUITest extends WebDriverTestCase {

    @ExcludeBrowsers({ BrowserType.IPAD, BrowserType.IPHONE, BrowserType.IE8, BrowserType.IE9, BrowserType.IE10, BrowserType.IE11 })
    @Test
    public void testAppcacheIsEnabled() throws Exception {
        DefDescriptor<ApplicationDef> appDesc = addSourceAutoCleanup(ApplicationDef.class,
                "<aura:application useAppcache='true' render='client'></aura:application>");
        String url = getUrl(appDesc);
        // this includes waitForAppCacheReady
        open(url);

        String script = "var htmlNode = document.body.parentNode;" +
                        "return htmlNode ? htmlNode.getAttribute('manifest') : 'null';";
        String manifestUrl = getAuraUITestingUtil().getEval(script).toString();
        assertNotEquals("Appcache is not enabled", "null", manifestUrl);

        script = "return location.protocol + '//' + location.hostname + (location.port? ':' + location.port : '')";
        String domain = getAuraUITestingUtil().getEval(script).toString();
        manifestUrl = domain + manifestUrl;

        this.getDriver().get(manifestUrl);
        getAuraUITestingUtil().waitForDocumentReady();

        String manifestContent = getText(By.cssSelector("body"));
        // we used to have hack by using empty manifest to disable manifest,
        // so it has to make sure the manifest file is not empty.
        assertFalse("Found an empty appcache manifest file", manifestContent.isEmpty());
        assertThat(manifestContent, containsString("CACHE MANIFEST"));
    }

}
