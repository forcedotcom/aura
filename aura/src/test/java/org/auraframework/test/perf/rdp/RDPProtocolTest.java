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

import org.auraframework.test.WebDriverTestCase;
import org.auraframework.test.annotation.FreshBrowserInstance;
import org.auraframework.util.test.perf.PerfTest;
import org.auraframework.util.test.perf.data.PerfMetric;
import org.auraframework.util.test.perf.rdp.RDP;
import org.auraframework.util.test.perf.rdp.RDPAnalyzer;
import org.auraframework.util.test.perf.rdp.RDPNotification;
import org.auraframework.util.test.perf.rdp.RDPUtil;
import org.auraframework.util.test.perf.rdp.TimelineEventStats;
import org.json.JSONArray;
import org.json.JSONObject;

@PerfTest
public final class RDPProtocolTest extends WebDriverTestCase {

    public RDPProtocolTest(String name) {
        super(name);
    }

    @Override
    protected int numPerfTimelineRuns() {
        return 0; // so it only runs once in functional mode
    }

    // request new browser to make sure cache is clean
    @FreshBrowserInstance
    public void testProtocol() throws Exception {
        if (!RUN_PERF_TESTS) {
            return;
        }
        // run WebDriver test
        openRaw("/ui/label.cmp?label=foo");

        // UC: verify raw protocol notifications:
        List<RDPNotification> notifications = getRDPNotifications();
        // checks has expected events:
        assertTrue(RDPUtil.containsMethod(notifications, RDP.Timeline.eventRecorded));
        assertTrue(RDPUtil.containsMethod(notifications, RDP.Network.loadingFinished));
        assertTrue(RDPUtil.containsMethod(notifications, RDP.Page.domContentEventFired));
        assertTrue(RDPUtil.containsMethod(notifications, RDP.Page.loadEventFired));

        // UC: extract/verify Network metrics
        RDPAnalyzer analyzer = new RDPAnalyzer(notifications);
        List<PerfMetric> networkMetrics = analyzer.analyzeNetworkDomain();
        // check requestsMetric
        PerfMetric requestsMetric = networkMetrics.get(0);
        assertEquals("Network.numRequests", requestsMetric.getName());
        assertEquals(7, requestsMetric.getIntValue());
        // check bytes metric
        PerfMetric bytesMetric = networkMetrics.get(1);
        assertEquals("Network.encodedDataLength", bytesMetric.getName());
        assertEquals("bytes", bytesMetric.getUnits());
        assertTrue(bytesMetric.toString(), bytesMetric.getIntValue() > 100000);
        JSONArray requests = bytesMetric.getDetails();
        assertTrue("num requests: " + requests.length(), requests.length() == 7);
        JSONObject request = requests.getJSONObject(0);
        assertTrue(request.toString(), request.getString("url").contains("/ui/label.cmp?label=foo"));
        int encodedDataLength = Integer.parseInt(request.getString("encodedDataLength"));
        assertTrue(request.toString(), encodedDataLength > 5000 && encodedDataLength < 15000);
        assertEquals("GET", request.getString("method"));

        // UC: extract/everify Timeline event metrics
        Map<String, TimelineEventStats> timelineEventsStats = analyzer.analyzeTimelineDomain();
        TimelineEventStats paintStats = timelineEventsStats.get("Paint");
        assertTrue("num paints: " + paintStats.getCount(), paintStats.getCount() >= 2);

        // UC: getTimeline() gets info from last getTimeline() call
        // we shouldn't get any more events in the timeline at this point
        assertEquals(0, getRDPNotifications().size());
    }

    public void testTimelineTimeStamp() throws Exception {
        if (!RUN_PERF_TESTS) {
            return;
        }

        openRaw("/ui/label.cmp?label=foo");

        // TODO:

        final String startStamp = RDPAnalyzer.MARK_TIMELINE_START;
        final String endStamp = RDPAnalyzer.MARK_TIMELINE_END;

        // UC: timeline without time stamps
        // List<RDPNotification> notifications = getRDPNotifications();

        // UC: timeline with time stamps
        // openRaw("/perfTest/perf.app#%7B%22componentDef%22%3A%22markup%3A%2F%2Fui%3Abutton%22%7D");
        // notifications = getRDPNotifications();
        // assertTrue(RDPUtil.containsTimelineStamp(notifications, startStamp));
        // filtered = RDPUtil.notificationsBetweenTimelineMarks(notifications, startStamp, endStamp);
        // assertEquals(notifications.size(), filtered.size());
    }
}
