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
package org.auraframework.util;

import java.io.File;
import java.io.IOException;
import java.net.URL;

/**
 * Gets files from the relevant file paths
 */
public enum AuraFiles {

    /**
     * Core dir (parent of module dirs)
     */
    Core(findCorePath()),
    /**
     * Aura Module Root dir
     */
    AuraModuleDirectory(Core.getPath(), "aura"),
    /**
     * Aura-Test Module Root dir
     */
    AuraTestModuleDirectory(AuraModuleDirectory.getPath(), "src/test"),
    /**
     * Root dir for File-based components only available to test contexts.
     */
    TestComponents(AuraTestModuleDirectory.getPath(), "components");

    /**
     * The Core path is where we expect all the Aura projects to be located. It can be set by specifying the "aura.home"
     * system property. If not set, try to locate the path by working backwards from where a known class file is being
     * loaded from (if it is being loaded from the file system).
     */
    private static String findCorePath() {
        String path = System.getProperty("aura.home");
        if (path == null) {
            URL loaded = AuraFiles.class.getResource("/" + AuraFiles.class.getName().replace('.', '/') + ".class");
            if ("file".equals(loaded.getProtocol())) {
                try {
                    String temp = loaded.getPath();
                    temp = temp.substring(0, temp.indexOf("/target/classes/"));
                    path = temp.substring(0, temp.lastIndexOf("/"));
                } catch (Throwable t) {
                    // must be built with non-standard structure
                }
            }
        } else {
            try {
                // try to clean up any provided path
                path = new File(path).getCanonicalPath();
            } catch (IOException e) {
                throw new Error("Invalid aura.home: " + path, e);
            }
        }
        return path;
    }

    private final String path;

    private AuraFiles(String... path) {
        this.path = AuraTextUtil.arrayToString(path, File.separator, -1, false);
    }

    /**
     * @return the path to this File.
     */
    public String getPath() {
        return this.path;
    }

    /**
     * @return A java.util.File for this file's path
     */
    public File asFile() {
        return new File(path);
    }

}
