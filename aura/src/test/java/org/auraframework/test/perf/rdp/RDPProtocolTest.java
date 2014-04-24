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
        assertEquals(6, requestsMetric.getIntValue());
        // check bytes metric
        PerfMetric bytesMetric = networkMetrics.get(1);
        assertEquals("Network.encodedDataLength", bytesMetric.getName());
        assertEquals("bytes", bytesMetric.getUnits());
        assertTrue(bytesMetric.toString(), bytesMetric.getIntValue() > 100000);
        JSONArray requests = bytesMetric.getDetails();
        assertTrue("num requests: " + requests.length(), requests.length() == 6);
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

    public void testAddTimelineTimeStamp() throws Exception {
        if (!RUN_PERF_TESTS) {
            return;
        }

        open("/ui/label.cmp?label=foo");
        perfWebDriverUtil.addTimelineTimeStamp("TIMELINE STAMP");

        // Above just shows as a Timeline.eventRecorded "Program" event:
        // Timeline.eventRecorded: {
        // "method": "Timeline.eventRecorded",
        // "params": {"record": {
        // "children": [{
        // "children": [{
        // "data": {"message": "BEFORE TEST"},
        // ...
        // "type": "Program",
        // "usedHeapSizeDelta": 77136
        // }}
        // }

        for (RDPNotification timelineEvent : RDPUtil.filterNotifications(getRDPNotifications(),
                RDP.Domain.Timeline)) {
            JSONObject event = timelineEvent.getJSON();
            try {
                if ("Program".equals(event.getString("type"))) {
                    // TODO:
                }
            } catch (Exception ignore) {
            }
        }
    }
}
