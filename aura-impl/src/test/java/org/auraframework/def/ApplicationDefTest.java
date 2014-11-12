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
package org.auraframework.def;

import java.util.Set;

import org.auraframework.Aura;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;

import com.google.common.collect.Sets;

public class ApplicationDefTest extends BaseComponentDefTest<ApplicationDef> {

    public ApplicationDefTest(String name) {
        super(name, ApplicationDef.class, "aura:application");
    }

    /**
     * App will inherit useAppcache='false' from aura:application if attribute not specified
     */
    public void testIsAppCacheEnabledInherited() throws Exception {
        DefDescriptor<ApplicationDef> parentDesc = addSourceAutoCleanup(ApplicationDef.class,
                String.format(baseTag, "useAppcache='true' extensible='true'", ""));
        DefDescriptor<ApplicationDef> desc = addSourceAutoCleanup(ApplicationDef.class,
                String.format(baseTag, String.format("extends='%s'", parentDesc.getQualifiedName()), ""));
        ApplicationDef appdef = Aura.getDefinitionService().getDefinition(desc);
        assertEquals(Boolean.TRUE, appdef.isAppcacheEnabled());
    }

    /**
     * App's useAppcache attribute value overrides value from aura:application
     */
    public void testIsAppCacheEnabledOverridesDefault() throws Exception {
        DefDescriptor<ApplicationDef> desc = addSourceAutoCleanup(ApplicationDef.class,
                String.format(baseTag, "useAppcache='true'", ""));
        ApplicationDef appdef = Aura.getDefinitionService().getDefinition(desc);
        assertEquals(Boolean.TRUE, appdef.isAppcacheEnabled());
    }

    /**
     * App's useAppcache attribute value overrides value from parent app
     */
    public void testIsAppCacheEnabledOverridesExtends() throws Exception {
        DefDescriptor<ApplicationDef> parentDesc = addSourceAutoCleanup(ApplicationDef.class,
                String.format(baseTag, "useAppcache='true' extensible='true'", ""));
        DefDescriptor<ApplicationDef> desc = addSourceAutoCleanup(ApplicationDef.class, String.format(baseTag,
                String.format("extends='%s' useAppcache='false'", parentDesc.getQualifiedName()), ""));
        ApplicationDef appdef = Aura.getDefinitionService().getDefinition(desc);
        assertEquals(Boolean.FALSE, appdef.isAppcacheEnabled());
    }

    /**
     * App's useAppcache attribute value is empty
     */
    public void testIsAppCacheEnabledUseAppcacheEmpty() throws Exception {
        DefDescriptor<ApplicationDef> desc = addSourceAutoCleanup(ApplicationDef.class,
                "<aura:application useAppCache=''/>");
        ApplicationDef appdef = Aura.getDefinitionService().getDefinition(desc);
        assertEquals(Boolean.FALSE, appdef.isAppcacheEnabled());
    }

    /**
     * App's useAppcache attribute value is invalid
     */
    public void testIsAppCacheEnabledUseAppcacheInvalid() throws Exception {
        DefDescriptor<ApplicationDef> desc = addSourceAutoCleanup(ApplicationDef.class,
                "<aura:application useAppCache='yes'/>");
        ApplicationDef appdef = Aura.getDefinitionService().getDefinition(desc);
        assertEquals(Boolean.FALSE, appdef.isAppcacheEnabled());
    }

    /**
     * Additional test cases which are specific to Applications. Test Case: When a component has a layout.xml specified,
     * do not auto render serverside. Automation for W-911562
     */
    public void testIsLocallyRenderable_extra() throws Exception {
        ApplicationDef appdef = Aura.getDefinitionService().getDefinition("test:test_Layouts", ApplicationDef.class);
        assertNotNull(appdef);
        assertFalse("Applications with a layout def should not be locally renderable.", appdef.isLocallyRenderable());
    }

