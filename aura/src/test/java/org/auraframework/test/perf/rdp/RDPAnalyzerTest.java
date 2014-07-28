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
package org.auraframework.test.perf.rdp;

import java.util.List;
import java.util.Map;

import org.auraframework.test.annotation.UnAdaptableTest;
import org.auraframework.test.perf.core.AbstractPerfTestCase;
import org.auraframework.test.perf.metrics.PerfMetric;
import org.auraframework.test.perf.metrics.PerfMetricsCollector;
import org.json.JSONArray;
import org.json.JSONObject;

import com.google.common.collect.Lists;

public final class RDPAnalyzerTest extends AbstractPerfTestCase {

    public RDPAnalyzerTest(String name) {
        super(name);
    }

    @Override
    protected boolean runPerfWarmupRun() {
        return true;
    }

    @Override
    protected int numPerfTimelineRuns() {
        return 0; // run only the first warmup run
    }

    @Override
    protected int numPerfAuraRuns() {
        return 0; // run only the first warmup run
    }

    @Override
    protected int numPerfProfileRuns() {
        return 0; // run only the first warmup run
    }

    // TODO: remove @UnAdaptableTest once we also use SauceLabs for perf tests in autobuild
    @UnAdaptableTest
    public void testProtocol() throws Exception {
        // run WebDriver test
        openTotallyRaw("/ui/label.cmp?label=foo");

        // UC: verify raw protocol notifications:
        List<RDPNotification> notifications = getRDPNotifications();
        // checks has expected events:
        assertTrue(RDP.Timeline.eventRecorded + " not found",
                RDPUtil.containsMethod(notifications, RDP.Timeline.eventRecorded));
        assertTrue(RDP.Network.loadingFinished + " not found",
                RDPUtil.containsMethod(notifications, RDP.Network.loadingFinished));
        assertTrue(RDP.Page.domContentEventFired + " not found",
                RDPUtil.containsMethod(notifications, RDP.Page.domContentEventFired));
        assertTrue(RDP.Page.loadEventFired + " not found",
                RDPUtil.containsMethod(notifications, RDP.Page.loadEventFired));

        // UC: extract/verify Network metrics
        RDPAnalyzer analyzer = new RDPAnalyzer(notifications, getPerfStartMarker(), getPerfEndMarker());
        List<PerfMetric> networkMetrics = analyzer.analyzeNetworkDomain();
        // check requestsMetric
        PerfMetric requestsMetric = networkMetrics.get(0);
        assertEquals("Network.numRequests", requestsMetric.getName());
        int numRequests = requestsMetric.getIntValue();
        assertTrue("numRequests: " + numRequests, numRequests >= 6);
        // check bytes metric
        PerfMetric bytesMetric = networkMetrics.get(1);
        assertEquals("Network.encodedDataLength", bytesMetric.getName());
        assertEquals("bytes", bytesMetric.getUnits());
        assertTrue("bytes: " + bytesMetric.getIntValue() + ": " + bytesMetric.toString(), bytesMetric.getIntValue() > 0);
        JSONArray requests = bytesMetric.getDetails();
        assertTrue("num requests: " + requests.length(), requests.length() == numRequests);

        // UC: extract/verify Timeline event metrics
        Map<String, TimelineEventStats> timelineEventsStats = analyzer.analyzeTimelineDomain();
        TimelineEventStats paintStats = timelineEventsStats.get("Paint");
        assertTrue("num paints: " + paintStats.getCount(), paintStats.getCount() >= 1);

        // UC: getTimeline() gets info from last getTimeline() call
        // we shouldn't get any more events in the timeline at this point
        assertEquals(0, getRDPNotifications().size());
    }

    /**
     * Checks the timeline has the marks we are adding
     */
    public void testTimelineMarks() throws Exception {
        runWithPerfApp(getDefDescriptor("ui:button"));

        List<RDPNotification> notifications = getRDPNotifications();
        RDPAnalyzer analyzer = new RDPAnalyzer(notifications, getPerfStartMarker(), getPerfEndMarker());

        // UC: check start and end mark are at beginning/end of filtered timeline
        List<JSONObject> filteredTimeline = analyzer.getFilteredFlattenedTimelineEvents();
        int filteredSize = filteredTimeline.size();
        JSONObject firstEntry = filteredTimeline.get(0);
        JSONObject lastEntry = filteredTimeline.get(filteredSize - 1);
        assertTrue(firstEntry.toString(),
                TimelineEventUtil.containsTimelineTimeStamp(firstEntry, getPerfStartMarker()));
        assertTrue(lastEntry.toString(),
                TimelineEventUtil.containsTimelineTimeStamp(lastEntry, getPerfEndMarker()));

        // UC: check the marks exists and in the right order
        List<String> marks = Lists.newArrayList();
        for (JSONObject timelineEvent : analyzer.getFilteredFlattenedTimelineEvents()) {
            String mark = TimelineEventUtil.isTimelineTimeStamp(timelineEvent);
            if (mark != null) {
                marks.add(mark);
            }
        }
        assertEquals("[PERF:start, START:cmpCreate, END:cmpCreate, START:cmpRender, END:cmpRender, PERF:end]",
                marks.toString());
    }

    public void testGetDevToolsLog() throws Exception {
        PerfMetricsCollector metricsCollector = new PerfMetricsCollector(this, PerfRunMode.TIMELINE);
        metricsCollector.startCollecting();
        runWithPerfApp(getDefDescriptor("ui:button"));
        metricsCollector.stopCollecting();
        RDPAnalyzer analyzer = metricsCollector.getRDPAnalyzer();

        // UC: whole dev tools log
        List<JSONObject> fulDevToolsLog = analyzer.getDevToolsLog();
        int fullSize = fulDevToolsLog.size();
        assertTrue("dev tools log size: " + fullSize, fulDevToolsLog.size() > 10);

        // UC: dev tools log between marks
        List<JSONObject> trimmedDevToolsLog = analyzer.getFilteredDevToolsLog();
        int trimmedSize = trimmedDevToolsLog.size();
        assertTrue("full " + fullSize + ", trimmed " + trimmedSize, trimmedSize < fullSize);
        JSONObject firstEntry = trimmedDevToolsLog.get(0);
        JSONObject lastEntry = trimmedDevToolsLog.get(trimmedSize - 1);
        assertTrue(firstEntry.toString(),
                TimelineEventUtil.containsTimelineTimeStamp(firstEntry, getPerfStartMarker()));
        assertTrue(lastEntry.toString(),
                TimelineEventUtil.containsTimelineTimeStamp(lastEntry, getPerfEndMarker()));
    }
}
