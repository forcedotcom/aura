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
package configuration.javascript;

import java.io.StringReader;
import java.io.StringWriter;
import java.util.List;
import java.util.Set;

import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.javascript.AuraJavascriptGroup;
import org.auraframework.impl.util.AuraImplFiles;
import org.auraframework.util.javascript.JavascriptProcessingError;
import org.auraframework.util.javascript.directive.DirectiveParser;
import org.auraframework.util.javascript.directive.JavascriptGeneratorMode;

/**
 * Automation for Aura JavascriptGroup.
 */
public class AuraJavascriptGroupTest extends AuraImplTestCase {
    public AuraJavascriptGroupTest(String name) {
        super(name);
    }

    @Override
    public void runTest() throws Throwable {
        if (AuraImplFiles.AuraJavascriptSourceDirectory.asFile().exists()) {
            super.runTest();
        }
    }

    /**
     * Verify that AuraJavascriptGroup does not fail JSLint validation.
     *
     * @priority high
     * @hierarchy Aura.Unit Tests.Javascript Library
     * @userStory a07B0000000FDWP
     */
    public void testJSLintValidationForAuraJavascriptGroup() throws Exception {
        AuraJavascriptGroup js = new AuraJavascriptGroup();
        try {
            // Should be ideally in setup, but this step might have some errors, so won't assume its reliable
            js.parse();
            js.validate();
        } catch (RuntimeException e) {
            fail("AuraJavascriptGroup failed validation with the following error:" + e.getMessage());
        }
    }

    /**
     * Verify that AuraJavascriptGroup can be compressed with all modes.
     *
     * @priority high
     * @hierarchy Aura.Unit Tests.Javascript Library
     * @userStory a07B0000000FDWP
     */
    public void testCompressionOfAuraJavascriptGroup() throws Exception {
        AuraJavascriptGroup js = new AuraJavascriptGroup();
        Set<JavascriptGeneratorMode> jsModes = js.getJavascriptGeneratorModes();
        DirectiveParser parser = new DirectiveParser(js, js.getStartFile());
        parser.parseFile();

        StringBuffer errorTxt = new StringBuffer();
        // Have to do it for All modes because each mode has specific settings for comments and such
        for (JavascriptGeneratorMode mode : jsModes) {
            if (mode.getCompressionLevel() != null) {
                String jsContents = parser.generate(mode);
                List<JavascriptProcessingError> errors = mode.getCompressionLevel().compress(
                        new StringReader(jsContents), new StringWriter(), js.getStartFile().getName());
                for (JavascriptProcessingError e : errors)
                    errorTxt.append(e.toString());
            }
        }
        if (errorTxt.length() != 0) fail("There were some errors while compressing:" + errorTxt);
    }
}
