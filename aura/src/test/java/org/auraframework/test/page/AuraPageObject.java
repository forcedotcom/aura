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
package org.auraframework.test.page;

import java.net.MalformedURLException;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.HashMap;
import java.util.Map;

import org.auraframework.Aura;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.test.AuraTestingUtil;
import org.auraframework.test.WebDriverUtil.BrowserType;
import org.auraframework.test.configuration.TestServletConfig;
import org.auraframework.util.AuraUITestingUtil;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.ui.ExpectedCondition;

public abstract class AuraPageObject<T extends BaseComponentDef> implements PageObject {
	
	protected AuraUITestingUtil auraUITestingUtil;
	protected AuraTestingUtil auraTestingUtil;
	private TestServletConfig servletConfig;
	
	private final String name;
	private final Boolean isComponent; 
	private final String descriptorString;
	private final DefDescriptor<T> defDescriptor;
	//TODO: move these to [test]context, page object shouldn't need to carry them.
	private WebDriver driver;
	private Mode mode;
	private boolean waitForInit = true;
	BrowserType currentBrowserType;
	private int timeoutInSecs = Integer.parseInt(System.getProperty("webdriver.timeout", "30"));;
	
	/**
	 * create AuraPageObject with just name. need to set necessary parameter before open the page and do stuff
	 * @param name
	 */
	@SuppressWarnings("unchecked")
	public AuraPageObject(String name, Boolean isComponent, String descriptorString) {
		this.name = name;
		this.isComponent = isComponent;
		this.descriptorString = descriptorString;
		if(isComponent) {
			this.defDescriptor = (DefDescriptor<T>) Aura.getDefinitionService().getDefDescriptor(descriptorString, ComponentDef.class);
		} else {
			this.defDescriptor = (DefDescriptor<T>) Aura.getDefinitionService().getDefDescriptor(descriptorString, ApplicationDef.class);
		}
		if(this.servletConfig == null) {
			this.servletConfig = Aura.get(TestServletConfig.class);
		}
	}
	
	@Override
	public void setCurrentBrowserType(BrowserType currentBrowserType) {
		this.currentBrowserType = currentBrowserType;
	}
	
	@Override
	public void setDriver(WebDriver driver) {
		this.driver = driver;
	}
	
	@Override
	public void setAuraTestingUtil(AuraTestingUtil auraTestingUtil) {
		this.auraTestingUtil = auraTestingUtil;
	}
	
	@Override
	public void setAuraUITestingUtil(AuraUITestingUtil auraUITestingUtil) {
		this.auraUITestingUtil = auraUITestingUtil;
	}
	
	@Override
	public void setMode(Mode mode) {
		this.mode = mode;
	}
	
	@Override
	public void setTimeoutInSecs(int timeoutInSecs) {
		this.timeoutInSecs = timeoutInSecs;
	}
	
	@Override
	public void setWaitForInit(Boolean waitForInit) {
		this.waitForInit = waitForInit;
	}
	
	protected WebDriver getDriver() {
		return driver;
	}
	
	@Override
	public String getDescriptorString() {
		return this.descriptorString;
	}
	
	@Override
	public String getName() {
		return this.name;
	}
	
	/**
	 * make sure all necessary parameters are set
	 */
	private void sanityCheck() {
		assert(this.auraUITestingUtil != null);
		assert(this.servletConfig != null);
		assert(this.currentBrowserType != null);
		assert(this.driver != null);
		assert(this.mode != null);
		assert(this.auraTestingUtil != null);
		assert(this.defDescriptor != null);
		assert(this.name != null);
		assert(this.isComponent != null);
	}
	
	public void open() throws MalformedURLException, URISyntaxException {
		sanityCheck();
		Map<String, String> params = new HashMap<>();
        params.put("aura.mode", mode.name());
        params.put("aura.test", this.defDescriptor.getQualifiedName());
        String url = this.defDescriptor.getNamespace()+"/"+this.defDescriptor.getName()+(this.isComponent?".cmp":".app");
        url = auraTestingUtil.addUrlParams(url, params);
        auraUITestingUtil.getRawEval("document._waitingForReload = true;");
        try {
            openAndWait(url);
        } catch (TimeoutException e) {
            // Hack to avoid timeout issue for IE7 and IE8. Appears that tests fail for the first time when we run the
            // test in new vm session on Sauce.
            if (currentBrowserType == BrowserType.IE7 || currentBrowserType == BrowserType.IE8) {
                openAndWait(url);
            } else {
                throw e;
            }
        }
	}
	
	private void openAndWait(String url) throws MalformedURLException, URISyntaxException {
        auraUITestingUtil.getRawEval("document._waitingForReload = true;");
        openRaw(url);
        auraUITestingUtil.waitUntil(new ExpectedCondition<Boolean>() {
            @Override
            public Boolean apply(WebDriver d) {
                Object ret = auraUITestingUtil.getRawEval("return !document._waitingForReload");
                if (ret != null && ((Boolean) ret).booleanValue()) {
                    return true;
                }
                return false;
            }
        }, timeoutInSecs,"fail on loading url:"+url);
        if (this.waitForInit) {
            auraUITestingUtil.waitForAuraInit();
        }
    }
	
	/**
     * Open a URI without any additional handling. This will, however, add a nonce to the URL to prevent caching of the
     * page.
	 * @throws URISyntaxException 
	 * @throws MalformedURLException 
     */
    protected void openRaw(String passInUrl) throws MalformedURLException, URISyntaxException {
    	URI uri = this.servletConfig.getBaseUrl().toURI().resolve(passInUrl);
        String urlWithBrowserNonce = auraTestingUtil.addBrowserNonce(uri.toString());
        getDriver().get(urlWithBrowserNonce);
    }
    
}
