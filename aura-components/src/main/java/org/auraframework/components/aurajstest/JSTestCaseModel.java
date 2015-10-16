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

import org.auraframework.Aura;
import org.auraframework.def.TestCaseDef;
import org.auraframework.instance.BaseComponent;
import org.auraframework.system.Annotations.AuraEnabled;
import org.auraframework.system.Annotations.Model;
import org.auraframework.system.AuraContext;
import org.auraframework.throwable.quickfix.QuickFixException;

@Model
public class JSTestCaseModel {
    private final String url;

    public JSTestCaseModel() throws QuickFixException {
        AuraContext context = Aura.getContextService().getCurrentContext();
        BaseComponent<?, ?> component = context.getCurrentComponent();

        TestCaseDef caseDef = (TestCaseDef) component.getAttributes().getValue("case");

        url = component.getAttributes().getValue("url").toString() + "&aura.jstestrun=" + caseDef.getName();
    }

    @AuraEnabled
    public String getUrl() {
        return url;
    }
}
