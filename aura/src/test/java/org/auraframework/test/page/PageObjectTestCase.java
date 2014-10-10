package org.auraframework.test.page;

import org.auraframework.test.WebDriverTestCase;
import org.openqa.selenium.WebDriver;

public abstract class PageObjectTestCase<T extends PageObject> extends WebDriverTestCase {

	private final T page;
	
	public PageObjectTestCase(T page) {
		super(page.getName());
		this.page = page;
	}
	
	@Override
	protected void setCurrentDriver(WebDriver currentDriver) {
		super.setCurrentDriver(currentDriver);
		page.setDriver(currentDriver);
	}

	public T page() {
		return (T) page;
	}
	
}
