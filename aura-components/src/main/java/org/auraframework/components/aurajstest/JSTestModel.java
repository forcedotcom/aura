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
package org.auraframework.components.aurajstest;

import java.util.ArrayList;
import java.util.List;

import org.auraframework.Aura;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.TestCaseDef;
import org.auraframework.def.TestSuiteDef;
import org.auraframework.instance.BaseComponent;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.Annotations.AuraEnabled;
import org.auraframework.system.Annotations.Model;
import org.auraframework.system.AuraContext;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.throwable.quickfix.QuickFixException;

@Model
public class JSTestModel {

    private final DefDescriptor<TestSuiteDef> descriptor;
    private final TestSuiteDef def;
    private final String url;
    private final List<TestCaseDef> tcd;

    public JSTestModel() throws QuickFixException {
        AuraContext context = Aura.getContextService().getCurrentContext();
        BaseComponent<?, ?> component = context.getCurrentComponent();
        DefinitionService defService = Aura.getDefinitionService();

        String desc = (String) component.getAttributes().getValue("descriptor");
        DefType defType = DefType.valueOf(((String) component.getAttributes().getValue("defType")).toUpperCase());

        desc = "js://" + desc.replace(':', '.');
        descriptor = defService.getDefDescriptor(desc, TestSuiteDef.class);
        def = descriptor.getDef();
        if (def == null) {
            throw new DefinitionNotFoundException(descriptor);
        }
        long nonce = System.currentTimeMillis();

        url = String.format("/%s/%s.%s?aura.nonce=%s&aura.mode=AUTO%s", descriptor.getNamespace(),
                descriptor.getName(), defType == DefType.COMPONENT ? "cmp" : "app", nonce, context.getMode().name());

        String test = (String) component.getAttributes().getValue("test");
        tcd = filterTestCases(test);
    }

    private List<TestCaseDef> filterTestCases(String test) throws QuickFixException {
        if (test != null) {
            List<TestCaseDef> temp = descriptor.getDef().getTestCaseDefs();
            for (TestCaseDef t : temp) {
                if (t.getName().equals(test)) {
                    List<TestCaseDef> testCases = new ArrayList<TestCaseDef>();
                    testCases.add(t);
                    return testCases;
                }
            }
        }
        return descriptor.getDef().getTestCaseDefs();
    }

    @AuraEnabled
    public TestSuiteDef getTestSuite() throws QuickFixException {
        return def;
    }

    @AuraEnabled
    public List<TestCaseDef> getTestCases() throws QuickFixException {
        return tcd;
    }

    @AuraEnabled
    public String getUrl() {
        return url;
    }
}
