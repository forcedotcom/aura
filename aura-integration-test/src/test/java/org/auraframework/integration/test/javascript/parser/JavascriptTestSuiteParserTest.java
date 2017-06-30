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

import org.auraframework.def.ApplicationDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.TestCaseDef;
import org.auraframework.def.TestSuiteDef;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.factory.JavascriptTestSuiteParser;
import org.auraframework.impl.javascript.testsuite.JavascriptTestCaseDef;
import org.auraframework.impl.javascript.testsuite.JavascriptTestSuiteDef;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.impl.system.DefinitionImpl;
import org.auraframework.impl.util.AuraTestingUtil;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.Source;
import org.auraframework.system.TextSource;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.junit.Test;

public class JavascriptTestSuiteParserTest extends AuraImplTestCase {
    @Inject
    DefinitionService definitionService;

    String jsTestSuiteCode = "({\n"
        +"    /*Multi line Comments\n"
        +"     **/\n"
        +"    //Single line Comments\n"
        +"    attributes : {num : '5'},\n"
        +"    /*Comments*/\n"
        +"    /*Multi line Comments\n"
        +"     **/\n"
        +"    //Single line Comments\n"
        +"    testHelloWorld: {\n"
        +"        /*Comments*/\n"
        +"        /*Multi line Comments\n"
        +"         **/\n"
        +"        //Single line Comments\n"
        +"\n"
        +"        attributes : {num : '2'},\n"
        +"        /*Comments*/\n"
        +"\n"
        +"        test: function(component){\n"
        +"            /*Comments*/\n"
        +"            aura.test.assertTrue(component.get('v.num') == 2, \"very bad things.\");\n"
        +"        }\n"
        +"    },\n"
        +"    /*Multi line Comments\n"
        +"     **/\n"
        +"    //Single line Comments\n"
        +"    testHelloWorld2: {\n"
        +"        test: function(){\n"
        +"            aura.log(location);\n"
        +"        }\n"
        +"    },\n"
        +"\n"
        +"    testHelloWorld3: {\n"
        +"        attributes : {num : '4', alpha: 'A'},\n"
        +"\n"
        +"        test: function(){\n"
        +"            aura.log(location);\n"
        +"        }\n"
        +"    }\n"
        +"})\n";
    
    /**
     * Test method for {@link JavascriptParser#parse(DefDescriptor, Source)}.
     */
    @Test
    public void testParse() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        String name = "foo";

        DefDescriptor<?> descriptor = new DefDescriptorImpl<>(DefDescriptor.MARKUP_PREFIX,
                util.getInternalNamespace(), name, ApplicationDef.class);
        TextSource<TestSuiteDef> source = util.buildTextSource(util.getInternalNamespace(), name, TestSuiteDef.class,
            jsTestSuiteCode, descriptor);
        // Step 1: Parse the source which refers to a simple component with a
        // reference to Javascript test suite
        TestSuiteDef testSuite = new JavascriptTestSuiteParser().getDefinition(source.getDescriptor(), source);
        assertTrue(testSuite instanceof JavascriptTestSuiteDef);
        // Step 2: Gold file the Json output of the test suite object
        goldFileText(testSuite.getCode());

