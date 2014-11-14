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
package org.auraframework.impl.adapter;

import static org.mockito.Mockito.when;

import java.util.ArrayList;
import java.util.List;

import org.auraframework.adapter.StyleAdapter;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.StyleDef;
import org.auraframework.impl.adapter.format.css.StyleDefCSSFormatAdapter;
import org.auraframework.impl.css.StyleTestCase;
import org.auraframework.impl.util.AuraUtil;
import org.auraframework.test.ServiceLocatorMocker;
import org.auraframework.util.ServiceLoader;

import com.google.common.collect.Lists;
import com.salesforce.omakase.ast.declaration.Declaration;
import com.salesforce.omakase.broadcast.annotation.Observe;
import com.salesforce.omakase.plugin.Plugin;

/**
 * Unit tests for {@link StyleAdapterImpl}.
 */
public class StyleAdapterImplTest extends StyleTestCase {
    private ServiceLoader locator;
    private Observer observer;

    public StyleAdapterImplTest(String name) {
        super(name);
        observer = new Observer();
    }

    @Override
    public void setUp() throws Exception {
        super.setUp();
        locator = ServiceLocatorMocker.spyOnServiceLocator();
    }

    @Override
    public void tearDown() throws Exception {
        super.tearDown();
        ServiceLocatorMocker.unmockServiceLocator();
    }

    public void testCompilationPlugins() throws Exception {
        TestStyleAdapter adapter = TestStyleAdapter.compilation(observer);
        when(locator.get(StyleAdapter.class)).thenReturn(adapter);

        DefDescriptor<StyleDef> desc = addStyleDef(".THIS{color:red}");
        StyleDef def = desc.getDef();

        assertEquals("expected plugin to run at compilation", 1, observer.count);

        def.getCode();
        assertEquals("did not expect plugin to run at runtime", 1, observer.count);
    }

    public void testRuntimePlugins() throws Exception {
        TestStyleAdapter adapter = TestStyleAdapter.runtime(observer);
        when(locator.get(StyleAdapter.class)).thenReturn(adapter);

        DefDescriptor<StyleDef> desc = addStyleDef(".THIS{color:red}");
        StyleDef def = desc.getDef();

        assertEquals("expected plugin to run at compilation", 1, observer.count);

        def.getCode();
        assertEquals("expected plugin to run at runtime", 2, observer.count);
    }

    public void testContextualPlugins() throws Exception {
        TestStyleAdapter adapter = TestStyleAdapter.contextual(observer);
        when(locator.get(StyleAdapter.class)).thenReturn(adapter);

        DefDescriptor<StyleDef> desc1 = addStyleDef(".THIS{color:red}");
        DefDescriptor<StyleDef> desc2 = addStyleDef(".THIS{color:red}");
        DefDescriptor<StyleDef> desc3 = addStyleDef(".THIS{color:red}");
        desc1.getDef();
        desc2.getDef();
        desc3.getDef();

        assertEquals("did not expect plugin to run at runtime", 0, observer.count);

        StyleDefCSSFormatAdapter cssFormatAdapter = new StyleDefCSSFormatAdapter();
        cssFormatAdapter.writeCollection(Lists.newArrayList(desc1.getDef(), desc2.getDef(), desc3.getDef()),
                new StringBuilder());

        assertEquals("expected the same plugin instance to once for each styledef", 3, observer.count);
    }

    public static final class TestStyleAdapter extends StyleAdapterImpl {
        private List<Plugin> compilationPlugins;
        private List<Plugin> runtimePlugins;
        private List<Plugin> contextualPlugins;

        public TestStyleAdapter(List<Plugin> compilationPlugins, List<Plugin> runtimePlugins,
                List<Plugin> contextualPlugins) {
            this.compilationPlugins = AuraUtil.immutableList(compilationPlugins);
            this.runtimePlugins = AuraUtil.immutableList(runtimePlugins);
            this.contextualPlugins = AuraUtil.immutableList(contextualPlugins);
        }

        @Override
        public List<Plugin> getCompilationPlugins() {
            List<Plugin> plugins = new ArrayList<>();
            plugins.addAll(compilationPlugins);
            return plugins;
        }

        @Override
        public List<Plugin> getRuntimePlugins() {
            List<Plugin> plugins = new ArrayList<>();
            plugins.addAll(runtimePlugins);
            return plugins;
        }

        @Override
        public List<Plugin> getContextualRuntimePlugins() {
            List<Plugin> plugins = new ArrayList<>();
            plugins.addAll(contextualPlugins);
            return plugins;
        }

        public static TestStyleAdapter compilation(Plugin... plugins) {
            return new TestStyleAdapter(Lists.newArrayList(plugins), null, null);
        }

        public static TestStyleAdapter runtime(Plugin... plugins) {
            return new TestStyleAdapter(null, Lists.newArrayList(plugins), null);
        }

        public static TestStyleAdapter contextual(Plugin... plugins) {
            return new TestStyleAdapter(null, null, Lists.newArrayList(plugins));
        }
    }

    public static final class Observer implements Plugin {
        int count = 0;

        @Observe
        public void declaration(Declaration declaration) {
            count++;
        }
    }
}
