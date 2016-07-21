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

import org.auraframework.system.StaticResource;
import org.auraframework.util.resource.ResourceLoader;

import java.io.IOException;
import java.io.InputStream;
import java.io.SequenceInputStream;

/**
 * Handles combined libs_ with timezone data javascript.
 */
public class CombinedLibsResource implements StaticResource {

    private static final String RESOURCES_JAR_DIR = "/aura/resources/";
    private static final String LIBS_PATH = RESOURCES_JAR_DIR + "libs.js";
    private static final String LIBS_MINIFIED_PATH = RESOURCES_JAR_DIR + "libs.min.js";
    private static final String WALLTIME_DATA_DIR = RESOURCES_JAR_DIR + "walltime-js/olson/";
    private static final String WALLTIME_FILE_PREFIX = "walltime-data_";

    private final String file;
    private final boolean isProduction;
    private final ResourceLoader resourceLoader;

    public CombinedLibsResource(String file, boolean isProduction, ResourceLoader resourceLoader) {
        this.file = file;
        this.isProduction = isProduction;
        this.resourceLoader = resourceLoader;
    }

    @Override
    public Boolean hasUid() {
        return false;
    }

    @Override
    public InputStream getResourceStream() throws IOException {

        String ending = file.substring(file.indexOf("_"), file.length());
        int extIndex = ending.lastIndexOf(".");
        String timezone = ending.substring(1, extIndex);

        InputStream output = null;

        String libsPath = isProduction ? LIBS_MINIFIED_PATH : LIBS_PATH;

        if (resourceLoader.getResource(libsPath) != null) {

            if ("GMT".equals(timezone)) {
                // GMT is the default and does not have timezone adjustments so just return the JS
                output = resourceLoader.getResourceAsStream(libsPath);
            } else {
                String filePath = WALLTIME_DATA_DIR + WALLTIME_FILE_PREFIX + timezone + ".js";

                String minFilePath = getMinFilePath(filePath);
                boolean minExists = resourceLoader.getResource(minFilePath) != null;
                String path = isProduction ? (minExists ? minFilePath : filePath) : filePath;

                if (resourceLoader.getResource(path) != null) {
                    output = new SequenceInputStream(resourceLoader.getResourceAsStream(path),
                            resourceLoader.getResourceAsStream(libsPath));
                }
            }
        }

        return output;
    }

    /**
     * Returns minified file name given non-minified file name
     *
     * @param original file name
     * @return minified file name
     */
    private String getMinFilePath(String original) {
        int extIndex = original.lastIndexOf(".");
        return original.substring(0, extIndex) + ".min" + original.substring(extIndex);
    }
}