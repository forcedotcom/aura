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
package org.auraframework.impl.util;

import java.io.File;

import org.auraframework.util.AuraFiles;
import org.auraframework.util.AuraTextUtil;

/**
 * Gets files from the relevant file paths
 */
public enum AuraImplFiles {

    /**
     * Aura-Impl Module Root dir
     */
    AuraImplModuleDirectory(AuraFiles.Core.getPath(), "aura-impl"),
    /**
     * Aura-Impl-Test Module Root dir
     */
    AuraImplTestModuleDirectory(AuraImplModuleDirectory.getPath(), "src/test"),
    /**
     * Root dir for File-based components only available to test contexts.
     */
    TestComponents(AuraImplTestModuleDirectory.getPath(), "components"),
    /**
     * javascript source directory
     */
    AuraJavascriptSourceDirectory(AuraImplModuleDirectory.getPath(), "src/main/resources"),
    /**
     * javascript destination directory to generate into, in the resources
     * module
     */
    AuraResourceJavascriptDirectory(AuraFiles.Core.getPath(), "aura-resources", "target", "src-gen", "main",
            "resources", "aura", "javascript"),
    /**
     * the other javascript destination directory that we have to regenerate
     * into, also in the resources module
     */
    AuraResourceJavascriptClassDirectory(AuraFiles.Core.getPath(), "aura-resources", "target", "classes", "aura",
            "javascript"), ;

    private final String path;

    private AuraImplFiles(String... path) {
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
