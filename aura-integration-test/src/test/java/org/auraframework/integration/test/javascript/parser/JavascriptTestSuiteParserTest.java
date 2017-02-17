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

package org.auraframework.integration.test.javascript.parser;

import java.util.List;
import java.util.Map;

import javax.inject.Inject;

import org.auraframework.adapter.ComponentLocationAdapter;
import org.auraframework.components.AuraComponentsFiles;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.TestCaseDef;
import org.auraframework.def.TestSuiteDef;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.factory.JavascriptTestSuiteParser;
import org.auraframework.impl.javascript.testsuite.JavascriptTestCaseDef;
import org.auraframework.impl.javascript.testsuite.JavascriptTestSuiteDef;
import org.auraframework.impl.source.BaseSourceLoader;
import org.auraframework.impl.source.file.FileSourceLoader;
import org.auraframework.impl.source.resource.ResourceSourceLoader;
import org.auraframework.impl.system.DefinitionImpl;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.Source;
import org.auraframework.system.TextSource;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.FileMonitor;
import org.auraframework.util.ServiceLocator;
import org.junit.Test;

public class JavascriptTestSuiteParserTest extends AuraImplTestCase {
    @Inject
    DefinitionService definitionService;

    @Inject
    private FileMonitor fileMonitor;
    
    /**
     * Test method for {@link JavascriptParser#parse(DefDescriptor, Source)}.
     */
    @Test
    public void testParse() throws Exception {
        DefDescriptor<TestSuiteDef> descriptor = definitionService.getDefDescriptor(
                "js://test.testJSTestSuite", TestSuiteDef.class);
        TextSource<TestSuiteDef> source = getJavascriptSourceLoader().getSource(descriptor);
        // Step 1: Parse the source which refers to a simple component with a
        // reference to Javascript test suite
        TestSuiteDef testSuite = new JavascriptTestSuiteParser().getDefinition(descriptor, source);
        assertTrue(testSuite instanceof JavascriptTestSuiteDef);
        // Step 2: Gold file the Json output of the test suite object
        goldFileText(testSuite.getCode());
    }

    /**
     * Test method for {@link JavascriptParser#parse(DefDescriptor, Source)}. This test case includes these scenarios:
     * <ul>
     * <li>A null source</li>
     * <li>A null Descriptor</li>
     * <li>Trying to create a Source for a Def type while no corresponding js file is present for the component</li>
     * </ul>
     */
    @Test
    public void testNullCases() throws Exception {
        DefDescriptor<TestSuiteDef> descriptor = definitionService.getDefDescriptor(
                "js://test.testNoJSControllers", TestSuiteDef.class);
        TextSource<TestSuiteDef> source = getJavascriptSourceLoader().getSource(descriptor);
        // Test case 1: Try to create a Source for a component which does not
        // have any javascript associated with it
        // getSource() call is looking for testNoJSControllersTest.js in the
        // component folder
        assertNull("Source should be null for non-existent controller", source);
        // Test case 2: Null source
        try {
            new JavascriptTestSuiteParser().getDefinition(descriptor, null);
            fail("should not load null source");
        } catch (Exception e) {
            checkExceptionFull(e, NullPointerException.class, null);
        }
        // Test Case 3: Null component descriptor
/*        try {
            new JavascriptTestSuiteParser().parse(null, source);
            fail("should not load null component descriptor");
        } catch (Exception e) {
            checkExceptionContains(e, AuraRuntimeException.class, "testNoJSControllers");
        }*/
    }

