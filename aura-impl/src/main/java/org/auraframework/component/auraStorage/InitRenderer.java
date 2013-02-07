/*
 * Copyright (C) 2012 salesforce.com, inc.
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
package org.auraframework.component.auraStorage;

import java.io.IOException;

import org.auraframework.def.Renderer;
import org.auraframework.instance.AttributeSet;
import org.auraframework.instance.BaseComponent;
import org.auraframework.throwable.quickfix.QuickFixException;

public class InitRenderer implements Renderer{

	@Override
	public void render(BaseComponent<?, ?> component, Appendable appendable)
			throws IOException, QuickFixException {
		
		AttributeSet attributes = component.getAttributes();
		String implementation = (String) attributes.getValue("implementation");
		Number defaultExpiration = (Number) attributes.getValue("defaultExpiration");
		Number defaultAutoRefreshInterval = (Number) attributes.getValue("defaultAutoRefreshInterval");
		Number maxSize = (Number) attributes.getValue("maxSize");
		Boolean clearStorageOnInit = (Boolean) attributes.getValue("clearStorageOnInit");
		Boolean debugLoggingEnabled = (Boolean) attributes.getValue("debugLoggingEnabled");

		appendable.append("<script>\n");
		
		appendable.append(String.format("$A.storageService.setStorage('%s', %d, %d, %d, %s, %s)", 
				implementation, maxSize.longValue() * 1024, defaultExpiration, defaultAutoRefreshInterval, debugLoggingEnabled, clearStorageOnInit));
		
		appendable.append("</script>\n");
	}

}
