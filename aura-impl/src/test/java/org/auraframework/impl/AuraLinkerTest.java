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
package org.auraframework.impl;

import java.util.List;

import org.auraframework.def.Definition;
import org.auraframework.impl.util.mock.MockDefDescriptor;
import org.auraframework.impl.util.mock.MockDefinition;
import org.auraframework.impl.util.mock.MockRegistrySet;
import org.auraframework.service.LoggingService;
import org.auraframework.system.AuraContext;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.MockitoAnnotations;

public class AuraLinkerTest {
    private final MockRegistrySet registries = new MockRegistrySet();

    @Mock
    private LoggingService loggingService;

    @Mock
    private AuraContext context;

    @Before
    public void initMocks() {
        MockitoAnnotations.initMocks(this);
    }

    @Before
    public void initContext() {
        Mockito.when(context.getRegistries()).thenReturn(registries);
    }

    @Test
    public void testGetCompilingSameForEqualDescriptors() {
        MockDefDescriptor desc1 = new MockDefDescriptor("markup", "b", "b");
        MockDefDescriptor desc2 = new MockDefDescriptor("markup", "b", "B");

        AuraLinker linker = new AuraLinker(desc1, context, null, null, null, null);
        LinkingDefinition<Definition> ld1 = linker.getCompiling(desc1);
        LinkingDefinition<Definition> ld2 = linker.getCompiling(desc2);
        Assert.assertSame("Definitions should be the same", ld1, ld2);
    }

    @Test
    public void testSortForVerificationWithInheritance() {
        MockDefDescriptor desc1 = new MockDefDescriptor("markup", "b", "b");
        MockDefinition def1 = new MockDefinition(desc1);

        MockDefDescriptor desc2 = new MockDefDescriptor("markup", "a", "b");
        MockDefinition def2 = new MockDefinition(desc1);

        AuraLinker linker = new AuraLinker(desc1, context, null, null, null, null);

        LinkingDefinition<Definition> ld = linker.getCompiling(desc1);
        ld.def = def1;
        ld.inheritanceLevel = 0;
        ld.level = 0;

        ld = linker.getCompiling(desc2);
        ld.def = def2;
        ld.inheritanceLevel = 1;
        ld.level = 0;

        List<LinkingDefinition<?>> ordered = linker.sortForVerification();
        Assert.assertSame(def2, ordered.get(0).def);
        Assert.assertSame(def1, ordered.get(1).def);
    }

    @Test
    public void testSortForLevelWithInheritance() {
        MockDefDescriptor desc1 = new MockDefDescriptor("markup", "b", "b");
        MockDefinition def1 = new MockDefinition(desc1);

        MockDefDescriptor desc2 = new MockDefDescriptor("markup", "a", "b");
        MockDefinition def2 = new MockDefinition(desc1);

        AuraLinker linker = new AuraLinker(desc1, context, null, null, null, null);

        LinkingDefinition<Definition> ld = linker.getCompiling(desc1);
        ld.def = def1;
        ld.inheritanceLevel = 1;
        ld.level = 0;

        ld = linker.getCompiling(desc2);
        ld.def = def2;
        ld.inheritanceLevel = 0;
        ld.level = 1;

        List<LinkingDefinition<?>> ordered = linker.sortForLevel();
        Assert.assertSame(def2, ordered.get(0).def);
        Assert.assertSame(def1, ordered.get(1).def);
    }
}
