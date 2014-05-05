package org.auraframework.perf.core;

import java.net.URLEncoder;
import java.util.logging.Logger;

import org.auraframework.Aura;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.test.WebDriverTestCase;
import org.openqa.selenium.By;
import org.openqa.selenium.Dimension;

public abstract class AbstractPerfTestCase extends WebDriverTestCase {

    private static final Logger logger = Logger.getLogger(AbstractPerfTestCase.class.getSimpleName());

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

    protected final void runWithPerfApp(DefDescriptor<ComponentDef> descriptor) throws Exception {
        String relativeUrl = "/perfTest/perf.app#" +
                URLEncoder.encode("{\"componentDef\":\"" + descriptor + "\"}", "UTF-8");
        String url = getAbsoluteURI(relativeUrl).toString();
        logger.info("testRun: " + url);

        openRaw(url);

        String componentName = descriptor.getName();
        waitForElementAppear("Container div[data-app-rendered-component] element for the component not present: "
                + componentName,
                By.cssSelector(String.format("[data-app-rendered-component]", componentName)));
    }

    protected static final DefDescriptor<ComponentDef> getDefDescriptor(String qualifiedName) {
        return Aura.getDefinitionService().getDefDescriptor(qualifiedName, ComponentDef.class);
    }
}
