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
package org.auraframework.integration.test;

import com.google.common.collect.Sets;

import junit.framework.Test;
import junit.framework.TestSuite;

import org.auraframework.AuraDeprecated;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.DescriptorFilter;
import org.auraframework.def.TestCaseDef;
import org.auraframework.def.TestSuiteDef;
import org.auraframework.integration.test.util.WebDriverTestCase;
import org.auraframework.service.ContextService;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.AuraContext.Authentication;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.test.util.WebDriverUtil;
import org.auraframework.test.util.WebDriverUtil.BrowserType;
import org.auraframework.util.test.annotation.JSTest;
import org.auraframework.util.test.annotation.UnAdaptableTest;
import org.junit.runner.RunWith;
import org.junit.runners.AllTests;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.TestContextManager;
import org.springframework.test.context.TestExecutionListeners;
import org.springframework.test.context.support.DependencyInjectionTestExecutionListener;

import javax.annotation.PostConstruct;
import javax.inject.Inject;

import java.util.EnumSet;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

/**
 * TODO(W-1386863): investigate why/fix the thread hostile nature of these tests.
 */
@UnAdaptableTest
@JSTest
@RunWith(AllTests.class)
@ContextConfiguration(locations = {"/applicationContext.xml"})
@TestExecutionListeners(listeners = {DependencyInjectionTestExecutionListener.class})
public class ComponentJSUITest extends TestSuite {

    public static TestSuite suite() throws Exception {
        ComponentJSUITest suite = new ComponentJSUITest("*");
        TestContextManager testContextManager = new TestContextManager(ComponentJSUITest.class);
        testContextManager.prepareTestInstance(suite);
        return suite;
    }

    @Inject
    private AuraDeprecated auraDeprecated;

    @Inject
    private ContextService contextService;

    @Inject
    private DefinitionService definitionService;

    private String[] namespaces;

    public ComponentJSUITest(String... namespaces) {
        super();
        this.namespaces = namespaces == null ? new String[0] : namespaces;
    }

    AuraDeprecated getAuraDeprecated() {
        return auraDeprecated;
    }
    
    @PostConstruct
    private void postConstruct() {
        boolean contextStarted = false;
        if (!contextService.isEstablished()) {
            contextStarted = true;
            contextService.startContext(Mode.JSTEST, Format.JSON, Authentication.AUTHENTICATED);
        }

        Map<String, TestSuite> subSuites = new HashMap<>();
        try {
            for (String namespace : namespaces) {
                try {
                    DescriptorFilter filter = new DescriptorFilter("js://" + namespace, DefType.TESTSUITE.toString());
                    Set<DefDescriptor<?>> descriptors = definitionService.find(filter);

                    for (DefDescriptor<?> qd : descriptors) {
                        @SuppressWarnings("unchecked")
                        DefDescriptor<TestSuiteDef> descriptor = (DefDescriptor<TestSuiteDef>) qd;
                        Test test;
                        try {
                            test = new ComponentTestSuite(definitionService.getDefinition(descriptor));
                        } catch (Throwable t) {
                            test = new FailTestCase(descriptor.getQualifiedName(), t);
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
                    addTest(new FailTestCase("Failed to generate tests for namespace: " + namespace, t));
                }
            }
        } finally {
            if (contextStarted) {
                contextService.endContext();
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
            if (DefType.APPLICATION.equals(defType)){
                return String.format("/%s/%s.app", descriptor.getNamespace(), descriptor.getName());
            } else {
                return String.format("/auratest/test.app?descriptor=%s:%s", descriptor.getNamespace(), descriptor.getName());
            }
        }
    }

    public static class ComponentTestCase extends WebDriverTestCase {
        private ComponentTestCase(ComponentTestSuite suite, TestCaseDef caseDef) {
            this.setName(String.format("%s$%s", suite.getName(), caseDef.getName()));
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
            if (DefType.APPLICATION.equals(defType)) {
                return String.format("%s?aura.jstestrun=%s&aura.testReset=true&aura.testTimeout=%s",
                        suite.getUrl(defType), caseDef.getName(), getAuraUITestingUtil().getTimeout());
            } else {
                return String.format("%s&testName=%s&aura.testReset=true&aura.testTimeout=%s", suite.getUrl(defType),
                        caseDef.getName(), getAuraUITestingUtil().getTimeout());
            }
        }

        /**
         * The URL for loading the test within the aurajstest:jstest app. Used primarily by test:runner.
         */
        public String getAppUrl() {
            String defType = DefType.APPLICATION.equals(caseDef.getDefType()) ? "app" : "cmp";
            return String.format("/%s/%s.%s?aura.jstest=%s&aura.mode=JSTESTDEBUG&aura.testReset=true", suite.descriptor.getNamespace(),
                    suite.descriptor.getName(), defType, caseDef.getName());
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

            // Actions run on servers need special handling because their call back methods are called asynchronously.
            // This check is to make sure all such calls were complete.
            getAuraUITestingUtil().waitForAuraTestComplete(getAuraUITestingUtil().getTimeout());
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

    private static class FailTestCase extends WebDriverTestCase {
        private final Throwable cause;

        private FailTestCase(String msg, Throwable cause) {
            super();
            this.setName(msg);
            this.cause = cause;
        }

        @Override
        public void runTest() throws Throwable {
            throw cause;
        }
    }
}
