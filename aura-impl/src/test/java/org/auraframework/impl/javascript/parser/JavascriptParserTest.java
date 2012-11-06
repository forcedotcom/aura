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
/*
 * Copyright, 1999-2009, salesforce.com All Rights Reserved Company Confidential
 */
package org.auraframework.impl.javascript.parser;

import java.io.File;
import java.util.*;

import org.auraframework.adapter.ComponentLocationAdapter;
import org.auraframework.def.ActionDef.ActionType;
import org.auraframework.def.*;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.javascript.controller.JavascriptActionDef;
import org.auraframework.impl.javascript.controller.JavascriptControllerDef;
import org.auraframework.impl.javascript.renderer.JavascriptRendererDef;
import org.auraframework.impl.javascript.testsuite.JavascriptTestCaseDef;
import org.auraframework.impl.javascript.testsuite.JavascriptTestSuiteDef;
import org.auraframework.impl.source.BaseSourceLoader;
import org.auraframework.impl.source.file.FileJavascriptSource;
import org.auraframework.impl.source.file.FileJavascriptSourceLoader;
import org.auraframework.impl.source.resource.ResourceJavascriptSourceLoader;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.impl.system.DefinitionImpl;
import org.auraframework.impl.util.AuraImplFiles;
import org.auraframework.system.Source;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.util.ServiceLocator;

/**
 * This class tests the usage of Javascript to specify Controllers, Renderers and Test suites for Aura Components. The
 * Javascript files are parsed using the {@link JavascriptParser} and the corresponding defs are created.
 */
public class JavascriptParserTest extends AuraImplTestCase {
    JavascriptParser parser;

    /**
     * @param name
     */
    public JavascriptParserTest(String name) {
        super(name);
    }

    @Override
    public void setUp() throws Exception {
        super.setUp();
        parser = JavascriptParser.getInstance();
    }

    /**
     * Test method for {@link JavascriptParser#parse(DefDescriptor, Source)}.
     */
    public void testParse() throws Exception {
        DefDescriptor<TestSuiteDef> descriptor = DefDescriptorImpl.getInstance("js://test.testJSTestSuite",
                TestSuiteDef.class);
        Source<?> source = getJavascriptSourceLoader().getSource(descriptor);
        // Step 1: Parse the source which refers to a simple component with a reference to Javascript test suite
        Definition testSuite = parser.parse(descriptor, source);
        assertTrue(testSuite instanceof JavascriptTestSuiteDef);
        // Step 2: Gold file the Json output of the test suite object
        serializeAndGoldFile(testSuite, "_JSTestSuite");
    }

    /**
     * Test method for {@link JavascriptParser#parse(DefDescriptor, Source)}. This test case includes these scenarios:
     * <ul>
     * <li>A null source</li>
     * <li>A null Descriptor</li>
     * <li>Trying to create a Source for a Def type while no corresponding js file is present for the component</li>
     * </ul>
     */
    public void testNullCases() throws Exception {
        DefDescriptor<TestSuiteDef> descriptor = DefDescriptorImpl.getInstance("js://test.testNoJSControllers",
                TestSuiteDef.class);
        Source<?> source = getJavascriptSourceLoader().getSource(descriptor);
        // Test case 1: Try to create a Source for a component which does not have any javascript associated with it
        // getSource() call is looking for testNoJSControllersTest.js in the component folder
        try {
            parser.parse(descriptor, source);
        } catch (AuraRuntimeException expected) {
            // Expect a file not found Exception
        }

        // Test case 2: Null source
        try {
            parser.parse(descriptor, null);
            fail();
        } catch (NullPointerException expected) {
            // we can't check the message here.
        } catch (Exception e) {
            fail("Expected AuraAssertionException, not" + e.getClass().getName());
        }

        // Test Case 3: Null component descriptor
        try {
            parser.parse(null, source);
            fail();
        } catch (NullPointerException expected) {
            // can't check the message.
        } catch (Exception e) {
            fail("Expected AuraAssertionException, not" + e.getClass().getName());
        }
    }

    /**
     * TODO:New test Case: Having duplicate controller methods What if there are two actions in the javascript
     * controller with the same name.
     */
    public void testDuplicateJSController() throws Exception {

    }

