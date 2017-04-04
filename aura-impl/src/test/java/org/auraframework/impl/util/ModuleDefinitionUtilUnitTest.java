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

import com.google.common.collect.Maps;
import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.junit.Test;


import java.util.Map;

import static org.junit.Assert.assertEquals;
import static org.powermock.api.mockito.PowerMockito.mock;
import static org.powermock.api.mockito.PowerMockito.when;

/**
 * Unit tests for {@link ModuleDefinitionUtil}
 */
public class ModuleDefinitionUtilUnitTest {

    @Test
    public void testConvertModuleComponentNameToAuraDescriptor() throws Exception {
        Map<String, String> internalNamespaces = Maps.newHashMap();
        internalNamespaces.put("namespace", "nameSpace");

        ConfigAdapter configAdapter = mock(ConfigAdapter.class);
        when(configAdapter.getInternalNamespacesMap()).thenReturn(internalNamespaces);

        String actual = ModuleDefinitionUtil.convertToAuraDescriptor("namespace-some-cool-thing", configAdapter);
        assertEquals("Expected descriptor does not match", "nameSpace:someCoolThing", actual);
    }


    @Test
    public void testConvertModuleNameToAuraDescriptor() throws Exception {
        Map<String, String> internalNamespaces = Maps.newHashMap();
        internalNamespaces.put("namespace", "nameSpace");

        ConfigAdapter configAdapter = mock(ConfigAdapter.class);
        when(configAdapter.getInternalNamespacesMap()).thenReturn(internalNamespaces);

        String descriptor = ModuleDefinitionUtil.convertToAuraDescriptor("namespace", "some-cool-thing", configAdapter);
        assertEquals("Expected descriptor does not match", "nameSpace:someCoolThing", descriptor);
        descriptor = ModuleDefinitionUtil.convertToAuraDescriptor("namespace", "some-cool-thing_bob", configAdapter);
        assertEquals("Expected descriptor does not match", "nameSpace:someCoolThing_bob", descriptor);
    }

    @Test
    public void testFilePathToModuleDescriptor() throws Exception {
        String expectedNamespace = "nameSpace";
        Map<String, String> internalNamespaces = Maps.newHashMap();
        internalNamespaces.put("namespace", expectedNamespace);

        ConfigAdapter configAdapter = mock(ConfigAdapter.class);
        when(configAdapter.getInternalNamespacesMap()).thenReturn(internalNamespaces);

        // modules containing folder is named "modules" by convention
        String path = "/User/user/projects/stealth/src/main/modules/namespace/some-awesome-thing/some-awesome-thing.js";

        DefDescriptor<?> moduleDescriptor = ModuleDefinitionUtil.getModuleDescriptorFromFilePath(path, configAdapter);
        assertEquals("descriptor DefType is incorrect", DefType.MODULE, moduleDescriptor.getDefType());
        assertEquals("descriptor namespace is incorrect", expectedNamespace, moduleDescriptor.getNamespace());
        assertEquals("descriptor name is incorrect", "someAwesomeThing", moduleDescriptor.getName());
    }
}