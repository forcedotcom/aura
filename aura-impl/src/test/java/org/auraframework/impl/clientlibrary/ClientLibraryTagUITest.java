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
package org.auraframework.impl.clientlibrary;

import org.auraframework.system.AuraContext.Mode;
import org.auraframework.test.WebDriverTestCase;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;

import com.ibm.icu.util.Calendar;

public class ClientLibraryTagUITest extends WebDriverTestCase {
    public ClientLibraryTagUITest(String name){
        super(name);
    }
    
    /**
     * Verify that Javascript and Style resources marked as combinable are available at the client.
     * clientLibraryTest:clientLibraryTest
     *  Moment, Walltime, js://clientLibraryTest.clientLibraryTest are marked as combinable JS resources.
     *  css://clientLibraryTest.clientLibraryTest is marked as combinable CSS resource
     * @throws Exception
     */
    public void testCombinableResources()throws Exception{
        open("/clientLibraryTest/clientLibraryTest.app");
        waitForAuraFrameworkReady();
        Object yearThruMoment = auraUITestingUtil.getEval("return moment(new Date()).year()");
        assertNotNull(yearThruMoment);
        assertEquals(Calendar.getInstance().get(Calendar.YEAR), ((Long)yearThruMoment).intValue());
        
        Object walltime = auraUITestingUtil.getEval("return WallTime");
        assertNotNull(walltime);
        
        assertEquals("awesome",auraUITestingUtil.getEval("return clientLibraryTest.cool;"));
        
        WebElement div = findDomElement(By.cssSelector("div[class~='identifier']"));
        assertTrue(div.getCssValue("border").contains("none"));
        
        
    }
    /**
     * Verify that Javascript and Style resources marked as uncombinable are available at the client.
     * WalltimeLocale is an uncombinable JS resource.
     * @throws Exception
     */
    public void testNonCombinableResources()throws Exception{
        open("/clientLibraryTest/clientLibraryTest.app");
        waitForAuraFrameworkReady();
        Object walltimeLocale = auraUITestingUtil.getEval("return WallTime");
        assertNotNull(walltimeLocale);
    }
    
    /**
     * Verify that resource change depending on Mode.
     * Mixture of combinable and uncombinable resources
     */
    public void testModeDependentResources()throws Exception{
        open("/clientLibraryTest/clientLibraryTest.app", Mode.PTEST);
        
        //PTEST only resources
        Object jiffyData = auraUITestingUtil.getEval("return Perf.toJson()");
        assertNotNull(jiffyData);
        
        Object jiffyUI = auraUITestingUtil.getEval("return Perf.ui");
        assertNotNull(jiffyUI);
        
        //Mode independent resources
        Object yearThruMoment = auraUITestingUtil.getEval("return moment(new Date()).year()");
        assertNotNull(yearThruMoment);
        assertEquals(Calendar.getInstance().get(Calendar.YEAR), ((Long)yearThruMoment).intValue());
        
        Object walltime = auraUITestingUtil.getEval("return WallTime");
        assertNotNull(walltime);
        
        assertEquals("awesome",auraUITestingUtil.getEval("return clientLibraryTest.cool;"));
    }
}
