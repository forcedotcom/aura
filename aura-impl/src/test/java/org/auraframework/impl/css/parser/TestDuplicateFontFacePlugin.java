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
package org.auraframework.impl.css.parser;

import java.util.ArrayList;
import java.util.List;

import org.auraframework.adapter.StyleAdapter;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.StyleDef;
import org.auraframework.impl.adapter.StyleAdapterImpl;
import org.auraframework.impl.css.StyleDefWriter;
import org.auraframework.impl.css.StyleTestCase;
import org.auraframework.impl.css.parser.plugin.DuplicateFontFacePlugin;
import org.auraframework.impl.util.AuraUtil;
import org.auraframework.throwable.AuraRuntimeException;
import org.junit.Test;

import com.google.common.collect.Lists;
import com.salesforce.omakase.plugin.Plugin;

public class TestDuplicateFontFacePlugin extends StyleTestCase {
    private DuplicateFontFacePlugin fontFamilyPlugin;
    private StringBuilder out;

    @Override
    public void setUp() throws Exception {
        super.setUp();
        out = new StringBuilder();

    }

    private StyleAdapter prepare(DuplicateFontFacePlugin plugin) {
        fontFamilyPlugin = plugin;
        TestStyleAdapter adapter = TestStyleAdapter.contextual(fontFamilyPlugin);
        return adapter;
    }

    @Test
    public void testNoErrorOnDifferentFonts() throws Exception {
        StyleAdapter adapter = prepare(new DuplicateFontFacePlugin());
        DefDescriptor<StyleDef> desc1 = addStyleDef("@font-face {font-family: Custom1; src: url(Custom1.woff)}");
        DefDescriptor<StyleDef> desc2 = addStyleDef("@font-face {font-family: Custom2; src: url(Custom2.woff)}");

        new StyleDefWriter(definitionService, adapter, contextService.getCurrentContext())
                .writeStyleDefs(
                        Lists.newArrayList(definitionService.getDefinition(desc1),
                            definitionService.getDefinition(desc2)), out);
        // no error
    }

    @Test
    public void testErrorsOnDupeFontsSameFile() throws Exception {
        StyleAdapter adapter = prepare(new DuplicateFontFacePlugin());
        String s = "@font-face {font-family: Custom1; src: url(Custom1.woff)}";
        DefDescriptor<StyleDef> desc = addStyleDef(s + "\n" + s);

        try {
            new StyleDefWriter(definitionService, adapter, contextService.getCurrentContext())
                    .writeStyleDefs(Lists.newArrayList(definitionService.getDefinition(desc)), out);
            fail("expected to get exception");
        } catch (Exception e) {
            checkExceptionContains(e, AuraRuntimeException.class, "was already declared");
        }
    }

    @Test
    public void testErrorsOnDupeFontsDifferentFiles() throws Exception {
        StyleAdapter adapter = prepare(new DuplicateFontFacePlugin());
        DefDescriptor<StyleDef> desc1 = addStyleDef("@font-face {font-family: Custom1; src: url(Custom1.woff)}");
        DefDescriptor<StyleDef> desc2 = addStyleDef("@font-face {font-family: Custom2; src: url(Custom2.woff)}");
        DefDescriptor<StyleDef> desc3 = addStyleDef("@font-face {font-family: Custom1; src: url(Custom1.woff)}");

        try {
            new StyleDefWriter(definitionService, adapter, contextService.getCurrentContext())
                .writeStyleDefs(Lists.newArrayList(definitionService.getDefinition(desc1), 
                            definitionService.getDefinition(desc2), 
            		definitionService.getDefinition(desc3)), out);
            fail("expected to get exception");
        } catch (Exception e) {
            checkExceptionContains(e, AuraRuntimeException.class, "was already declared");
        }
    }

    @Test
    public void testErrorsOnDupeQuotedAndUnquoted() throws Exception {
        StyleAdapter adapter = prepare(new DuplicateFontFacePlugin());
        DefDescriptor<StyleDef> desc1 = addStyleDef("@font-face {font-family: Custom1; src: url(Custom1.woff)}");
        DefDescriptor<StyleDef> desc2 = addStyleDef("@font-face {font-family: \"Custom1\"; src: url(Custom1.woff)}");

        try {
            new StyleDefWriter(definitionService, adapter, contextService.getCurrentContext())
                .writeStyleDefs(Lists.newArrayList(definitionService.getDefinition(desc1),
            		definitionService.getDefinition(desc2)), out);
            fail("expected to get exception");
        } catch (Exception e) {
            checkExceptionContains(e, AuraRuntimeException.class, "was already declared");
        }
    }

