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
package org.auraframework.perfTest;

import java.util.Map;

import org.auraframework.system.AuraContext.Mode;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

/**
 * Gather metrics of performanceTest/perfApp.app
 * 
 */
public class PerfAppLoadRenderingMetricsTest extends PerfMetricsBaseTest {
	public PerfAppLoadRenderingMetricsTest(String name){
		super(name);
	}
	
	private String appUrl = "/performanceTest/perfApp.app";
	
	/**
	 * Gather onload metrics.
	 * This includes page load time, rendering time for certain components and services.
	 * @throws Exception
	 */
	public void testGatherMetricsOnLoad() throws Exception{
		open(appUrl, Mode.CADENCE);
		Map<String,String> logStats = Maps.newHashMap();
		logStats.putAll(
				getJiffyStats(Lists.newArrayList("t_onLoad","t_page", "t_done", 
						"ClientService.init",
						"Initial Component Created",
						"Initial Component Rendered",
						"Component Load Complete", //Currently not getting logged, gotto check
						"Rendering time for performanceTest:htmlMarkup",
						"Rendering time for performanceTest:iterateComponents",
						"Rendering time for performanceTest:deepIteration",
						"Rendering time for performanceTest:iterateBasicData",
						"Rendering time for performanceTest:inheritance component",
						"HistoryService.init",
						"LayoutService.init",
						"Aura.finishInit")));
		logStats.putAll(getAuraStats());
		output(logStats);
	}
	
	/**
	 * Gather metrics for completing a simple server action.
	 * 
	 * @throws Exception
	 */
	public void testGatherMetricsSimpleServerAction() throws Exception{
		open(appUrl, Mode.CADENCE);
		clearStats();
		WebElement button = findDomElement(By.cssSelector("button[class~='simpleServerAction']"));
		button.click();
		
		Map<String,String> logStats = Maps.newHashMap(); 
		logStats.putAll(
				getJiffyStats(Lists.newArrayList("XHR call time: Simple Server Controller", 
						"Action Request Prepared", 
						"Completed Action Callback - XHR 3",
						"Callback Complete - XHR 3",
						"Fired aura:doneRendering event")));
		output(logStats);
	}
	
	/**
	 * Gather metrics for completing a server action that fetches a new component from the server.
	 * The new component being fetched is the same test app performanceTest:perfApp
	 * @throws Exception
	 */
	public void testGatherMetricsFetchingComponentFromServer() throws Exception{
		open(appUrl, Mode.CADENCE);
		Map<String,String> logStats = Maps.newHashMap();
		logStats.putAll(
				getJiffyStats(Lists.newArrayList("t_onLoad","t_page", "t_done", 
						"ClientService.init",
						"Initial Component Created",
						"Initial Component Rendered")));
		logStats.putAll(getAuraStats());
		clearStats();
		WebElement button = findDomElement(By.cssSelector("button[class~='fetchComponentFromServer']"));
		button.click();
		logStats.putAll(
				getJiffyStats(Lists.newArrayList("XHR call time: Server Controller, New Component & Resolve Refs", 
						"Action Request Prepared", 
						"Completed Action Callback - XHR 3",
						"Callback Complete - XHR 3",
						"Fired aura:doneRendering event",
						"Json.resolveRefs")));
		logStats.putAll(getAuraStats("NewComponentFromServer"));
		output(logStats);
	}
	/**
	 * Gather metrics for completing a simple rerender.
	 * @throws Exception
	 */
	public void testGatherMetricsForReRendering()throws Exception{
		open(appUrl, Mode.CADENCE);
		Map<String,String> logStats = Maps.newHashMap(); 
		logStats.putAll(getAuraStats());
		clearStats();
		WebElement button = findDomElement(By.cssSelector("button[class~='bkgColor']"));
		button.click();
		
		logStats.putAll(
				getJiffyStats(Lists.newArrayList("Fired aura:doneRendering event", 
						"Rerender time for performanceTest:htmlMarkup", 
						"Rerender time for performanceTest:iterateComponents",
						"Rerender time for performanceTest:iterateBasicData",
						"Rerender time for performanceTest:deepIteration",
						"Rerender time for performanceTest:inheritance component")));
		logStats.putAll(getAuraStats("AfterRerender"));
		output(logStats);
	}
	
	/**
	 * Gather metrics for rerendering iteration components by changing start and end index.
	 * @throws Exception
	 */
	public void testGatherMetricsForIterationReRendering()throws Exception{
		open(appUrl, Mode.CADENCE);
		Map<String,String> logStats = Maps.newHashMap(); 
		logStats.putAll(getAuraStats());
		
		clearStats();
		WebElement button = findDomElement(By.cssSelector("button[class~='changeIteratonIndex']"));
		button.click();
		
		logStats.putAll(
				getJiffyStats(Lists.newArrayList("Fired aura:doneRendering event", 
						"Rerender time for performanceTest:iterateComponents",
						"Rerender time for performanceTest:iterateBasicData",
						"Rerender time for performanceTest:deepIteration")));
		logStats.putAll(getAuraStats("AfterRerender"));
		
		output(logStats);
	}
	
	/**
	 * Gather metrics for switching layout, which involved calling the server to fetch components, 
	 * resolving json references and rendering new component.
	 * @throws Exception
	 */
	public void testGatherMetricsForSwitchingLayouts()throws Exception{
		open(appUrl, Mode.CADENCE);
		Map<String,String> logStats = Maps.newHashMap();
		logStats.putAll(getAuraStats());
		logStats.putAll(
				getJiffyStats(Lists.newArrayList("t_onLoad","t_page", "t_done", 
						"ClientService.init",
						"Initial Component Created",
						"Initial Component Rendered",
						"Rerendering: 2",
						"Container Layout Complete",
						"Layout Actions Callback Complete",
						"Container Action Callback Initiated")));
		
		clearStats();
		WebElement button = findDomElement(By.cssSelector("button[class~='switchLayout']"));
		button.click();
		logStats.putAll(
				getJiffyStats("SwitchLayout",Lists.newArrayList("Rerendering: 3", 
						"Container Action Callback Initiated",
						"Layout Actions Callback Complete",
						"Completed Action Callback - XHR 3",
						"Json.resolveRefs",
						"Rerendering: 4",
						"Container Layout Complete")));
		logStats.putAll(getAuraStats("SwitchLayout"));
		
		clearStats();
		button = findDomElement(By.cssSelector("button[class~='revertLayout']"));
		button.click();
		logStats.putAll(
				getJiffyStats("RevertLayout", Lists.newArrayList("Rerendering: 5", 
						"Container Action Callback Initiated",
						"Layout Actions Callback Complete",
						"Completed Action Callback - XHR 4",
						"Json.resolveRefs",
						"Rerendering: 6",
						"Container Layout Complete")));
		logStats.putAll(getAuraStats("RevertLayout"));
		output(logStats);
	}
	
}
