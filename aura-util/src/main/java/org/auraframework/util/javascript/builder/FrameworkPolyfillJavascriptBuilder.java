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

import java.io.*;
import java.net.MalformedURLException;
import java.util.ArrayList;
import java.util.List;

import org.auraframework.util.javascript.JavascriptProcessingError;
import org.auraframework.util.javascript.JavascriptWriter;
import org.auraframework.util.javascript.directive.JavascriptGeneratorMode;
import org.auraframework.util.resource.ResourceLoader;

import com.google.common.io.Files;

public class FrameworkPolyfillJavascriptBuilder extends JavascriptBuilder{
    
    private String cssVariableSource = "";
    
    public FrameworkPolyfillJavascriptBuilder(ResourceLoader resourceLoader) {
        super(resourceLoader);
    }
    
    @Override
    public List<JavascriptResource> build(JavascriptGeneratorMode mode, boolean isCompat, String inputContent, String outputFileName) throws IOException {
        JavascriptWriter jsWriter = mode.getJavascriptWriter();
        List<JavascriptResource> resources = new ArrayList<>();
        boolean withSourceMaps = mode == JavascriptGeneratorMode.PRODUCTION;
        if (isCompat) {
            resources.add(getCssVarPollyfill(jsWriter, withSourceMaps, outputFileName));
        }
        return resources;
    }

    private JavascriptResource getCssVarPollyfill(JavascriptWriter jsWriter, boolean withSourceMaps, String outputFileName) throws IOException {
        StringWriter compressedSourceWriter = new StringWriter();
        if(withSourceMaps) {
            try (StringWriter sourcemapSectionWriter = new StringWriter()) {

                final List<JavascriptProcessingError> errors = jsWriter.compress(
                        new StringReader(cssVariableSource),
                        compressedSourceWriter,
                        sourcemapSectionWriter,
                        Files.getNameWithoutExtension(outputFileName) + ".map.js",
                        null);

                proccessBuildErrorsAndWarnings(errors);

                return new JavascriptResource(
                        cssVariableSource,
                        compressedSourceWriter.toString(),
                        sourcemapSectionWriter.toString()
                );
            }
        }

        jsWriter.compress(cssVariableSource, compressedSourceWriter, outputFileName);
        return new JavascriptResource(null, compressedSourceWriter.toString(), null);
    }
    
    @Override
    public void fetchResources() {
        try {
            cssVariableSource = getSource("aura/polyfill/css-variables.js");
        } catch (MalformedURLException err) {
        }
    }

    @Override
    public int getSourcemapLineOffset() {
        return 1;
    }
}
