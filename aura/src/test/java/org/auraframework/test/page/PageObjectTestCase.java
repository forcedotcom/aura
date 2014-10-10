package org.auraframework.test.page;

import org.auraframework.test.WebDriverTestCase;

public abstract class PageObjectTestCase<T extends PageObject> extends WebDriverTestCase {

	private T page;
	
	public PageObjectTestCase(T page) {
		super(page);
		this.page = page;
	}

	public T page() {
		return (T) page;
	}
	
}
