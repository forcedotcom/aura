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
package org.auraframework.service;

import java.lang.reflect.Method;
import java.lang.reflect.Modifier;

import junit.framework.AssertionFailedError;
import junit.framework.TestCase;
import junit.framework.TestSuite;
import org.auraframework.Aura;

/**
 * Enforces that utests exist in this suite for every Aura service
 *
 * This class generates a suite of tests based on implementations of the AuraServices
 * in the aura.service package.  While those classes implement the service interfaces
 * that is only to enforce at compile-time that each method on the interfaces has tests.
 *
 * null is passed into the test implementation of the service for all arguments, and the
 * return type of the method is disregarded.
 *
 * A property called 'service' is set on the impl before it is executed.  That should be used
 * by the impl at the service instance to test.
 *
 * Another property called 'config' is set on the impl before it is executed as well.  This will
 * be one of the Config objects returned by getConfigs() on that impl.  Every config returned by that
 * method will be used as a seperate test suite so that the same test cases can be run multiple times
 * with different config data.
 */
public class AuraTest extends TestCase {

    private static final String testSuiteClassName = "%sTest";


    public AuraTest(String name) throws Exception {
        super(name);
    }

    @SuppressWarnings("unchecked")
    public static TestSuite suite() throws Exception {
        TestSuite suite = new TestSuite(AuraTest.class.getName());

        // Check each method on Aura.java
        for (Method method : Aura.class.getMethods()) {
            int modifiers = method.getModifiers();

            // Only look at the public static methods
            boolean found = false;
            if (Modifier.isPublic(modifiers) && Modifier.isStatic(modifiers)) {
                Class<?> returnType = method.getReturnType();
                // Only look at the methods that return AuraServices.
                if (AuraService.class.isAssignableFrom(returnType)) {
                    // Now, check the aura.service package and make sure that
                    // there is a test class that implements the same interface
                    // and with the expected name
                    String testSuiteName = String.format(testSuiteClassName, returnType.getName());
                    Class<?> clz = null;

                    try {
                        // Look for the class
                        clz = Class.forName(testSuiteName);
                        // Make sure the class is a test suite
                        if (BaseServiceTest.class.isAssignableFrom(clz)) {
                            found = true;
                        }
                        // Make sure the class implements the interface
                        if (!returnType.isAssignableFrom(clz)) {
                            found = false;
                        }
                    } catch (ClassNotFoundException e) {
                        found = false;
                    }

                    if (!found) {
                        throw new AssertionFailedError(String.format("No test suite exists for %s.  Expected to find %s", returnType.getSimpleName(), testSuiteName));
                    }

                    TestSuite serviceSuite = createTestSuite((Class<? extends AuraService>)returnType, (Class<? extends BaseServiceTest<?,?>>)clz, method);
                    if (serviceSuite.testCount() > 0)
                        suite.addTest(serviceSuite);
                }
            }
        }
        return suite;
    }

    @SuppressWarnings("unchecked")
    private static <T extends AuraService> TestSuite createTestSuite(Class<T> serviceClass,
            Class<? extends BaseServiceTest<?,?>> suiteClass, Method auraMethod) throws Exception {

        AuraServiceTestSuite serviceSuite = new AuraServiceTestSuite(suiteClass.getName());

        // The ftest framework indexes test cases by class name rather than suite name, so if these generated
        // tests don't have unique names, some won't run in automation. We'll use param types to differentiate.
        for (Method serviceMeth : serviceClass.getMethods()) {
            StringBuilder suffix = new StringBuilder();
            for (Class<?> paramClass : serviceMeth.getParameterTypes())
                suffix.append('_').append(paramClass.getSimpleName().replace("[]", "Array"));

            String name = String.format("test%s_%s%s", serviceClass.getSimpleName(), serviceMeth.getName(),
                    suffix.toString());

            BaseServiceTest<T,?> test = (BaseServiceTest<T,?>)suiteClass.getConstructor(String.class).newInstance(name);
            test.setMethods(serviceClass, auraMethod, serviceMeth);

            serviceSuite.addTest(test);
        }

        return serviceSuite;
    }

    private static class AuraServiceTestSuite extends TestSuite {
        private AuraServiceTestSuite(String name) {
            super(name);
        }
    }

    public void testServices() {

    }

}
