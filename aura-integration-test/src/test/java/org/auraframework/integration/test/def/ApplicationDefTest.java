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
package org.auraframework.integration.test.def;

import java.util.Set;

import javax.inject.Inject;

import org.auraframework.def.ApplicationDef;
import org.auraframework.def.ControllerDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.TokensDef;
import org.auraframework.impl.root.component.BaseComponentDefTest;
import org.auraframework.service.CompilerService;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.Source;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.junit.Ignore;
import org.junit.Test;

import com.google.common.collect.Sets;

public class ApplicationDefTest extends BaseComponentDefTest<ApplicationDef> {
    @Inject
    DefinitionService definitionService;

    @Inject
    protected CompilerService compilerService;

    public ApplicationDefTest() {
        super(ApplicationDef.class, "aura:application");
    }

    /**
     * App will inherit useAppcache='false' from aura:application if attribute not specified
     */
    @Test
    public void testIsAppCacheEnabledInherited() throws Exception {
        DefDescriptor<ApplicationDef> parentDesc = addSourceAutoCleanup(ApplicationDef.class,
                String.format(baseTag, "useAppcache='true' extensible='true'", ""));
        DefDescriptor<ApplicationDef> desc = addSourceAutoCleanup(ApplicationDef.class,
                String.format(baseTag, String.format("extends='%s'", parentDesc.getQualifiedName()), ""));
        ApplicationDef appdef = definitionService.getDefinition(desc);
        assertEquals(Boolean.TRUE, appdef.isAppcacheEnabled());
    }

    /**
     * App's useAppcache attribute value overrides value from aura:application
     */
    @Test
    public void testIsAppCacheEnabledOverridesDefault() throws Exception {
        DefDescriptor<ApplicationDef> desc = addSourceAutoCleanup(ApplicationDef.class,
                String.format(baseTag, "useAppcache='true'", ""));
        ApplicationDef appdef = definitionService.getDefinition(desc);
        assertEquals(Boolean.TRUE, appdef.isAppcacheEnabled());
    }

    /**
     * App's useAppcache attribute value overrides value from parent app
     */
    @Test
    public void testIsAppCacheEnabledOverridesExtends() throws Exception {
        DefDescriptor<ApplicationDef> parentDesc = addSourceAutoCleanup(ApplicationDef.class,
                String.format(baseTag, "useAppcache='true' extensible='true'", ""));
        DefDescriptor<ApplicationDef> desc = addSourceAutoCleanup(ApplicationDef.class, String.format(baseTag,
                String.format("extends='%s' useAppcache='false'", parentDesc.getQualifiedName()), ""));
        ApplicationDef appdef = definitionService.getDefinition(desc);
        assertEquals(Boolean.FALSE, appdef.isAppcacheEnabled());
    }

    /**
     * App's useAppcache attribute value is empty
     */
    @Test
    public void testIsAppCacheEnabledUseAppcacheEmpty() throws Exception {
        DefDescriptor<ApplicationDef> desc = addSourceAutoCleanup(ApplicationDef.class,
                "<aura:application useAppCache=''/>");
        ApplicationDef appdef = definitionService.getDefinition(desc);
        assertEquals(Boolean.FALSE, appdef.isAppcacheEnabled());
    }

    /**
     * App's useAppcache attribute value is invalid
     */
    @Test
    public void testIsAppCacheEnabledUseAppcacheInvalid() throws Exception {
        DefDescriptor<ApplicationDef> desc = addSourceAutoCleanup(ApplicationDef.class,
                "<aura:application useAppCache='yes'/>");
        ApplicationDef appdef = definitionService.getDefinition(desc);
        assertEquals(Boolean.FALSE, appdef.isAppcacheEnabled());
    }

    /**
     * W-788745
     *
     * @throws Exception
     */
    @Test
    @Ignore("we dropped this exception")
    public void testNonExistantNameSpace() throws Exception {
        try {
            definitionService.getDefinition("auratest:test_Preload_ScrapNamespace", ApplicationDef.class);
            fail("Expected Exception");
        } catch (InvalidDefinitionException e) {
            assertEquals("Invalid dependency *://somecrap:*[COMPONENT]", e.getMessage());
        }
    }