    /**
     * Test method for {@link JavascriptParser#parse(DefDescriptor, Source)}. The DefDescriptor in this case is
     * referring to a simple Component with a Javascript Controller {@link DefType#CONTROLLER}.
     */
    public void testJSController() throws Exception {

        DefDescriptor<ControllerDef> descriptor = DefDescriptorImpl.getInstance("js://test.testJSController",
                ControllerDef.class);
        Source<?> source = getJavascriptSourceLoader().getSource(descriptor);
        // STEP 1:
        // Parse and create the ControllerDef object for the component
        Definition controller = parser.parse(descriptor, source);

        // STEP 2:
        // 2.1:Verify the CONTROLLERDEF object
        assertTrue(controller instanceof JavascriptControllerDef);
        // Convert from a generic controller to a Javascript type controller
        JavascriptControllerDef obj = (JavascriptControllerDef)controller;
        // Step 4: Verify properties of JavascriptRenderDef Object
        // OBject that is to be verified, The Def object name / Qualified name, Name of the Def / Descriptor, prefix of
        // the Def object, Namespace of the descriptor, Resource represented in terms of Aura component namespace
        verifyBasicDefinitionAttributes(obj, "js://test.testJSController", "testJSController", "js", "test",
                "js://test.testJSController");

        serializeAndGoldFile(controller, "_JSControllerDef");

        // 2.2: Should not be able to create an instance of the client action on the server side
        try {
            obj.createAction("newAction", new HashMap<String, Object>());
            fail("Should not be able to create an instance of the client action on the server side");
        } catch (UnsupportedOperationException expected) {
            "cannot create an instance of a client action".equals(expected.getMessage());
        }
        // 2.3 Extract the action defs and verify each of them in Step 3
        // Get all the actions defined in the Javascript
        Map<String, JavascriptActionDef> controllerActions = obj.getActionDefs();

        // STEP 3:
        // 3.1: Verify the number of ACTIONDEF objects is 2
        assertTrue(controllerActions.size() == 2);
        // 3.2: Verify the name of actiodefs
        assertTrue(controllerActions.containsKey("functionName1"));
        assertTrue(controllerActions.containsKey("functionName2"));

        // 3.3: Verify each JavascriptAction Def
        JavascriptActionDef jsActionDef = null;
        // 3.3.1 Action Def 1
        jsActionDef = controllerActions.get("functionName1");
        // Javascript Controllers are to be called on the Client side
        assertEquals(ActionType.CLIENT, jsActionDef.getActionType());
        // Javascript actions have no return type
        assertNull(jsActionDef.getReturnType());
        // Verify the Serialized form of the objects
        serializeAndGoldFile(controllerActions.get("functionName1"), "_actionDef_functionName1");

        // OBject that is to be verified, The Def object name / Qualified name, Name of the Def / Descriptor, prefix of
        // the Def object, Namespace of the descriptor, Resource represented in terms of Aura component namespace
        verifyBasicDefinitionAttributes(jsActionDef, "js://test.testJSController/ACTION$functionName1",
                "functionName1", "js", "test", "js://test.testJSController");

        // 3.3.2 Action Def 2
        jsActionDef = controllerActions.get("functionName2");
        // Javascript Controllers are to be called on the Client side
        assertEquals(ActionType.CLIENT, jsActionDef.getActionType());
        // Javascript actions have no return type
        assertNull(jsActionDef.getReturnType());
        // Verify the Serialized form of the objects
        serializeAndGoldFile(controllerActions.get("functionName2"), "_actionDef_functionName2");

        // OBject that is to be verified, The Def object name / Qualified name, Name of the Def / Descriptor, prefix of
        // the Def object, Namespace of the descriptor, Resource represented in terms of Aura component namespace
        verifyBasicDefinitionAttributes(jsActionDef, "js://test.testJSController/ACTION$functionName2",
                "functionName2", "js", "test", "js://test.testJSController");

    }

