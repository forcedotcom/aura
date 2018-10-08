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
package org.auraframework.util.javascript.builder;

import com.google.common.io.Files;
import org.auraframework.util.javascript.JavascriptWriter;
import org.auraframework.util.javascript.directive.JavascriptGeneratorMode;

import java.io.IOException;
import java.io.StringReader;
import java.io.StringWriter;

public class FrameworkJavascriptBuilder extends JavascriptBuilder {

    public FrameworkJavascriptBuilder() {
        super(null);
    }

    @Override
    public JavascriptResource build(JavascriptGeneratorMode mode, boolean isCompat, String inputContent, String outputFileName) throws IOException {
        JavascriptWriter jsWriter = mode.getJavascriptWriter();

        StringWriter compressedSourceWriter = new StringWriter();
        if (mode == JavascriptGeneratorMode.PRODUCTION) {
            StringWriter sourcemapSectionWriter = new StringWriter();

            jsWriter.compress(new StringReader(inputContent), compressedSourceWriter, sourcemapSectionWriter, Files.getNameWithoutExtension(outputFileName) + ".map.js", null);

            return new JavascriptResource(inputContent, compressedSourceWriter.toString(), sourcemapSectionWriter.toString());
        } else {
            jsWriter.compress(inputContent, compressedSourceWriter, outputFileName);
            return new JavascriptResource(null, compressedSourceWriter.toString(), null);
        }
    }
}
