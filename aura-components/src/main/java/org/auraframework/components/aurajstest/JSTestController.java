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

import javax.inject.Inject;

import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.TestCaseDef;
import org.auraframework.def.TestSuiteDef;
import org.auraframework.ds.servicecomponent.Controller;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.Annotations.AuraEnabled;
import org.auraframework.system.Annotations.Key;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.throwable.quickfix.QuickFixException;

@ServiceComponent
public class JSTestController implements Controller {

    @Inject
    private DefinitionService definitionService;
    
    private TestSuiteDef getTestSuiteDef(String desc, String defType) throws DefinitionNotFoundException, QuickFixException {
        DefType type = DefType.valueOf(defType.toUpperCase());
        DefDescriptor<? extends BaseComponentDef> bundle;
        if (type == DefType.COMPONENT) {
            bundle = definitionService.getDefDescriptor(desc, ComponentDef.class);
        } else {
            bundle = definitionService.getDefDescriptor(desc, ApplicationDef.class);
        }
        desc = "js://" + desc.replace(':', '.');
        DefDescriptor<TestSuiteDef> descriptor = definitionService.getDefDescriptor(desc, TestSuiteDef.class, bundle);
        TestSuiteDef def = definitionService.getDefinition(descriptor);
        if (def == null) {
            throw new DefinitionNotFoundException(descriptor);
        }
        return def;
    }

    @AuraEnabled
    public String getSource(@Key("descriptor") String desc, @Key("defType") String defType) throws QuickFixException {
        TestSuiteDef def = getTestSuiteDef(desc, defType);
        return def.getCode();
    }

    @AuraEnabled
    public List<TestCaseDef> getTestCases(@Key("descriptor") String desc, @Key("defType") String defType,
            @Key("test") String testName) throws QuickFixException {
        TestSuiteDef def = getTestSuiteDef(desc, defType);
        if (testName != null) {
            List<TestCaseDef> temp = def.getTestCaseDefs();
            for (TestCaseDef t : temp) {
                if (t.getName().equals(testName)) {
                    List<TestCaseDef> testCases = new ArrayList<>();
                    testCases.add(t);
                    return testCases;
                }
            }
        }
        return def.getTestCaseDefs();
    }
}
