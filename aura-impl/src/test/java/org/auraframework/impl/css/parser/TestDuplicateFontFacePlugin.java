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

import static org.mockito.Mockito.when;

import org.auraframework.adapter.StyleAdapter;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.StyleDef;
import org.auraframework.impl.adapter.StyleAdapterImplTest.TestStyleAdapter;
import org.auraframework.impl.adapter.format.css.StyleDefCSSFormatAdapter;
import org.auraframework.impl.css.StyleTestCase;
import org.auraframework.test.ServiceLocatorMocker;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.util.ServiceLoader;

import com.google.common.collect.Lists;

public class TestDuplicateFontFacePlugin extends StyleTestCase {
    private ServiceLoader locator;
    private DuplicateFontFacePlugin fontFamilyPlugin;
    private StringBuilder out;

    public TestDuplicateFontFacePlugin(String name) {
        super(name);
    }

    @Override
    public void setUp() throws Exception {
        super.setUp();
        out = new StringBuilder();

    }

    private void prepare(DuplicateFontFacePlugin plugin) {
        locator = ServiceLocatorMocker.spyOnServiceLocator();
        fontFamilyPlugin = plugin;
        TestStyleAdapter adapter = TestStyleAdapter.contextual(fontFamilyPlugin);
        when(locator.get(StyleAdapter.class)).thenReturn(adapter);
    }

    @Override
    public void tearDown() throws Exception {
        super.tearDown();
        ServiceLocatorMocker.unmockServiceLocator();
    }

    public void testNoErrorOnDifferentFonts() throws Exception {
        prepare(new DuplicateFontFacePlugin());
        DefDescriptor<StyleDef> desc1 = addStyleDef("@font-face {font-family: Custom1; src: url(Custom1.woff)}");
        DefDescriptor<StyleDef> desc2 = addStyleDef("@font-face {font-family: Custom2; src: url(Custom2.woff)}");

        StyleDefCSSFormatAdapter cssFormatAdapter = new StyleDefCSSFormatAdapter();
        cssFormatAdapter.writeCollection(Lists.newArrayList(desc1.getDef(), desc2.getDef()), out);
        // no error
    }

    public void testErrorsOnDupeFontsSameFile() throws Exception {
        prepare(new DuplicateFontFacePlugin());
        String s = "@font-face {font-family: Custom1; src: url(Custom1.woff)}";
        DefDescriptor<StyleDef> desc = addStyleDef(s + "\n" + s);

        StyleDefCSSFormatAdapter cssFormatAdapter = new StyleDefCSSFormatAdapter();

        try {
            cssFormatAdapter.writeCollection(Lists.newArrayList(desc.getDef()), out);
            fail("expected to get exception");
        } catch (Exception e) {
            checkExceptionContains(e, AuraRuntimeException.class, "was already declared");
        }
    }

    public void testErrorsOnDupeFontsDifferentFiles() throws Exception {
        prepare(new DuplicateFontFacePlugin());
        DefDescriptor<StyleDef> desc1 = addStyleDef("@font-face {font-family: Custom1; src: url(Custom1.woff)}");
        DefDescriptor<StyleDef> desc2 = addStyleDef("@font-face {font-family: Custom2; src: url(Custom2.woff)}");
        DefDescriptor<StyleDef> desc3 = addStyleDef("@font-face {font-family: Custom1; src: url(Custom1.woff)}");

        StyleDefCSSFormatAdapter cssFormatAdapter = new StyleDefCSSFormatAdapter();

        try {
            cssFormatAdapter.writeCollection(Lists.newArrayList(desc1.getDef(), desc2.getDef(), desc3.getDef()), out);
            fail("expected to get exception");
        } catch (Exception e) {
            checkExceptionContains(e, AuraRuntimeException.class, "was already declared");
        }
    }