    /**
     * Test method for {@link JavascriptParser#parse(DefDescriptor, Source)}. The DefDescriptor in this case is
     * referring to a Nested Component with a Javascript Controller {@link DefType#CONTROLLER}.
     */
    public void testNestedComponent() throws Exception {
        DefDescriptor<ControllerDef> descriptor = DefDescriptorImpl.getInstance("js://test.testJSControllerParent",
                ControllerDef.class);
        Source<?> source = getJavascriptSourceLoader().getSource(descriptor);
        // STEP 1:
        // Parse and create the ControllerDef object for the component
        Definition controller = parser.parse(descriptor, source);
        // STEP 2:
        // 2.1:Verify the CONTROLLERDEF object
        assertTrue(controller instanceof JavascriptControllerDef);
        // Convert from a generic controller to a Javascript type controller
        JavascriptControllerDef obj = (JavascriptControllerDef)controller;
        // Get all the actions defined in the Javascript
        Map<String, JavascriptActionDef> controllerActions = obj.getActionDefs();

        // STEP 3:
        // 3.1: Verify the number of ACTIONDEF objects
        assertTrue(controllerActions.size() == 1);
        // 3.2: Verify the name of ActionDefs
        assertTrue(controllerActions.containsKey("functionName1"));

        // 3.4: Verify each JavascriptAction Def
        JavascriptActionDef jsActionDef = null;
        // 3.4.1 Action Def 1
        jsActionDef = controllerActions.get("functionName1");
        assertEquals(ActionType.CLIENT, jsActionDef.getActionType());
        assertNull(jsActionDef.getReturnType());
        // 3.4.2: Verify the Serialized form of the objects
        serializeAndGoldFile(jsActionDef, "_actionDef_functionName1");

        // OBject that is to be verified, The Def object name / Qualified name, Name of the Def / Descriptor, prefix of
        // the Def object, Namespace of the descriptor, Resource represented in terms of Aura component namespace
        verifyBasicDefinitionAttributes(jsActionDef, "js://test.testJSControllerParent/ACTION$functionName1",
                "functionName1", "js", "test", "js://test.testJSControllerParent");
    }

    /**
     * Test method for {@link JavascriptParser#parse(DefDescriptor, Source)}. The DefDescriptor is referring to a
     * Controller but the Javascript should have had only functions. In this scenario there is a variable declaration
     * which is not expected in a controller file. The JSparser will flag an exception for this.
     *
     * @throws Exception
     */
    public void testInvalidJSController() throws Exception {
        DefDescriptor<ControllerDef> descriptor = DefDescriptorImpl.getInstance("js://test.testInvalidJSController",
                ControllerDef.class);
        Source<?> source = getJavascriptSourceLoader().getSource(descriptor);
        try {
            parser.parse(descriptor, source);
            fail("Javascript controller must only contain functions");
        } catch (AuraRuntimeException expected) {
            // Expected
        }

    }

    /**
     * Test method for {@link JavascriptParser#parse(DefDescriptor, Source)}. The DefDescriptor is referring to a
     * Controller but the Javascript should have had only functions. In this scenario, the contents of the js file is a
     * well formatted Json but it contains a string assignment to a map key.
     *
     * @throws Exception
     */
    public void testNonFunctionElementsInJSController() throws Exception {
        DefDescriptor<ControllerDef> descriptor = DefDescriptorImpl.getInstance(
                "js://test.testNonFunctionElementsInJSController", ControllerDef.class);
        Source<?> source = getJavascriptSourceLoader().getSource(descriptor);
        try {
            parser.parse(descriptor, source);
            fail("Javascript controller must only contain functions");
        } catch (AuraRuntimeException expected) {
            assertTrue(expected.getCause().getCause().getMessage()
                    .startsWith("Only functions are allowed in javascript controllers"));
        }
    }

    /**
     * Test method for {@link JavascriptParser#parse(DefDescriptor, Source)}. The DefDescriptor in this case is
     * referring to a simple Component with a Javascript Rederer {@link DefType#RENDERER}.
     *
     * @newTestCase Verify the serialized format of Javascript RendererDef.
     * @hierarchy Aura.Unit Tests.Components.Renderer
     * @priority medium
     * @userStorySyncIdOrName a07B0000000Ekdr
     */
    public void testJSRenderer() throws Exception {
        DefDescriptor<RendererDef> descriptor = DefDescriptorImpl.getInstance("js://test.testJSRenderer",
                RendererDef.class);
        Source<?> source = getJavascriptSourceLoader().getSource(descriptor);
        // STEP 1:
        // Parse and create the RedererDef object for the component
        Definition renderer = parser.parse(descriptor, source);

        // STEP 2:Verify the RENDERERDEF object
        assertTrue(renderer instanceof JavascriptRendererDef);
        // Convert from a generic DEFINITION to a Javascript Renderer Definition
        JavascriptRendererDef obj = (JavascriptRendererDef)renderer;
        // Step 3: Gold file the JAvascriptRenderDef
        serializeAndGoldFile(renderer, "_JSRendererDef");
        // Step 4: Verify properties of JavascriptRenderDef Object
        // OBject that is to be verified, The Def object name / Qualified name, Name of the Def / Descriptor, prefix of
        // the Def object, Namespace of the descriptor, Resource represented in terms of Aura component namespace
        verifyBasicDefinitionAttributes(obj, "js://test.testJSRenderer", "testJSRenderer", "js", "test",
                "js://test.testJSRenderer");

    }

