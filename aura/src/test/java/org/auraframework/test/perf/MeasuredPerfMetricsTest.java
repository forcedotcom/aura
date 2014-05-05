package org.auraframework.test.perf;

import org.auraframework.Aura;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.perf.core.AbstractPerfTestCase;
import org.auraframework.util.AuraTextUtil;
import org.auraframework.util.test.perf.data.MedianPerfMetric;
import org.auraframework.util.test.perf.data.PerfMetrics;
import org.auraframework.util.test.perf.data.PerfMetricsComparator;
import org.auraframework.util.test.perf.data.PerfRunsCollector;
import org.openqa.selenium.By;

/**
 * Checks that the metrics we measure are the expected ones. The idea is to measure the metrics manually, input the
 * values in this test class and then have this test class verify that our automated ways of getting the metrics get the
 * exact same values.
 */
public final class MeasuredPerfMetricsTest extends AbstractPerfTestCase {

    public MeasuredPerfMetricsTest(String name) {
        super(name);
    }

    private static final String LABEL_MOCK = "Mock value for 'label' attribute";

    /**
     * Overriding to check the expected metrics are meaused
     */
    @Override
    protected void perfTearDown(PerfMetrics median, PerfRunsCollector collector) throws Exception {
        String testName = getName();
        if (testName.startsWith("testButton")) {
            verifyTestButton(median, collector);
        } else if (testName.startsWith("testLabel")) {
            verifyTestLabel(median);
        } else {
            fail("TODO: " + testName);
        }
    }

    // ui:button: basic simple ref case

    /**
     * Test loading component directly
     */
    public void testButtonOpenRaw() throws Exception {
        openRaw("/ui/button.cmp?label=" + AuraTextUtil.urlencode(LABEL_MOCK));
    }

    /**
     * Test loading component using /perfTest/perf.app
     */
    public void testButtonPerfApp() throws Exception {
        runWithPerfApp(getDefDescriptor("ui:button"));
    }

    private void verifyTestButton(PerfMetrics median, PerfRunsCollector collector) {
        // check expected metrics
        PerfMetrics expected = new PerfMetrics();
        expected.setMetric("Timeline.Scripting.MarkDOMContent", 1);
        expected.setMetric("Timeline.Rendering.Layout", 3);
        expected.setMetric("Timeline.Painting.Paint", 2);

        String differentMessage = new PerfMetricsComparator(0).compare(expected, median);
        if (differentMessage != null) {
            fail(differentMessage);
        }

        // verify the component was loaded
        assertEquals("button loaded", LABEL_MOCK, currentDriver.findElement(By.cssSelector(".uiButton")).getText());

        // check network metrics
        MedianPerfMetric networkMetric = (MedianPerfMetric) median.getMetric("Network.encodedDataLength");
        System.out.println("NETWORK: " + networkMetric.toLongText());

        collector.show(System.out);
    }

    // ui:label: perf.app was not showing the label in the page

    public void testLabelOpenRaw() throws Exception {
        openRaw("/ui/label.cmp?label=" + AuraTextUtil.urlencode(LABEL_MOCK));
    }

    public void testLabelPerfApp() throws Exception {
        runWithPerfApp(getDefDescriptor("ui:label"));
    }

    private void verifyTestLabel(PerfMetrics median) {
        // check expected metrics
        PerfMetrics expected = new PerfMetrics();
        expected.setMetric("Timeline.Scripting.MarkDOMContent", 1);
        expected.setMetric("Timeline.Rendering.Layout", 3);
        expected.setMetric("Timeline.Painting.Paint", 2);

        String differentMessage = new PerfMetricsComparator(0).compare(expected, median);
        if (differentMessage != null) {
            fail(differentMessage);
        }

        // verify the component was loaded
        assertEquals("label loaded", LABEL_MOCK, currentDriver.findElement(By.cssSelector(".uiLabel")).getText());
    }

    // TODO: add some complicated component that has more complicated metrics

    // util

    private static final DefDescriptor<ComponentDef> getDefDescriptor(String qualifiedName) {
        return Aura.getDefinitionService().getDefDescriptor(qualifiedName, ComponentDef.class);
    }
}
