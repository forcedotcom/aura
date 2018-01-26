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
package org.auraframework.test.perf.util;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.Map;

import org.apache.commons.io.IOUtils;
import org.auraframework.util.test.perf.metrics.PerfMetric;
import org.auraframework.util.test.perf.metrics.PerfMetrics;
import org.auraframework.util.test.perf.rdp.RDPAnalyzer;
import org.auraframework.util.test.perf.rdp.RDPNotification;
import org.auraframework.util.test.perf.rdp.TraceEventStats;
import org.auraframework.util.test.perf.rdp.TraceEventUtil;
import org.json.JSONException;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;

public class PerfMetricsUtil {
    private final PerfExecutorTestCase test;
    private final PerfConfig config;
    private RDPAnalyzer rdpAnalyzer;
    private List<RDPNotification> notifications;
    private Map<String, Map<String, Map<String, Object>>> auraStats;
    private String dbURI;

    public PerfMetricsUtil(PerfExecutorTestCase test, String dbURI, PerfConfig config) {
        this.test = test;
        this.dbURI = dbURI;
        this.config = config;
    }

    /**
     * Evaluate the collected perf metrics //TODO Handle diff for a subset of metrics
     * 
     * @throws Exception
     */
    public void evaluateResults(String testName) throws Exception {
        // Get the median metrics after all the runs.
        PerfMetrics metrics = test.getPerfRunsCollector().getMedianMetrics();
        PerfMetrics median = test.getPerfRunsCollector().getMedianRun();
        
        metrics.setMetricsServiceTransaction(median.getMetricsServiceTransaction());
        metrics.setDevToolsLog(median.getDevToolsLog());
        metrics.setCommonMetrics(median.getCommonMetrics());
        metrics.setCustomMetrics(median.getCustomMetrics());

        // Write the results into file
        writeResults(testName, metrics);
        //PerfResultsUtil.exportToCsv(test, dbURI);

        // Diff the results file against an existing goldfile per component
        if(config.getOptions().get("skipDiff") == null || config.getOptions().get("skipDiff") == "false"){
        PerfResultsUtil.assertPerfDiff(test, "goldfile.json", metrics);
    }
    }

    /**
     * Write the results into json files and db
     * 
     * @param metrics
     * @return
     * @throws JSONException
     */
    public void writeResults(String testName, PerfMetrics metrics) throws JSONException {
        // Write the metrics into result file
    	PerfResultsUtil.writeGoldFile(metrics, test);
    	String timeline = config.getOptions().get("timeline");
    	String traceJson = "";
    	
        if(timeline!=null && !timeline.equals("disable")) {
        	// Write the timeline events
            File traceLog = PerfResultsUtil.writeDevToolsLog(metrics.getDevToolsLog(), test.getComponentDef().getName(), test);
            try {
	            InputStream is = new FileInputStream(traceLog);
	            traceJson = IOUtils.toString(is);	            
	        } catch (FileNotFoundException e) {
	            e.printStackTrace();
	        } catch (IOException e) {
	            e.printStackTrace();
	        }
        }
        
        // Write the results to Db
        PerfResultsUtil.writeToDb(test, testName, dbURI, metrics, traceJson);
    }

    private void prepareNetworkMetrics(PerfMetrics metrics) {
        for (PerfMetric metric : rdpAnalyzer.analyzeNetworkDomain()) {
            metrics.setMetric(metric);
        }
    }

