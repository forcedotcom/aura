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
package org.auraframework.test.perf.core;

import java.lang.reflect.Constructor;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.Vector;
import java.util.logging.Level;
import java.util.logging.Logger;

import junit.framework.Test;
import junit.framework.TestCase;
import junit.framework.TestSuite;

import org.auraframework.Aura;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.service.ContextService;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.AuraContext.Authentication;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.test.TestInventory;
import org.auraframework.test.TestInventory.Type;
import org.auraframework.test.WebDriverTestCase;
import org.auraframework.test.annotation.PerfTestSuite;
import org.auraframework.test.annotation.UnAdaptableTest;
import org.auraframework.util.ServiceLocator;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableSet;
import com.google.common.collect.Maps;

@UnAdaptableTest
@PerfTestSuite
public class ComponentPerfSuiteTest extends TestSuite {
    // List components that we can't able to instantiate from client side.
    // The reason could be a dependency to a server side model. Eg. ui:inputDate
    // ui:action cmp shold be abstract?
    private static final Set<String> BLACKLISTED_COMPONENTS = ImmutableSet.of(
            "markup://ui:inputDate" // server side dependency
            , "markup://ui:action" // this should be abstract
            , "markup://perf:dummyPerf"
            );

    private static final Logger LOG = Logger.getLogger(ComponentPerfSuiteTest.class.getSimpleName());

    public ComponentPerfSuiteTest() throws Exception {
        this("Component Perf tests");
    }

    public ComponentPerfSuiteTest(String name) throws Exception {
        LOG.info("ComponentPerfSuiteTest: " + name);
        setName(name);
        createTestCases();
    }

    /**
     * @return the list of namespaces to create tests for
     */
    protected List<String> getNamespaces() {
        return ImmutableList.of("ui", "perf");
    }

    /**
     * Components that we aren't able to instantiate from client side. The reason could be a dependency to a server side
     * model. Eg. ui:inputDate ui:action cmp should be abstract?
     */
    protected Set<String> getBlacklistedComponents() {
        return BLACKLISTED_COMPONENTS;
    }

    protected void createTestCases() throws Exception {
        LOG.info("createTestCases: starting");

        if (System.getProperty("skipCmpPerfTests") != null) {
            LOG.info("Skipping Components Perf Tests");
            return;
        }

        for (String namespace : getNamespaces()) {
            try {
                addTest(new NamespacePerfTestSuite(namespace));
            } catch (Exception e) {
                LOG.log(Level.WARNING, "cannot load namespace " + namespace, e);
            }
        }
    }

    public static TestSuite suite() throws Exception {
        return new ComponentPerfSuiteTest();
    }

    /**
     * Override to patch the test case, i.e. for SFDC core
     */
    protected TestCase patchPerfComponentTestCase(ComponentPerfAbstractTestCase test,
            DefDescriptor<ComponentDef> descriptor) throws Exception {
        test.setTestName("perf_" + test.getClass().getSimpleName() + '_' + descriptor.getDescriptorName());
        return test;
    }

    @UnAdaptableTest
    public final class NamespacePerfTestSuite extends TestSuite {
        public NamespacePerfTestSuite(String namespace) throws Exception {
            super(namespace);
            ContextService contextService = Aura.getContextService();
            DefinitionService definitionService = Aura.getDefinitionService();

            boolean contextStarted = false;
            if (!contextService.isEstablished()) {
                contextStarted = true;
                contextService.startContext(Mode.PTEST, Format.JSON, Authentication.AUTHENTICATED);
            }

            Map<String, TestSuite> subSuites = Maps.newHashMap();

            try {
                DefDescriptor<ComponentDef> matcher = definitionService.getDefDescriptor(
                        String.format("markup://%s:*", namespace), ComponentDef.class);

                Set<DefDescriptor<ComponentDef>> descriptors = definitionService.find(matcher);

                for (DefDescriptor<ComponentDef> descriptor : descriptors) {
                    if (descriptor.getDef().isAbstract()
                            || getBlacklistedComponents().contains(descriptor.getQualifiedName())) {
                        continue;
                    }

                    Test test;
                    try {
                        test = new ComponentSuiteTest(descriptor);
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
                LOG.log(Level.WARNING, "Failed to load component tests for namespace: " + namespace, t);
            } finally {
                if (contextStarted) {
                    contextService.endContext();
                }
            }
        }
    }

    private class ComponentSuiteTest extends TestSuite {
        ComponentSuiteTest(DefDescriptor<ComponentDef> descriptor) {
            super(descriptor.getName());
            TestInventory inventory = ServiceLocator.get().get(TestInventory.class, "auraTestInventory");
            Vector<Class<? extends Test>> testClasses = inventory.getTestClasses(Type.PERFCMP);

            for (Class<? extends Test> testClass : testClasses) {
                try {
                    Constructor<? extends Test> constructor = testClass.getConstructor(String.class,
                            DefDescriptor.class);
                    ComponentPerfAbstractTestCase test = (ComponentPerfAbstractTestCase) constructor.newInstance(
                            "testRun", descriptor);
                    addTest(patchPerfComponentTestCase(test, descriptor));
                } catch (Exception e) {
                    LOG.log(Level.WARNING, "exception instantiating " + testClass.getName(), e);
                }
            }
        }
    }

    private static class FailTestCase extends WebDriverTestCase {
        private final Throwable cause;

        private FailTestCase(DefDescriptor<?> descriptor, Throwable cause) {
            super(descriptor.getQualifiedName());
            this.cause = cause;
        }

        @Override
        public void runTest() throws Throwable {
            throw cause;
        }
    }
}
