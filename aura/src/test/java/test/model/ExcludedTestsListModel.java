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
package test.model;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.EnumSet;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import junit.framework.TestSuite;

import org.auraframework.system.Annotations.AuraEnabled;
import org.auraframework.system.Annotations.Model;
import org.auraframework.test.ComponentJSTestSuiteTest;
import org.auraframework.test.TestInventory;
import org.auraframework.test.WebDriverProvider;
import org.auraframework.test.WebDriverTestCase;
import org.auraframework.test.WebDriverUtil;
import org.auraframework.test.WebDriverUtil.BrowserType;
import org.auraframework.util.ServiceLocator;
import org.auraframework.util.json.Json;
import org.auraframework.util.json.JsonSerializable;

import com.google.common.collect.Lists;

@Model
public class ExcludedTestsListModel {

    private int totalTestCount;
    private final Map<WebDriverUtil.BrowserType, Browser> browserMap;

    public ExcludedTestsListModel() {
        // Initialize map
        browserMap = new HashMap<WebDriverUtil.BrowserType, Browser>();
        for (BrowserType bt : BrowserType.values()) {
            Browser b = new Browser(bt.name());
            browserMap.put(bt, b);
        }

        // Set the browser types to all browsers so logic in WebDriverUtil.getBrowserListForTestRun works
        String origBrowsers = System.getProperty(WebDriverProvider.BROWSER_TYPE_PROPERTY);
        String allBrowsers = EnumSet.allOf(WebDriverUtil.BrowserType.class).toString();
        String allBrowsersTrimmed = allBrowsers.substring(1, allBrowsers.length() - 1);
        System.setProperty(WebDriverProvider.BROWSER_TYPE_PROPERTY, allBrowsersTrimmed);

        // We only ignore browsers on Web tests, so just grab those
        Set<TestInventory> testInventories = ServiceLocator.get().getAll(TestInventory.class);
        for (TestInventory ti : testInventories) {
            processTestSuite(ti.getTestSuite(TestInventory.Type.WEB));
        }

        System.setProperty(WebDriverProvider.BROWSER_TYPE_PROPERTY, origBrowsers);
    }

    /**
     * Go down the nested TestSuites until we get down to the individual tests, then find out what browsers each test
     * doesn't run on and increment our counters.
     */
    private void processTestSuite(TestSuite suite) {
        for (int i = 0; i < suite.testCount(); i++) {
            TestSuite ts = (TestSuite) suite.testAt(i);
            if (!ts.getName().equals("JS component tests")) {
                for (int j = 0; j < ts.testCount(); j++) {
                    try {
                        WebDriverTestCase test = (WebDriverTestCase) ts.testAt(j);
                        Set<BrowserType> browserList = WebDriverUtil.getBrowserListForTestRun(test.getTargetBrowsers(),
                                test.getExcludedBrowsers());
                        Set<BrowserType> ignoredBrowsers = EnumSet.complementOf(EnumSet.copyOf(browserList));
                        incrementCounters(test, ignoredBrowsers);
                    } catch (ClassCastException e) {
                        // If we have a test class without any test methods we don't get an error until we try cast the
                        // empty TestSuite to a WebDriverTestCase. Ignore and keep going.
                    }
                }
            } else {
                // Javascript component test suites are handled differently.
                processJsTestSuite(ts);
            }
        }
    }

    /**
     * Dig a little deeper to get to the individual Javascript tests.
     */
    private void processJsTestSuite(TestSuite ts) {
        for (int i = 0; i < ts.testCount(); i++) {
            TestSuite ts1 = (TestSuite) ts.testAt(i);
            for (int j = 0; j < ts1.testCount(); j++) {
                TestSuite ts2 = (TestSuite) ts1.testAt(j);
                for (int k = 0; k < ts2.testCount(); k++) {
                    ComponentJSTestSuiteTest.ComponentTestCase test = (ComponentJSTestSuiteTest.ComponentTestCase) ts2
                            .testAt(k);
                    Set<BrowserType> browserList = WebDriverUtil.getBrowserListForTestRun(test.getTargetBrowsers(),
                            test.getExcludedBrowsers());
                    Set<BrowserType> ignoredBrowsers = EnumSet.complementOf(EnumSet.copyOf(browserList));
                    incrementCounters(test, ignoredBrowsers);
                }
            }
        }
    }

    private void incrementCounters(WebDriverTestCase test, Set<BrowserType> browsers) {
        totalTestCount++;

        for (BrowserType bt : browsers) {
            browserMap.get(bt).getIgnoredTests().add(test.getQualifiedName());
        }
    }

    @AuraEnabled
    public int getTotalTestCount() {
        return totalTestCount;
    }

    @AuraEnabled
    public List<Browser> getBrowserInfo() {
        List<Browser> list = new ArrayList<Browser>(browserMap.values());
        Collections.sort(list); // Put in alphabetical order
        return list;
    }

    public class Browser implements JsonSerializable, Comparable<Browser> {
        public final String name;
        public final List<String> ignoredTests;

        public Browser(String name) {
            this.name = name;
            this.ignoredTests = Lists.newArrayList();
        }

        @AuraEnabled
        public String getName() {
            return this.name;
        }

        @AuraEnabled
        public List<String> getIgnoredTests() {
            return this.ignoredTests;
        }

        @AuraEnabled
        public String getIgnoredTestCount() {
            return "" + ignoredTests.size();
        }

        @Override
        public void serialize(Json json) throws IOException {
            json.writeMapBegin();
            json.writeMapEntry("name", this.name);
            json.writeMapKey("ignoredTests");
            json.writeValue(this.ignoredTests);
            json.writeMapEntry("ignoredTestCount", "" + ignoredTests.size());
            json.writeMapEnd();
        }

        @Override
        public int compareTo(Browser o) {
            int result = this.name.compareTo(o.getName());
            if (result < 0) {
                return -1;
            } else if (result > 0) {
                return 1;
            }
            return 0;
        }
    }
}