    @SuppressWarnings("unchecked")
    private void prepareTimelineMetrics(PerfMetrics metrics) {
        Map<String, TraceEventStats> traceEventsStats = rdpAnalyzer.analyzeTraceDomain();
        for (TraceEventStats stats : traceEventsStats.values()) {
            PerfMetric metric = new PerfMetric();
            String statName = stats.getName();
            Object statValue = stats.getValue();

            // TODO Better way to handle this is to abstract this in TraceEventStats
            if (statName.equals("UpdateCounters")) {
                Map<String, Object> memoryCounters = (Map<String, Object>) statValue;
                for (Map.Entry<String, Object> entry : memoryCounters.entrySet()) {
                    metric.setName(TraceEventUtil.toMetricName(entry.getKey()));
                    metric.setValue(entry.getValue());
                    metrics.setMetric(metric);
                    metric = new PerfMetric();
                }
            }
            else {
                metric.setName(TraceEventUtil.toMetricName(statName));
                metric.setValue(statValue);
                metrics.setMetric(metric);
            }
        }
        // keep the corresponding Dev Tools Log for the metrics
        metrics.setDevToolsLog(rdpAnalyzer.getDevToolsLog());
    }

    private void handleCoqlMetrics(PerfMetrics metrics, String name) {
        Map<String, Map<String, Object>> nameValue = auraStats.get(name);
        for (String method : nameValue.keySet()) {
            Map<String, Object> methodValue = nameValue.get(method);
            for (String what : methodValue.keySet()) {
                Long value = (Long) methodValue.get(what);
                metrics.setMetric("Aura." + name + '.' + method + '.' + what, value);
            }
        }
    }
    private void handleMetricsServiceTransaction(PerfMetrics metrics, String name) {
    	Map<String, Map<String, Object>> transactionMap = auraStats.get(name);
    	metrics.setMetricsServiceTransaction(transactionMap);
	}
    
    private void handleCommonMetrics(PerfMetrics metrics, String name) {
    	Map<String, Map<String, Object>> transactionMap = auraStats.get(name);
    	metrics.setCommonMetrics(transactionMap);
	}
    
    private void handleCustomMetrics(PerfMetrics metrics, String name) {
        Map<String, Map<String, Object>> customMap = auraStats.get(name);
        for (String method : customMap.keySet()) {
                if(customMap.get(method) != null) {
                    Map<String, Object> methodValue = customMap.get(method);
                    for (String what : methodValue.keySet()) {
                        Object value = methodValue.get(what);
                        if(value!=null) {
                                value = methodValue.get(what).toString();
                                metrics.setMetric("Custom." + name + '.' + method + '.' + what, value);
                        }
                    }
                } else {
                        Object value = customMap.get(method);
                        metrics.setMetric("Custom." + name + '.' + method, value);
                }
        }
        metrics.setCustomMetrics(customMap);
    }

    private void prepareAuraMetrics(PerfMetrics metrics) {
        if (auraStats != null) {
        	handleCoqlMetrics(metrics, "coql");
        	handleMetricsServiceTransaction(metrics, "transaction");
        	handleCommonMetrics(metrics, "commonMetrics");
        	handleCustomMetrics(metrics, "customMetrics");
        }
    }

	public PerfMetrics prepareResults() {
        PerfMetrics metrics = new PerfMetrics();
        String timeline = config.getOptions().get("timeline");
        if (timeline != null && !timeline.equals("disable")) {
            rdpAnalyzer = new RDPAnalyzer(notifications, test.getPerfStartMarker(), test.getPerfEndMarker());
            prepareNetworkMetrics(metrics);
            prepareTimelineMetrics(metrics);
        }
        prepareAuraMetrics(metrics);
        return metrics;
    }

    public void startCollecting() {
        // Start recording
        //test.getRDPNotifications();
    }

    @SuppressWarnings("unchecked")
    public void stopCollecting() {
        WebDriver driver = test.getWebDriver();
        String timeline = config.getOptions().get("timeline");
        if(timeline!=null && !timeline.equals("disable")) {
            notifications = test.getRDPNotifications();
        }
        // TODO auraUITestingUtil unable to execute the js correctly
        Object obj = ((JavascriptExecutor) driver).executeScript("return $A.PerfRunner.getResults()");
        auraStats = (Map<String, Map<String, Map<String, Object>>>) obj;
    }
}
