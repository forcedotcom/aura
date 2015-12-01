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
package org.auraframework.test;

import java.util.EnumSet;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

import junit.framework.Test;
import junit.framework.TestSuite;

import org.auraframework.Aura;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.DescriptorFilter;
import org.auraframework.def.TestCaseDef;
import org.auraframework.def.TestSuiteDef;
import org.auraframework.service.ContextService;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.AuraContext.Authentication;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.test.util.WebDriverTestCase;
import org.auraframework.test.util.WebDriverUtil;
import org.auraframework.test.util.WebDriverUtil.BrowserType;
import org.auraframework.util.test.annotation.JSTest;
import org.auraframework.util.test.annotation.UnAdaptableTest;

import com.google.common.collect.Sets;

/**
 * TODO(W-1386863): investigate why/fix the thread hostile nature of these tests.
 */
@UnAdaptableTest
@JSTest
public class ComponentJSTest extends TestSuite {

    public static TestSuite suite() throws Exception {
        TestSuite suite = new NamespaceTestSuite("*");
        suite.setName("JS Component Tests");
        return suite;
    }

    private static class FailTestCase extends WebDriverTestCase {
        private final Throwable cause;

        private FailTestCase(DefDescriptor<TestSuiteDef> descriptor, Throwable cause) {
            super(descriptor.getQualifiedName());
            this.cause = cause;
        }

        @Override
        public void runTest() throws Throwable {
            throw cause;
        }
    }

    @UnAdaptableTest
    public static class NamespaceTestSuite extends TestSuite {
        public NamespaceTestSuite(String namespace) throws Exception {
            super(namespace);
            ContextService contextService = Aura.getContextService();
            DefinitionService definitionService = Aura.getDefinitionService();

            boolean contextStarted = false;
            if (!contextService.isEstablished()) {
                contextStarted = true;
                contextService.startContext(Mode.JSTEST, Format.JSON, Authentication.AUTHENTICATED);
            }

            Map<String, TestSuite> subSuites = new HashMap<>();
            try {
                DescriptorFilter filter = new DescriptorFilter("js://" + namespace, DefType.TESTSUITE.toString());
                Set<DefDescriptor<?>> descriptors = definitionService.find(filter);

                for (DefDescriptor<?> qd : descriptors) {
                    @SuppressWarnings("unchecked")
                    DefDescriptor<TestSuiteDef> descriptor = (DefDescriptor<TestSuiteDef>) qd;
                    Test test;
                    try {
                        test = new ComponentTestSuite(descriptor.getDef());
                    } catch (Throwable t) {
                        test = new FailTestCase(descriptor, t);
                    }
                    String testNamespace = descriptor.getNamespace();
                    if (namespace.equals(testNamespace)) {
                        addTest(test);
                    } else {
                        TestSuite subSuite = subSuites.get(testNamespace);
                        if (subSuite == null) {
                            subSuite = new TestSuite(testNamespace);
                            subSuites.put(testNamespace, subSuite);
                            addTest(subSuite);
                        }
                        subSuite.addTest(test);
                    }
                }
            } catch (Throwable t) {
                System.err.println("Failed to load component tests for namespace: " + namespace);
                t.printStackTrace();
            } finally {
                if (contextStarted) {
                    contextService.endContext();
                }
            }
        }
    }

    private static class ComponentTestSuite extends TestSuite {

        private final DefDescriptor<TestSuiteDef> descriptor;

        private ComponentTestSuite(TestSuiteDef suiteDef) {
            super(String.format("%s.%s", suiteDef.getDescriptor().getNamespace(), suiteDef.getDescriptor().getName()));

            this.descriptor = suiteDef.getDescriptor();
            for (TestCaseDef caseDef : suiteDef.getTestCaseDefs()) {
                addTest(new ComponentTestCase(this, caseDef));
            }
        }

        public String getUrl(DefType defType) {
            String ext = ".cmp";
            if (defType == DefType.APPLICATION) {
                ext = ".app";
            }
            return String.format("/%s/%s%s", descriptor.getNamespace(), descriptor.getName(), ext);
        }
    }

    public static class ComponentTestCase extends WebDriverTestCase {
        private ComponentTestCase(ComponentTestSuite suite, TestCaseDef caseDef) {
            super(String.format("%s$%s", suite.getName(), caseDef.getName()));
            this.suite = suite;
            this.caseDef = caseDef;
            for (String browser : caseDef.getBrowsers()) {
                String token = browser.trim().toUpperCase();
                Set<BrowserType> set;
                if (token.charAt(0) == '-') {
                    token = token.substring(1);
                    set = excludedBrowsers;
                } else {
                    set = targetBrowsers;
                }
                try {
                	if (token.equals("MOBILE")) {
                        set.addAll(WebDriverUtil.MOBILE);
                    } else if (token.equals("DESKTOP")) {
                        set.addAll(WebDriverUtil.DESKTOP);      
                    } else {
                        set.add(BrowserType.valueOf(token));
                    }
                } catch (IllegalArgumentException e) {
                    fail("Unknown BrowserType: " + browser);
                }
            }
        }

        @Override
        public String toString() {
            return getName() + "(" + suite.descriptor.getName() + "Test.js)";
        }

        public String getUrl() {
            DefType defType = caseDef.getDefType();
            return String.format("%s?aura.jstestrun=%s&aura.testReset=true&aura.test=%s", suite.getUrl(defType),
                    caseDef.getName(), getQualifiedName());
        }

        /**
         * The URL for loading the test within the aurajstest:jstest app.  Used primarily by test:runner.
         */
        public String getAppUrl() {
            DefType defType = caseDef.getDefType();
            return suite.getUrl(defType) + "?aura.jstest=" + caseDef.getName() + "&aura.testReset=true";
        }

        @Override
        public String getQualifiedName() {
            String btype = getBrowserTypeString();
            return caseDef.getDescriptor().getQualifiedName() + btype;
        }

        // Override superRunTest() to be invoked in parent class runTest()
        @Override
        protected void superRunTest() throws Throwable {
            open(getUrl(), Mode.AUTOJSTEST, false);

            // Actions run on servers need special handling because their call
            // back methods are called asynchronously.
            // This check is to make sure all such calls were complete
            waitForCondition("return window.$A && window.$A.test && window.$A.test.isComplete()",
                    auraUITestingUtil.getTimeout());
        }

        @Override
        public Set<BrowserType> getTargetBrowsers() {
            return targetBrowsers;
        }

        @Override
        public Set<BrowserType> getExcludedBrowsers() {
            return excludedBrowsers;
        }

        @Override
        protected Set<String> getAuraErrorsExpectedDuringInit() {
            return caseDef.getAuraErrorsExpectedDuringInit();
        }

        @Override
        public Set<String> getTestLabels() {
            return Sets.newHashSet(caseDef.getTestLabels());
        }

        private final ComponentTestSuite suite;
        private final TestCaseDef caseDef;
        private final Set<BrowserType> targetBrowsers = EnumSet.noneOf(BrowserType.class);
        private final Set<BrowserType> excludedBrowsers = EnumSet.noneOf(BrowserType.class);
    }
}
