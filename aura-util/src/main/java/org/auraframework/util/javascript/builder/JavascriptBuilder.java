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

import com.google.common.base.Charsets;
import com.google.common.io.Resources;
import org.auraframework.util.javascript.directive.JavascriptGeneratorMode;
import org.auraframework.util.resource.ResourceLoader;

import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;

public abstract class JavascriptBuilder {
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
}
