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
package org.auraframework.impl.coql;

import org.auraframework.controller.java.ServletConfigController;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.test.WebDriverTestCase;
import org.auraframework.test.annotation.ThreadHostileTest;

/**
 * Automation for COQL (Component Query Language).
 * COQL is available in all modes except PRODUCTION
 *
 * @since 0.0.302
 */
@ThreadHostileTest
public class ComponentQueryLanguageUITest extends WebDriverTestCase {
    public ComponentQueryLanguageUITest(String name){
        super(name);
    }

    /**
     * Verify that query language is not available in PROD mode.
     * 
     * @throws Exception
     */
    public void testQueryLanguageNotAvailableInprodMode() throws Exception{
        ServletConfigController.setProductionConfig(true);
        open("/test/laxSecurity.app", Mode.PROD);
        Object query = auraUITestingUtil.getEval("return window.$A.getQueryStatement");
        assertNull("Query language should not be available in PROD mode.", query);
    }

    /**
     * Verify that query language is available in non prod mode. For the rest of the test cases, look at
     * js://cmpQueryLanguage.query
     * 
     * @throws Exception
     */
    public void testQueryLanguageAvailableInNonprodMode() throws Exception{
        open("/test/laxSecurity.app");
        Object query = auraUITestingUtil.getEval("return window.$A.getQueryStatement");
        assertNotNull("Query language should be available in non PROD mode.", query);
        query = auraUITestingUtil.getEval("return window.$A.getQueryStatement()");
        assertNotNull("$A.q() failed to return query", query);
    }
}
