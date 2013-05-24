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
package org.auraframework.impl.context;

import java.io.File;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import org.auraframework.adapter.ComponentLocationAdapter;

import org.auraframework.impl.AuraImplTestCase;

import org.auraframework.test.annotation.TestLabels;

public class AuraRegistryProviderImplTest extends AuraImplTestCase {
    public AuraRegistryProviderImplTest(String name) {
        super(name);
    }

    private static class AuraRegistryProviderImplOverride extends AuraRegistryProviderImpl {
        public Collection<ComponentLocationAdapter> testGetAllComponentLocationAdapters() {
            return getAllComponentLocationAdapters();
        }
    }

    @TestLabels("auraSanity")
    public void testAllRegistries() throws Exception {
        Collection<ComponentLocationAdapter> markupLocations;
        List<File> broken = new ArrayList<File>();

        markupLocations = new AuraRegistryProviderImplOverride().testGetAllComponentLocationAdapters();
        for (ComponentLocationAdapter location : markupLocations) {
            if (location != null) {
                File file = location.getComponentSourceDir();
                if (file != null && (!file.canRead() || !file.canExecute() || !file.isDirectory())) {
                    broken.add(file);
                }
            }
        }
        if (broken.size() > 0) {
            StringBuffer sb = new StringBuffer("Missing Directories in registry path");
            for (File dead : broken) {
                sb.append(dead.getAbsolutePath());
                sb.append("\n");
            }
            fail(sb.toString());
        }
    }
}
