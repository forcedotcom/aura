package org.auraframework.test.perf;

import junit.framework.Assert;

import org.auraframework.Aura;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.perf.core.AbstractPerfTestCase;
import org.auraframework.util.test.perf.data.PerfMetrics;
import org.auraframework.util.test.perf.data.PerfMetricsComparator;

/**
 * Checks that the metrics we measure are the expected ones. The idea is to measure the metrics manually, input the
 * values in this test class and then have this test class verify that our automated ways of getting the metrics get the
 * exact same values.
 */
public final class MeasuredPerfMetricsTest extends AbstractPerfTestCase {

    public MeasuredPerfMetricsTest(String name) {
        super(name);
    }

    private static final PerfMetrics EXPECTED;

    static {
        // the metrics to expect, i.e. obtained by running manually with dev tools
        EXPECTED = new PerfMetrics();
        EXPECTED.setMetric("Timeline.Scripting.MarkDOMContent", 1);
        EXPECTED.setMetric("Timeline.Rendering.Layout", 2);
        EXPECTED.setMetric("Timeline.Painting.Paint", 1);
    }

    /**
     * Overriding to check we are getting the expected metrics
     */
    @Override
    protected void perfMetricsTearDown(PerfMetrics median) throws Exception {

        String differentMessage = new PerfMetricsComparator(0).compare(EXPECTED, median);
        if (differentMessage != null) {
            Assert.fail(differentMessage);
        }
    }

    /**
     * Test loading component directly
     */
    public void testOpenRaw() throws Exception {
        openRaw("/ui/label.cmp?label=foo");
    }

    /**
     * Test loading component using /perfTest/perf.app
     */
    public void testPerfApp() throws Exception {
        DefDescriptor<ComponentDef> descriptor = Aura.getDefinitionService().getDefDescriptor("ui:label",
                ComponentDef.class);
        runWithPerfApp(descriptor);
    }
}
