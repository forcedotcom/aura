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

import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.List;

import org.apache.log4j.Logger;
import org.auraframework.util.javascript.JavascriptProcessingError;
import org.auraframework.util.javascript.directive.JavascriptGeneratorMode;
import org.auraframework.util.resource.ResourceLoader;

import com.google.common.base.Charsets;
import com.google.common.io.Resources;

public abstract class JavascriptBuilder {
    
    private final Logger logger = Logger.getLogger(this.getClass().getName());
    
    protected ResourceLoader resourceLoader;

    public JavascriptBuilder(ResourceLoader resourceLoader) {
        this.resourceLoader = resourceLoader;
    }

    public String getSource(String path) throws MalformedURLException {
        URL lib = resourceLoader.getResource(path);
        String source = null;
        if (lib != null) {
            try {
                source = Resources.toString(lib, Charsets.UTF_8);
            } catch (IOException ignored) {
            }
        }
        return source;
    }

    public void fetchResources() {

    }

    public abstract JavascriptResource build(JavascriptGeneratorMode mode, boolean isCompat, String inputContent, String outputFileName) throws IOException;
    
    /**
     * Takes the passe in errors/warnings and logs them to the logger.
     * 
     * @param errors The errors/warnings to process
     */
    protected void proccessBuildErrorsAndWarnings(final List<JavascriptProcessingError> errors) {
        errors.stream().forEach(error -> {
            switch(error.getLevel()) {
                case Warning:
                    logger.warn(error.toString());
                    break;
                case Error:
                    logger.error(error.toString());
                    break;
                default:
                    logger.info(error.toString());
                    break;
            }
        });
    }
}
