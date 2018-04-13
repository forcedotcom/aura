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

import java.io.IOException;
import java.util.List;
import java.util.Set;

import javax.inject.Inject;

import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.DescriptorFilter;
import org.auraframework.def.TestCaseDef;
import org.auraframework.def.TestSuiteDef;
import org.auraframework.ds.servicecomponent.Controller;
import org.auraframework.service.ContextService;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.Annotations.AuraEnabled;
import org.auraframework.system.Annotations.Key;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;
import org.auraframework.util.json.JsonSerializable;

import com.google.common.collect.Lists;

@ServiceComponent
public class JSTestController implements Controller {

    @Inject
    private DefinitionService definitionService;

    @Inject
    private ContextService contextService;
    
    private List<TestSuiteDef> getTestSuiteDef(String desc) throws DefinitionNotFoundException, QuickFixException {
        List<TestSuiteDef> suites = Lists.newLinkedList();
        Set<DefDescriptor<?>> suiteDescriptors = definitionService.find(new DescriptorFilter(desc, DefType.TESTSUITE));
        if (suiteDescriptors == null || suiteDescriptors.isEmpty()) {
            throw new AuraRuntimeException("No tests found for " + desc);
        }
        for (DefDescriptor<?> suiteDesc : suiteDescriptors) {
            suites.add((TestSuiteDef)suiteDesc.getDef());
        }
        if (suites.isEmpty()) {
            throw new AuraRuntimeException("No tests found for " + desc);
        }
        return suites;
    }

    @AuraEnabled
    public String getSource(@Key("descriptor") String desc) throws QuickFixException {
        List<TestSuiteDef> def = getTestSuiteDef(desc);
        if (def.size() == 1) {
            return def.get(0).getCode();
        } else {
            throw new AuraRuntimeException("Could not retrieve source for " + desc);
        }
    }

    private class TestCase implements JsonSerializable {
        private final String name;
        private final String bundle;
        private final String url;
        
        public TestCase(String name, String bundle, String url) {
            this.name = name;
            this.bundle = bundle;
            this.url = url;
        }

        @Override
        public void serialize(Json json) throws IOException {
            json.writeMapBegin();
            json.writeMapEntry("name", name);
            json.writeMapEntry("bundle", bundle);
            json.writeMapEntry("url", url);
            json.writeMapEnd();
        }
    }
    
    @AuraEnabled
    public List<TestCase> getTestCases(@Key("descriptor") String descriptorFilter, @Key("test") String filterName)
            throws QuickFixException {
        List<TestCase> testCases = Lists.newLinkedList();
        for(TestSuiteDef def : getTestSuiteDef(descriptorFilter)) {
            for (TestCaseDef testCase : def.getTestCaseDefs()) {
                String testName = testCase.getName();
                if (filterName != null && !testName.equals(filterName)) {
                    continue;
                }
                AuraContext context = contextService.getCurrentContext();
                String contextPath = context.getContextPath();
                Mode mode = context.getMode().name().endsWith("DEBUG") ? Mode.AUTOJSTESTDEBUG : Mode.AUTOJSTEST;
                DefType defType = testCase.getDefType();
                String bundle = testCase.getDescriptor().getDescriptorName().split("/")[0].replace(".", ":");
                String url;
                if (DefType.APPLICATION.equals(defType)) {
                    String extension = DefType.APPLICATION.equals(defType) ? ".app" : ".cmp";
                    url = contextPath + "/" + bundle.replace(":","/") + extension +
                        "?aura.jstestrun=" + testName +
                        "&aura.mode=" + mode +
                        "&aura.testReset=true";
                } else {
                    url = contextPath + "/auratest/test.app" +
                        "?test=" + testName +
                        "&descriptor=" + bundle +
                        "&aura.mode=" + mode +
                        "&aura.testReset=true";
                }

                testCases.add(new TestCase(testName, bundle, url));
            }
        };
        return testCases;
    }
}