    /**
     * W-788745
     * 
     * @throws Exception
     */
    public void testNonExistantNameSpace() throws Exception {
        try {
            Aura.getDefinitionService().getDefinition("auratest:test_Preload_ScrapNamespace", ApplicationDef.class);
            fail("Expected Exception");
        } catch (InvalidDefinitionException e) {
            assertEquals("Invalid dependency *://somecrap:*[COMPONENT]", e.getMessage());
        }
    }

    /**
     * Verify the isOnePageApp() API on ApplicationDef Applications who have the isOnePageApp attribute set, will have
     * the template cached.
     * 
     * @throws Exception
     */
    public void testIsOnePageApp() throws Exception {
        DefDescriptor<ApplicationDef> desc = addSourceAutoCleanup(ApplicationDef.class,
                String.format(baseTag, "isOnePageApp='true'", ""));
        ApplicationDef onePageApp = Aura.getDefinitionService().getDefinition(desc);
        assertEquals(Boolean.TRUE, onePageApp.isOnePageApp());

        desc = addSourceAutoCleanup(ApplicationDef.class, String.format(baseTag, "isOnePageApp='false'", ""));
        ApplicationDef nonOnePageApp = Aura.getDefinitionService().getDefinition(desc);
        assertEquals(Boolean.FALSE, nonOnePageApp.isOnePageApp());

        // By default an application is not a onePageApp
        desc = addSourceAutoCleanup(ApplicationDef.class, String.format(baseTag, "", ""));
        ApplicationDef simpleApp = Aura.getDefinitionService().getDefinition(desc);
        assertEquals(Boolean.FALSE, simpleApp.isOnePageApp());
    }

    /** verify that we set the correct theme descriptor when there is an explicit theme on the app tag */
    public void testExplicitTheme() throws QuickFixException {
        DefDescriptor<ThemeDef> theme = addSourceAutoCleanup(ThemeDef.class, "<aura:theme></aura:theme>");
        String src = String.format("<aura:application theme=\"%s\"/>", theme.getDescriptorName());
        DefDescriptor<ApplicationDef> desc = addSourceAutoCleanup(ApplicationDef.class, src);
        assertEquals(1, desc.getDef().getThemeDescriptors().size());
        assertEquals(theme, desc.getDef().getThemeDescriptors().get(0));
    }

    /** verify that we set the correct theme descriptor when there is an explicit theme and a cmp theme */
    public void testExplicitAndCmpTheme() throws QuickFixException {
        // standalone theme
        DefDescriptor<ThemeDef> explicitTheme = addSourceAutoCleanup(ThemeDef.class, "<aura:theme></aura:theme>");

        // style
        DefDescriptor<StyleDef> styleDesc = addSourceAutoCleanup(StyleDef.class, ".THIS{}");

        // theme is in same bundle as style
        String qn = String.format("%s:%s", styleDesc.getNamespace(), styleDesc.getName());
        DefDescriptor<ThemeDef> cmpTheme = DefDescriptorImpl.getInstance(qn, ThemeDef.class);
        addSourceAutoCleanup(cmpTheme, "<aura:theme/>");

        // app is in same bundle as theme and style
        DefDescriptor<ApplicationDef> appDesc = DefDescriptorImpl.getInstance(qn, ApplicationDef.class);
        String src = String.format("<aura:application theme=\"%s\"/>", explicitTheme.getDescriptorName());
        addSourceAutoCleanup(appDesc, src);

        // cmp theme should not have an impact, explicit theme should be used
        assertEquals(1, appDesc.getDef().getThemeDescriptors().size());
        assertEquals(explicitTheme, appDesc.getDef().getThemeDescriptors().get(0));
    }

