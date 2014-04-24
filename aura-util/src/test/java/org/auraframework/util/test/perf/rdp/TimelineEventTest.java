package org.auraframework.util.test.perf.rdp;

import java.util.List;

import org.auraframework.test.UnitTestCase;

public final class TimelineEventTest extends UnitTestCase {

    public void testGetCategoryMetricNames() {
        List<String> types = TimelineEvent.getCategoryMetricNames(TimelineEvent.Category.Loading);
        assertEquals(7, types.size());
        assertTrue(types.toString(), types.contains("Timeline.Loading.ResourceReceivedData"));
    }
}
