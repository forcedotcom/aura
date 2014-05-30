package org.auraframework.test.perf.core;

import java.lang.reflect.Constructor;
import java.lang.reflect.InvocationTargetException;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.Vector;

import junit.framework.Test;
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

import com.google.common.collect.ImmutableSet;

@PerfTestSuite
public class ComponentPerfSuiteTest extends TestSuite {
    // List components that we can't able to instantiate from client side.
    // The reason could be a dependency to a server side model. Eg. ui:inputDate
    // ui:action cmp shold be abstract?
    private static final Set<String> BLACKLISTED_COMPONENTS = ImmutableSet.of("markup://ui:inputDate",
            "markup://ui:action"
            , "markup://perf:dummyPerf");

    public static TestSuite suite() throws Exception {
        if (System.getProperty("skipCmpPerfTests") != null) {
            System.out.println("Skipping Components Perf Tests");
            return new TestSuite();
        }

        TestSuite suite = new TestSuite();
        suite.setName("Component Perf tests");
        suite.addTest(new NamespacePerfTestSuite("ui"));
        suite.addTest(new NamespacePerfTestSuite("perf"));
        return suite;
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

    @UnAdaptableTest
    public static class NamespacePerfTestSuite extends TestSuite {
        public NamespacePerfTestSuite(String namespace) throws Exception {
            super(namespace);
            ContextService contextService = Aura.getContextService();
            DefinitionService definitionService = Aura.getDefinitionService();
            System.out.println("Bootstrapping Components Perf Tests");

            boolean contextStarted = false;
            if (!contextService.isEstablished()) {
                contextStarted = true;
                contextService.startContext(Mode.PTEST, Format.JSON, Authentication.AUTHENTICATED);
            }

            Map<String, TestSuite> subSuites = new HashMap<String, TestSuite>();

            try {
                DefDescriptor<ComponentDef> matcher = definitionService.getDefDescriptor(
                        String.format("markup://%s:*", namespace), ComponentDef.class);

                Set<DefDescriptor<ComponentDef>> descriptors = definitionService.find(matcher);

                for (DefDescriptor<ComponentDef> descriptor : descriptors) {
                    if (descriptor.getDef().isAbstract()
                            || BLACKLISTED_COMPONENTS.contains(descriptor.getQualifiedName())) {
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
                System.err.println("Failed to load component tests for namespace: " + namespace);
                t.printStackTrace();
            } finally {
                if (contextStarted) {
                    contextService.endContext();
                }
            }
        }
    }

    public static class ComponentSuiteTest extends TestSuite {

        public ComponentSuiteTest(DefDescriptor<ComponentDef> descriptor) {
            TestInventory inventory = ServiceLocator.get().get(TestInventory.class, "auraTestInventory");
            Vector<Class<? extends Test>> testClasses = inventory.getTestClasses(Type.PERFCMP);
            TestSuite suite = new TestSuite();

            for (Class<? extends Test> testClass : testClasses) {
                try {
                    Constructor<? extends Test> constructor = testClass.getConstructor(String.class,
                            DefDescriptor.class);
                    ComponentPerfAbstractTestCase t = (ComponentPerfAbstractTestCase) constructor.newInstance(
                            "testRun", descriptor);
                    String testName = "perf_" + testClass.getSimpleName() + '_' + descriptor.getNamespace() + '_'
                            + descriptor.getName();
                    t.testName = testName;
                    suite.addTest(t);
                } catch (NoSuchMethodException e) {
                    suite.getName();
                } catch (InvocationTargetException e) {
                    suite.getName();
                } catch (IllegalAccessException e) {
                    suite.getName();
                } catch (InstantiationException e) {
                    suite.getName();
                }
            }
            addTest(suite);
        }
    }
}
