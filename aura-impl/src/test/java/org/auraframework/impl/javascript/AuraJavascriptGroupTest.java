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
package org.auraframework.impl.javascript;

import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.util.AuraImplFiles;
import org.auraframework.util.javascript.JavascriptProcessingError;
import org.auraframework.util.javascript.JavascriptProcessingError.Level;
import org.auraframework.util.javascript.directive.DirectiveParser;
import org.auraframework.util.javascript.directive.JavascriptGeneratorMode;
import org.auraframework.util.test.annotation.UnAdaptableTest;
import org.junit.Test;

import java.io.StringWriter;
import java.util.List;
import java.util.Set;

/**
 * Automation for Aura JavascriptGroup.
 */
@UnAdaptableTest("JS Generation only happens in file system mode. When running in UITier we're not going to have the right access to the file system. These tests still run in OSS Build.")
public class AuraJavascriptGroupTest extends AuraImplTestCase {
    
    @Override
    public void runTest() throws Throwable {
        if (AuraImplFiles.AuraJavascriptSourceDirectory.asFile().exists()) {
            super.runTest();
        }
    }

    /**
     * Verify that AuraJavascriptGroup can be compressed with all modes.
     */
    @Test
    public void testCompressionOfAuraJavascriptGroup() throws Exception {
        AuraJavascriptGroup js = new AuraJavascriptGroup(fileMonitor);
        Set<JavascriptGeneratorMode> jsModes = js.getJavascriptGeneratorModes();
        DirectiveParser parser = new DirectiveParser(js, js.getStartFile());
        parser.parseFile();

        StringBuffer errorTxt = new StringBuffer();
        // Have to do it for All modes because each mode has specific settings
        // for comments and such
        for (JavascriptGeneratorMode mode : jsModes) {
            if (mode.getJavascriptWriter() != null) {
                String jsContents = parser.generate(mode);
                List<JavascriptProcessingError> errors = mode.getJavascriptWriter().compress(jsContents,
                        new StringWriter(), js.getStartFile().getName());
                for (JavascriptProcessingError e : errors) {
                    if (e.getLevel() == Level.Error) {
                        errorTxt.append(e.toString());
                    }
                }
            }
        }
        if (errorTxt.length() != 0) {
            fail("There were some errors while compressing:" + errorTxt);
        }
    }
}