    public void testErrorsOnDupeQuotedAndUnquoted() throws Exception {
        prepare(new DuplicateFontFacePlugin());
        DefDescriptor<StyleDef> desc1 = addStyleDef("@font-face {font-family: Custom1; src: url(Custom1.woff)}");
        DefDescriptor<StyleDef> desc2 = addStyleDef("@font-face {font-family: \"Custom1\"; src: url(Custom1.woff)}");

        StyleDefCSSFormatAdapter cssFormatAdapter = new StyleDefCSSFormatAdapter();

        try {
            cssFormatAdapter.writeCollection(Lists.newArrayList(desc1.getDef(), desc2.getDef()), out);
            fail("expected to get exception");
        } catch (Exception e) {
            checkExceptionContains(e, AuraRuntimeException.class, "was already declared");
        }
    }

    public void testErrorsOnDupeDifferentQuotes() throws Exception {
        prepare(new DuplicateFontFacePlugin());
        DefDescriptor<StyleDef> desc1 = addStyleDef("@font-face {font-family: 'Custom1'; src: url(Custom1.woff)}");
        DefDescriptor<StyleDef> desc2 = addStyleDef("@font-face {font-family: \"Custom1\"; src: url(Custom1.woff)}");

        StyleDefCSSFormatAdapter cssFormatAdapter = new StyleDefCSSFormatAdapter();

        try {
            cssFormatAdapter.writeCollection(Lists.newArrayList(desc1.getDef(), desc2.getDef()), out);
            fail("expected to get exception");
        } catch (Exception e) {
            checkExceptionContains(e, AuraRuntimeException.class, "was already declared");
        }
    }

    public void testSamePropsCheckAllOn() throws Exception {
        prepare(new DuplicateFontFacePlugin(false, true));
        DefDescriptor<StyleDef> desc1 = addStyleDef("@font-face {font-family: Custom1; font-weight:bold; src: url(Custom1.woff)}");
        DefDescriptor<StyleDef> desc2 = addStyleDef("@font-face {font-family: Custom1; font-weight:bold; src: url(Custom1.woff)}");

        StyleDefCSSFormatAdapter cssFormatAdapter = new StyleDefCSSFormatAdapter();

        try {
            cssFormatAdapter.writeCollection(Lists.newArrayList(desc1.getDef(), desc2.getDef()), out);
            fail("expected to get exception");
        } catch (Exception e) {
            checkExceptionContains(e, AuraRuntimeException.class, "was already declared");
        }
    }

    public void testSamePropsCheckAllOff() throws Exception {
        prepare(new DuplicateFontFacePlugin(false, false));
        DefDescriptor<StyleDef> desc1 = addStyleDef("@font-face {font-family: Custom1; font-weight:bold; src: url(Custom1.woff)}");
        DefDescriptor<StyleDef> desc2 = addStyleDef("@font-face {font-family: Custom1; font-weight:bold; src: url(Custom1.woff)}");

        StyleDefCSSFormatAdapter cssFormatAdapter = new StyleDefCSSFormatAdapter();

        try {
            cssFormatAdapter.writeCollection(Lists.newArrayList(desc1.getDef(), desc2.getDef()), out);
            fail("expected to get exception");
        } catch (Exception e) {
            checkExceptionContains(e, AuraRuntimeException.class, "was already declared");
        }
    }

    public void testDifferentPropsCheckAllOn() throws Exception {
        prepare(new DuplicateFontFacePlugin(false, true));
        DefDescriptor<StyleDef> desc1 = addStyleDef("@font-face {font-family: Custom1; font-weight:bold; src: url(Custom1.woff)}");
        DefDescriptor<StyleDef> desc2 = addStyleDef("@font-face {font-family: Custom1; font-style:italic; src: url(Custom1.woff)}");

        StyleDefCSSFormatAdapter cssFormatAdapter = new StyleDefCSSFormatAdapter();

        cssFormatAdapter.writeCollection(Lists.newArrayList(desc1.getDef(), desc2.getDef()), out);
        // no error
    }

