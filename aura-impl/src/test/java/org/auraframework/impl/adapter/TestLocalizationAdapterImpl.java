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
/*
 * Copyright, 1999-2011, salesforce.com All Rights Reserved Company Confidential
 */
package org.auraframework.impl.adapter;

import java.util.HashMap;
import java.util.Map;

import org.auraframework.impl.context.LocalizationAdapterImpl;

public class TestLocalizationAdapterImpl extends LocalizationAdapterImpl {
	private static Map<String, String> labels = new HashMap<>();
    static {
        labels.put("dynamic_label_for_test", "we have {0} members");
    }
    
    public TestLocalizationAdapterImpl() {}
    
    @Override
    public String getLabel(String section, String name, Object... params) {
        String label = labels.get(name);
        if (label == null) {
        	return super.getLabel(section, name, params);
        }
        return label;
    }
}
