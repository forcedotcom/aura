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

import java.util.List;

import org.auraframework.Aura;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.def.LibraryDefRef;
import org.auraframework.integration.test.error.AbstractErrorUITestCase;
import org.auraframework.service.ContextService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.Source;
import org.auraframework.system.AuraContext.Authentication;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.util.test.annotation.ThreadHostileTest;
import org.auraframework.util.test.annotation.UnAdaptableTest;
import org.junit.Assert;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.ui.ExpectedCondition;

import com.google.common.base.Function;

public class MarkupCaseSensitivityUITest extends AbstractErrorUITestCase {
	private final String testAppName = "testMarkupCaseSensitivityApp";
	private final String testAppNamespace = "auratest";
	private final String outputDivClass = "div_output";
	private final String testLibButtonClass = "button_tryOutLibs";
	
	public MarkupCaseSensitivityUITest(String name) {
		super(name);
	}


	public void testDummy() {
		return;
	}
	
	/**
	 * we have library imported in testMarkupCaseSensitivityApp.app like this:
	 *  <aura:import library="test:test_Library" property="importED" /> 
    	<aura:import library="test:TEST_Library" property="importedWithWrongCase" /> 
     * test_Library.lib include a list of JS files (for example: 'basicFirst.js' by: <aura:include name="basicFirst" />) 
     * This verify after first loading the testApp (it loads fine)
     * we modify test_Library.lib, change all basicFirst to BASICFirst (wrong case, BASICFirst.js doesn't exist)
     * then reload the testApp, it still loads fine, and what we changed is updated in lib too (verify through helper).
         fix it and enable plz: W-2984818	
       */
	@UnAdaptableTest("SFDC chrome autobuild doesn't pick up source change, not sure why.")
	@ThreadHostileTest("We are messing up with source during the test, if you load other cmp/app at the same time, it might get wrong source")
	public void _testLibFileChangeAfterCached() throws Exception {
		//load the test app, and verify the lib loads fine
		String url = "/"+testAppNamespace+"/"+testAppName+".app";
        open(url, Mode.DEV);
        waitForElementAppear(By.className(testLibButtonClass));
        findDomElement(By.className(testLibButtonClass)).click();
        //change lib source
        ContextService service = Aura.getContextService();
        AuraContext context = service.getCurrentContext();
        if (context == null) {
            context = service.startContext(Mode.SELENIUM, Format.HTML,
                    Authentication.AUTHENTICATED);
        }
        ApplicationDef ad = definitionService.getDefinition(
                String.format("%s:%s", testAppNamespace, testAppName), ApplicationDef.class);
        List<LibraryDefRef> aid = ad.getImports();
        DefDescriptor<? extends Definition> idd;
        Source<?> source = null;
        String newSource = null; 
        for(LibraryDefRef id : aid) {
        	idd = id.getDescriptor();
        	source = context.getDefRegistry().getSource(idd);
            String originalContent = source.getContents();
            //System.out.println("originalContent of "+idd.getName()+" is: "+originalContent);
            //Notice two things:
            //1. the name of ImportDef has no namespace
            //2. we have both test_Library and TEST_Library because we include them both via the test app's markup
            //even TEST_Library.lib doesn't exist in file system, we still hook it up with what's inside test_Library.lib 
            //then why later in helper, importedWithWrongCase (that's what we import TEST_Library as) has nothing ?
            if(idd.getName().indexOf("test_Library") >= 0) {
            	newSource = originalContent.replace("basicFirst", "BASICFirst");
            	break;
            }
        }
        if(source != null && newSource != null) {
        	//update the test_Library.lib source, then refresh
        	source.addOrUpdate(newSource);
        	//refresh the testApp, until it pick up the source change in test_Library.lib
        	getAuraUITestingUtil().waitUntilWithCallback(
                    new Function<WebDriver, Integer>() {
                        @Override
                        public Integer apply(WebDriver driver) {
                            driver.navigate().refresh();
                            //click the button
                            waitForElementAppear(By.className(testLibButtonClass));
                        	findDomElement(By.className(testLibButtonClass)).click();
                        	//get the text from output div
                        	waitForElementAppear(By.className(testLibButtonClass));
                        	String text = findDomElement(By.className(outputDivClass)).getText();
                        	if(text.contains("BASICFirst")) {
                        		return 1;
                        	} else {
                        		return null;
                        	}
                        }
                    },
                    new ExpectedCondition<String>() {
                        @Override
                        public String apply(WebDriver d) {
                            return "outputDiv doesn't contain 'BASICFirst'"
                            		+findDomElement(By.className(outputDivClass)).getText();
                        }
                    },
                    30,
                    "fail waiting on test app pick up new source in test_Library.lib");
        } else {
        	Assert.fail("expect to find 'test:test_Library' in auratest:testMarkupCaseSensitivityApp's import libs");
        }
        
        //now let's change test_Library.lib back anyway
    	if(newSource != null) {
    		newSource = newSource.replace("BASICFirst", "basicFirst");
    		source.addOrUpdate(newSource);
    	}
	}
}