    public void testDifferentPropsCheckAllOff() throws Exception {
        prepare(new DuplicateFontFacePlugin(false, false));
        DefDescriptor<StyleDef> desc1 = addStyleDef("@font-face {font-family: Custom1; font-weight:bold; src: url(Custom1.woff)}");
        DefDescriptor<StyleDef> desc2 = addStyleDef("@font-face {font-family: Custom1; font-style:italic; src: url(Custom1.woff)}");

        StyleDefCSSFormatAdapter cssFormatAdapter = new StyleDefCSSFormatAdapter();

        try {
            cssFormatAdapter.writeCollection(Lists.newArrayList(desc1.getDef(), desc2.getDef()), out);
            fail("expected to get exception");
        } catch (Exception e) {
            checkExceptionContains(e, AuraRuntimeException.class, "was already declared");
        }
    }

    public void testSamePropsBothHaveAnnotation() throws Exception {
        prepare(new DuplicateFontFacePlugin(true, false));
        DefDescriptor<StyleDef> desc1 = addStyleDef("@font-face {/* @allowDuplicate */ font-family: Custom1; font-weight:bold; src: url(Custom1.woff)}");
        DefDescriptor<StyleDef> desc2 = addStyleDef("@font-face {/* @allowDuplicate */ font-family: Custom1; font-weight:bold; src: url(Custom1.woff)}");

        StyleDefCSSFormatAdapter cssFormatAdapter = new StyleDefCSSFormatAdapter();

        cssFormatAdapter.writeCollection(Lists.newArrayList(desc1.getDef(), desc2.getDef()), out);
        // no error
    }

    public void testSamePropsOnlyFirstHasAnnotation() throws Exception {
        prepare(new DuplicateFontFacePlugin(true, false));
        DefDescriptor<StyleDef> desc1 = addStyleDef("@font-face {/* @allowDuplicate */ font-family: Custom1; font-weight:bold; src: url(Custom1.woff)}");
        DefDescriptor<StyleDef> desc2 = addStyleDef("@font-face {font-family: Custom1; font-weight:bold; src: url(Custom1.woff)}");

        StyleDefCSSFormatAdapter cssFormatAdapter = new StyleDefCSSFormatAdapter();

        try {
            cssFormatAdapter.writeCollection(Lists.newArrayList(desc1.getDef(), desc2.getDef()), out);
            fail("expected to get exception");
        } catch (Exception e) {
            checkExceptionContains(e, AuraRuntimeException.class, "was already declared");
        }
    }

    public void testSamePropsOnlySecondHasAnnotation() throws Exception {
        prepare(new DuplicateFontFacePlugin(true, false));
        DefDescriptor<StyleDef> desc1 = addStyleDef("@font-face {font-family: Custom1; font-weight:bold; src: url(Custom1.woff)}");
        DefDescriptor<StyleDef> desc2 = addStyleDef("@font-face {/* @allowDuplicate */ font-family: Custom1; font-weight:bold; src: url(Custom1.woff)}");

        StyleDefCSSFormatAdapter cssFormatAdapter = new StyleDefCSSFormatAdapter();

        try {
            cssFormatAdapter.writeCollection(Lists.newArrayList(desc1.getDef(), desc2.getDef()), out);
            fail("expected to get exception");
        } catch (Exception e) {
            checkExceptionContains(e, AuraRuntimeException.class, "was already declared");
        }
    }

    public void testSamePropsBothHaveAnnotationButNotAllowed() throws Exception {
        prepare(new DuplicateFontFacePlugin(false, false));
        DefDescriptor<StyleDef> desc1 = addStyleDef("@font-face {/* @allowDuplicate */ font-family: Custom1; font-weight:bold; src: url(Custom1.woff)}");
        DefDescriptor<StyleDef> desc2 = addStyleDef("@font-face {/* @allowDuplicate */ font-family: Custom1; font-weight:bold; src: url(Custom1.woff)}");

        StyleDefCSSFormatAdapter cssFormatAdapter = new StyleDefCSSFormatAdapter();

        try {
            cssFormatAdapter.writeCollection(Lists.newArrayList(desc1.getDef(), desc2.getDef()), out);
            fail("expected to get exception");
        } catch (Exception e) {
            checkExceptionContains(e, AuraRuntimeException.class, "was already declared");
        }
    }
}
