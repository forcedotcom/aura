package org.auraframework.test.perf;

import org.auraframework.test.perf.core.AbstractPerfTestCase;
import org.auraframework.test.perf.metrics.PerfMetrics;
import org.auraframework.test.perf.metrics.PerfMetricsComparator;
import org.openqa.selenium.By;

/**
 * Checks that the metrics we measure are the expected ones. The idea is to measure the metrics manually, input the
 * values in this test class and then have this test class verify that our automated ways of getting the metrics get the
 * exact same values.
 */
public final class PerfMetricsTest extends AbstractPerfTestCase {

    public PerfMetricsTest(String name) {
        super(name);
    }

    private static final String LABEL_MOCK = "Mock value for 'label' attribute";

    @Override
    protected int numPerfAuraRuns() {
        return getName().equals("testButton") ? 5 : 0;
    }

    /**
     * Overriding to check the expected metrics are meaused
     */
    @Override
    protected void perfTearDown(PerfMetrics median) throws Exception {
        String testName = getName();
        if (testName.equals("testButton")) {
            verifyButton(median);
        } else if (testName.equals("testLabel")) {
            verifyLabel(median);
        } else if (testName.equals("testDummyPerf")) {
            verifyDummyPerf(median);
        } else {
            fail("TODO: " + testName + ": " + median.toLongString());
        }
    }

    // ui:button: basic simple ref case

    /**
     * Test loading component using /perfTest/perf.app
     */
    public void testButton() throws Exception {
        runWithPerfApp(getDefDescriptor("ui:button"));
    }

    private void verifyButton(PerfMetrics median) {
        PerfMetrics expected = new PerfMetrics();
        // Timeline metrics
        expected.setMetric("Timeline.Rendering.Layout", 2);
        expected.setMetric("Timeline.Painting.Paint", 2); // button + image

        // Aura Stats metrics (this metric fluctuates between 2/3)
        assertNotNull(median.getMetric("Aura.InitialComponentCreated"));

        // verify the component was loaded
        assertEquals("button loaded", LABEL_MOCK, currentDriver.findElement(By.cssSelector(".uiButton")).getText());

        // TODO: check network metrics
        // MedianPerfMetric networkMetric = (MedianPerfMetric) median.getMetric("Network.encodedDataLength");
    }

    // ui:label: perf.app was not showing the label in the page

    public void testLabel() throws Exception {
        runWithPerfApp(getDefDescriptor("ui:label"));
    }

    private void verifyLabel(PerfMetrics median) {
        // check expected metrics
        PerfMetrics expected = new PerfMetrics();
        expected.setMetric("Timeline.Rendering.Layout", 1);
        expected.setMetric("Timeline.Painting.Paint", 1);

        String differentMessage = new PerfMetricsComparator(0).compare(expected, median);
        if (differentMessage != null) {
            fail(differentMessage);
        }

        // verify the component was loaded
        assertEquals("label loaded", LABEL_MOCK,
                currentDriver.findElement(By.cssSelector(".uiLabel")).getText());
    }

    //

    /**
     * Verifies that we report at least 10 paints for the dummyPerf.cmp
     */
    public void testDummyPerf() throws Exception {
        runWithPerfApp(getDefDescriptor("perfTest:dummyPerf"));
    }

    private void verifyDummyPerf(PerfMetrics median) {
        int numPaints = median.getMetric("Timeline.Painting.Paint").getIntValue();
        assertTrue("expected at least 10 paints, found " + numPaints, numPaints >= 10);
    }

    // TODO: add some complicated component that has more complicated metrics
}
