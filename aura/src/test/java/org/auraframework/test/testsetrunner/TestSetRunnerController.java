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
package org.auraframework.test.testsetrunner;

import java.util.Enumeration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReadWriteLock;
import java.util.concurrent.locks.ReentrantReadWriteLock;

import javax.annotation.concurrent.GuardedBy;

import junit.framework.Test;
import junit.framework.TestFailure;
import junit.framework.TestResult;

import org.auraframework.system.Annotations.Controller;
import org.auraframework.system.Annotations.Key;
import org.auraframework.system.Annotations.AuraEnabled;
import org.auraframework.test.WebDriverProvider;
import org.auraframework.util.AuraUtil;
import org.auraframework.test.annotation.ThreadHostileTest;

/**
 * This controller handles the execution and result collection of test cases on behalf of client-initiated requests.
 */
@Controller
public class TestSetRunnerController {
    /**
     * A small helper to encapsulate the creation of a {@link ThreadPoolExecutor} for test execution. TODO: add the
     * ability to abort the pending tasks.
     */
    private static class ExecutorQueue {
        private final LinkedBlockingQueue<Runnable> queue;
        private final ThreadPoolExecutor threadPool;

        /**
         * Keep track of the number of pending/running tasks in the executor.
         */
        @GuardedBy("this")
        private int taskCount = 0;

        private ExecutorQueue(int coreSize, int poolSize) {
            queue = new LinkedBlockingQueue<Runnable>();
            threadPool = new ThreadPoolExecutor(coreSize, poolSize, 0, TimeUnit.SECONDS, queue);
        }

        /**
         * Enqueue a runnable task on the executor.
         */
        public synchronized void submit(final Runnable r) {
            // After running the given task, check to see if the executor is empty.
            Runnable wrappedRunnable = new Runnable() {
                @Override
                public void run() {
                    try {
                        r.run();
                    } finally {
                        synchronized (this) {
                            taskCount--;
                            if (taskCount == 0) {
                                onExecutorEmpty();
                            }
                        }
                    }
                }
            };
            taskCount++;
            threadPool.submit(wrappedRunnable);
        }

        /**
         * Called when the executor transitions from the active into the empty state. Synchronized on this so that no
         * new tasks may submit while we are running cleanup code.
         */
        private synchronized void onExecutorEmpty() {
            WebDriverProvider provider = AuraUtil.get(WebDriverProvider.class);
            if (provider != null) {
                provider.release();
            }
        }

        /**
         * @return true if the executor is currently active (not empty).
         */
        public synchronized boolean isActive() {
            return taskCount > 0;
        }
    }

    /**
     * A helper to enable lazy static initialization of the {@link ExecutorQueue}.
     */
    private static class ExecutorQueueHolder {
        // TODO: Enable parallel execution by default (and/or make configurable) once the known
        // parallel test flappers are addressed.
        private static ExecutorQueue INSTANCE = new ExecutorQueue(1, 1);
    }

    /**
     * @return the singleton {@link ExecutorQueue} instance.
     */
    private static ExecutorQueue getExecutorQueue() {
        return ExecutorQueueHolder.INSTANCE;
    }

    /**
     * Enqueue multiple tests for execution.
     * 
     * @param tests
     *            the tests to execute
     * @throws Exception
     */
    @AuraEnabled
    public static void runTestSet(@Key("testSet") List<String> tests) throws Exception {
        changeStatus(tests, "ENQUEUED");
        for (String name : tests) {
            TestRunner testRunner = new TestRunner(name);
            getExecutorQueue().submit(testRunner);
        }
    }

    /**
     * Bulk update the status of the given tests and clear any exceptions they might have.
     * 
     * @param tests
     *            the tests to update
     * @param status
     *            the new status to give to the tests
     */
    private static void changeStatus(List<String> tests, String status) throws Exception {
        for (String t : tests) {
            TestSetRunnerState testRunnerState = TestSetRunnerState.getInstance();
            testRunnerState.setTestProp(t, "status", status);
            testRunnerState.setTestProp(t, "exception", "");
        }
    }

    /**
     * Query the current status of test execution.
     */
    @AuraEnabled
    public static Map<String, Object> pollForTestRunStatus() throws Exception {
        Map<String, Object> r = new HashMap<String, Object>();
        Map<String, Map<String, Object>> m = TestSetRunnerState.getInstance().getTestsWithPropertiesMap();
        r.put("testsRunning", getExecutorQueue().isActive());
        r.put("testsWithPropsMap", m);
        return r;
    }

    /**
     * A {@link Runnable} adapter to schedule a test for execution and collect its results.
     */
    private static class TestRunner implements Runnable {
        private final String testName;
        /**
         * This lock ensures that a {@link ThreadHostileTest} is not run concurrently with any other tests because it
         * must obtain the write lock.
         */
        private static final ReadWriteLock globalStateLock = new ReentrantReadWriteLock();

        public TestRunner(String testName) {
            this.testName = testName;
        }

        @Override
        public void run() {
            TestResult result = new TestResult();
            TestSetRunnerState testRunnerState = TestSetRunnerState.getInstance();
            assert (testRunnerState.getInventory().get(testName) != null) : "Encountered an unknown test: " + testName;
            testRunnerState.setTestProp(testName, "status", "RUNNING");
            Test test = testRunnerState.getInventory().get(testName);

            Lock lock;
            Class<? extends Test> clazz = test.getClass();
            if (clazz.getAnnotation(ThreadHostileTest.class) != null) {
                // Thread hostile tests need to run alone and therefore require the write lock.
                lock = globalStateLock.writeLock();
            } else {
                // Regular tests can run concurrently
                lock = globalStateLock.readLock();
            }

            // Run the test.
            lock.lock();
            try {
                test.run(result);
            } finally {
                lock.unlock();
            }

            // Gather the results.
            if (result.wasSuccessful()) {
                testRunnerState.setTestProp(testName, "status", "PASSED");
            } else {
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

        }
    }
}