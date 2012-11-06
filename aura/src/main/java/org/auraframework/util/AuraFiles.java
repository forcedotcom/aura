/*
 * Copyright (C) 2012 salesforce.com, inc.
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

/**
 * Gets files from the relevant file paths
 */
public enum AuraFiles {

    /**
     * Core dir (parent of module dirs)
     */
    Core(System.getProperty("aura.home")),
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
