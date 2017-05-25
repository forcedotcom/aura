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
package org.auraframework.modules.impl;

import java.util.HashMap;
import java.util.Map;

import javax.inject.Inject;

import org.auraframework.def.module.ModuleDef.CodeType;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.modules.ModulesCompilerData;
import org.auraframework.service.ModulesCompilerService;
import org.junit.Test;

import com.google.common.base.Charsets;
import com.google.common.io.Files;

public final class ModulesCompilerServiceImplTest extends AuraImplTestCase {

    @Inject
    private ModulesCompilerService modulesCompilerService;

    @Test
    public void testCompile() throws Exception {
        String entry = "modules/moduletest/moduletest.js";
        String sourceTemplate = Files.toString(getResourceFile("/testdata/modules/moduletest/moduletest.html"),
                Charsets.UTF_8);
        String sourceClass = Files.toString(getResourceFile("/testdata/modules/moduletest/moduletest.js"),
                Charsets.UTF_8);

        Map<String, String> sources = new HashMap<>();
        sources.put("modules/moduletest/moduletest.js", sourceClass);
        sources.put("modules/moduletest/moduletest.html", sourceTemplate);

        ModulesCompilerData compilerData = modulesCompilerService.compile(entry, sources);
        String expected = Files.toString(getResourceFile("/testdata/modules/moduletest/expected.js"), Charsets.UTF_8);

        assertEquals(expected.trim(), compilerData.codes.get(CodeType.DEV).trim());
        assertEquals("[x-test]", compilerData.bundleDependencies.toString());
    }
}
