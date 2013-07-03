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
package org.auraframework;

import java.util.Collection;
import java.util.Collections;
import java.util.Enumeration;
import java.util.List;
import java.util.Set;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.logging.Logger;

import junit.framework.Test;
import junit.framework.TestCase;
import junit.framework.TestResult;
import junit.framework.TestSuite;

import org.auraframework.test.TestExecutor;
import org.auraframework.test.WebDriverProvider;
import org.auraframework.test.TestExecutor.TestRun;
import org.auraframework.test.TestInventory;
import org.auraframework.test.TestInventory.Type;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.util.AuraUtil;
import org.auraframework.util.ServiceLocator;

import com.google.common.collect.Lists;

/**
 * Run all integration tests.
 * 
 * If the "testNameContains" system property is set, filter tests to run only those tests containing the provided string
 * (case-insensitive).
 */
public class AuraIntegrationTests extends TestSuite {
    public static final boolean RANDOM_ORDER = Boolean.parseBoolean(System.getProperty("testShuffle", "false"));
    private final String nameFragment;

    public static TestSuite suite() {
        return new AuraIntegrationTests();
    }

    private AuraIntegrationTests() {
        String frag = System.getProperty("testNameContains");
        if (frag != null && !frag.trim().equals("")) {
            nameFragment = frag.toLowerCase();
        } else {
            nameFragment = null;
        }
    }

    /**
     * Run integration tests in parallel.
     */
    @Override
    public void run(final TestResult masterResult) {
        Logger logger = Logger.getLogger(getClass().getName());
        logger.info("Building test inventories");
        if (nameFragment != null) {
            logger.info("Filtering by test names containing: " + nameFragment);
        }
        Set<TestInventory> inventories = ServiceLocator.get().getAll(TestInventory.class);
        List<Callable<TestResult>> queue = Lists.newLinkedList();
        List<Callable<TestResult>> hostileQueue = Lists.newLinkedList();
        for (TestInventory inventory : inventories) {
            for (Type type : new Type[] { Type.INTEGRATION, Type.WEB }) {
                TestSuite child = inventory.getTestSuite(type);
                if (child != null) {
                    for (Enumeration<?> tests = child.tests(); tests.hasMoreElements();) {
                        queueTest((Test) tests.nextElement(), masterResult, queue, hostileQueue);
                    }
                }
            }
        }

        if (RANDOM_ORDER) {
            logger.info("Randomizing test execution order");
            Collections.shuffle(queue);
            Collections.shuffle(hostileQueue);
        }
        ExecutorService executor = Executors.newFixedThreadPool(TestExecutor.NUM_THREADS);
        try {
            logger.info(String.format("Executing parallelizable tests with %s threads", TestExecutor.NUM_THREADS));
            long start = System.currentTimeMillis();
            executor.invokeAll(queue);
            logger.info(String.format("Completed %s tests in %s ms", queue.size(), System.currentTimeMillis() - start));

            logger.info("Executing thread hostile tests");
            start = System.currentTimeMillis();
            executor.invokeAll(hostileQueue);
            logger.info(String.format("Completed %s thread hostile tests in %s ms", hostileQueue.size(),
                    System.currentTimeMillis() - start));
        } catch (InterruptedException e) {
            throw new AuraRuntimeException("TEST RUN INTERRUPTED", e);
        } finally {
            executor.shutdown();
            WebDriverProvider provider = AuraUtil.get(WebDriverProvider.class);
            if (provider != null) {
                logger.info("Releasing WebDriver resources");
                provider.release();
            }
        }
    }

    private void queueTest(final Test test, final TestResult result, Collection<Callable<TestResult>> queue,
            Collection<Callable<TestResult>> hostileQueue) {
        // queue up TestCases individually so they can be fully parallelized (vs. per-suite)
        if (test instanceof TestSuite) {
            TestSuite suite = (TestSuite) test;
            for (int i = 0; i < suite.testCount(); i++) {
                queueTest(suite.testAt(i), result, queue, hostileQueue);
            }
        } else if (test instanceof TestCase) {
            if (nameFragment != null) {
                String testName = test.getClass().getName().toLowerCase() + "."
                        + ((TestCase) test).getName().toLowerCase();
                if (!testName.contains(nameFragment)) {
                    return;
                }
            }
            TestRun callable = new TestRun(test, result);
            if (TestExecutor.isThreadHostile(test)) {
                hostileQueue.add(callable);
            } else {
                queue.add(callable);
            }
        }
    }
}
