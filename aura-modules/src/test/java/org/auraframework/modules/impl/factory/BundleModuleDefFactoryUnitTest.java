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
package org.auraframework.modules.impl.factory;

import com.google.common.collect.Maps;
import com.google.common.collect.Sets;
import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.module.ModuleDef;
import org.auraframework.impl.source.file.FileSource;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.modules.ModulesCompilerData;
import org.auraframework.modules.impl.ModulesCompilerJ2V8;
import org.auraframework.system.BundleSource;
import org.auraframework.system.Source;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.powermock.core.classloader.annotations.PrepareForTest;
import org.powermock.modules.junit4.PowerMockRunner;

import java.util.Map;

import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;
import static org.mockito.Matchers.anyMap;
import static org.mockito.Matchers.anyString;
import static org.powermock.api.mockito.PowerMockito.mock;
import static org.powermock.api.mockito.PowerMockito.when;
import static org.powermock.api.mockito.PowerMockito.whenNew;

/**
 * Unit tests for {@link BundleModuleDefFactory}
 */
@RunWith(PowerMockRunner.class)
@PrepareForTest({BundleModuleDefFactory.class, ModulesCompilerJ2V8.class})
public class BundleModuleDefFactoryUnitTest {

    @Test
    public void getDefinition() throws Exception {
        BundleSource<ModuleDef> mockBundleSource = mock(BundleSource.class);

        FileSource jsFileSource = mock(FileSource.class);
        when(jsFileSource.getSystemId()).thenReturn("/User/me/project/src/main/modules/namespace/module-cmp/module-cmp.js");
        when(jsFileSource.getContents()).thenReturn("javascript code here");

        FileSource htmlFileSource = mock(FileSource.class);
        when(htmlFileSource.getSystemId()).thenReturn("/User/me/project/src/main/modules/namespace/module-cmp/module-cmp.html");
        when(htmlFileSource.getContents()).thenReturn("template code here");

        DefDescriptor module = new DefDescriptorImpl<>(DefDescriptor.MARKUP_PREFIX, "nameSpace", "moduleCmp", ModuleDef.class);
        DefDescriptor template = new DefDescriptorImpl<>(ModuleDef.TEMPLATE_PREFIX, "nameSpace", "moduleCmp-module-cmp", ModuleDef.class, module);

        Map<DefDescriptor<?>, Source<?>> mockBundledParts = Maps.newHashMap();
        mockBundledParts.put(module, jsFileSource);
        mockBundledParts.put(template, htmlFileSource);

        when(mockBundleSource.getBundledParts()).thenReturn(mockBundledParts);

        ModulesCompilerJ2V8 mockCompiler = mock(ModulesCompilerJ2V8.class);
        ModulesCompilerData compilerData = new ModulesCompilerData("define()", Sets.newHashSet());
        when(mockCompiler.compile(anyString(), anyMap())).thenReturn(compilerData);
        whenNew(ModulesCompilerJ2V8.class).withNoArguments().thenReturn(mockCompiler);

        ConfigAdapter mockConfigAdapter = mock(ConfigAdapter.class);
        when(mockConfigAdapter.isInternalNamespace(anyString())).thenReturn(true);

        BundleModuleDefFactory moduleDefFactory = new BundleModuleDefFactory();
        moduleDefFactory.setConfigAdapter(mockConfigAdapter);

        ModuleDef moduleDef = moduleDefFactory.getDefinition(module, mockBundleSource);
        String compiledCode = moduleDef.getCompiledCode();
        assertTrue("compiled code should be wrapped in function and calls $A.componentService.addModule",
                compiledCode.startsWith("function() { $A.componentService.addModule("));
        assertTrue("compiled code should end with closing bracket and not semicolon for locker perf",
                compiledCode.endsWith("}"));
        assertNotNull("ownHash should not be null", moduleDef.getOwnHash());
    }

