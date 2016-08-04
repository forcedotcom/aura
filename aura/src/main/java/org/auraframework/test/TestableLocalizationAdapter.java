/*
 * Copyright (C) 2013 salesforce.com, inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.auraframework.test;

/**
 * Is this localization adapter able to provide dynamic label values? Called Testable since we really only wanted to provide that functionality for tests. 
 * We could do it for PROD as well, but is not currently a requirement.
 * @author kgray
 */
public interface TestableLocalizationAdapter {
	/**
	 * Set a label available when the default label is not present.
	 * 
	 * @param section Label grouping
	 * @param name Label key
	 * @param value value that this grouping.section resolves to.
	 */
	void setTestLabel(String section, String name, String value);
	
	/**
	 * Get the label set via setTestLabel. This will always use what was set via that method. 
	 * The getLabel() on LocalizationAdapter is what will get the resolved label using what is used in production first then the test label. 
	 * 
	 * @param section Label grouping
	 * @param name Label key
	 */
	String getTestLabel(String section, String name);
	
	/**
	 * Remove the test label from the context.
	 * @param section Label grouping
	 * @param name Label key
	 * @return removed value, or null if there was no value.
	 */
	String removeTestLabel(String section, String name);
}
