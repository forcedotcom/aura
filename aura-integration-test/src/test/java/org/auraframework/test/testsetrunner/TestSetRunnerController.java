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
package org.auraframework.test.testsetrunner;

import junit.framework.TestFailure;
import junit.framework.TestResult;

import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.ds.servicecomponent.Controller;
import org.auraframework.integration.test.util.TestExecutor;
import org.auraframework.integration.test.util.TestExecutor.TestRun;
import org.auraframework.system.Annotations.AuraEnabled;
import org.auraframework.system.Annotations.Key;
import org.auraframework.test.perf.util.PerfExecutorTestCase;
import org.auraframework.test.util.WebDriverProvider;

import java.util.Enumeration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * This controller handles the execution and result collection of test cases on behalf of client-initiated requests.
 */
@ServiceComponent
public class TestSetRunnerController implements Controller {
    /**
     * Enqueue multiple tests for execution.
     * 
     * @param tests the tests to execute
     * @throws Exception
     */
    @AuraEnabled
    public void runTestSet(@Key("testSet") List<String> tests, @Key("scope") String scope, @Key("headless") boolean headless) throws Exception {
        changeStatus(tests, "ENQUEUED", scope);
        System.setProperty(WebDriverProvider.BROWSER_RUN_HEADLESS_PROPERTY, headless ? "true" : "false");
        for (String name : tests) {
            StatefulTestRun testRunner = new StatefulTestRun(name, scope);
            TestExecutor.getInstance().submit(testRunner);
        }
    }

    /**
     * Bulk update the status of the given tests and clear any exceptions they might have.
     * 
     * @param tests the tests to update
     * @param status the new status to give to the tests
     */
    private void changeStatus(List<String> tests, String status, String scope) throws Exception {
        for (String t : tests) {
            TestSetRunnerState testRunnerState = TestSetRunnerState.getInstanceByScope(scope);
            testRunnerState.setTestProp(t, "status", status);
            testRunnerState.setTestProp(t, "exception", "");
        }
    }

    /**
     * Query the current status of test execution.
     */
    @AuraEnabled
    public Map<String, Object> pollForTestRunStatus(@Key("scope") String scope) throws Exception {
        Map<String, Object> r = new HashMap<>();
        Map<String, Map<String, Object>> m = TestSetRunnerState.getInstanceByScope(scope).getTestsWithPropertiesMap();
        r.put("testsRunning", TestExecutor.getInstance().isActive());
        r.put("testsWithPropsMap", m);
        return r;
    }

    /**
     * A {@link Callable} adapter to schedule a test for execution and collect its results.
     */
    private class StatefulTestRun extends TestRun {
        private final String testName;
		private String scope;

        public StatefulTestRun(String testName) {
            super(TestSetRunnerState.getFuncInstance().getInventory().get(testName), new TestResult());
            this.testName = testName;
        }
        
        public StatefulTestRun(String testName, String scope) {
            super(TestSetRunnerState.getInstanceByScope(scope).getInventory().get(testName), new TestResult());
            this.testName = testName;
            this.scope = scope;
        }

        @Override
        public TestResult call() throws Exception {
            TestSetRunnerState testRunnerState = TestSetRunnerState.getInstanceByScope(scope);
            boolean finished = false;
            assert (test != null) : "Encountered an unknown test: " + testName;
            testRunnerState.setTestProp(testName, "status", "RUNNING");

            super.call();

            // Gather the results.
            if (result.wasSuccessful()) {
                testRunnerState.setTestProp(testName, "status", "PASSED");
                finished = true;
            } else {
            	finished = true;
                testRunnerState.setTestProp(testName, "status", "FAILED");
                StringBuffer res = new StringBuffer("Failures:\n");
                for (Enumeration<TestFailure> fs = result.failures(); fs.hasMoreElements();) {
                    TestFailure f = fs.nextElement();
                    testRunnerState.setTestProp(testName, "exception", "Failure\n" + f.trace());
                    f.exceptionMessage();
                    res.append(f.exceptionMessage()).append("\n");
                }
                res.append("Errors:\n");
                for (Enumeration<TestFailure> fs = result.errors(); fs.hasMoreElements();) {
                    TestFailure f = fs.nextElement();
                    testRunnerState.setTestProp(testName, "exception", "Error\n" + f.trace());
                    res.append(f.exceptionMessage()).append("\n");
                }
                System.out.println(res.toString());
            }
            
            // Perf special handling
            // @dval: This makes no sense here because it exposes a perf Class
            // Remove all this once we refactor the perfRunner.
            if (finished && test instanceof PerfExecutorTestCase) {
            	testRunnerState.setTestProp(testName, "perfInfo", ((PerfExecutorTestCase)test).getLastCollectedMetrics().toString());
            }
            
            return result;
        }
    }
}