        // Step 3: Verify the properties of the JavascriptTestSuiteDef object
        // OBject that is to be verified, Qualified name,
        String baseTestName = "js://"+util.getInternalNamespace()+".foo";
        assertEquals("unexpected qualifiedName of testSuite", baseTestName,
                ((JavascriptTestSuiteDef) testSuite).getDescriptor().getQualifiedName());
        // Step 4: Verify each testCaseDef objects in the test suite object
        List<TestCaseDef> testCases = ((JavascriptTestSuiteDef) testSuite).getTestCaseDefs();
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
                        baseTestName+"/TESTCASE$testHelloWorld",
                        ((DefinitionImpl<?>) o).getDescriptor().getQualifiedName());
            } else if (testCaseDef.getName().equals("testHelloWorld2")) {
                assertTrue(attributes.size() == 1);
                assertTrue(attributes.containsKey("num"));
                // Should get the default Attribute value
                assertEquals("5", attributes.get("num"));
                // OBject that is to be verified, Qualified name,
                assertEquals("unexpected qualifiedName of testHelloWorld2",
                        baseTestName+"/TESTCASE$testHelloWorld2",
                        ((DefinitionImpl<?>) o).getDescriptor().getQualifiedName());
            } else if (testCaseDef.getName().equals("testHelloWorld3")) {
                assertTrue(attributes.size() == 2);
                assertTrue(attributes.containsKey("num"));
                assertEquals("4", attributes.get("num"));
                assertTrue(attributes.containsKey("alpha"));
                assertEquals("A", attributes.get("alpha"));
                // OBject that is to be verified, Qualified name
                assertEquals("unexpected qualifiedName of testHelloWorld3",
                        baseTestName+"/TESTCASE$testHelloWorld3",
                        ((DefinitionImpl<?>) o).getDescriptor().getQualifiedName());
            } else {
                fail("There should be no other test cases created");
            }
        }
    }

    String jsTestSuiteCodeNoAttributes = "({\n"
        +"    testHelloWorld: {"
        +"        attributes : {num : '2'},"
        +"        test: function(component){"
        +"            aura.test.assertTrue(component.get('v.num') == 2, \"very bad things.\");"
        +"        }"
        +"    },"
        +""
        +"    testHelloWorld3: {"
        +"        test: function(){"
        +"            aura.log(location);"
        +"        }"
        +"    }"
        +"})";

    /**
     * Test method for {@link JavascriptParser#parse(DefDescriptor, Source)}. The DefDescriptor in this case is
     * referring to a simple Component with a Javascript test suite {@link DefType#TESTSUITE}. One of the test cases has
     * no function assigned to them, this should cause an Exception
     */

    @Test
    public void testJSTestSuiteWithoutAttributes() throws Exception {
        AuraTestingUtil util = getAuraTestingUtil();
        String name = "foo";

        DefDescriptor<?> descriptor = new DefDescriptorImpl<>(DefDescriptor.MARKUP_PREFIX,
                util.getInternalNamespace(), name, ApplicationDef.class);
        TextSource<TestSuiteDef> source = util.buildTextSource(util.getInternalNamespace(), name, TestSuiteDef.class,
            jsTestSuiteCodeNoAttributes, descriptor);

        // Step 1: Parse the source which refers to a simple component with a
        // reference to Javascript test suite
        TestSuiteDef testSuite = new JavascriptTestSuiteParser().getDefinition(source.getDescriptor(), source);
        assertTrue(testSuite instanceof JavascriptTestSuiteDef);
        
        String baseTestName = "js://"+util.getInternalNamespace()+".foo";

        // Step 2: Verify the properties of the JavascriptTestSuiteDef object
        // Object that is to be verified, Qualified name,
        assertEquals("unexpected qualifiedName of testSuite",
                baseTestName,
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
                        baseTestName+"/TESTCASE$testHelloWorld",
                        ((DefinitionImpl<?>) o).getDescriptor()
                                .getQualifiedName());
            } else if (testCaseDef.getName().equals("testHelloWorld3")) {
                assertNull(attributes);
                // OBject that is to be verified, Qualified name
                assertEquals(
                        "unexpected qualifiedName of testHelloWorld3",
                        baseTestName+"/TESTCASE$testHelloWorld3",
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
        AuraTestingUtil util = getAuraTestingUtil();
        String name = "foo";

        DefDescriptor<?> descriptor = new DefDescriptorImpl<>(DefDescriptor.MARKUP_PREFIX,
                util.getInternalNamespace(), name, ApplicationDef.class);
        TextSource<TestSuiteDef> source = util.buildTextSource(util.getInternalNamespace(), name, TestSuiteDef.class,
            suiteContent, descriptor);
        TestSuiteDef d = new JavascriptTestSuiteParser().getDefinition(source.getDescriptor(), source);
        try {
            d.validateDefinition();
            fail("Invalid testsuite: Every test case should have a function assigned to it");
        } catch (QuickFixException expected) {
            assertTrue(expected.getMessage().startsWith(expectedMessageStartsWith));
        }
    }
}
