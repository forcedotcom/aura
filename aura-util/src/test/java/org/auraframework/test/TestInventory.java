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
package org.auraframework.test;

import java.io.File;
import java.io.IOException;
import java.lang.reflect.Modifier;
import java.net.JarURLConnection;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URL;
import java.util.Collection;
import java.util.EnumSet;
import java.util.Enumeration;
import java.util.Map;
import java.util.jar.JarEntry;

import junit.framework.JUnit4TestAdapter;
import junit.framework.Test;
import junit.framework.TestCase;
import junit.framework.TestSuite;

import org.auraframework.test.annotation.HybridContainerTest;
import org.auraframework.test.annotation.IntegrationTest;
import org.auraframework.test.annotation.UnitTest;
import org.auraframework.test.annotation.WebDriverTest;
import org.auraframework.util.ServiceLocator;

import com.google.common.collect.Maps;
import com.google.common.collect.Sets;

public class TestInventory {
    public final static String TEST_CLASS_SUFFIX = "Test";
    private final static String CLASS_SUFFIX = ".class";
    public static final EnumSet<Type> CONTAINER_TYPE_TESTS = EnumSet.of(Type.HYBRID_CONTAINER);
    public static final EnumSet<Type> CONTAINERLESS_TYPE_TESTS = EnumSet.complementOf(CONTAINER_TYPE_TESTS);

    public enum Type {
        UNIT, WEB, INTEGRATION, IGNORED, HYBRID_CONTAINER;
    }

    private URI rootUri;
    private final Map<Type, TestSuite> suites = Maps.newHashMap();

    public TestInventory(Class<?> classInModule) {
        suites.put(Type.IGNORED, new TestSuite());
        try {
            String resourceName = classInModule.getName().replace('.', '/') + CLASS_SUFFIX;
            URL url = classInModule.getClassLoader().getResource(resourceName);
            String resPath = url.toString();
            String root;
            if ("jar".equals(url.getProtocol())) {
                root = resPath.substring(0, resPath.indexOf("!/") + 2);
            } else {
                root = resPath.substring(0, resPath.length() - resourceName.length());
            }
            rootUri = new URI(root);
        } catch (URISyntaxException e) {
            e.printStackTrace();
        }
    }

    public TestSuite getTestSuite(Type type) {
        if (suites.isEmpty() || !suites.containsKey(type)) {
            loadTestSuites(type);
        }
        return suites.get(type);
    }

    public void loadTestSuites(Type type) {
        TestFilter filter = ServiceLocator.get().get(TestFilter.class);
        TestSuite suite = new TestSuite();
        suites.put(type, suite);

        System.out.println(String.format("Loading %s tests from %s", type, rootUri));
        for (String className : getClassNames(rootUri)) {
            Class<? extends Test> testClass = filter.applyTo(getTestClass(className));
            if (testClass == null) {
                continue;
            }

            Type target = null;
            if (testClass.getAnnotation(HybridContainerTest.class) != null) {
                target = Type.HYBRID_CONTAINER;
            } else if (testClass.getAnnotation(WebDriverTest.class) != null) {
                target = Type.WEB;
            } else if (testClass.getAnnotation(IntegrationTest.class) != null) {
                target = Type.INTEGRATION;
            } else if (testClass.getAnnotation(UnitTest.class) != null) {
                target = Type.UNIT;
            } else {
                continue;
            }

            if (target != type) {
                continue;
            }

            try {
                addTest(suite, filter, (Test) testClass.getMethod("suite").invoke(null));
            } catch (Exception e) {
            }
            try {
                addTest(suite, filter, new TestSuite(testClass.asSubclass(TestCase.class)));
            } catch (ClassCastException cce) {
            }
        }
    }

    private void addTest(TestSuite suite, TestFilter filter, Test test) {
        if (test == null) {
            return;
        } else if (test instanceof TestCase) {
            if (filter == null) {
                suite.addTest(test);
            } else {
                TestCase tc = filter.applyTo((TestCase) test);
                if (tc != null) {
                    suite.addTest(test);
                }
            }
        } else if (test instanceof TestSuite) {
            TestSuite newSuite = new TestSuite(((TestSuite) test).getName());
            for (Enumeration<Test> tests = ((TestSuite) test).tests(); tests.hasMoreElements();) {
                addTest(newSuite, filter, tests.nextElement());
            }
            if (newSuite.testCount() > 0) {
                suite.addTest(newSuite);
            }
        } else if (test instanceof JUnit4TestAdapter) {
            // This is a hack because this inventory is not actually complaint
            // with the JUnit specification. All of the
            // tests in the suite will appear to the runner as a single test.
            TestSuite newSuite = new TestSuite(test.toString() + "JUnit4TestAdapterHack");
            newSuite.addTest(test);
            suite.addTest(newSuite);
        }
    }

    private static Collection<String> getClassNames(URI rootUri) {
        Collection<String> classNames = Sets.newHashSet();
        try {
            if ("jar".equals(rootUri.getScheme())) {
                JarURLConnection jarConn = (JarURLConnection) rootUri.toURL().openConnection();
                for (Enumeration<JarEntry> entries = jarConn.getJarFile().entries(); entries.hasMoreElements();) {
                    JarEntry entry = entries.nextElement();
                    String entryName = entry.getName();
                    if (entryName.endsWith(CLASS_SUFFIX)) {
                        entryName = entryName.substring(0, entryName.length() - CLASS_SUFFIX.length());
                    }
                    classNames.add(entryName.replace('/', '.'));
                }
            } else {
                forEachFile(classNames, rootUri, new File(rootUri));
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
        return classNames;
    }

    private static void forEachFile(Collection<String> names, URI root, File file) {
        if (!file.isDirectory()) {
            if (!file.getName().endsWith(CLASS_SUFFIX)) {
                return;
            }
            String relative = root.relativize(file.toURI()).getPath();
            names.add(relative.substring(0, relative.length() - CLASS_SUFFIX.length()).replace(File.separatorChar, '.'));
        } else {
            for (File child : file.listFiles()) {
                forEachFile(names, root, child);
            }
        }
    }

    /**
     * Check if class might be a valid test case. Must be public, non-abstract, named "*Test" and extend from
     * {@link Test}.
     */
    private static Class<? extends Test> getTestClass(String className) {
        if (!className.endsWith(TEST_CLASS_SUFFIX)) {
            return null;
        }
        Class<?> clazz;
        try {
            clazz = Class.forName(className);
        } catch (ClassNotFoundException e) {
            return null;
        } catch (NoClassDefFoundError e) {
            return null;
        }
        int mods = clazz.getModifiers();
        if (!Modifier.isPublic(mods)) {
            return null;
        }
        if (Modifier.isAbstract(mods)) {
            return null;
        }
        Class<? extends Test> testClazz;
        try {
            testClazz = clazz.asSubclass(Test.class);
        } catch (ClassCastException e) {
            return null;
        }
        return testClazz;
    }
}
