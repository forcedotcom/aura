package org.auraframework.test.page;

import org.openqa.selenium.WebDriver;

public interface PageObject {
	
	String getName();

	void setDriver(WebDriver currentDriver);

}
