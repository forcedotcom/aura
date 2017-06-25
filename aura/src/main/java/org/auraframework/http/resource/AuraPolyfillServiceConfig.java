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
package org.auraframework.http.resource;

import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.util.AuraFiles;
import org.polyfill.api.interfaces.PolyfillServiceConfigLocation;
import org.springframework.context.annotation.Primary;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;

/**
 * Provides Polyfill Service our polyfills configuration
 */
@ServiceComponent
@Primary
public class AuraPolyfillServiceConfig implements PolyfillServiceConfigLocation {

    private static final String XML_RESOURCE_FILE = "polyfill-service.xml";
    private static final String XML_FILE_LOCATION = new StringBuilder(AuraFiles.AuraModuleDirectory.getPath()).append(File.separator)
            .append("src").append(File.separator)
            .append("main").append(File.separator)
            .append("resources").append(File.separator)
            .append(XML_RESOURCE_FILE).toString();

    @Override
    public InputStream getInputStream() throws IOException {
        File configFile = new File(XML_FILE_LOCATION);
        if (configFile.exists()) {
            return new FileInputStream(configFile);
        } else {
            return this.getClass().getClassLoader().getResourceAsStream(XML_RESOURCE_FILE);
        }
    }
}