    @Test
    public void testErrorsOnDupeDifferentQuotes() throws Exception {
        StyleAdapter adapter = prepare(new DuplicateFontFacePlugin());
        DefDescriptor<StyleDef> desc1 = addStyleDef("@font-face {font-family: 'Custom1'; src: url(Custom1.woff)}");
        DefDescriptor<StyleDef> desc2 = addStyleDef("@font-face {font-family: \"Custom1\"; src: url(Custom1.woff)}");

        try {
            new StyleDefWriter(definitionService, adapter, contextService.getCurrentContext())
                .writeStyleDefs(Lists.newArrayList(definitionService.getDefinition(desc1), 
            		definitionService.getDefinition(desc2)), out);
            fail("expected to get exception");
        } catch (Exception e) {
            checkExceptionContains(e, AuraRuntimeException.class, "was already declared");
        }
    }

    @Test
    public void testSamePropsCheckAllOn() throws Exception {
        StyleAdapter adapter = prepare(new DuplicateFontFacePlugin(false, true));
        DefDescriptor<StyleDef> desc1 = addStyleDef("@font-face {font-family: Custom1; font-weight:bold; src: url(Custom1.woff)}");
        DefDescriptor<StyleDef> desc2 = addStyleDef("@font-face {font-family: Custom1; font-weight:bold; src: url(Custom1.woff)}");

        try {
            new StyleDefWriter(definitionService, adapter, contextService.getCurrentContext())
                .writeStyleDefs(Lists.newArrayList(definitionService.getDefinition(desc1), 
            		definitionService.getDefinition(desc2)), out);
            fail("expected to get exception");
        } catch (Exception e) {
            checkExceptionContains(e, AuraRuntimeException.class, "was already declared");
        }
    }

    @Test
    public void testSamePropsCheckAllOff() throws Exception {
        StyleAdapter adapter = prepare(new DuplicateFontFacePlugin(false, false));
        DefDescriptor<StyleDef> desc1 = addStyleDef("@font-face {font-family: Custom1; font-weight:bold; src: url(Custom1.woff)}");
        DefDescriptor<StyleDef> desc2 = addStyleDef("@font-face {font-family: Custom1; font-weight:bold; src: url(Custom1.woff)}");

        try {
            new StyleDefWriter(definitionService, adapter, contextService.getCurrentContext())
                .writeStyleDefs(Lists.newArrayList(definitionService.getDefinition(desc1), 
            		definitionService.getDefinition(desc2)), out);
            fail("expected to get exception");
        } catch (Exception e) {
            checkExceptionContains(e, AuraRuntimeException.class, "was already declared");
        }
    }

    @Test
    public void testDifferentPropsCheckAllOn() throws Exception {
        StyleAdapter adapter = prepare(new DuplicateFontFacePlugin(false, true));
        DefDescriptor<StyleDef> desc1 = addStyleDef("@font-face {font-family: Custom1; font-weight:bold; src: url(Custom1.woff)}");
        DefDescriptor<StyleDef> desc2 = addStyleDef("@font-face {font-family: Custom1; font-style:italic; src: url(Custom1.woff)}");

        new StyleDefWriter(definitionService, adapter, contextService.getCurrentContext())
            .writeStyleDefs(Lists.newArrayList(definitionService.getDefinition(desc1), 
        		definitionService.getDefinition(desc2)), out);
        // no error
    }

    @Test
    public void testDifferentPropsCheckAllOff() throws Exception {
        StyleAdapter adapter = prepare(new DuplicateFontFacePlugin(false, false));
        DefDescriptor<StyleDef> desc1 = addStyleDef("@font-face {font-family: Custom1; font-weight:bold; src: url(Custom1.woff)}");
        DefDescriptor<StyleDef> desc2 = addStyleDef("@font-face {font-family: Custom1; font-style:italic; src: url(Custom1.woff)}");

        try {
            new StyleDefWriter(definitionService, adapter, contextService.getCurrentContext())
                .writeStyleDefs(Lists.newArrayList(definitionService.getDefinition(desc1), 
            		definitionService.getDefinition(desc2)), out);
            fail("expected to get exception");
        } catch (Exception e) {
            checkExceptionContains(e, AuraRuntimeException.class, "was already declared");
        }
    }

