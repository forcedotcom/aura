package org.auraframework.perf.test.components;

import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.perf.core.ComponentPerfAbstractTestCase;
import org.openqa.selenium.By;

import java.net.URLEncoder;
import java.util.logging.Logger;

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

        String componentName = descriptor.getName();
        waitForElementAppear("Container div[data-app-rendered-component] element for thecomponent not present",
                By.cssSelector(String.format("[data-app-rendered-component='%s']", componentName)));
    }
}