    /** verify that we set tokens explicitly set on the tokens tag */
    @Test
    public void testExplicitTokenOverrides() throws QuickFixException {
        DefDescriptor<TokensDef> tokens = addSourceAutoCleanup(TokensDef.class, "<aura:tokens></aura:tokens>");
        String src = String.format("<aura:application tokens=\"%s\"/>", tokens.getDescriptorName());
        DefDescriptor<ApplicationDef> desc = addSourceAutoCleanup(ApplicationDef.class, src);
        assertEquals(1, definitionService.getDefinition(desc).getTokenOverrides().size());
        assertEquals(tokens, definitionService.getDefinition(desc).getTokenOverrides().get(0));
    }

    /** verify tokens descriptor is added to dependency set */
    @Test
    public void testTokensAddedToDeps() throws QuickFixException {
        DefDescriptor<TokensDef> tokens = addSourceAutoCleanup(TokensDef.class, "<aura:tokens></aura:tokens>");
        String src = String.format("<aura:application tokens=\"%s\"/>", tokens.getDescriptorName());
        DefDescriptor<ApplicationDef> desc = addSourceAutoCleanup(ApplicationDef.class, src);

        Set<DefDescriptor<?>> deps = Sets.newHashSet();
        definitionService.getDefinition(desc).appendDependencies(deps);
        assertTrue(deps.contains(tokens));
    }

    /** verify tokens descriptor ref is validated */
    @Test
    public void testInvalidTokensRef() throws QuickFixException {
        String src = String.format("<aura:application tokens=\"%s\"/>", "wall:maria");
        DefDescriptor<ApplicationDef> desc = addSourceAutoCleanup(ApplicationDef.class, src);

        try {
            definitionService.getDefinition(desc).validateReferences();
            fail("expected to get an exception");
        } catch (Exception e) {
            checkExceptionContains(e, DefinitionNotFoundException.class, "No TOKENS");
        }
    }

    @Test
    public void testValidateDefinitionValidateJsCode() throws Exception {
        DefDescriptor<ApplicationDef> appDesc = addSourceAutoCleanup(
                ApplicationDef.class, "<aura:application></aura:application>");
        DefDescriptor<ControllerDef> controllerDesc = definitionService.getDefDescriptor(appDesc,
                DefDescriptor.JAVASCRIPT_PREFIX, ControllerDef.class);

        String controllerCode = "({ function1: function(cmp) {var a = {k:}} })";
        addSourceAutoCleanup(controllerDesc, controllerCode);

        Source<ApplicationDef> source = stringSourceLoader.getSource(appDesc);

        try {
            compilerService.compile(appDesc, source);
            fail("Expecting an InvalidDefinitionException");
        } catch(Exception e) {
            String expectedMsg = String.format("JS Processing Error: %s", appDesc.getQualifiedName());
            this.assertExceptionMessageContains(e, InvalidDefinitionException.class, expectedMsg);
        }
    }

    /**
     * bootstrapPublicCacheExpiration attribute not set.
     */
    @Test
    public void testBootstrapPublicCacheExpirationNotSet() throws Exception {
        DefDescriptor<ApplicationDef> desc = addSourceAutoCleanup(ApplicationDef.class,
                String.format(baseTag, "", ""));
        ApplicationDef appdef = definitionService.getDefinition(desc);
        assertNull(appdef.getBootstrapPublicCacheExpiration());
    }

    /**
     * bootstrapPublicCacheExpiration set to integer value.
     */
    @Test
    public void testBootstrapPublicCacheExpirationIntegerValue() throws Exception {
        DefDescriptor<ApplicationDef> desc = addSourceAutoCleanup(ApplicationDef.class,
                String.format(baseTag, "bootstrapPublicCacheExpiration='100'", ""));
        ApplicationDef appdef = definitionService.getDefinition(desc);
        assertEquals(Integer.valueOf(100), appdef.getBootstrapPublicCacheExpiration());
    }

    /**
     * bootstrapPublicCacheExpiration set to server-side action.
     */
    @Test
    public void testBootstrapPublicCacheExpirationServerAction() throws Exception {
        DefDescriptor<ApplicationDef> desc = addSourceAutoCleanup(ApplicationDef.class,
                String.format(baseTag, "bootstrapPublicCacheExpiration='{!c.getBootstrapPublicCacheExpiration}'"
                        + " controller='java://org.auraframework.components.test.java.controller.TestController'", ""));
        ApplicationDef appdef = definitionService.getDefinition(desc);
        assertEquals(Integer.valueOf(60), appdef.getBootstrapPublicCacheExpiration());
    }
}
