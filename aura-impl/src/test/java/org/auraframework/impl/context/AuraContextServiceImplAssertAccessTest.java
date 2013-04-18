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

import org.auraframework.Aura;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.ModelDef;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.system.AuraContext.Access;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.throwable.NoAccessException;

/**
 * Tests for AuraContextServiceImpl.assertAccess method.
 * 
 * @since 0.0.178
 */

public class AuraContextServiceImplAssertAccessTest extends AuraImplTestCase {
    private static final String cmpTag = String.format(baseComponentTag, "", "");

    @Override
    public void tearDown() throws Exception {
        Aura.getContextService().endContext();
        super.tearDown();
    }

    public AuraContextServiceImplAssertAccessTest(String name) {
        super(name, false);
    }

    private Throwable assertException(DefDescriptor<?> desc, Class<? extends Throwable> exClass, String message) {
        try {
            Aura.getContextService().assertAccess(desc);
            fail("Expected " + exClass.getName());
            return null;
        } catch (Exception e) {
            checkExceptionFull(e, exClass, message);
            return e;
        }
    }

    public void testDevCmpWithoutApp() throws Exception {
        Aura.getContextService().startContext(Mode.UTEST, Format.JSON, Access.AUTHENTICATED);
        DefDescriptor<ComponentDef> cmpDesc = addSourceAutoCleanup(ComponentDef.class, cmpTag);
        Aura.getContextService().assertAccess(cmpDesc);
    }

    /**
     * DEV mode component with invalid app context does not invoke security check.
     */
    public void testDevCmpWithUnknownApp() throws Exception {
        DefDescriptor<ApplicationDef> appDesc = Aura.getDefinitionService().getDefDescriptor("nonexistant:application",
                ApplicationDef.class);
        Aura.getContextService().startContext(Mode.UTEST, Format.JSON, Access.AUTHENTICATED, appDesc);
        DefDescriptor<ComponentDef> cmpDesc = addSourceAutoCleanup(ComponentDef.class, cmpTag);
        Aura.getContextService().assertAccess(cmpDesc);
    }

    /**
     * DEV mode component with valid app context has security check invoked.
     */
    public void testDevCmpWithAppThatDenies() throws Exception {
        DefDescriptor<ApplicationDef> appDesc = addSourceAutoCleanup(ApplicationDef.class, String.format(
                baseApplicationTag,
                "securityProvider='java://org.auraframework.components.security.SecurityProviderAlwaysDenies'", ""));
        Aura.getContextService().startContext(Mode.UTEST, Format.JSON, Access.AUTHENTICATED, appDesc);
        DefDescriptor<ComponentDef> cmpDesc = addSourceAutoCleanup(ComponentDef.class, cmpTag);
        assertException(cmpDesc, NoAccessException.class,
                String.format("Access to %s disallowed by SecurityProviderAlwaysDenies", cmpDesc.getQualifiedName()));
    }

    /**
     * DEV mode component with valid app context and allows access passes check.
     */
    public void testDevCmpWithAppThatAllows() throws Exception {
        DefDescriptor<ApplicationDef> appDesc = addSourceAutoCleanup(ApplicationDef.class, String.format(
                baseApplicationTag,
                "securityProvider='java://org.auraframework.components.security.SecurityProviderAlwaysAllows'", ""));
        Aura.getContextService().startContext(Mode.UTEST, Format.JSON, Access.AUTHENTICATED, appDesc);
        DefDescriptor<ComponentDef> cmpDesc = addSourceAutoCleanup(ComponentDef.class, cmpTag);
        Aura.getContextService().assertAccess(cmpDesc);
    }

    /**
     * PROD mode model does not invoke security provider.
     */
    public void testProdModel() throws Exception {
        DefDescriptor<ApplicationDef> appDesc = addSourceAutoCleanup(ApplicationDef.class, String.format(
                baseApplicationTag,
                "securityProvider='java://org.auraframework.components.security.SecurityProviderAlwaysDenies'", ""));
        Aura.getContextService().startContext(Mode.PROD, Format.JSON, Access.AUTHENTICATED, appDesc);
        DefDescriptor<ModelDef> desc = DefDescriptorImpl.getInstance("java://any.model", ModelDef.class);
        Aura.getContextService().assertAccess(desc);
    }

    /**
     * PROD mode component with unsecured prefix does not invoke security provider.
     */
    public void testProdCmpWithUnsecuredPrefix() throws Exception {
        DefDescriptor<ApplicationDef> appDesc = addSourceAutoCleanup(ApplicationDef.class, String.format(
                baseApplicationTag,
                "securityProvider='java://org.auraframework.components.security.SecurityProviderAlwaysDenies'", ""));
        Aura.getContextService().startContext(Mode.PROD, Format.JSON, Access.AUTHENTICATED, appDesc);
        DefDescriptor<ComponentDef> cmpDesc = DefDescriptorImpl.getInstance("aura://otherns:arbitrary",
                ComponentDef.class);
        Aura.getContextService().assertAccess(cmpDesc);
    }

