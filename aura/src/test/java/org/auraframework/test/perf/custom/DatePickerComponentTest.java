package org.auraframework.test.perf.custom;

import org.auraframework.test.perf.core.CustomPerfAbstractTestCase;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;

import java.util.logging.Logger;

public final class DatePickerComponentTest extends CustomPerfAbstractTestCase {

    private static final Logger logger = Logger.getLogger(DatePickerComponentTest.class.getSimpleName());

    public DatePickerComponentTest(String name) {
        super(name);

        setComponentDef(getDefDescriptor("perfTest:datePicker"));
    }

    @Override
    public void testRun() throws Throwable {
        runWithPerfApp(descriptor);

        final String name = "datePicker_change_year";
        profileStart(name);

        // Change calendar year.
        WebElement element = currentDriver.findElement(By.cssSelector(".nextYear"));
        element.click();

        profileEnd(name);
    }
}
