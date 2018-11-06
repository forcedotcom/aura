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

import org.auraframework.util.javascript.JavascriptProcessingError;
import org.auraframework.util.javascript.JavascriptWriter;
import org.auraframework.util.javascript.directive.JavascriptGeneratorMode;
import org.auraframework.util.resource.ResourceLoader;

import java.io.IOException;
import java.io.StringWriter;
import java.net.MalformedURLException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.StringJoiner;

public class ExternalLibJavascriptBuilder extends JavascriptBuilder {
    private String librariesContent = "";
    private String librariesContentMin = "";
    private String compatLibrariesContent = "";
    private String compatLibrariesContentMin = "";

    public ExternalLibJavascriptBuilder(ResourceLoader resourceLoader) {
        super(resourceLoader);
    }

    @Override
    public List<JavascriptResource> build(JavascriptGeneratorMode mode, boolean isCompat, String inputContent, String outputFileName) throws IOException {
        boolean minified = mode.getJavascriptWriter() == JavascriptWriter.CLOSURE_AURA_PROD;

        String libs = minified ?
                (isCompat ? compatLibrariesContentMin : librariesContentMin) :
                (isCompat ? compatLibrariesContent : librariesContent);

        // strip out spaces and comments for external libraries
        JavascriptWriter libsJsWriter = JavascriptWriter.CLOSURE_WHITESPACE_ONLY;
        try (StringWriter libsWriter = new StringWriter()) {
            final List<JavascriptProcessingError> errors = libsJsWriter.compress(libs, libsWriter, outputFileName);
            proccessBuildErrorsAndWarnings(errors);

            return Arrays.asList(new JavascriptResource(null, libsWriter.toString(), null));
        }
    }

    @Override
    public void fetchResources() {
        List<String> libraries = new ArrayList<>();
        libraries.add("aura/resources/moment/moment");
        libraries.add("aura/resources/DOMPurify/DOMPurify");

        StringJoiner libs = new StringJoiner("\n");
        StringJoiner libsMin = new StringJoiner("\n");

        libraries.forEach((path) -> {
            String source = null;
            String minSource = null;
            try {
                source = getSource(path + ".js");
                minSource = getSource(path + ".min.js");
            } catch (MalformedURLException e) {
            }
            if (source != null) {
                libs.add(source);
            }
            if (minSource != null) {
                libsMin.add(minSource);
            }
        });

        if (libs.length() != 0) {
            librariesContent = "\nAura.externalLibraries = function() {\n" + libs.toString() + "\n};";
        }
        if (libsMin.length() != 0) {
            librariesContentMin = "\nAura.externalLibraries = function() {\n" + libsMin.toString() + "\n};";
        }

        List<String> compatLibraries = new ArrayList<>();
        compatLibraries.add("aura/resources/IntlTimeZonePolyfill/IntlTimeZonePolyfill");
        compatLibraries.forEach((path) -> {
            String source = null;
            String minSource = null;
            try {
                source = getSource(path + ".js");
                minSource = getSource(path + ".min.js");
            } catch (MalformedURLException e) {
            }
            if (source != null) {
                source = "try {\n" + source + "\n} catch (e) {}\n";
                libs.add(source);
            }
            if (minSource != null) {
                minSource = "try {\n" + minSource + "\n} catch (e) {}\n";
                libsMin.add(minSource);
            }
        });
        if (libs.length() != 0) {
            compatLibrariesContent = "\nAura.externalLibraries = function() {\n" + libs.toString() + "\n};";
        }
        if (libsMin.length() != 0) {
            compatLibrariesContentMin = "\nAura.externalLibraries = function() {\n" + libsMin.toString() + "\n};";
        }
    }
}
