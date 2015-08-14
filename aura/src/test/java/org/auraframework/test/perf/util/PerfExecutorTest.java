package org.auraframework.test.perf.util;

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
import java.io.File;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
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
import org.auraframework.test.perf.PerfWebDriverUtil;
import org.auraframework.test.util.WebDriverTestCase;
import org.auraframework.test.util.WebDriverTestCase.TargetBrowsers;
import org.auraframework.test.util.WebDriverUtil.BrowserType;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.JsonEncoder;
import org.auraframework.util.AuraFiles;
import org.auraframework.util.test.annotation.PerfCmpTest;
import org.auraframework.util.test.perf.metrics.PerfMetrics;
import org.auraframework.util.test.perf.metrics.PerfRunsCollector;
import org.json.JSONArray;
import org.json.JSONException;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.ui.ExpectedCondition;
import org.openqa.selenium.support.ui.WebDriverWait;

import com.google.common.collect.ImmutableMap;
import com.google.gson.Gson;

@PerfCmpTest
@TargetBrowsers({ BrowserType.GOOGLECHROME })
public class PerfExecutorTest extends WebDriverTestCase {

    private static final Logger logger = Logger.getLogger(PerfExecutorTest.class.getSimpleName());
    private DefDescriptor<ComponentDef> def;
    private PerfConfig config;
    private PerfMetricsUtil perfMetricsUtil;
    private PerfRunsCollector runsCollector;
    private String dbURI;
    private String testName;
    private static String DEFAULT_DB_URI = "mongodb://fjunod-wsl4:27017";
    
    public PerfExecutorTest(DefDescriptor<ComponentDef> def, PerfConfig config, String db) {
        //super("runTests");
        // needs to temporarily be set to something non-null as getName() should never return null
        //testName = "runTests";
    	super("perf_" + def.getDescriptorName());
    	//testName = "perf_" + def.getDescriptorName();
        this.def = def;
        this.config = config;
        this.setDB(db);
        init();
    }

    /*public void setTestName(String testName) {
        this.testName = testName;
    }

    @Override
    public final String getName() {
        return testName;
    }*/
    
    @Override
    protected void superRunTest() throws Throwable {
    	try {
            int numberOfRuns = config.getNumberOfRuns();
            while(numberOfRuns-- > 0)
                runWithPerfApp(def, config);
            //Evaluate results after all the runs are done.
            perfMetricsUtil.evaluateResults();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    
    private void init(){
        perfMetricsUtil = new PerfMetricsUtil(this, this.dbURI, config.getOptions().get("metricsMode"));
        runsCollector = new PerfRunsCollector();
    }

    /*public void runTests() {
        try {
            int numberOfRuns = config.getNumberOfRuns();
            while(numberOfRuns-- > 0)
                runWithPerfApp(def, config);
            //Evaluate results after all the runs are done.
            perfMetricsUtil.evaluateResults();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }*/

    private void setDB(String dbURI){
    	this.dbURI = dbURI;
    	if(dbURI == null) {
    		this.dbURI = DEFAULT_DB_URI;
    	}
    }
    
    /**
     * Required to get component directory in SFDC
     * @param def
     * @return
     */
    public String resolveComponentDirPath(DefDescriptor<ComponentDef> def) {
    	String fileName;
		File moduleDir;
		String componentsDir = null;
		try {
			fileName = def.getDef().getLocation().getFileName();
			moduleDir = new File(fileName).getCanonicalFile().getParentFile().getParentFile().getParentFile();
			if(fileName.contains("/core/")){
				componentsDir = moduleDir.toString();
			} else {
				componentsDir =  AuraFiles.Core.getPath() + "/aura-components/src/test/components";
			}
		} catch (QuickFixException e1) {
			// TODO Auto-generated catch block
			e1.printStackTrace();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}		
		return componentsDir;
    }
    
    private void loadComponent(String url, DefDescriptor<ComponentDef> descriptor) throws MalformedURLException,
    URISyntaxException {

        openTotallyRaw(url);

        // wait for component loaded or aura error message
        final By componentRendered = By.cssSelector("div[class*='container performanceRunner testFinish']");
        final By auraErrorMessage = By.id("auraErrorMessage");
        ExpectedCondition<By> condition = prepareCondition(componentRendered, auraErrorMessage);
        By locatorFound = new WebDriverWait(currentDriver, 60).withMessage("Error loading " + descriptor).until(
                condition);

        if (locatorFound == auraErrorMessage) {
            fail("Error loading " + descriptor.getName() + ": " + currentDriver.findElement(auraErrorMessage).getText());
        }

        // check for internal errors while rendering component
        if (locatorFound == componentRendered) {
            String text = currentDriver.findElement(componentRendered).getText();
            if (text != null && text.contains("internal server error")) {
                fail("Error loading " + descriptor.getDescriptorName() + ": " + text);
            }
        }
    }

    private ExpectedCondition<By> prepareCondition(final By componentRendered, final By auraErrorMessage){
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
        return condition;
    }

    private String generateUrl (DefDescriptor<ComponentDef> descriptor, PerfConfig config, Mode mode) throws UnsupportedEncodingException, MalformedURLException, URISyntaxException {
        String relativeUrl = "/performance/runner.app?";
        Map<String, String> hash = ImmutableMap.of("componentDef", descriptor.getQualifiedName());

        relativeUrl += "aura.mode=" + mode;
        relativeUrl += "#" + URLEncoder.encode(JsonEncoder.serialize(hash), "UTF-8");
        String url = getAbsoluteURI(relativeUrl).toString();
        return url;
    }

    public String generateUrl(){
        try {
            return generateUrl(def, config, Mode.STATS);
        }catch (Exception e) {
            return "";
        }
    }

    private void runWithPerfApp(DefDescriptor<ComponentDef> descriptor, PerfConfig config) throws Exception {
        try {
            Mode mode = Mode.STATS;
            setupContext(mode, AuraContext.Format.JSON, descriptor);
            String url = generateUrl(descriptor, config, mode);

            logger.info("invoking runner.app: " + url);
            Gson gson = new Gson();
            String json = gson.toJson(config);
            logger.info("component config:" + json);

            try {
                perfMetricsUtil.startCollecting();
                loadComponent(url, descriptor);
                perfMetricsUtil.stopCollecting(); //TODO handle case when component fails to load
                PerfMetrics metrics = perfMetricsUtil.prepareResults();
                runsCollector.addRun(metrics);
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

    @Override
    public JSONArray getLastCollectedMetrics () {
        try {
            return getPerfRunsCollector().getMedianMetrics().toJSONArrayWithoutDetails();
        } catch (JSONException e) {
            return new JSONArray();
        }
    }

    public DefDescriptor<ComponentDef> getComponentDef(){
        return def;
    }

    public WebDriver getWebDriver(){
        return currentDriver;
    }

    @Override
    public BrowserType getBrowserType(){
        return super.getBrowserType();
    }

    public PerfRunsCollector getPerfRunsCollector(){
        return runsCollector;
    }

    @Override
    public String getPerfStartMarker() {
        return "perfRunner:start";
    }

    @Override
    public String getPerfEndMarker() {
        return "perfRunner:end";
    }

    @Override
    public String toString() {
        return def.getNamespace() + ":" + def.getName() + "(perfExecutor)";
    }

}