    @Test
    public void getNamespaceFolderWithHyphen() throws Exception {
        BundleSource<ModuleDef> mockBundleSource = mock(BundleSource.class);

        FileSource jsFileSource = mock(FileSource.class);
        when(jsFileSource.getSystemId()).thenReturn("/User/me/project/src/main/modules/name-space/moduleCmp/moduleCmp.js");
        when(jsFileSource.getContents()).thenReturn("javascript code here");

        FileSource htmlFileSource = mock(FileSource.class);
        when(htmlFileSource.getSystemId()).thenReturn("/User/me/project/src/main/modules/name-space/moduleCmp/moduleCmp.html");
        when(htmlFileSource.getContents()).thenReturn("template code here");

        DefDescriptor module = new DefDescriptorImpl<>(DefDescriptor.MARKUP_PREFIX, "name-space", "modulecmp", ModuleDef.class);
        DefDescriptor template = new DefDescriptorImpl<>(ModuleDef.TEMPLATE_PREFIX, "name-space", "modulecmp-moduleCmp", ModuleDef.class, module);

        Map<DefDescriptor<?>, Source<?>> mockBundledParts = Maps.newHashMap();
        mockBundledParts.put(module, jsFileSource);
        mockBundledParts.put(template, htmlFileSource);

        when(mockBundleSource.getBundledParts()).thenReturn(mockBundledParts);

        BundleModuleDefFactory moduleDefFactory = new BundleModuleDefFactory();

        try {
            moduleDefFactory.getDefinition(module, mockBundleSource);
            fail("Should have thrown InvalidDefinitionException due to bad naming convention for modules");
        } catch (InvalidDefinitionException ide) {
            assertTrue("Incorrect exception message", ide.getMessage().startsWith("Namespace cannot have a hyphen."));
        }
    }

    @Test
    public void getNamespaceFolderUpperCase() throws Exception {
        BundleSource<ModuleDef> mockBundleSource = mock(BundleSource.class);

        FileSource jsFileSource = mock(FileSource.class);
        when(jsFileSource.getSystemId()).thenReturn("/User/me/project/src/main/modules/name-Space/moduleCmp/moduleCmp.js");
        when(jsFileSource.getContents()).thenReturn("javascript code here");

        FileSource htmlFileSource = mock(FileSource.class);
        when(htmlFileSource.getSystemId()).thenReturn("/User/me/project/src/main/modules/name-Space/moduleCmp/moduleCmp.html");
        when(htmlFileSource.getContents()).thenReturn("template code here");

        DefDescriptor module = new DefDescriptorImpl<>(DefDescriptor.MARKUP_PREFIX, "name-Space", "modulecmp", ModuleDef.class);
        DefDescriptor template = new DefDescriptorImpl<>(ModuleDef.TEMPLATE_PREFIX, "name-Space", "modulecmp-moduleCmp", ModuleDef.class, module);

        Map<DefDescriptor<?>, Source<?>> mockBundledParts = Maps.newHashMap();
        mockBundledParts.put(module, jsFileSource);
        mockBundledParts.put(template, htmlFileSource);

        when(mockBundleSource.getBundledParts()).thenReturn(mockBundledParts);

        BundleModuleDefFactory moduleDefFactory = new BundleModuleDefFactory();

        try {
            moduleDefFactory.getDefinition(module, mockBundleSource);
            fail("Should have thrown InvalidDefinitionException due to bad naming convention for modules");
        } catch (InvalidDefinitionException ide) {
            assertTrue("Incorrect exception message", ide.getMessage().startsWith("Use lowercase for module folder names."));
        }
    }

    @Test
    public void getNameFolderUpperCase() throws Exception {
        BundleSource<ModuleDef> mockBundleSource = mock(BundleSource.class);

        FileSource jsFileSource = mock(FileSource.class);
        when(jsFileSource.getSystemId()).thenReturn("/User/me/project/src/main/modules/namespace/moduleCmp/moduleCmp.js");
        when(jsFileSource.getContents()).thenReturn("javascript code here");

        FileSource htmlFileSource = mock(FileSource.class);
        when(htmlFileSource.getSystemId()).thenReturn("/User/me/project/src/main/modules/namespace/moduleCmp/moduleCmp.html");
        when(htmlFileSource.getContents()).thenReturn("template code here");

        DefDescriptor module = new DefDescriptorImpl<>(DefDescriptor.MARKUP_PREFIX, "namespace", "modulecmp", ModuleDef.class);
        DefDescriptor template = new DefDescriptorImpl<>(ModuleDef.TEMPLATE_PREFIX, "namespace", "modulecmp-moduleCmp", ModuleDef.class, module);

        Map<DefDescriptor<?>, Source<?>> mockBundledParts = Maps.newHashMap();
        mockBundledParts.put(module, jsFileSource);
        mockBundledParts.put(template, htmlFileSource);

        when(mockBundleSource.getBundledParts()).thenReturn(mockBundledParts);

        BundleModuleDefFactory moduleDefFactory = new BundleModuleDefFactory();

        try {
            moduleDefFactory.getDefinition(module, mockBundleSource);
            fail("Should have thrown InvalidDefinitionException due to bad naming convention for modules");
        } catch (InvalidDefinitionException ide) {
            assertTrue("Incorrect exception message", ide.getMessage().startsWith("Use lowercase and hyphens for module file names."));
        }
    }
}