    /**
     * Test method for {@link JavascriptParser#parse(DefDescriptor, Source)}. The DefDescriptor in this case is
     * referring to a simple Component with a Javascript test {@link DefType#TESTSUITE}.
     */
    @Test
    public void testJSTestSuite() throws Exception {

        DefDescriptor<TestSuiteDef> descriptor = definitionService.getDefDescriptor(
                "js://test.testJSTestSuite", TestSuiteDef.class);
        TextSource<TestSuiteDef> source = getJavascriptSourceLoader().getSource(descriptor);

        // Step 1: Parse the source which refers to a simple component with a
        // reference to Javascript test suite
        TestSuiteDef testSuite = new JavascriptTestSuiteParser().getDefinition(descriptor, source);
        assertTrue(testSuite instanceof JavascriptTestSuiteDef);

        // Step 2: Gold file the Json output of the test suite object
        goldFileText(testSuite.getCode());

        // Step 3: Verify the properties of the JavascriptTestSuiteDef object
        // OBject that is to be verified, Qualified name,
        assertEquals("unexpected qualifiedName of testSuite",
                "js://test.testJSTestSuite",
                ((JavascriptTestSuiteDef) testSuite).getDescriptor()
                        .getQualifiedName());
        // Step 4: Verify each testCaseDef objects in the test suite object
        List<TestCaseDef> testCases = ((JavascriptTestSuiteDef) testSuite)
                .getTestCaseDefs();
        assertEquals(3, testCases.size());
        for (Object o : testCases.toArray()) {
            assertTrue(o instanceof JavascriptTestCaseDef);
            JavascriptTestCaseDef testCaseDef = (JavascriptTestCaseDef) o;
            Map<String, Object> attributes = testCaseDef.getAttributeValues();
            if (testCaseDef.getName().equals("testHelloWorld")) {
                assertTrue(attributes.size() == 1);
                assertTrue(attributes.containsKey("num"));
                assertEquals("2", attributes.get("num"));
                // OBject that is to be verified, Qualified name
                assertEquals("unexpected qualifiedName of testHelloWorld",
                        "js://test.testJSTestSuite/TESTCASE$testHelloWorld",
                        ((DefinitionImpl<?>) o).getDescriptor()
                                .getQualifiedName());
            } else if (testCaseDef.getName().equals("testHelloWorld2")) {
                assertTrue(attributes.size() == 1);
                assertTrue(attributes.containsKey("num"));
                // Should get the default Attribute value
                assertEquals("5", attributes.get("num"));
                // OBject that is to be verified, Qualified name,
                assertEquals("unexpected qualifiedName of testHelloWorld2",
                        "js://test.testJSTestSuite/TESTCASE$testHelloWorld2",
                        ((DefinitionImpl<?>) o).getDescriptor()
                                .getQualifiedName());
            } else if (testCaseDef.getName().equals("testHelloWorld3")) {
                assertTrue(attributes.size() == 2);
                assertTrue(attributes.containsKey("num"));
                assertEquals("4", attributes.get("num"));
                assertTrue(attributes.containsKey("alpha"));
                assertEquals("A", attributes.get("alpha"));
                // OBject that is to be verified, Qualified name
                assertEquals("unexpected qualifiedName of testHelloWorld3",
                        "js://test.testJSTestSuite/TESTCASE$testHelloWorld3",
                        ((DefinitionImpl<?>) o).getDescriptor()
                                .getQualifiedName());
            } else {
                fail("There should be no other test cases created");
            }

        }
    }

    /**
     * Test method for {@link JavascriptParser#parse(DefDescriptor, Source)}. The DefDescriptor in this case is
     * referring to a simple Component with a Javascript test suite {@link DefType#TESTSUITE}. One of the test cases has
     * no function assigned to them, this should cause an Exception
     */

