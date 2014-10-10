package org.auraframework.test.page;

import org.openqa.selenium.WebDriver;

public abstract class AuraPageObject implements PageObject {
	
	private String name;
	private WebDriver driver;
	
	public AuraPageObject(String name) {
		this.name = name;
	}

	public void setDriver(WebDriver driver) {
		this.driver = driver;
	}
	
	protected WebDriver getDriver() {
		return driver;
	}
	
	public String getName() {
		return name;
	}

}
