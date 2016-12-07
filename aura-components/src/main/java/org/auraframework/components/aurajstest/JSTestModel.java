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

import java.util.ArrayList;
import java.util.List;

import org.auraframework.annotations.Annotations.ServiceComponentModelInstance;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.TestCaseDef;
import org.auraframework.def.TestSuiteDef;
import org.auraframework.ds.servicecomponent.ModelInstance;
import org.auraframework.instance.BaseComponent;
import org.auraframework.service.ContextService;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.Annotations.AuraEnabled;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.throwable.quickfix.QuickFixException;

@ServiceComponentModelInstance
public class JSTestModel implements ModelInstance {

    private final DefDescriptor<TestSuiteDef> descriptor;
    private final TestSuiteDef def;
    private final String url;
    private final List<TestCaseDef> tcds;
    private final DefinitionService definitionService;
    
    public JSTestModel(ContextService contextService, DefinitionService definitionService) throws QuickFixException {
        this.definitionService = definitionService;
        
    	AuraContext context = contextService.getCurrentContext();
        BaseComponent<?, ?> component = context.getCurrentComponent();

        String desc = (String) component.getAttributes().getValue("descriptor");
        DefType defType = DefType.valueOf(((String) component.getAttributes().getValue("defType")).toUpperCase());

        desc = "js://" + desc.replace(':', '.');
        descriptor = definitionService.getDefDescriptor(desc, TestSuiteDef.class);
        def = definitionService.getDefinition(descriptor);
        if (def == null) {
            throw new DefinitionNotFoundException(descriptor);
        }
        long nonce = System.currentTimeMillis();

        Mode testMode = context.getMode();
        if (Mode.JSTESTDEBUG.equals(testMode) || Mode.AUTOJSTESTDEBUG.equals(testMode)) {
            testMode = Mode.AUTOJSTESTDEBUG;
        } else {
            testMode = Mode.AUTOJSTEST;
        }
        url = String.format("/%s/%s.%s?aura.nonce=%s&aura.mode=%s&aura.testReset=true", descriptor.getNamespace(), descriptor.getName(),
                defType == DefType.COMPONENT ? "cmp" : "app", nonce, testMode.name());

        String test = (String) component.getAttributes().getValue("test");
        tcds = filterTestCases(test);
    }

    private List<TestCaseDef> filterTestCases(String test) throws QuickFixException {
        if (test != null) {
            List<TestCaseDef> temp = definitionService.getDefinition(descriptor).getTestCaseDefs();
            for (TestCaseDef t : temp) {
                if (t.getName().equals(test)) {
                    List<TestCaseDef> testCases = new ArrayList<>();
                    testCases.add(t);
                    return testCases;
                }
            }
        }
        return definitionService.getDefinition(descriptor).getTestCaseDefs();
    }

    @AuraEnabled
    public TestSuiteDef getTestSuite() throws QuickFixException {
        return def;
    }

    @AuraEnabled
    public List<TestCaseDef> getTestCases() throws QuickFixException {
        return tcds;
    }

    @AuraEnabled
    public String getUrl() {
        return url;
    }

}
