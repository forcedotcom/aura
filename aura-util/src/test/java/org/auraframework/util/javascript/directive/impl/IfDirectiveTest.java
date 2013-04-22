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

import org.auraframework.test.UnitTestCase;
import org.auraframework.util.javascript.directive.Directive;
import org.auraframework.util.javascript.directive.DirectiveBasedJavascriptGroup;
import org.auraframework.util.javascript.directive.DirectiveParser;
import org.auraframework.util.javascript.directive.DirectiveType;
import org.auraframework.util.javascript.directive.DirectiveTypes;
import org.auraframework.util.javascript.directive.JavascriptGeneratorMode;

import com.google.common.collect.ImmutableList;

/**
 * Tests to verify the functioning of the IF directive {@link IfDirective}
 */
public class IfDirectiveTest extends UnitTestCase {
    public IfDirectiveTest(String name) {
        super(name);
    }

    /**
     * Test basic initialization.
     */
    public void testIfDirectiveBasicInitialization() throws Exception {
        IfDirectiveType directiveTypeObj = new IfDirectiveType();
        assertTrue("If Directive type should be labled as 'if'", directiveTypeObj.getLabel().equals("if"));
        Directive directiveObj = directiveTypeObj.constructDirective(4, "");
        assertTrue("If directive is a multiline directive", directiveObj.isMultiline());
        String content = "Write anything you want and this will just throw is back. But it should throw back the exact same thing";
        directiveObj.setContent(content);
        // Regardless of the javascriptGenerator mode, an IF directive just
        // spits out its contents. Hence using null as
        // the mode.
        assertTrue("If directive should just spit out whatever was given to it", directiveObj.generateOutput(null)
                .equals(content));
    }

    /**
     * Test basic javascript generation with IF directives
     */
    public void testJSSourceWithIfDirective() throws Exception {
        File file = getResourceFile("/testdata/javascript/testIfDirective_positive.js");
        DirectiveBasedJavascriptGroup jg = new DirectiveBasedJavascriptGroup("testDummy", file.getParentFile(),
                file.getName(), ImmutableList.<DirectiveType<?>> of(DirectiveTypes.ifType),
                EnumSet.of(JavascriptGeneratorMode.TESTING));
        DirectiveParser dp = new DirectiveParser(jg, jg.getStartFile());
        dp.parseFile();
        goldFileText(dp.generate(JavascriptGeneratorMode.TESTING), "_test.js");
        goldFileText(dp.generate(JavascriptGeneratorMode.PRODUCTION), "_prod.js");
    }
}