    /**
     * Test method for {@link JavascriptParser#parse(DefDescriptor, Source)}. The DefDescriptor in this case is
     * referring to a simple Component with an invalid Javascript Rederer {@link DefType#RENDERER}. Javascript rederer
     * should have only two actions : render & rerender
     */
    public void testInvalidJSRenderer() throws Exception {
        DefDescriptor<RendererDef> descriptor = DefDescriptorImpl.getInstance("js://test.testInvalidJSRenderer",
                RendererDef.class);
        Source<?> source = getJavascriptSourceLoader().getSource(descriptor);
        try {
            // Parse and create the RedererDef object for the component
            parser.parse(descriptor, source);
            // TODO: Currently a feature request. Uncomment the test once this is fixed
            // fail("Javascript renderer should have only two actions : render & rerender");
        } catch (AuraRuntimeException expected) {
            // expected
        }
    }

    /**
     * Test method for {@link JavascriptParser#parse(DefDescriptor, Source)}. The DefDescriptor in this case is
     * referring to a simple Component with a Javascript test {@link DefType#TESTSUITE}.
     */
    public void testJSTestSuite() throws Exception {

        DefDescriptor<TestSuiteDef> descriptor = DefDescriptorImpl.getInstance("js://test.testJSTestSuite",
                TestSuiteDef.class);
        Source<?> source = getJavascriptSourceLoader().getSource(descriptor);

        // Step 1: Parse the source which refers to a simple component with a reference to Javascript test suite
        Definition testSuite = parser.parse(descriptor, source);
        assertTrue(testSuite instanceof JavascriptTestSuiteDef);

        // Step 2: Gold file the Json output of the test suite object
        serializeAndGoldFile(testSuite, "_JSTestSuite");

        // Step 3: Verify the properties of the JavascriptTestSuiteDef object
        // OBject that is to be verified, The Def object name / Qualified name, Name of the Def / Descriptor, prefix of
        // the Def object, Namespace of the descriptor, Resource represented in terms of Aura component namespace
        verifyBasicDefinitionAttributes((JavascriptTestSuiteDef)testSuite, "js://test.testJSTestSuite",
                "testJSTestSuite", "js", "test", "js://test.testJSTestSuite");

        // Step 4: Verify each testCaseDef objects in the test suite object
        List<TestCaseDef> testCases = ((JavascriptTestSuiteDef)testSuite).getTestCaseDefs();
        assertEquals(3, testCases.size());
        for (Object o : testCases.toArray()) {
            assertTrue(o instanceof JavascriptTestCaseDef);
            JavascriptTestCaseDef testCaseDef = (JavascriptTestCaseDef)o;
            Map<String, Object> attributes = testCaseDef.getAttributeValues();
            if (testCaseDef.getName().equals("testHelloWorld")) {
                assertTrue(attributes.size() == 1);
                assertTrue(attributes.containsKey("num"));
                assertEquals("2", attributes.get("num"));
                // OBject that is to be verified, The Def object name / Qualified name, Name of the Def / Descriptor,
                // prefix of the Def object, Namespace of the descriptor, Resource represented in terms of Aura
                // component namespace
                // TODO:W-766231
                // verifyBasicDefinitionAttributes((DefinitionImpl)o,"js://test.testJSTestSuite/testHelloWorld","testHelloWorld",null,null,"js://test.testJSTestSuite");
            } else if (testCaseDef.getName().equals("testHelloWorld2")) {
                assertTrue(attributes.size() == 1);
                assertTrue(attributes.containsKey("num"));
                // Should get the default Attribute value
                assertEquals("5", attributes.get("num"));
                // OBject that is to be verified, The Def object name / Qualified name, Name of the Def / Descriptor,
                // prefix of the Def object, Namespace of the descriptor, Resource represented in terms of Aura
                // component namespace
                // TODO:W-766231
                // verifyBasicDefinitionAttributes((DefinitionImpl)o,"js://test.testJSTestSuite/testHelloWorld2","testHelloWorld2",null,null,"js://test.testJSTestSuite");
            } else if (testCaseDef.getName().equals("testHelloWorld3")) {
                assertTrue(attributes.size() == 2);
                assertTrue(attributes.containsKey("num"));
                assertEquals("4", attributes.get("num"));
                assertTrue(attributes.containsKey("alpha"));
                assertEquals("A", attributes.get("alpha"));
                // OBject that is to be verified, The Def object name / Qualified name, Name of the Def / Descriptor,
                // prefix of the Def object, Namespace of the descriptor, Resource represented in terms of Aura
                // component namespace
                // TODO:W-766231
                // verifyBasicDefinitionAttributes((DefinitionImpl)o,"js://test.testJSTestSuite/testHelloWorld3","testHelloWorld3",null,null,"js://test.testJSTestSuite");

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

    public void testJSTestSuiteWithoutAttributes() throws Exception {
        DefDescriptor<TestSuiteDef> descriptor = DefDescriptorImpl.getInstance(
                "js://test.testJSTestSuiteWithoutAttributes", TestSuiteDef.class);
        Source<?> source = getJavascriptSourceLoader().getSource(descriptor);

        // Step 1: Parse the source which refers to a simple component with a reference to Javascript test suite
        Definition testSuite = parser.parse(descriptor, source);
        assertTrue(testSuite instanceof JavascriptTestSuiteDef);

        // Step 2: Verify the properties of the JavascriptTestSuiteDef object
        // OBject that is to be verified, The Def object name / Qualified name, Name of the Def / Descriptor, prefix of
        // the Def object, Namespace of the descriptor, Resource represented in terms of Aura component namespace
        verifyBasicDefinitionAttributes((JavascriptTestSuiteDef)testSuite,
                "js://test.testJSTestSuiteWithoutAttributes", "testJSTestSuiteWithoutAttributes", "js", "test",
                "js://test.testJSTestSuiteWithoutAttributes");

        // Step 3: Verify each testCaseDef objects in the test suite object
        List<TestCaseDef> testCases = ((JavascriptTestSuiteDef)testSuite).getTestCaseDefs();
        assertEquals(2, testCases.size());
        for (Object o : testCases.toArray()) {
            assertTrue(o instanceof JavascriptTestCaseDef);
            JavascriptTestCaseDef testCaseDef = (JavascriptTestCaseDef)o;
            Map<String, Object> attributes = testCaseDef.getAttributeValues();
            if (testCaseDef.getName().equals("testHelloWorld")) {
                assertTrue(attributes.size() == 1);
                assertTrue(attributes.containsKey("num"));
                assertEquals("2", attributes.get("num"));
                // OBject that is to be verified, The Def object name / Qualified name, Name of the Def / Descriptor,
                // prefix of the Def object, Namespace of the descriptor, Resource represented in terms of Aura
                // component namespace
                // TODO:W-766231
                // verifyBasicDefinitionAttributes((DefinitionImpl)o,"js://test.testJSTestSuiteWithoutAttributes/testHelloWorld","testHelloWorld",null,null,"js://test.testJSTestSuiteWithoutAttributes");
            } else if (testCaseDef.getName().equals("testHelloWorld3")) {
                assertTrue(attributes.size() == 0);
                // OBject that is to be verified, The Def object name / Qualified name, Name of the Def / Descriptor,
                // prefix of the Def object, Namespace of the descriptor, Resource represented in terms of Aura
                // component namespace
                // TODO:W-766231
                // verifyBasicDefinitionAttributes((DefinitionImpl)o,"js://test.testJSTestSuiteWithoutAttributes/testHelloWorld3","testHelloWorld3",null,null,"js://test.testJSTestSuiteWithoutAttributes");
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
    // TODO: update test to account for resource loading vs. filesystem loading
    public void _testJSTestSuiteWithoutTestFunc() throws Exception {

        DefDescriptor<TestSuiteDef> descriptor = DefDescriptorImpl.getInstance(
                "js://test.testJSTestSuiteWithoutTestFunc", TestSuiteDef.class);
        /**
         * TODO: A makeshift way of creating a source, should replace it with the String Source when its available for
         * Javascript
         **/
        String jsFilename = String.format("%s/%s/%s%s", descriptor.getNamespace(), descriptor.getName(),
                descriptor.getName(), "_TestSuite.js");
        File jsFile = new File(AuraImplFiles.TestComponents.asFile(), jsFilename);
        String jsControllerName = String.format("js://%s.%s", descriptor.getNamespace(), descriptor.getName());
        String pathOrId = jsFile.exists() ? jsFile.getCanonicalPath() : jsControllerName;

        Source<?> source = new FileJavascriptSource<TestSuiteDef>(descriptor, pathOrId, jsFile);
        try {
            parser.parse(descriptor, source);
            fail("Invalid testsuite: Every test case should have a function assigned to it");
        } catch (AuraRuntimeException expected) {
            assertTrue(expected.getMessage().startsWith("test function required"));
        }
    }

    /**
     * Test method for {@link JavascriptParser#parse(DefDescriptor, Source)}. The DefDescriptor in this case is
     * referring to a simple Component with a Javascript test suite {@link DefType#TESTSUITE}. One of the test cases has
     * no function assigned to them, this should cause an Exception
     */
    // TODO: update test to account for resource loading vs. filesystem loading
    public void _testJSTestSuiteNegativeCases() throws Exception {
        // Test Case 1: There is a test case like entry in the Javascript file. The assignment to the test case is a MAP
        DefDescriptor<TestSuiteDef> descriptor = DefDescriptorImpl.getInstance("js://test.testJSTestSuiteNegative1",
                TestSuiteDef.class);
        /**
         * TODO: A makeshift way of creating a source, should replace it with the String Source when its available for
         * Javascript
         **/
        String jsFilename = String.format("%s/%s/%s%s", descriptor.getNamespace(), descriptor.getName(),
                descriptor.getName(), "_TestSuite.js");
        File jsFile = new File(AuraImplFiles.TestComponents.asFile(), jsFilename);
        String jsControllerName = String.format("js://%s.%s", descriptor.getNamespace(), descriptor.getName());

        String pathOrId = jsFile.exists() ? jsFile.getCanonicalPath() : jsControllerName;
        Source<?> source = new FileJavascriptSource<TestSuiteDef>(descriptor, pathOrId, jsFile);

        try {
            parser.parse(descriptor, source);
            fail("Not a well defined test case, so should have failed");
        } catch (AuraRuntimeException expected) {
            assertTrue(expected.getMessage().startsWith("test function required"));
        }
        // Test Case 2: There is a test case like entry in the Javascript file. The assignment to the test case is a
        // String
        descriptor = DefDescriptorImpl.getInstance("js://test.testJSTestSuiteNegative2", TestSuiteDef.class);
        jsFilename = String.format("%s/%s/%s%s", descriptor.getNamespace(), descriptor.getName(), descriptor.getName(),
                "_TestSuite.js");
        jsFile = new File(AuraImplFiles.TestComponents.asFile(), jsFilename);
        jsControllerName = String.format("js://%s.%s", descriptor.getNamespace(), descriptor.getName());
        source = getJavascriptSourceLoader().getSource(descriptor);
        try {
            parser.parse(descriptor, source);
            fail("Not a well defined test case, so should have failed");
        } catch (AuraRuntimeException expected) {
            // Expected
        }

    }

    /**
     * @param defImplObj
     *            OBject that is to be verified
     * @param descriptorName
     *            The Def object name / Qualified name
     * @param objName
     *            Name of the Def / Descriptor
     * @param prefix
     *            prefix of the Def object
     * @param namespace
     *            Namespace of the descriptor
     * @param fileName
     *            Resource represented in terms of Aura component namespace
     * @throws Exception
     */
    private void verifyBasicDefinitionAttributes(DefinitionImpl<?> defImplObj, String descriptorName, String objName,
            String prefix, String namespace, String fileName) throws Exception {
        DefDescriptor<?> descriptorObj = null;

        assertEquals(defImplObj.toString(), descriptorName);
        assertEquals(defImplObj.getName(), objName);
        descriptorObj = defImplObj.getDescriptor();
        assertEquals(objName, descriptorObj.getName());
        assertEquals(prefix, descriptorObj.getPrefix());
        assertEquals(namespace, descriptorObj.getNamespace());
        assertEquals(descriptorName, descriptorObj.getQualifiedName());
        // TODO: have to address getFileName() when loaded as resource
        // Location l = defImplObj.getLocation();
        // assertEquals(fileName, l.getFileName());
    }

    private BaseSourceLoader getJavascriptSourceLoader() {
        if (AuraImplFiles.TestComponents.asFile().exists()) {
            return new FileJavascriptSourceLoader(AuraImplFiles.TestComponents.asFile());
        } else {
            String pkg = ServiceLocator.get()
                    .get(ComponentLocationAdapter.class, "auraImplTestComponentLocationAdapterImpl")
                    .getComponentSourcePackage();
            return new ResourceJavascriptSourceLoader(pkg);
        }
    }
}
