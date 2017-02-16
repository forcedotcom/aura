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

import java.io.InputStream;

/**
 * Delivers static file resources
 */
public class FileStaticResource implements StaticResource {

    private static final String MINIFIED_FILE_SUFFIX = ".min";

    private final String format;
    private final String nonceUid;
    private final String file;
    private final boolean isProduction;
    private final ResourceLoader resourceLoader;

    private String path;

    public FileStaticResource(String file, String format, String nonceUid, boolean isProduction, ResourceLoader resourceLoader) {
        this.resourceLoader = resourceLoader;
        this.format = format;
        this.file = file;
        this.nonceUid = nonceUid;
        this.isProduction = isProduction;

        this.path = String.format(format, file);
    }

    /**
     * Logic previously in AuraFramework
     *
     * @return Whether path and file exists containing nonceUid
     */
    @Override
    public Boolean hasUid() {
        // has "nonce" like path but uids don't match
        if (resourceLoader.getResource(path) == null) {
            // Check if resource exists with nonced path
            path = String.format(format, "/" + nonceUid + file);
            if (resourceLoader.getResource(path) != null) {
                // file exists so doesn't have a nonce
                return false;
            } else {
                return null;
            }
        } else {
            // nonce exists but not matching
            return true;
        }
    }

    /**
     * Looks for minified version of the same file
     * @return InputStream of resource
     */
    @Override
    public InputStream getResourceStream() {
        // Checks for a minified version of the external resource file
        // Uses the minified version if in production mode.
        if (path.startsWith("/aura/resources/") && isProduction && !path.contains(".min.")) {
            int extIndex = path.lastIndexOf(".");
            if (extIndex > 0) {
                String minFile = path.substring(0, extIndex) + MINIFIED_FILE_SUFFIX + path.substring(extIndex);
                if (resourceLoader.getResource(minFile) != null) {
                    path = minFile;
                }
            }
        }
        return resourceLoader.getResourceAsStream(path);
    }
}
