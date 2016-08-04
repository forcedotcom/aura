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

import org.auraframework.adapter.ComponentLocationAdapter;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.util.test.annotation.UnAdaptableTest;
import org.junit.Test;

import javax.inject.Inject;
import java.io.File;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

public class AuraRegistryProviderImplTest extends AuraImplTestCase {
    @Inject
    private AuraRegistryProviderImpl auraRegistryProviderImpl;
    
    // Stop running the test in SFDC integration build. The test includes all component location
    // adapters. It's often broke by other teams.
    @UnAdaptableTest("Prevent this test running with SFDC integration build. W-2820492")
    @Test
    public void testAllRegistries() throws Exception {
        Collection<ComponentLocationAdapter> markupLocations;
        List<File> broken = new ArrayList<>();

        markupLocations = auraRegistryProviderImpl.getAllComponentLocationAdapters();
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
