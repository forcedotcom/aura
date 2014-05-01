package org.auraframework.perf.test.custom;

import java.net.URLEncoder;
import java.util.logging.Logger;

import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.perf.core.ComponentPerfAbstractTestCase;
import org.auraframework.perf.core.CustomPerfAbstractTestCase;

public final class ExampleCustomComponentTest extends CustomPerfAbstractTestCase {

    private static final Logger logger = Logger.getLogger(ExampleCustomComponentTest.class.getSimpleName());

    public ExampleCustomComponentTest(String name, DefDescriptor<ComponentDef> desc) {
        super(name, desc);
    }

    @Override
    public void testRun() throws Throwable {
        // TODO: aura.mode=PROD: shows those errors in the log:
        // 10:14:42.223 ERROR - JS:MIN:5sKHt1bcEBLRhRYVTA8MzA:3787: ERROR - Parse error. invalid property id
        // char: String.fromCharCode(65 + (i%26))
        // plus some metrics are bigger than in DEV mode
        String relativeUrl = "/perf/perf.app#" +
                URLEncoder.encode("{\"componentDef\":\"" + descriptor + "\"}", "UTF-8");
        
        String url = getAbsoluteURI(relativeUrl).toString();
        logger.info("testRun: " + url);
        openRaw(url);
    }
}
