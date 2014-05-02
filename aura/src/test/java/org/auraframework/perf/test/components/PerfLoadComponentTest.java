package org.auraframework.perf.test.components;

import java.net.URLEncoder;
import java.util.logging.Logger;

import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.perf.core.ComponentPerfAbstractTestCase;

public final class PerfLoadComponentTest extends ComponentPerfAbstractTestCase {

    private static final Logger logger = Logger.getLogger(PerfLoadComponentTest.class.getSimpleName());

    public PerfLoadComponentTest(String name, DefDescriptor<ComponentDef> desc) {
        super(name, desc);
    }

    @Override
    public void testRun() throws Throwable {
        String relativeUrl = "/perfTest/perf.app#" +
                URLEncoder.encode("{\"componentDef\":\"" + descriptor + "\"}", "UTF-8");
        String url = getAbsoluteURI(relativeUrl).toString();
        logger.info("testRun: " + url);
        openRaw(url);
    }
}