    /**
     * PROD mode component with unsecured namespace does not invoke security provider.
     */
    public void testProdCmpWithUnsecuredNamespace() throws Exception {
        DefDescriptor<ApplicationDef> appDesc = addSourceAutoCleanup(ApplicationDef.class, String.format(
                baseApplicationTag,
                "securityProvider='java://org.auraframework.components.security.SecurityProviderAlwaysDenies'", ""));
        Aura.getContextService().startContext(Mode.PROD, Format.JSON, Access.AUTHENTICATED, appDesc);
        DefDescriptor<ComponentDef> cmpDesc = DefDescriptorImpl.getInstance("markup://aura:text", ComponentDef.class);
        Aura.getContextService().assertAccess(cmpDesc);
    }

    /**
     * PROD mode component without app context is not allowed.
     */
    public void testProdCmpWithoutApp() throws Exception {
        Aura.getContextService().startContext(Mode.PROD, Format.JSON, Access.AUTHENTICATED);
        DefDescriptor<ComponentDef> cmpDesc = addSourceAutoCleanup(ComponentDef.class, cmpTag);
        assertException(cmpDesc, NoAccessException.class,
                String.format("Access to %s disallowed.  No Security Provider found.", cmpDesc.getQualifiedName()));
    }

    /**
     * PROD mode component with unknown app context is not allowed.
     */
    public void testProdCmpWithUnknownApp() throws Exception {
        DefDescriptor<ApplicationDef> appDesc = Aura.getDefinitionService().getDefDescriptor("nonexistant:application",
                ApplicationDef.class);
        Aura.getContextService().startContext(Mode.PROD, Format.JSON, Access.AUTHENTICATED, appDesc);
        DefDescriptor<ComponentDef> cmpDesc = addSourceAutoCleanup(ComponentDef.class, cmpTag);
        assertException(cmpDesc, NoAccessException.class,
                String.format("Access to %s disallowed.  No Security Provider found.", cmpDesc.getQualifiedName()));
    }

    /**
     * PROD mode component with app context where SecurityProvider throws a Throwable is not allowed.
     */
    public void testProdCmpWithAppThatThrows() throws Exception {
        Throwable t;

        DefDescriptor<ApplicationDef> appDesc = addSourceAutoCleanup(ApplicationDef.class, String.format(
                baseApplicationTag,
                "securityProvider='java://org.auraframework.components.security.SecurityProviderThrowsThrowable'", ""));
        Aura.getContextService().startContext(Mode.PROD, Format.JSON, Access.AUTHENTICATED, appDesc);
        DefDescriptor<ComponentDef> cmpDesc = addSourceAutoCleanup(ComponentDef.class, cmpTag);
        t = assertException(cmpDesc, NoAccessException.class, "Access Denied");
        checkExceptionFull(t.getCause(), RuntimeException.class, "generated intentionally");
    }

    /**
     * PROD mode component with app context where SecurityProvider denies access is not allowed.
     */
    public void testProdCmpWithAppThatDenies() throws Exception {
        DefDescriptor<ApplicationDef> appDesc = addSourceAutoCleanup(ApplicationDef.class, String.format(
                baseApplicationTag,
                "securityProvider='java://org.auraframework.components.security.SecurityProviderAlwaysDenies'", ""));
        Aura.getContextService().startContext(Mode.PROD, Format.JSON, Access.AUTHENTICATED, appDesc);
        DefDescriptor<ComponentDef> cmpDesc = addSourceAutoCleanup(ComponentDef.class, cmpTag);
        assertException(cmpDesc, NoAccessException.class,
                String.format("Access to %s disallowed by SecurityProviderAlwaysDenies", cmpDesc.getQualifiedName()));
    }

    /**
     * PROD mode component with app context where SecurityProvider allows access is allowed.
     */
    public void testProdCmpWithAppThatAllows() throws Exception {
        DefDescriptor<ApplicationDef> appDesc = addSourceAutoCleanup(ApplicationDef.class, String.format(
                baseApplicationTag,
                "securityProvider='java://org.auraframework.components.security.SecurityProviderAlwaysAllows'", ""));
        Aura.getContextService().startContext(Mode.PROD, Format.JSON, Access.AUTHENTICATED, appDesc);
        DefDescriptor<ComponentDef> cmpDesc = addSourceAutoCleanup(ComponentDef.class, cmpTag);
        Aura.getContextService().assertAccess(cmpDesc);
    }
}
