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
package org.auraframework.impl.source;

import java.io.File;
import java.io.FileFilter;
import java.io.IOException;

import org.auraframework.impl.util.AuraImplFiles;
import org.auraframework.util.resource.HashingGroup;

/**
 * Aura resources wrapper containing constants for the resources group
 */
public class AuraResourcesHashingGroup extends HashingGroup {

    public static final String GROUP_NAME = "aura-resources";
    public static final String FILE_NAME = "resourcesuid.properties";
    public static final File ROOT_DIR = AuraImplFiles.AuraResourcesSourceDirectory.asFile();

    public static final FileFilter FILE_FILTER = new FileFilter() {
        @Override
        public boolean accept(File f) {
            return f.getName().endsWith(".css") || f.getName().endsWith(".js");
        }
    };


    public AuraResourcesHashingGroup() throws IOException {
        super(GROUP_NAME, ROOT_DIR, FILE_FILTER);
    }
}
