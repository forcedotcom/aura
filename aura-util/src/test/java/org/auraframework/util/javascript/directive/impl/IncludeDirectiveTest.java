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
package org.auraframework.util.javascript.directive.impl;

import java.io.File;
import java.util.EnumSet;

import org.apache.commons.lang3.StringUtils;
import org.auraframework.util.javascript.directive.Directive;
import org.auraframework.util.javascript.directive.DirectiveBasedJavascriptGroup;
import org.auraframework.util.javascript.directive.DirectiveParser;
import org.auraframework.util.javascript.directive.DirectiveType;
import org.auraframework.util.javascript.directive.DirectiveTypes;
import org.auraframework.util.javascript.directive.JavascriptGeneratorMode;
import org.auraframework.util.test.util.UnitTestCase;

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
        boolean failed = false;
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
                    file.getName(), ImmutableList.<DirectiveType<?>> of(DirectiveTypes.includeType),
                    EnumSet.of(JavascriptGeneratorMode.TESTING));
            id = new IncludeDirective(4, config[1]);
            id.processDirective(jg);
            failed = true;
        } catch (Throwable e) {
            // Expected the Javascript group to throw an error while adding an
            // invalid file
            assertTrue("Add File function failed because of an unexpected error message",
                    e.getMessage().indexOf("reallyconkyinclude") != -1);
        }
        if (failed) {
            fail("should have failed because 'reallyconkyinclude' is an invalid javascript file to include");
        }
    }

    /**
     * Include some non-existing file. Really this is handled by
     * DirectivebasedJavascriptGroup. But having this test here only doubles the
     * number of checks.
     */
    public void testIncludeNonExistingFile() throws Exception {
        File file = getResourceFile("/testdata/javascript/includeDirective/testIncludeNonExistingFile.js");
        DirectiveBasedJavascriptGroup jg = new DirectiveBasedJavascriptGroup("testDummy", file.getParentFile(),
                file.getName(), ImmutableList.<DirectiveType<?>> of(DirectiveTypes.includeType),
                EnumSet.of(JavascriptGeneratorMode.TESTING));
        DirectiveParser dp = new DirectiveParser(jg, jg.getStartFile());
        boolean failed = false;
        try {
            dp.parseFile();
            failed = true;
        } catch (Throwable expected) {
            assertTrue("Add File function failed because of an unexpected error message",
                    expected.getMessage().indexOf("haha.js") != -1);
        }
        if (failed) {
            fail("Should have failed processing a non-existing file");
        }
    }

    /**
     * Positive test case for INCLUDE directive
     */
    public void testIncludeDirective() throws Exception {
        File file = getResourceFile("/testdata/javascript/includeDirective/testIncludeDirective.js");
        getResourceFile("/testdata/javascript/includeDirective/testIncludeDirective1.js");
        getResourceFile("/testdata/javascript/includeDirective/testIncludeDirective2.js");
        getResourceFile("/testdata/javascript/includeDirective/nestedInclude/testIncludeDirective3.js");
        // There will be classpath issues with getResourceFile("/testdata/") if another module has a testdata folder
        File testDataFolder = file.getParentFile().getParentFile().getParentFile();
        DirectiveBasedJavascriptGroup jg = new DirectiveBasedJavascriptGroup("testDummy",
                testDataFolder, "javascript/includeDirective/testIncludeDirective.js",
                ImmutableList.of(DirectiveTypes.includeType, DirectiveTypes.ifType),
                EnumSet.of(JavascriptGeneratorMode.TESTING));
        DirectiveParser dp = new DirectiveParser(jg, jg.getStartFile());
        dp.parseFile();
        goldFileText(dp.generate(JavascriptGeneratorMode.TESTING), "_test.js");
        goldFileText(dp.generate(JavascriptGeneratorMode.AUTOTESTING), "_auto.js");
    }

    /**
     * Test cyclic include directives
     * TODO: W-2537655
     * Disable the test, since we don't handle the cyclic includes now. The test can be used when fixing the bug.
     */
    public void _testCyclicInclude() throws Exception {
        DirectiveBasedJavascriptGroup jg = new DirectiveBasedJavascriptGroup("testDummy",
                getResourceFile("/testdata/"),
                "javascript/includeDirective/testCyclicInclude.js",
                ImmutableList.<DirectiveType<?>> of(DirectiveTypes.includeType),
                EnumSet.of(JavascriptGeneratorMode.TESTING));
        DirectiveParser dp = new DirectiveParser(jg, jg.getStartFile());
        try {
            dp.parseFile();
            fail("Failed to process a cyclic INCLUDE directive");
        } //If we throw exception when cyclic includes, assert catch corresponding exception here. catch() {}
        catch (StackOverflowError e) {
            // FIXME: this need to be removed when the bug is fixed.
            fail("Failed to catch cyclic incudes.");
        }
    }

    /**
     * Test duplicate include directives
     * TODO: W-2537655
     * Disable the test, since we don't handle the cyclic includes now. The test can be used when fixing the bug.
     */
    public void _testCommonInclude() throws Exception {
        getResourceFile("/testdata/javascript/includeDirective/testCommonInclude.js");
        getResourceFile("/testdata/javascript/includeDirective/testCommonInclude_inner1.js");
        getResourceFile("/testdata/javascript/includeDirective/testCommonInclude_inner2.js");
        getResourceFile("/testdata/javascript/includeDirective/testCommonInclude_commonstuff.js");
        DirectiveBasedJavascriptGroup jg = new DirectiveBasedJavascriptGroup("testDummy",
                getResourceFile("/testdata/"), "javascript/includeDirective/testCommonInclude.js",
                ImmutableList.<DirectiveType<?>> of(DirectiveTypes.includeType),
                EnumSet.of(JavascriptGeneratorMode.TESTING));
        DirectiveParser dp = new DirectiveParser(jg, jg.getStartFile());

        dp.parseFile();
        String generateContent = dp.generate(JavascriptGeneratorMode.TESTING);

        // FIXME: if we want to error out when duplicate includes, change the assertion.
        // System.out.println(generateContent);
        int count = StringUtils.countMatches(generateContent, "file testCommonInclude_commonstuff.js");
        assertEquals(1, count);
    }


}
