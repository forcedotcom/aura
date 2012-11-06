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
package org.auraframework.util.javascript.directive.impl;

import java.io.File;
import java.io.IOException;
import java.util.EnumSet;

import org.auraframework.test.UnitTestCase;
import org.auraframework.util.javascript.directive.Directive;
import org.auraframework.util.javascript.directive.DirectiveBasedJavascriptGroup;
import org.auraframework.util.javascript.directive.DirectiveParser;
import org.auraframework.util.javascript.directive.DirectiveType;
import org.auraframework.util.javascript.directive.DirectiveTypes;
import org.auraframework.util.javascript.directive.JavascriptGeneratorMode;

import com.google.common.collect.ImmutableList;

/**
 * Tests to verify functions of Include Directive {@link IncludeDirective}.
 */
public class IncludeDirectiveTest extends UnitTestCase {
    /**
     * Test basic initialization.
     */
    public void testIncludeDirectiveBasicInitialization() throws Exception {
        IncludeDirectiveType directiveTypeObj = new IncludeDirectiveType();
        assertTrue("Include Directive type should be labled as 'include'", directiveTypeObj.getLabel()
                .equals("include"));
        Directive directiveObj = directiveTypeObj.constructDirective(4, "");
        assertFalse("Include directive is a multiline directive", directiveObj.isMultiline());
    }

    /**
     * Test config parameters passed for Include directive
     */
    public void testIncludeConfig() throws Exception {
        String[] config = { "{\"modes\": [\"TESTING\"]}", "reallyconkyinclude" };
        IncludeDirective id = null;
        try {
            id = new IncludeDirective(4, config[0]);
            fail("Should not have continued processing the include directive without a value for path");
        } catch (AssertionError expected) {
            assertTrue(expected.getMessage().equals("Path is required in include directive config"));
            // just to avoid the "local variable never read" error
            assertTrue(id == null);
        }
        try {
            File file = getResourceFile("/testdata/javascript/head.js");
            DirectiveBasedJavascriptGroup jg = new DirectiveBasedJavascriptGroup("testDummy", file.getParentFile(),
                    file.getName(), ImmutableList.<DirectiveType<?>>of(DirectiveTypes.includeType),
                    EnumSet.of(JavascriptGeneratorMode.TESTING));
            id = new IncludeDirective(4, config[1]);
            id.processDirective(jg);
            fail("should have failed because 'reallyconkyinclude' is an invalid javascript file to include");
        } catch (IOException e) {
            // Expected the Javascript group to throw an error while adding an invalid file
        }
    }

    /**
     * Test cyclic include directives
     */
    /*
     * Cannot have this test in autobuild. If it fails it will hose the whole autobuild. But a bug has been filed for
     * this. https://gus.soma.salesforce.com/a0790000000DQ06AAG public void testCyclicInclude() throws Exception{
     * DirectiveBasedJavascriptGroup jg = new DirectiveBasedJavascriptGroup( "testDummy", new
     * File(SettingsTestUtil.getTestdataDir()), "javascript/includeDirective/cyclicInclude1.js", false,
     * ImmutableList.of(DirectiveTypes.includeType), EnumSet.of(JavascriptGeneratorMode.TESTING)); DirectiveParser dp =
     * new DirectiveParser (jg, jg.getStartFile()); try{ dp.parseFile();
     * fail("Should not have processed a cyclic INCLUDE directive"); }catch( RuntimeException e){
     * assertTrue("The Javascript Processor failed for some unkown reason"
     * ,e.getMessage().startsWith("Cyclic Include directives found")); } }
     */
    /**
     * https://gus.soma.salesforce.com/a0790000000DQ3AAAW Test common inclusion. What if the same javascript file is
     * included twice. Ideally each included javascript should be parsed and processed only once.
     */
    public void testCommonInclude() throws Exception {
        getResourceFile("/testdata/javascript/includeDirective/testCommonInclude.js");
        getResourceFile("/testdata/javascript/includeDirective/testCommonInclude_inner1.js");
        getResourceFile("/testdata/javascript/includeDirective/testCommonInclude_inner2.js");
        getResourceFile("/testdata/javascript/includeDirective/testCommonInclude_commonstuff.js");
        DirectiveBasedJavascriptGroup jg = new DirectiveBasedJavascriptGroup("testDummy",
                getResourceFile("/testdata/"), "javascript/includeDirective/testCommonInclude.js",
                ImmutableList.<DirectiveType<?>>of(DirectiveTypes.includeType), EnumSet.of(JavascriptGeneratorMode.TESTING));
        DirectiveParser dp = new DirectiveParser(jg, jg.getStartFile());
        dp.parseFile();
        goldFileText(dp.generate(JavascriptGeneratorMode.TESTING), ".js");

    }

    /**
     * Include some non-existing file. Really this is handled by DirectivebasedJavascriptGroup. But having this test
     * here only doubles the number of checks.
     */
    public void testIncludeNonExistingFile() throws Exception {
        File file = getResourceFile("/testdata/javascript/includeDirective/testIncludeNonExistingFile.js");
        DirectiveBasedJavascriptGroup jg = new DirectiveBasedJavascriptGroup("testDummy", file.getParentFile(),
                file.getName(), ImmutableList.<DirectiveType<?>>of(DirectiveTypes.includeType),
                EnumSet.of(JavascriptGeneratorMode.TESTING));
        DirectiveParser dp = new DirectiveParser(jg, jg.getStartFile());
        try {
            dp.parseFile();
            fail("Should have failed processing a non-existing file");
        } catch (IOException expected) {
            assertTrue(expected.getMessage().contains("File did not exist or was not a .js file: "));
        }

    }

    /**
     * Positive test case for INCLUDE directive
     */
    public void testIncludeDirective() throws Exception {
        getResourceFile("/testdata/javascript/includeDirective/testIncludeDirective.js");
        getResourceFile("/testdata/javascript/includeDirective/testIncludeDirective1.js");
        getResourceFile("/testdata/javascript/includeDirective/testIncludeDirective2.js");
        getResourceFile("/testdata/javascript/includeDirective/nestedInclude/testIncludeDirective3.js");
        DirectiveBasedJavascriptGroup jg = new DirectiveBasedJavascriptGroup("testDummy",
                getResourceFile("/testdata/"), "javascript/includeDirective/testIncludeDirective.js", ImmutableList.<DirectiveType<?>>of(
                        DirectiveTypes.includeType, DirectiveTypes.ifType), EnumSet.of(JavascriptGeneratorMode.TESTING));
        DirectiveParser dp = new DirectiveParser(jg, jg.getStartFile());
        dp.parseFile();
        goldFileText(dp.generate(JavascriptGeneratorMode.TESTING), "_test.js");
        goldFileText(dp.generate(JavascriptGeneratorMode.AUTOTESTING), "_auto.js");
    }
}
