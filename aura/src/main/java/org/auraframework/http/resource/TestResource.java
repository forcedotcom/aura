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

package org.auraframework.http.resource;

import java.io.IOException;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.TestCaseDef;
import org.auraframework.def.TestSuiteDef;
import org.auraframework.http.RequestParam.StringParam;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.throwable.quickfix.QuickFixException;

abstract class TestResource extends AuraResourceImpl {
    private final StringParam DESC_PARAM = new StringParam("desc", 0, true);
    private final StringParam TEST_PARAM = new StringParam("test", 0, true);

    TestResource(String name, Format format) {
        super(name, format);
    }

    abstract void write(HttpServletResponse response, TestSuiteDef testSuite, String testName) throws IOException, QuickFixException;

    @Override
    public void write(HttpServletRequest request, HttpServletResponse response, AuraContext context)
            throws IOException {
        try {
            if (!configAdapter.isTestAllowed()) {
                servletUtilAdapter.send404(request.getServletContext(), request, response);
            }

            String descriptor = DESC_PARAM.get(request);
            String testName = TEST_PARAM.get(request);
            DefDescriptor<?> targetDesc = definitionService.getDefDescriptor(descriptor, ComponentDef.class);
            DefDescriptor<TestSuiteDef> suiteDesc = definitionService.getDefDescriptor(
                    DefDescriptor.JAVASCRIPT_PREFIX+"://"+targetDesc.getDescriptorName(),
                    TestSuiteDef.class, targetDesc);

            TestSuiteDef testSuite = definitionService.getDefinition(suiteDesc);
            write(response, testSuite, testName);
        } catch (Throwable t) {
            servletUtilAdapter.handleServletException(t, false, context, request, response, false);
        }
    }

    TestCaseDef getTestCase(TestSuiteDef testSuite, String testName) throws QuickFixException {
        for (TestCaseDef currentTestDef : testSuite.getTestCaseDefs()) {
            if (testName.equals(currentTestDef.getName())) {
                currentTestDef.validateDefinition();
                return currentTestDef;
            }
        }
        throw new DefinitionNotFoundException(definitionService.getDefDescriptor(testName, TestCaseDef.class));
    }
}
