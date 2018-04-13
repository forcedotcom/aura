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
import java.io.Writer;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.def.*;
import org.auraframework.http.RequestParam.IntegerParam;
import org.auraframework.http.RequestParam.StringParam;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.throwable.quickfix.QuickFixException;

@ServiceComponent
public class TestJs extends AuraResourceImpl {
    private static final int DEFAULT_JSTEST_TIMEOUT = 30;

    private final StringParam BUNDLE_PARAM = new StringParam("bundle", 0, true);
    private final StringParam TEST_PARAM = new StringParam("test", 0, true);
    private final IntegerParam TIMEOUT_PARAM = new IntegerParam("timeout", false);

    public TestJs() {
        super("test.js", Format.JS);
    }

    @Override
    public void write(HttpServletRequest request, HttpServletResponse response, AuraContext context)
            throws IOException {
        try {
            if (!configAdapter.isTestAllowed()) {
                servletUtilAdapter.send404(request.getServletContext(), request, response);
            }
            servletUtilAdapter.setNoCache(response);

            String bundle = BUNDLE_PARAM.get(request);
            String testName = TEST_PARAM.get(request);
            int timeout = TIMEOUT_PARAM.get(request, DEFAULT_JSTEST_TIMEOUT);
            
            DefDescriptor<TestSuiteDef> suiteDesc = definitionService.getDefDescriptor(
                    DefDescriptor.JAVASCRIPT_PREFIX + "://" + bundle.replace(":", "."), TestSuiteDef.class);

            Writer out = response.getWriter();

            TestSuiteDef suiteDef;
            try {
                suiteDef = definitionService.getDefinition(suiteDesc);
                getTestCase(suiteDef, testName);
            } catch (QuickFixException e) {
                out.append(String.format("$A.test.run('%s',{},1,{'message':'%s'}});", testName, e.getMessage()));
                return;
            }
            out.append(
                    String.format(
                        "var suiteCode=%2$s\n;" +
                        "var testBootstrapFunction = function(testName, suiteProps, testTimeout) { \n"+
                                "if(!$A.test.isComplete()) {\n"+
                                    "if(window.sessionStorage) {\n"+
                                        "var oldStatus = sessionStorage.getItem('TestRunStatus'); \n"+
                                        "sessionStorage.setItem('TestRunStatus',(oldStatus?oldStatus:'')+'Run '+testName+', timeStamp#'+$A.test.time()+'.'); \n"+
                                    "}\n"+
                                    "$A.test.run(testName, suiteProps, testTimeout, Aura['appBootstrap'] && Aura['appBootstrap']['error']); \n"+
                                "} else {\n"+
                                    "if(window.sessionStorage) {\n"+
                                        "var oldStatus = sessionStorage.getItem('TestRunStatus'); \n"+
                                        "sessionStorage.setItem('TestRunStatus',(oldStatus?oldStatus:'')+'Skip '+testName+', Test Already Complete, timeStamp#'+$A.test.time()+'.'); \n"+
                                    "}\n"+
                                "}\n"+
                        "}; \n"+
                        "if(window && window.Aura && window.Aura.appBootstrapStatus === 'loaded' " +//bootstrap is finished
                             "&& window.$A && window.$A.test && window.$A.test.isComplete instanceof Function ) { \n"+//but the test wasn't
                             "if(window.sessionStorage) {\n"+
                                    //"var oldStatus = sessionStorage.getItem('TestRunStatus'); \n"+
                                    "sessionStorage.setItem('TestRunStatus','Run %1$s directly, as bootstrap finish before we can push test to its run-after, timeStamp#'+$A.test.time()+'.'); \n"+
                             "}\n"+
                             "testBootstrapFunction('%1$s', suiteCode, '%3$s'); \n"+
                        "} else {\n"+
                            "if(window.sessionStorage) {\n"+
                                //"var oldStatus = sessionStorage.getItem('TestRunStatus'); \n"+
                                "sessionStorage.setItem('TestRunStatus','Push %1$s to bootstrap run after, timeStamp#'+((window.$A && window.$A.test) ? $A.test.time():Date.now())+'.'); \n"+
                            "}\n"+
                            "window.Aura || (window.Aura = {}); \n"+
                            "window.Aura.afterBootstrapReady || (window.Aura.afterBootstrapReady = []); \n"+
                            "window.Aura.afterBootstrapReady.push(testBootstrapFunction.bind(this, '%1$s', suiteCode, '%3$s')); \n"+
                        "} \n"
                        ,testName, suiteDef.getCode()+"\t\n", timeout)
            );
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
