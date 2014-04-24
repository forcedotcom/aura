package org.auraframework.test.perf;

import org.auraframework.test.WebDriverTestCase;
import org.auraframework.util.test.perf.PerfTest;

/**
 * Example PerfTests.
 */
@PerfTest
public final class PerfUITest extends WebDriverTestCase {

    public PerfUITest(String name) {
        super(name);
    }

    public void testLabel() throws Exception {
        openRaw("/ui/label.cmp?label=foo");
    }

    public void testButton() throws Exception {
        openRaw("/ui/button.cmp?label=Push");
    }
}