    @Test
    public void testJSTestSuiteWithoutAttributes() throws Exception {
        DefDescriptor<TestSuiteDef> descriptor = definitionService.getDefDescriptor(
                "js://test.testJSTestSuiteWithoutAttributes",
                TestSuiteDef.class);
        TextSource<TestSuiteDef> source = getJavascriptSourceLoader().getSource(descriptor);

        // Step 1: Parse the source which refers to a simple component with a
        // reference to Javascript test suite
        TestSuiteDef testSuite = new JavascriptTestSuiteParser().getDefinition(descriptor, source);
        assertTrue(testSuite instanceof JavascriptTestSuiteDef);

        // Step 2: Verify the properties of the JavascriptTestSuiteDef object
        // OBject that is to be verified, Qualified name,
        assertEquals("unexpected qualifiedName of testSuite",
                "js://test.testJSTestSuiteWithoutAttributes",
                ((JavascriptTestSuiteDef) testSuite).getDescriptor()
                        .getQualifiedName());
        // Step 3: Verify each testCaseDef objects in the test suite object
        List<TestCaseDef> testCases = ((JavascriptTestSuiteDef) testSuite)
                .getTestCaseDefs();
        assertEquals(2, testCases.size());
        for (Object o : testCases.toArray()) {
            assertTrue(o instanceof JavascriptTestCaseDef);
            JavascriptTestCaseDef testCaseDef = (JavascriptTestCaseDef) o;
            Map<String, Object> attributes = testCaseDef.getAttributeValues();
            if (testCaseDef.getName().equals("testHelloWorld")) {
                assertTrue(attributes.size() == 1);
                assertTrue(attributes.containsKey("num"));
                assertEquals("2", attributes.get("num"));
                // OBject that is to be verified, Qualified name
                assertEquals(
                        "unexpected qualifiedName of testHelloWorld",
                        "js://test.testJSTestSuiteWithoutAttributes/TESTCASE$testHelloWorld",
                        ((DefinitionImpl<?>) o).getDescriptor()
                                .getQualifiedName());
            } else if (testCaseDef.getName().equals("testHelloWorld3")) {
                assertNull(attributes);
                // OBject that is to be verified, Qualified name
                assertEquals(
                        "unexpected qualifiedName of testHelloWorld3",
                        "js://test.testJSTestSuiteWithoutAttributes/TESTCASE$testHelloWorld3",
                        ((DefinitionImpl<?>) o).getDescriptor()
                                .getQualifiedName());
            } else {
                fail("There should be no other test cases created");
            }
        }
    }

    /**
     * Test method for {@link JavascriptParser#parse(DefDescriptor, Source)}. The DefDescriptor in this case is
     * referring to a simple Component with a Javascript test suite {@link DefType#TESTSUITE}. One of the test cases has
     * no function assigned to them, this should cause an Exception
     */
    @Test
    public void testJSTestSuiteWithoutTestFunc() throws Exception {
        assertInvalidTestCase("{testWithString:{test:'empty'}}",
                "testWithString 'test' must be a function or an array of functions");
        assertInvalidTestCase("{testWithObject:{test:{}}}",
                "testWithObject 'test' must be a function or an array of functions");
        assertInvalidTestCase(
                "{testWithMixedArray:{test:[function(){},'oops']}}",
                "testWithMixedArray 'test' must be a function or an array of functions");
        assertInvalidTestCase(
                "{testWithObjectFunction:{test:{inner:function(){}}}}",
                "testWithObjectFunction 'test' must be a function or an array of functions");
    }

    private void assertInvalidTestCase(String suiteContent, String expectedMessageStartsWith) throws Exception {
        DefDescriptor<TestSuiteDef> desc = addSourceAutoCleanup(TestSuiteDef.class, suiteContent);
        TextSource<TestSuiteDef> source = (TextSource<TestSuiteDef>)getSource(desc);
        TestSuiteDef d = new JavascriptTestSuiteParser().getDefinition(desc, source);
        try {
            d.validateDefinition();
            fail("Invalid testsuite: Every test case should have a function assigned to it");
        } catch (QuickFixException expected) {
            assertTrue(expected.getMessage().startsWith(expectedMessageStartsWith));
        }
    }

    private BaseSourceLoader getJavascriptSourceLoader() {
        if (AuraComponentsFiles.TestComponents.asFile().exists()) {
            return new FileSourceLoader(AuraComponentsFiles.TestComponents.asFile(), fileMonitor);
        } else {
            String pkg = ServiceLocator.get()
                    .get(ComponentLocationAdapter.class, "auraTestComponentLocationAdapterImpl")
                    .getComponentSourcePackage();
            return new ResourceSourceLoader(pkg);
        }
    }
}