    /** verify that we set the correct theme descriptor when there is only the namespace default theme */
    public void testImplicitTheme() throws QuickFixException {
        DefDescriptor<ThemeDef> dummy = addSourceAutoCleanup(ThemeDef.class, "<aura:theme></aura:theme>");

        DefDescriptor<ThemeDef> nsTheme = DefDescriptorImpl.getInstance(
                String.format("%s:%sTheme", dummy.getNamespace(), dummy.getNamespace()), ThemeDef.class);
        addSourceAutoCleanup(nsTheme, "<aura:theme></aura:theme>");

        String src = "<aura:application/>";
        DefDescriptor<ApplicationDef> desc = DefDescriptorImpl.getInstance(
                String.format("%s:%s", dummy.getNamespace(), getAuraTestingUtil().getNonce(getName())),
                ApplicationDef.class);
        addSourceAutoCleanup(desc, src);
        assertEquals(1, desc.getDef().getThemeDescriptors().size());
        assertEquals(nsTheme, desc.getDef().getThemeDescriptors().get(0));
    }

    /** an empty value for the theme attr means that you don't want any theme, even the implicit one */
    public void testThemeAttrIsEmptyString() throws QuickFixException {
        DefDescriptor<ThemeDef> dummy = addSourceAutoCleanup(ThemeDef.class, "<aura:theme></aura:theme>");

        DefDescriptor<ThemeDef> nsTheme = DefDescriptorImpl.getInstance(
                String.format("%s:%sTheme", dummy.getNamespace(), dummy.getNamespace()), ThemeDef.class);
        addSourceAutoCleanup(nsTheme, "<aura:theme></aura:theme>");

        String src = "<aura:application theme=''/>";
        DefDescriptor<ApplicationDef> desc = DefDescriptorImpl.getInstance(
                String.format("%s:%s", dummy.getNamespace(), getAuraTestingUtil().getNonce(getName())),
                ApplicationDef.class);
        addSourceAutoCleanup(desc, src);
        assertTrue(desc.getDef().getThemeDescriptors().isEmpty());
    }

    /** verify theme descriptor is added to dependency set */
    public void testThemeAddedToDeps() throws QuickFixException {
        DefDescriptor<ThemeDef> theme = addSourceAutoCleanup(ThemeDef.class, "<aura:theme></aura:theme>");
        String src = String.format("<aura:application theme=\"%s\"/>", theme.getDescriptorName());
        DefDescriptor<ApplicationDef> desc = addSourceAutoCleanup(ApplicationDef.class, src);

        Set<DefDescriptor<?>> deps = Sets.newHashSet();
        desc.getDef().appendDependencies(deps);
        assertTrue(deps.contains(theme));
    }

    /** verify theme descriptor ref is validated */
    public void testInvalidThemeRef() throws QuickFixException {
        String src = String.format("<aura:application theme=\"%s\"/>", "wall:maria");
        DefDescriptor<ApplicationDef> desc = addSourceAutoCleanup(ApplicationDef.class, src);

        try {
            desc.getDef().validateReferences();
            fail("expected to get an exception");
        } catch (Exception e) {
            checkExceptionContains(e, DefinitionNotFoundException.class, "No THEME");
        }
    }

    /** an application can't specify a cmp bundle theme as its theme (even the one in its own bundle) */
    public void testAppThemeCantBeCmpTheme() throws QuickFixException {
        DefDescriptor<StyleDef> styleDesc = addSourceAutoCleanup(StyleDef.class, ".THIS{}");

        String fmt = String.format("%s:%s", styleDesc.getNamespace(), styleDesc.getName());
        DefDescriptor<ThemeDef> themeDesc = DefDescriptorImpl.getInstance(fmt, ThemeDef.class);
        addSourceAutoCleanup(themeDesc, "<aura:theme/>");

        String src = String.format("<aura:application theme=\"%s\"/>", themeDesc.getDescriptorName());
        DefDescriptor<ApplicationDef> desc = addSourceAutoCleanup(ApplicationDef.class, src);

        try {
            desc.getDef().validateReferences();
            fail("expected to get an exception");
        } catch (Exception e) {
            checkExceptionContains(e, InvalidDefinitionException.class, "must not specify");
        }
    }
}
