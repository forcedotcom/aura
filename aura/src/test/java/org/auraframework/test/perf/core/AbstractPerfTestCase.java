package org.auraframework.test.perf.core;

import java.net.URLEncoder;
import java.util.logging.Logger;

import org.auraframework.Aura;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.test.WebDriverTestCase;
import org.openqa.selenium.By;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.ui.ExpectedCondition;

public abstract class AbstractPerfTestCase extends WebDriverTestCase {

    protected static final Logger logger = Logger.getLogger(AbstractPerfTestCase.class.getSimpleName());

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
     * @return 5 runs (3 was too little)
     */
    @Override
    protected int numPerfTimelineRuns() {
        return 5;
    }

    @Override
    protected final Dimension getWindowSize() {
        // use same size as OnePhoneContext.java: 548x320 (1/2 iPhone 5?)
        return new Dimension(320, 548);
    }

    protected final void runWithPerfApp(DefDescriptor<ComponentDef> descriptor) throws Exception {
        String relativeUrl = "/perfTest/perf.app?";
        currentAuraMode = isPerfRunForAuraStats ? Mode.CADENCE : Mode.PROD;
        relativeUrl += "aura.mode=" + currentAuraMode;
        relativeUrl += "#" + URLEncoder.encode("{\"componentDef\":\"" + descriptor + "\"}", "UTF-8");
        String url = getAbsoluteURI(relativeUrl).toString();
        logger.info("testRun: " + url);

        openRaw(url);

        // Fail with timeout if the component is not available on the page or there is an error rendering it.
        auraUITestingUtil.waitUntil(new ExpectedCondition<Boolean>() {
            @Override
            public Boolean apply(WebDriver d) {
                return d.findElements(By.cssSelector("[data-app-rendered-component]")).size() > 0
                        && !d.findElement(By.className("auraErrorBox")).isDisplayed();
            }
        }, String.format("Error rendering component : %s", descriptor.getName()));
    }

    protected static final DefDescriptor<ComponentDef> getDefDescriptor(String qualifiedName) {
        return Aura.getDefinitionService().getDefDescriptor(qualifiedName, ComponentDef.class);
    }
}
