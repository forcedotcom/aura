package org.auraframework.perf.core;

import org.auraframework.test.WebDriverTestCase;
import org.openqa.selenium.Dimension;

public abstract class AbstractPerfTestCase extends WebDriverTestCase {

    String testName;

    public AbstractPerfTestCase(String name) {
        super(name);
        // needs to temporarily be set to something non-null as getName() should never return null
        testName = name;
    }

    @Override
    public final String getName() {
        return testName;
    }

    @Override
    protected final boolean isPerfTest() {
        return true;
    }

    /**
     * Don't store details to decrease gold files size
     */
    @Override
    public final boolean storeDetailsInGoldFile() {
        return false;
    }

    /**
     * @return 3 only to run a little faster
     */
    @Override
    protected int numPerfTimelineRuns() {
        return 3;
    }

    @Override
    protected final Dimension getWindowSize() {
        // use same size as OnePhoneContext.java: 548x320 (1/2 iPhone 5?)
        return new Dimension(320, 548);
    }
}
