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
package org.auraframework.components.aurajstest;

import java.util.List;
import java.util.Map.Entry;
import java.util.Set;

import org.apache.http.NameValuePair;
import org.apache.http.client.utils.URLEncodedUtils;
import org.apache.http.message.BasicNameValuePair;
import org.auraframework.Aura;
import org.auraframework.def.TestCaseDef;
import org.auraframework.def.TestSuiteDef;
import org.auraframework.instance.BaseComponent;
import org.auraframework.system.Annotations.AuraEnabled;
import org.auraframework.system.Annotations.Model;
import org.auraframework.system.AuraContext;
import org.auraframework.throwable.quickfix.QuickFixException;

import com.google.common.collect.Lists;

@Model
public class JSTestCaseModel {
    private final String url;
    private final int count;

    public JSTestCaseModel() throws QuickFixException {
        AuraContext context = Aura.getContextService().getCurrentContext();
        BaseComponent<?, ?> component = context.getCurrentComponent();

        TestCaseDef caseDef = (TestCaseDef) component.getAttributes().getValue("case");

        String baseUrl = component.getAttributes().getValue("url").toString();
        Set<Entry<String, Object>> attributes = caseDef.getAttributeValues().entrySet();
        List<NameValuePair> newParams = Lists.newArrayList();
        String hash = "";
        if (!attributes.isEmpty()) {
            for (Entry<String, Object> entry : attributes) {
                String key = entry.getKey();
                String value = entry.getValue().toString();
                if (key.equals("__layout")) {
                    hash = value;
                } else {
                    newParams.add(new BasicNameValuePair(key, value));
                }
            }
        }
        newParams.add(new BasicNameValuePair("aura.test", caseDef.getDescriptor().getQualifiedName()));
        url = baseUrl + "&" + URLEncodedUtils.format(newParams, "UTF-8") + hash;
        count = ((TestSuiteDef) component.getAttributes().getValue("suite")).getTestCaseDefs().size();
    }

    @AuraEnabled
    public String getUrl() {
        return url;
    }

    @AuraEnabled
    public Integer getCount() {
        return count;
    }
}