    @Test
    public void testSamePropsBothHaveAnnotation() throws Exception {
        StyleAdapter adapter = prepare(new DuplicateFontFacePlugin(true, false));
        DefDescriptor<StyleDef> desc1 = addStyleDef("@font-face {/* @allowDuplicate */ font-family: Custom1; font-weight:bold; src: url(Custom1.woff)}");
        DefDescriptor<StyleDef> desc2 = addStyleDef("@font-face {/* @allowDuplicate */ font-family: Custom1; font-weight:bold; src: url(Custom1.woff)}");

        new StyleDefWriter(definitionService, adapter, contextService.getCurrentContext())
            .writeStyleDefs(Lists.newArrayList(definitionService.getDefinition(desc1), 
        		definitionService.getDefinition(desc2)), out);
        // no error
    }

    @Test
    public void testSamePropsOnlyFirstHasAnnotation() throws Exception {
        StyleAdapter adapter = prepare(new DuplicateFontFacePlugin(true, false));
        DefDescriptor<StyleDef> desc1 = addStyleDef("@font-face {/* @allowDuplicate */ font-family: Custom1; font-weight:bold; src: url(Custom1.woff)}");
        DefDescriptor<StyleDef> desc2 = addStyleDef("@font-face {font-family: Custom1; font-weight:bold; src: url(Custom1.woff)}");

        try {
            new StyleDefWriter(definitionService, adapter, contextService.getCurrentContext())
                .writeStyleDefs(Lists.newArrayList(definitionService.getDefinition(desc1), 
            		definitionService.getDefinition(desc2)), out);
            fail("expected to get exception");
        } catch (Exception e) {
            checkExceptionContains(e, AuraRuntimeException.class, "was already declared");
        }
    }

    @Test
    public void testSamePropsOnlySecondHasAnnotation() throws Exception {
        StyleAdapter adapter = prepare(new DuplicateFontFacePlugin(true, false));
        DefDescriptor<StyleDef> desc1 = addStyleDef("@font-face {font-family: Custom1; font-weight:bold; src: url(Custom1.woff)}");
        DefDescriptor<StyleDef> desc2 = addStyleDef("@font-face {/* @allowDuplicate */ font-family: Custom1; font-weight:bold; src: url(Custom1.woff)}");

        try {
            new StyleDefWriter(definitionService, adapter, contextService.getCurrentContext())
                .writeStyleDefs(Lists.newArrayList(definitionService.getDefinition(desc1), definitionService.getDefinition(desc2)), out);
            fail("expected to get exception");
        } catch (Exception e) {
            checkExceptionContains(e, AuraRuntimeException.class, "was already declared");
        }
    }

    @Test
    public void testSamePropsBothHaveAnnotationButNotAllowed() throws Exception {
        StyleAdapter adapter = prepare(new DuplicateFontFacePlugin(false, false));
        DefDescriptor<StyleDef> desc1 = addStyleDef("@font-face {/* @allowDuplicate */ font-family: Custom1; font-weight:bold; src: url(Custom1.woff)}");
        DefDescriptor<StyleDef> desc2 = addStyleDef("@font-face {/* @allowDuplicate */ font-family: Custom1; font-weight:bold; src: url(Custom1.woff)}");

        try {
            new StyleDefWriter(definitionService, adapter, contextService.getCurrentContext())
                .writeStyleDefs(Lists.newArrayList(definitionService.getDefinition(desc1), definitionService.getDefinition(desc2)), out);
            fail("expected to get exception");
        } catch (Exception e) {
            checkExceptionContains(e, AuraRuntimeException.class, "was already declared");
        }
    }

    private static final class TestStyleAdapter extends StyleAdapterImpl {
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

//        @SuppressWarnings("unused")
//        public static TestStyleAdapter compilation(Plugin... plugins) {
//            return new TestStyleAdapter(Lists.newArrayList(plugins), null, null);
//        }
//
//        @SuppressWarnings("unused")
//        public static TestStyleAdapter runtime(Plugin... plugins) {
//            return new TestStyleAdapter(null, Lists.newArrayList(plugins), null);
//        }

        public static TestStyleAdapter contextual(Plugin... plugins) {
            return new TestStyleAdapter(null, null, Lists.newArrayList(plugins));
        }
    }
}
