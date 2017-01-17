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
package org.auraframework.integration.test.root.parser.handler;

import org.auraframework.def.*;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.root.component.ComponentDefImpl;
import org.auraframework.test.source.StringSourceLoader;
import org.auraframework.test.source.StringSourceLoader.NamespaceAccess;
import org.auraframework.throwable.NoAccessException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.test.annotation.UnAdaptableTest;
import org.junit.Ignore;
import org.junit.Test;

import java.util.List;

@UnAdaptableTest("namespace start with c means something special in core")
public class ComponentAccessAttributeEnforcementTest extends AuraImplTestCase {
    /**
     * Template tests start
     * template cannot have access='Private' 
     */
    /**
     * access to template in a custom namespace
     * for template in custom namespace, we cannot have access='Privileged'
     */
    @Test
    public void testApplicationWithCustomNamespaceImplementsTemplateWithSameCustomNamespace() throws QuickFixException {
        //create component with custom namespace
        String cmpSource = "<aura:component isTemplate='true'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponent", NamespaceAccess.CUSTOM);
        //create application with above component in markup
        String source = "<aura:application template='" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "'/>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testapplication", NamespaceAccess.CUSTOM);
        definitionService.getDefinition(descriptor);
    }
    @Test
    public void testApplicationWithCustomNamespaceImplementsTemplateWithSameCustomNamespaceAccessGlobal() throws QuickFixException {
        //create component with custom namespace
        String cmpSource = "<aura:component isTemplate='true' access='GLOBAL'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponent", NamespaceAccess.CUSTOM);
        //create application with above component in markup
        String source = "<aura:application template='" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "'/>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testapplication", NamespaceAccess.CUSTOM);
        definitionService.getDefinition(descriptor);
    }
    @Test
    public void testApplicationWithCustomNamespaceImplementsTemplateWithSameCustomNamespaceAccessPublic() throws QuickFixException {
        //create component with custom namespace
        String cmpSource = "<aura:component isTemplate='true' access='Public'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponent", NamespaceAccess.CUSTOM);
        //create application with above component in markup
        String source = "<aura:application template='" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "'/>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testapplication", NamespaceAccess.CUSTOM);
        definitionService.getDefinition(descriptor);
    }
    
     
    @Test
    public void testApplicationWithCustomNamespaceImplementsTemplateWithOtherCustomNamespace() throws QuickFixException {
        //create component with custom namespace
        String cmpSource = "<aura:component isTemplate='true' />";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponent", NamespaceAccess.CUSTOM);
        //create application with above component in markup
        String source = "<aura:application template='" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "'/>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.OTHER_CUSTOM_NAMESPACE + ":testapplication", NamespaceAccess.CUSTOM);

        Exception caught = null;
        try {
            definitionService.getDefinition(descriptor);
        } catch (NoAccessException e) {
            caught = e;
        }
        assertNotNull("Template from a custom namespace cannot be used in another custom namespace because their default access is PUBLIC", caught);
        // missing message
        assertTrue("got unexpected error message:"+caught.getMessage(), caught.getMessage().contains("is not allowed"));
    }
    @Test
    public void testApplicationWithCustomNamespaceImplementsTemplateWithOtherCustomNamespaceAccessPublic() throws QuickFixException {
        //create component with custom namespace
        String cmpSource = "<aura:component isTemplate='true' access='PUBLIC'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponent", NamespaceAccess.CUSTOM);
        //create application with above component in markup
        String source = "<aura:application template='" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "'/>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.OTHER_CUSTOM_NAMESPACE + ":testapplication", NamespaceAccess.CUSTOM);

        Exception caught = null;
        try {
            definitionService.getDefinition(descriptor);
        } catch (NoAccessException e) {
            caught = e;
        }
        assertNotNull("Template from a custom namespace cannot be used in another custom namespace because their default access is PUBLIC", caught);
        // missing message
        assertTrue("got unexpected error message:"+caught.getMessage(), caught.getMessage().contains("is not allowed"));
    }
    @Test
    public void testApplicationWithCustomNamespaceImplementsTemplateWithOtherCustomNamespaceAccessGlobal() throws QuickFixException {
        //create component with custom namespace
        String cmpSource = "<aura:component isTemplate='true' access='GLOBAL'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponent", NamespaceAccess.CUSTOM);
        //create application with above component in markup
        String source = "<aura:application template='" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "'/>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.OTHER_CUSTOM_NAMESPACE + ":testapplication", NamespaceAccess.CUSTOM);
        definitionService.getDefinition(descriptor);
    }
    
    
    @Test
    public void testApplicationWithPrivilegedNamespaceImplementsTemplateWithCustomNamespace() throws QuickFixException {
        //create component with custom namespace
        String cmpSource = "<aura:component isTemplate='true'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponent", NamespaceAccess.CUSTOM);
        //create application with above component in markup
        String source = "<aura:application template='" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "'/>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testapplication", NamespaceAccess.PRIVILEGED);

        Exception caught = null;
        try {
            definitionService.getDefinition(descriptor);
        } catch (NoAccessException e) {
            caught = e;
        }
        assertNotNull("Template from a privileged namespace cannot be used in another custom namespace with default access", caught);
        // missing message
        assertTrue("got unexpected error message:"+caught.getMessage(), caught.getMessage().contains("is not allowed"));
    }

    @Test
    public void testApplicationWithPrivilegedNamespaceImplementsTemplateWithCustomNamespaceAccessPublic() throws QuickFixException {
        //create component with custom namespace
        String cmpSource = "<aura:component isTemplate='true' access='Public'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponent", NamespaceAccess.CUSTOM);
        //create application with above component in markup
        String source = "<aura:application template='" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "'/>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testapplication", NamespaceAccess.PRIVILEGED);

        Exception caught = null;
        try {
            definitionService.getDefinition(descriptor);
        } catch (NoAccessException e) {
            caught = e;
        }
        assertNotNull("Template from a privileged namespace cannot be used in another custom namespace with PUBLIC access", caught);
        // missing message
        assertTrue("got unexpected error message:"+caught.getMessage(), caught.getMessage().contains("is not allowed"));
    }

    @Test
    public void testApplicationWithPrivilegedNamespaceImplementsTemplateWithCustomNamespaceAccessGlobal() throws QuickFixException {
        //create component with custom namespace
        String cmpSource = "<aura:component isTemplate='true' access='Global'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponent", NamespaceAccess.CUSTOM);
        //create application with above component in markup
        String source = "<aura:application template='" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "'/>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testapplication", NamespaceAccess.PRIVILEGED);
        definitionService.getDefinition(descriptor);
    }
    
    
    @Test
    public void testApplicationWithSystemNamespaceImplementsTemplateWithCustomNamespace() throws QuickFixException {
        //create component with custom namespace
        String cmpSource = "<aura:component isTemplate='true'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponent", NamespaceAccess.CUSTOM);
        //create application with above component in markup
        String source = "<aura:application template='" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "'/>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testapplication", NamespaceAccess.INTERNAL);
        definitionService.getDefinition(descriptor);
    }
    @Test
    public void testApplicationWithSystemNamespaceImplementsTemplateWithCustomNamespaceGlobal() throws QuickFixException {
        //create component with custom namespace
        String cmpSource = "<aura:component isTemplate='true' access='GLOBAL'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponent", NamespaceAccess.CUSTOM);
        //create application with above component in markup
        String source = "<aura:application template='" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "'/>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testapplication", NamespaceAccess.INTERNAL);
        definitionService.getDefinition(descriptor);
    }
    @Test
    public void testApplicationWithSystemNamespaceImplementsTemplateWithCustomNamespacePublic() throws QuickFixException {
        //create component with custom namespace
        String cmpSource = "<aura:component isTemplate='true' access='PUBLIC'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponent", NamespaceAccess.CUSTOM);
        //create application with above component in markup
        String source = "<aura:application template='" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "'/>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testapplication", NamespaceAccess.INTERNAL);
        definitionService.getDefinition(descriptor);
    }
    
    
    
    /**
     * access to template in a privileged namespace
     */
    @Test
    public void testApplicationWithSystemNamespaceImplementsTemplateWithPrivilegedNamespace() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component isTemplate='true'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testcomponent", NamespaceAccess.PRIVILEGED);
        //create application with above component in markup
        String source = "<aura:application template='" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "'/>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testapplication", NamespaceAccess.INTERNAL);
        definitionService.getDefinition(descriptor);
    }
    @Test
    public void testApplicationWithSystemNamespaceImplementsTemplateWithPrivilegedNamespaceAccessPrivileged() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component isTemplate='true' access='Privileged'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testcomponent", NamespaceAccess.PRIVILEGED);
        //create application with above component in markup
        String source = "<aura:application template='" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "'/>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testapplication", NamespaceAccess.INTERNAL);
        definitionService.getDefinition(descriptor);
    }
    @Test
    public void testApplicationWithSystemNamespaceImplementsTemplateWithPrivilegedNamespaceAccessPublic() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component isTemplate='true' access='Public'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testcomponent", NamespaceAccess.PRIVILEGED);
        //create application with above component in markup
        String source = "<aura:application template='" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "'/>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testapplication", NamespaceAccess.INTERNAL);
        definitionService.getDefinition(descriptor);
    }
    @Test
    public void testApplicationWithSystemNamespaceImplementsTemplateWithPrivilegedNamespaceAccessGlobal() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component isTemplate='true' access='Global'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testcomponent", NamespaceAccess.PRIVILEGED);
        //create application with above component in markup
        String source = "<aura:application template='" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "'/>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testapplication", NamespaceAccess.INTERNAL);
        definitionService.getDefinition(descriptor);
    }
    
    
    @Test
    public void testApplicationWithPrivilegedNamespaceImplementsTemplateWithSamePrivilegedNamespace() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component isTemplate='true'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testcomponent", NamespaceAccess.PRIVILEGED);
        //create application with above component in markup
        String source = "<aura:application template='" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "'/>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testapplication", NamespaceAccess.PRIVILEGED);
        definitionService.getDefinition(descriptor);
    }
    @Test
    public void testApplicationWithPrivilegedNamespaceImplementsTemplateWithSamePrivilegedNamespaceAccessPublic() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component isTemplate='true' access='Public'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testcomponent", NamespaceAccess.PRIVILEGED);
        //create application with above component in markup
        String source = "<aura:application template='" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "'/>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testapplication", NamespaceAccess.PRIVILEGED);
        definitionService.getDefinition(descriptor);
    }
    @Test
    public void testApplicationWithPrivilegedNamespaceImplementsTemplateWithSamePrivilegedNamespaceAccessGlobal() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component isTemplate='true' access='Public'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testcomponent", NamespaceAccess.PRIVILEGED);
        //create application with above component in markup
        String source = "<aura:application template='" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "'/>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testapplication", NamespaceAccess.PRIVILEGED);
        definitionService.getDefinition(descriptor);
    }
    @Test
    public void testApplicationWithPrivilegedNamespaceImplementsTemplateWithSamePrivilegedNamespaceAccessPrivileged() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component isTemplate='true' access='Privileged'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testcomponent", NamespaceAccess.PRIVILEGED);
        //create application with above component in markup
        String source = "<aura:application template='" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "'/>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testapplication", NamespaceAccess.PRIVILEGED);
        definitionService.getDefinition(descriptor);
    }
    
    
    @Test
    public void testApplicationWithPrivilegedNamespaceImplementsTemplateWithOtherPrivilegedNamespace() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component isTemplate='true'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testcomponent", NamespaceAccess.PRIVILEGED);
        //create application with above component in markup
        String source = "<aura:application template='" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "'/>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.OTHER_PRIVILEGED_NAMESPACE + ":testapplication", NamespaceAccess.PRIVILEGED);

        Exception caught = null;
        try {
            definitionService.getDefinition(descriptor);
        } catch (NoAccessException e) {
            caught = e;
        }
        assertNotNull("Template from a privileged namespace cannot be used in another privileged namespace with default access", caught);
        // missing message
        assertTrue("got unexpected error message:"+caught.getMessage(), caught.getMessage().contains("is not allowed"));
    }

    @Test
    public void testApplicationWithPrivilegedNamespaceImplementsTemplateWithOtherPrivilegedNamespaceAccessPublic() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component isTemplate='true' access='Public'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testcomponent", NamespaceAccess.PRIVILEGED);
        //create application with above component in markup
        String source = "<aura:application template='" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "'/>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.OTHER_PRIVILEGED_NAMESPACE + ":testapplication", NamespaceAccess.PRIVILEGED);

        Exception caught = null;
        try {
            definitionService.getDefinition(descriptor);
        } catch (NoAccessException e) {
            caught = e;
        }
        assertNotNull("Template from a privileged namespace cannot be used in another privileged namespace with default access", caught);
        // missing message
        assertTrue("got unexpected error message:"+caught.getMessage(), caught.getMessage().contains("is not allowed"));
    }
    @Test
    public void testApplicationWithPrivilegedNamespaceImplementsTemplateWithOtherPrivilegedNamespaceAccessGlobal() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component isTemplate='true' access='Global'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testcomponent", NamespaceAccess.PRIVILEGED);
        //create application with above component in markup
        String source = "<aura:application template='" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "'/>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.OTHER_PRIVILEGED_NAMESPACE + ":testapplication", NamespaceAccess.PRIVILEGED);
        definitionService.getDefinition(descriptor);
    }
    @Test
    public void testApplicationWithPrivilegedNamespaceImplementsTemplateWithOtherPrivilegedNamespaceAccessPrivilged() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component isTemplate='true' access='Privileged'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testcomponent", NamespaceAccess.PRIVILEGED);
        //create application with above component in markup
        String source = "<aura:application template='" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "'/>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.OTHER_PRIVILEGED_NAMESPACE + ":testapplication", NamespaceAccess.PRIVILEGED);
        definitionService.getDefinition(descriptor);
    }
    
    
    @Test
    public void testApplicationWithCustomNamespaceImplementsTemplateWithPrivilegedNamespace() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component isTemplate='true'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testcomponent", NamespaceAccess.PRIVILEGED);
        //create application with above component in markup
        String source = "<aura:application template='" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "'/>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testapplication", NamespaceAccess.CUSTOM);

        Exception caught = null;
        try {
            definitionService.getDefinition(descriptor);
        } catch (NoAccessException e) {
            caught = e;
        }
        assertNotNull("Template from a privileged namespace cannot be used in custom namespace with default access", caught);
        // missing message
        assertTrue("got unexpected error message:"+caught.getMessage(), caught.getMessage().contains("is not allowed"));
    }
    @Test
    public void testApplicationWithCustomNamespaceImplementsTemplateWithPrivilegedNamespaceAccessPublic() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component isTemplate='true' access='Public'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testcomponent", NamespaceAccess.PRIVILEGED);
        //create application with above component in markup
        String source = "<aura:application template='" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "'/>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testapplication", NamespaceAccess.CUSTOM);

        Exception caught = null;
        try {
            definitionService.getDefinition(descriptor);
        } catch (NoAccessException e) {
            caught = e;
        }
        assertNotNull("Template from a privileged namespace cannot be used in custom namespace with Public access", caught);
        // missing message
        assertTrue("got unexpected error message:"+caught.getMessage(), caught.getMessage().contains("is not allowed"));
    }
    @Test
    public void testApplicationWithCustomNamespaceImplementsTemplateWithPrivilegedNamespaceAccessGlobal() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component isTemplate='true' access='Global'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testcomponent", NamespaceAccess.PRIVILEGED);
        //create application with above component in markup
        String source = "<aura:application template='" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "'/>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testapplication", NamespaceAccess.CUSTOM);
        definitionService.getDefinition(descriptor);
    }
    @Test
    public void testApplicationWithCustomNamespaceImplementsTemplateWithPrivilegedNamespaceAccessPrivileged() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component isTemplate='true' access='Privileged'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testcomponent", NamespaceAccess.PRIVILEGED);
        //create application with above component in markup
        String source = "<aura:application template='" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "'/>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testapplication", NamespaceAccess.CUSTOM);

        Exception caught = null;
        try {
            definitionService.getDefinition(descriptor);
        } catch (NoAccessException e) {
            caught = e;
        }
        assertNotNull("Template from a privileged namespace cannot be used in custom namespace with Privileged access", caught);
        // missing message
        assertTrue("got unexpected error message:"+caught.getMessage(), caught.getMessage().contains("is not allowed"));
    }
    
    
    
    /**
     * access to template in a system namespace
     * we can have template with access='Privileged' in system namespace
     */
    @Test
    public void testApplicationWithSystemNamespaceImplementsTemplateWithSameSystemNamespace() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component isTemplate='true'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponent", NamespaceAccess.INTERNAL);
        //create application with above component in markup
        String source = "<aura:application template='" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "'/>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testapplication", NamespaceAccess.INTERNAL);
        definitionService.getDefinition(descriptor);
    }
    @Test
    public void testApplicationWithSystemNamespaceImplementsTemplateWithSameSystemNamespaceAccessGlobal() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component isTemplate='true' access='GLOBAL'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponent", NamespaceAccess.INTERNAL);
        //create application with above component in markup
        String source = "<aura:application template='" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "'/>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testapplication", NamespaceAccess.INTERNAL);
        definitionService.getDefinition(descriptor);
    }
    @Test
    public void testApplicationWithSystemNamespaceImplementsTemplateWithSameSystemNamespaceAccessPublic() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component isTemplate='true' access='PUBLIC'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponent", NamespaceAccess.INTERNAL);
        //create application with above component in markup
        String source = "<aura:application template='" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "'/>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testapplication", NamespaceAccess.INTERNAL);
        definitionService.getDefinition(descriptor);
    }
    @Test
    public void testApplicationWithSystemNamespaceImplementsTemplateWithSameSystemNamespaceAccessInternal() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component isTemplate='true' access='INTERNAL'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponent", NamespaceAccess.INTERNAL);
        //create application with above component in markup
        String source = "<aura:application template='" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "'/>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testapplication", NamespaceAccess.INTERNAL);
        definitionService.getDefinition(descriptor);
    }
    @Test
    public void testApplicationWithSystemNamespaceImplementsTemplateWithSameSystemNamespaceAccessPrivileged() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component isTemplate='true' access='Privileged'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponent", NamespaceAccess.INTERNAL);
        //create application with above component in markup
        String source = "<aura:application template='" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "'/>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testapplication", NamespaceAccess.INTERNAL);
        definitionService.getDefinition(descriptor);
    }
    
    
    
    @Test
    public void testApplicationWithSystemNamespaceImplementsTemplateWithOtherSystemNamespace() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component isTemplate='true'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponent", NamespaceAccess.INTERNAL);
        //create application with above component in markup
        String source = "<aura:application template='" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "'/>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.OTHER_NAMESPACE + ":testapplication", NamespaceAccess.INTERNAL);
        definitionService.getDefinition(descriptor);
    }
    @Test
    public void testApplicationWithSystemNamespaceImplementsTemplateWithOtherSystemNamespaceAccessGlobal() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component isTemplate='true' access='GLOBAL'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponent", NamespaceAccess.INTERNAL);
        //create application with above component in markup
        String source = "<aura:application template='" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "'/>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.OTHER_NAMESPACE + ":testapplication", NamespaceAccess.INTERNAL);
        definitionService.getDefinition(descriptor);
    }
    @Test
    public void testApplicationWithSystemNamespaceImplementsTemplateWithOtherSystemNamespaceAccessPublic() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component isTemplate='true' access='PUBLIC'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponent", NamespaceAccess.INTERNAL);
        //create application with above component in markup
        String source = "<aura:application template='" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "'/>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.OTHER_NAMESPACE + ":testapplication", NamespaceAccess.INTERNAL);
        definitionService.getDefinition(descriptor);
    }
    @Test
    public void testApplicationWithSystemNamespaceImplementsTemplateWithOtherSystemNamespaceInternal() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component isTemplate='true' access='INTERNAL'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponent", NamespaceAccess.INTERNAL);
        //create application with above component in markup
        String source = "<aura:application template='" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "'/>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.OTHER_NAMESPACE + ":testapplication", NamespaceAccess.INTERNAL);
        definitionService.getDefinition(descriptor);
    }
    @Test
    public void testApplicationWithSystemNamespaceImplementsTemplateWithOtherSystemNamespacePrivileged() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component isTemplate='true' access='Privileged'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponent", NamespaceAccess.INTERNAL);
        //create application with above component in markup
        String source = "<aura:application template='" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "'/>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.OTHER_NAMESPACE + ":testapplication", NamespaceAccess.INTERNAL);
        definitionService.getDefinition(descriptor);
    }
    
    @Test
    public void testApplicationWithPrivilegedNamespaceImplementsTemplateWithSystemNamespace() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component isTemplate='true'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponent", NamespaceAccess.INTERNAL);
        //create application with above component in markup
        String source = "<aura:application template='" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "'/>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testapplication", NamespaceAccess.PRIVILEGED);

        Exception caught = null;
        try {
            definitionService.getDefinition(descriptor);
        } catch (NoAccessException e) {
            caught = e;
        }
        assertNotNull("Template from a privileged namespace cannot be used in privileged namespace with default access", caught);
        // missing message
        assertTrue("got unexpected error message:"+caught.getMessage(), caught.getMessage().contains("is not allowed"));
    }

    @Test
    public void testApplicationWithPrivilegedNamespaceImplementsTemplateWithSystemNamespaceAccessPublic() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component isTemplate='true' access='Public'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponent", NamespaceAccess.INTERNAL);
        //create application with above component in markup
        String source = "<aura:application template='" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "'/>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testapplication", NamespaceAccess.PRIVILEGED);

        Exception caught = null;
        try {
            definitionService.getDefinition(descriptor);
        } catch (NoAccessException e) {
            caught = e;
        }
        assertNotNull("Template from a privileged namespace cannot be used in privileged namespace with public access", caught);
        // missing message
        assertTrue("got unexpected error message:"+caught.getMessage(), caught.getMessage().contains("is not allowed"));
    }
    @Test
    public void testApplicationWithPrivilegedNamespaceImplementsTemplateWithSystemNamespaceAccessGlobal() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component isTemplate='true' access='Global'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponent", NamespaceAccess.INTERNAL);
        //create application with above component in markup
        String source = "<aura:application template='" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "'/>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testapplication", NamespaceAccess.PRIVILEGED);
        definitionService.getDefinition(descriptor);
    }

    @Test
    public void testApplicationWithPrivilegedNamespaceImplementsTemplateWithSystemNamespaceAccessInternal() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component isTemplate='true' access='Internal'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponent", NamespaceAccess.INTERNAL);
        //create application with above component in markup
        String source = "<aura:application template='" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "'/>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testapplication", NamespaceAccess.PRIVILEGED);

        Exception caught = null;
        try {
            definitionService.getDefinition(descriptor);
        } catch (NoAccessException e) {
            caught = e;
        }
        assertNotNull("Template from a privileged namespace cannot be used in privileged namespace with internal access", caught);
        // missing message
        assertTrue("got unexpected error message:"+caught.getMessage(), caught.getMessage().contains("is not allowed"));
    }
    @Test
    public void testApplicationWithPrivilegedNamespaceImplementsTemplateWithSystemNamespaceAccessPrivileged() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component isTemplate='true' access='Privileged'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponent", NamespaceAccess.INTERNAL);
        //create application with above component in markup
        String source = "<aura:application template='" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "'/>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testapplication", NamespaceAccess.PRIVILEGED);
        definitionService.getDefinition(descriptor);
    }
    
    
    @Test
    public void testApplicationWithCustomNamespaceImplementsTemplateWithSystemNamespace() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component isTemplate='true'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponent", NamespaceAccess.INTERNAL);
        //create application with above component in markup
        String source = "<aura:application template='" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "'/>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testapplication", NamespaceAccess.CUSTOM);

        Exception caught = null;
        try {
            definitionService.getDefinition(descriptor);
        } catch (NoAccessException e) {
            caught = e;
        }
        assertNotNull("Template from a system namespace cannot be used in custom namespace with default access", caught);
        // missing message
        assertTrue("got unexpected error message:"+caught.getMessage(), caught.getMessage().contains("is not allowed"));
    }
    @Test
    public void testApplicationWithCustomNamespaceImplementsTemplateWithSystemNamespaceAccessPublic() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component isTemplate='true' access='Public'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponent", NamespaceAccess.INTERNAL);
        //create application with above component in markup
        String source = "<aura:application template='" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "'/>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testapplication", NamespaceAccess.CUSTOM);

        Exception caught = null;
        try {
            definitionService.getDefinition(descriptor);
        } catch (NoAccessException e) {
            caught = e;
        }
        assertNotNull("Template from a system namespace cannot be used in custom namespace with Public access", caught);
        // missing message
        assertTrue("got unexpected error message:"+caught.getMessage(), caught.getMessage().contains("is not allowed"));
    }
    @Test
    public void testApplicationWithCustomNamespaceImplementsTemplateWithSystemNamespaceAccessGlobal() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component isTemplate='true' access='GLOBAL'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponent", NamespaceAccess.INTERNAL);
        //create application with above component in markup
        String source = "<aura:application template='" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "'/>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testapplication", NamespaceAccess.CUSTOM);
        definitionService.getDefinition(descriptor);
    }
    @Test
    public void testApplicationWithCustomNamespaceImplementsTemplateWithSystemNamespaceAccessInternal() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component isTemplate='true' access='Internal'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponent", NamespaceAccess.INTERNAL);
        //create application with above component in markup
        String source = "<aura:application template='" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "'/>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testapplication", NamespaceAccess.CUSTOM);

        Exception caught = null;
        try {
            definitionService.getDefinition(descriptor);
        } catch (NoAccessException e) {
            caught = e;
        }
        assertNotNull("Template from a system namespace cannot be used in custom namespace with internal access", caught);
        // missing message
        assertTrue("got unexpected error message:"+caught.getMessage(), caught.getMessage().contains("is not allowed"));
    }
    @Test
    public void testApplicationWithCustomNamespaceImplementsTemplateWithSystemNamespaceAccessPrivileged() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component isTemplate='true' access='Privileged'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponent", NamespaceAccess.INTERNAL);
        //create application with above component in markup
        String source = "<aura:application template='" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "'/>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testapplication", NamespaceAccess.CUSTOM);

        Exception caught = null;
        try {
            definitionService.getDefinition(descriptor);
        } catch (NoAccessException e) {
            caught = e;
        }
        assertNotNull("Template from a system namespace cannot be used in custom namespace with privileged access", caught);
        // missing message
        assertTrue("got unexpected error message:"+caught.getMessage(), caught.getMessage().contains("is not allowed"));
    }
    
    
   
    

   

    /**
     * Tests around include another component in your markup start
     */
    /**
     * component in custom namespace cannot have access='Privileged'
     */
    /**
     * Default access tests
     */
    @Test
    public void testApplicationWithPrivilegedNamespaceIncludeComponentWithSamePrivilegedNamespaceInMarkup() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component extensible='true'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testcomponent", NamespaceAccess.PRIVILEGED);
        //create application with above component in markup
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "/> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testapplication", NamespaceAccess.PRIVILEGED);
        definitionService.getDefinition(descriptor);
    }

    @Test
    public void testApplicationWithPrivilegedNamespaceIncludeComponentWithOtherPrivilegedNamespaceInMarkup() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component extensible='true'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testcomponent", NamespaceAccess.PRIVILEGED);
        //create application with above component in markup
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "/> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.OTHER_PRIVILEGED_NAMESPACE + ":testapplication", NamespaceAccess.PRIVILEGED);

        Exception caught = null;
        try {
            definitionService.getDefinition(descriptor);
        } catch(Exception e) {
            caught = e;
        }
        assertNotNull("component of a privileged namespace shouldn't be able to include component of another privileged namespace", caught);
        // missing message
        assertTrue("got unexpected error message:"+caught.getMessage(), caught.getMessage().contains("is not allowed"));
    }

    @Test
    public void testApplicationWithPrivilegedNamespaceIncludeComponentWithSystemNamespaceInMarkup() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component extensible='true'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponent", NamespaceAccess.INTERNAL);
        //create application with above component in markup
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "/> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testapplication", NamespaceAccess.PRIVILEGED);

        Exception caught = null;
        try {
            definitionService.getDefinition(descriptor);
        } catch(Exception e) {
            caught = e;
        }
        assertNotNull("component of a privileged namespace shouldn't be able to include component of a system namespace", caught);
        //Access to component 'string:testcomponent1' from namespace 'privilegedNS' in 'markup://privilegedNS:testapplication2(APPLICATION)' is not allowed
        assertTrue("got unexpected error message:"+caught.getMessage(), caught.getMessage().contains("is not allowed"));
    }

    @Test
    public void testApplicationWithPrivilegedNamespaceIncludeComponentWithSystemNamespaceInMarkupAccessInternal() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component extensible='true' access='Internal'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponent", NamespaceAccess.INTERNAL);
        //create application with above component in markup
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "/> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testapplication", NamespaceAccess.PRIVILEGED);

        Exception caught = null;
        try {
            definitionService.getDefinition(descriptor);
        } catch(Exception e) {
            caught = e;
        }
        assertNotNull("component of a privileged namespace shouldn't be able to include component of a system namespace", caught);
        //Access to component 'string:testcomponent1' from namespace 'privilegedNS' in 'markup://privilegedNS:testapplication2(APPLICATION)' is not allowed
        assertTrue("got unexpected error message:"+caught.getMessage(), caught.getMessage().contains("is not allowed"));
    }

    @Test
    public void testApplicationWithPrivilegedNamespaceIncludeComponentWithCustomNamespaceInMarkup() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component extensible='true'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponent", NamespaceAccess.CUSTOM);
        //create application with above component in markup
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "/> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testapplication", NamespaceAccess.PRIVILEGED);

        Exception caught = null;
        try {
            definitionService.getDefinition(descriptor);
        } catch(Exception e) {
            caught = e;
        }
        assertNotNull("component of a privileged namespace shouldn't be able to include component of a custom namespace", caught);
        //Access to component 'cstring:testcomponent1' from namespace 'privilegedNS' in 'markup://privilegedNS:testapplication2(APPLICATION)' is not allowed
        assertTrue("got unexpected error message:"+caught.getMessage(), caught.getMessage().contains("is not allowed"));
    }
    
    
    @Test
    public void testApplicationWithSystemNamespaceIncludeComponentWithSameSystemNamespaceInMarkup() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component extensible='true'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponent", NamespaceAccess.INTERNAL);
        //create application with above component in markup
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "/> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testapplication", NamespaceAccess.INTERNAL);
        definitionService.getDefinition(descriptor);
    }
    @Test
    public void testApplicationWithSystemNamespaceIncludeComponentWithOtherSystemNamespaceInMarkup() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component extensible='true'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.OTHER_NAMESPACE + ":testcomponent", NamespaceAccess.INTERNAL);
        //create application with above component in markup
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "/> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testapplication", NamespaceAccess.INTERNAL);
        definitionService.getDefinition(descriptor);
    }
    @Test
    public void testApplicationWithSystemNamespaceIncludeComponentWithCustomNamespaceInMarkup() throws QuickFixException {
        //create component with custom namespace
        String cmpSource = "<aura:component extensible='true'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponent", NamespaceAccess.CUSTOM);
        //create application with above component in markup
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "/> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testapplication", NamespaceAccess.INTERNAL);
        definitionService.getDefinition(descriptor);
    }
    @Test
    public void testApplicationWithSystemNamespaceIncludeComponentWithPrivilegedNamespaceInMarkup() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component extensible='true'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testcomponent", NamespaceAccess.PRIVILEGED);
        //create application with above component in markup
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "/> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testapplication", NamespaceAccess.INTERNAL);
        definitionService.getDefinition(descriptor);
    }
    
    @Test
    public void testApplicationWithCustomNamespaceIncludeComponentWithSystemNamespaceInMarkup() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component extensible='true'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.OTHER_NAMESPACE + ":testcomponent", NamespaceAccess.INTERNAL);
        //create application with above component in markup
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "/> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testapplication", NamespaceAccess.CUSTOM);

        Exception caught = null;
        try {
            definitionService.getDefinition(descriptor);
        } catch(Exception e) {
            caught = e;
        }
        assertNotNull("component of a custom namespace shouldn't be able to include component of a system namespace", caught);
        //Access to component 'string1:testcomponent1' from namespace 'cstring' in 'markup://cstring:testapplication2(APPLICATION)' is not allowed
        assertTrue("got unexpected error message:"+caught.getMessage(), caught.getMessage().contains("is not allowed"));
    }
    @Test
    public void testApplicationWithCustomNamespaceIncludeComponentWithSameCustomNamespaceInMarkup() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component extensible='true'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponent", NamespaceAccess.CUSTOM);
        //create application with above component in markup
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "/> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testapplication", NamespaceAccess.CUSTOM);
        definitionService.getDefinition(descriptor);
    }
    @Test
    public void testApplicationWithCustomNamespaceIncludeComponentWithAnotherCustomNamespaceInMarkup() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component extensible='true'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponent", NamespaceAccess.CUSTOM);
        //create application with above component in markup
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "/> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.OTHER_CUSTOM_NAMESPACE + ":testapplication", NamespaceAccess.CUSTOM);

        Exception caught = null;
        try {
            definitionService.getDefinition(descriptor);
        } catch(Exception e) {
            caught = e;
        }
        assertNotNull("component of a custom namespace shouldn't be able to include component of another custom namespace", caught);
        //Access to component 'cstring:testcomponent1' from namespace 'cstring1' in 'markup://cstring1:testapplication2(APPLICATION)' is not allowed
        assertTrue("got unexpected error message:"+caught.getMessage(), caught.getMessage().contains("is not allowed"));
    }
    @Test
    public void testApplicationWithCustomNamespaceIncludeComponentWithPrivilegedNamespaceInMarkup() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component extensible='true'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testcomponent", NamespaceAccess.PRIVILEGED);
        //create application with above component in markup
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "/> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testapplication", NamespaceAccess.CUSTOM);

        Exception caught = null;
        try {
            definitionService.getDefinition(descriptor);
        } catch(Exception e) {
            caught = e;
        }
        assertNotNull("component of a custom namespace shouldn't be able to include component of a privileged namespace", caught);
        //Access to component 'privilegedNS:testcomponent1' from namespace 'cstring' in 'markup://cstring:testapplication2(APPLICATION)' is not allowed
        assertTrue("got unexpected error message:"+caught.getMessage(), caught.getMessage().contains("is not allowed"));
    }
    
    
    /**
     * Public access tests
     */
    @Test
    public void testApplicationWithPrivilegedNamespaceIncludeComponentWithSamePrivilegedNamespaceInMarkupAccessPublic() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component extensible='true' access='Public'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testcomponent", NamespaceAccess.PRIVILEGED);
        //create application with above component in markup
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "/> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testapplication", NamespaceAccess.PRIVILEGED);
        definitionService.getDefinition(descriptor);
    }

    @Test
    public void testApplicationWithPrivilegedNamespaceIncludeComponentWithOtherPrivilegedNamespaceInMarkupAccessPublic() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component extensible='true' access='Public'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testcomponent", NamespaceAccess.PRIVILEGED);
        //create application with above component in markup
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "/> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.OTHER_PRIVILEGED_NAMESPACE + ":testapplication", NamespaceAccess.PRIVILEGED);

        Exception caught = null;
        try {
            definitionService.getDefinition(descriptor);
        } catch(Exception e) {
            caught = e;
        }
        assertNotNull("component of a privileged namespace shouldn't be able to include component of another privileged namespace", caught);
        // missing message
        assertTrue("got unexpected error message:"+caught.getMessage(), caught.getMessage().contains("is not allowed"));
    }

    @Test
    public void testApplicationWithPrivilegedNamespaceIncludeComponentWithSystemNamespaceInMarkupAccessPublic() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component extensible='true' access='Public'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponent", NamespaceAccess.INTERNAL);
        //create application with above component in markup
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "/> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testapplication", NamespaceAccess.PRIVILEGED);

        Exception caught = null;
        try {
            definitionService.getDefinition(descriptor);
        } catch(Exception e) {
            caught = e;
        }
        assertNotNull("component of a privileged namespace shouldn't be able to include component of a system namespace", caught);
        //Access to component 'string:testcomponent1' from namespace 'privilegedNS' in 'markup://privilegedNS:testapplication2(APPLICATION)' is not allowed
        assertTrue("got unexpected error message:"+caught.getMessage(), caught.getMessage().contains("is not allowed"));
    }

    @Test
    public void testApplicationWithPrivilegedNamespaceIncludeComponentWithCustomNamespaceInMarkupAccessPublic() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component extensible='true' access='Public'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponent", NamespaceAccess.CUSTOM);
        //create application with above component in markup
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "/> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testapplication", NamespaceAccess.PRIVILEGED);

        Exception caught = null;
        try {
            definitionService.getDefinition(descriptor);
        } catch(Exception e) {
            caught = e;
        }
        assertNotNull("component of a privileged namespace shouldn't be able to include component of a custom namespace", caught);
        //Access to component 'cstring:testcomponent1' from namespace 'privilegedNS' in 'markup://privilegedNS:testapplication2(APPLICATION)' is not allowed
        assertTrue("got unexpected error message:"+caught.getMessage(), caught.getMessage().contains("is not allowed"));
    }
    
    
    @Test
    public void testApplicationWithSystemNamespaceIncludeComponentWithSameSystemNamespaceInMarkupAccessPublic() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component extensible='true' access='Public'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponent", NamespaceAccess.INTERNAL);
        //create application with above component in markup
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "/> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testapplication", NamespaceAccess.INTERNAL);
        definitionService.getDefinition(descriptor);
    }
    @Test
    public void testApplicationWithSystemNamespaceIncludeComponentWithOtherSystemNamespaceInMarkupAccessPublic() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component extensible='true' access='Public'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.OTHER_NAMESPACE + ":testcomponent", NamespaceAccess.INTERNAL);
        //create application with above component in markup
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "/> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testapplication", NamespaceAccess.INTERNAL);
        definitionService.getDefinition(descriptor);
    }
    @Test
    public void testApplicationWithSystemNamespaceIncludeComponentWithCustomNamespaceInMarkupAccessPublic() throws QuickFixException {
        //create component with custom namespace
        String cmpSource = "<aura:component extensible='true' access='Public'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponent", NamespaceAccess.CUSTOM);
        //create application with above component in markup
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "/> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testapplication", NamespaceAccess.INTERNAL);
        definitionService.getDefinition(descriptor);
    }
    @Test
    public void testApplicationWithSystemNamespaceIncludeComponentWithPrivilegedNamespaceInMarkupAccessPublic() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component extensible='true' access='Public'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testcomponent", NamespaceAccess.PRIVILEGED);
        //create application with above component in markup
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "/> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testapplication", NamespaceAccess.INTERNAL);
        definitionService.getDefinition(descriptor);
    }
    
    @Test
    public void testApplicationWithCustomNamespaceIncludeComponentWithSystemNamespaceInMarkupAccessPublic() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component extensible='true' access='Public'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.OTHER_NAMESPACE + ":testcomponent", NamespaceAccess.INTERNAL);
        //create application with above component in markup
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "/> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testapplication", NamespaceAccess.CUSTOM);

        Exception caught = null;
        try {
            definitionService.getDefinition(descriptor);
        } catch(Exception e) {
            caught = e;
        }
        assertNotNull("component of a custom namespace shouldn't be able to include component of a system namespace", caught);
        //Access to component 'string1:testcomponent1' from namespace 'cstring' in 'markup://cstring:testapplication2(APPLICATION)' is not allowed
        assertTrue("got unexpected error message:"+caught.getMessage(), caught.getMessage().contains("is not allowed"));
    }
    @Test
    public void testApplicationWithCustomNamespaceIncludeComponentWithSameCustomNamespaceInMarkupAccessPublic() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component extensible='true' access='Public'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponent", NamespaceAccess.CUSTOM);
        //create application with above component in markup
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "/> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testapplication", NamespaceAccess.CUSTOM);
        definitionService.getDefinition(descriptor);
    }
    @Test
    public void testApplicationWithCustomNamespaceIncludeComponentWithAnotherCustomNamespaceInMarkupAccessPublic() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component extensible='true' access='Public'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponent", NamespaceAccess.CUSTOM);
        //create application with above component in markup
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "/> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.OTHER_CUSTOM_NAMESPACE + ":testapplication", NamespaceAccess.CUSTOM);

        Exception caught = null;
        try {
            definitionService.getDefinition(descriptor);
        } catch(Exception e) {
            caught = e;
        }
        assertNotNull("component of a custom namespace shouldn't be able to include component of another custom namespace", caught);
        //Access to component 'cstring:testcomponent1' from namespace 'cstring1' in 'markup://cstring1:testapplication2(APPLICATION)' is not allowed
        assertTrue("got unexpected error message:"+caught.getMessage(), caught.getMessage().contains("is not allowed"));
    }
    @Test
    public void testApplicationWithCustomNamespaceIncludeComponentWithPrivilegedNamespaceInMarkupAccessPublic() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component extensible='true' access='Public'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testcomponent", NamespaceAccess.PRIVILEGED);
        //create application with above component in markup
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "/> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testapplication", NamespaceAccess.CUSTOM);

        Exception caught = null;
        try {
            definitionService.getDefinition(descriptor);
        } catch(Exception e) {
            caught = e;
        }
        assertNotNull("component of a custom namespace shouldn't be able to include component of a privileged namespace", caught);
        //Access to component 'privilegedNS:testcomponent1' from namespace 'cstring' in 'markup://cstring:testapplication2(APPLICATION)' is not allowed
        assertTrue("got unexpected error message:"+caught.getMessage(), caught.getMessage().contains("is not allowed"));
    }
    
    /**
     * Privileged access tests
     */
    @Test
    public void testApplicationWithPrivilegedNamespaceIncludeComponentWithSamePrivilegedNamespaceInMarkupAccessPrivileged() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component extensible='true' access='Privileged'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testcomponent", NamespaceAccess.PRIVILEGED);
        //create application with above component in markup
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "/> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testapplication", NamespaceAccess.PRIVILEGED);
        definitionService.getDefinition(descriptor);
    }

    @Test
    public void testApplicationWithPrivilegedNamespaceIncludeComponentWithOtherPrivilegedNamespaceInMarkupAccessPrivileged() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component extensible='true' access='Privileged'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testcomponent", NamespaceAccess.PRIVILEGED);
        //create application with above component in markup
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "/> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.OTHER_PRIVILEGED_NAMESPACE + ":testapplication", NamespaceAccess.PRIVILEGED);
        definitionService.getDefinition(descriptor);
    }

    @Test
    public void testApplicationWithPrivilegedNamespaceIncludeComponentWithSystemNamespaceInMarkupAccessPrivileged() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component extensible='true' access='Privileged'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponent", NamespaceAccess.INTERNAL);
        //create application with above component in markup
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "/> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testapplication", NamespaceAccess.PRIVILEGED);
        definitionService.getDefinition(descriptor);
    }
    
    
    @Test
    public void testApplicationWithSystemNamespaceIncludeComponentWithSameSystemNamespaceInMarkupAccessPrivileged() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component extensible='true' access='Privileged'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponent", NamespaceAccess.INTERNAL);
        //create application with above component in markup
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "/> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testapplication", NamespaceAccess.INTERNAL);
        definitionService.getDefinition(descriptor);
    }
    @Test
    public void testApplicationWithSystemNamespaceIncludeComponentWithOtherSystemNamespaceInMarkupAccessPrivileged() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component extensible='true' access='Privileged'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.OTHER_NAMESPACE + ":testcomponent", NamespaceAccess.INTERNAL);
        //create application with above component in markup
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "/> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testapplication", NamespaceAccess.INTERNAL);
        definitionService.getDefinition(descriptor);
    }
    @Test
    public void testApplicationWithSystemNamespaceIncludeComponentWithPrivilegedNamespaceInMarkupAccessPrivileged() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component extensible='true' access='Privileged'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testcomponent", NamespaceAccess.PRIVILEGED);
        //create application with above component in markup
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "/> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testapplication", NamespaceAccess.INTERNAL);
        definitionService.getDefinition(descriptor);
    }
    
    @Test
    public void testApplicationWithCustomNamespaceIncludeComponentWithSystemNamespaceInMarkupAccessPrivileged() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component extensible='true' access='Privileged'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.OTHER_NAMESPACE + ":testcomponent", NamespaceAccess.INTERNAL);
        //create application with above component in markup
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "/> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testapplication", NamespaceAccess.CUSTOM);

        Exception caught = null;
        try {
            definitionService.getDefinition(descriptor);
        } catch(Exception e) {
            caught = e;
        }
        assertNotNull("component of a custom namespace shouldn't be able to include component of a system namespace", caught);
        //Access to component 'string1:testcomponent1' from namespace 'cstring' in 'markup://cstring:testapplication2(APPLICATION)' is not allowed
        assertTrue("got unexpected error message:"+caught.getMessage(), caught.getMessage().contains("is not allowed"));
    }

    @Test
    public void testApplicationWithCustomNamespaceIncludeComponentWithAnotherCustomNamespace() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component extensible='true'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponent", NamespaceAccess.CUSTOM);
        //create application with above component in markup
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "/> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.OTHER_CUSTOM_NAMESPACE + ":testapplication", NamespaceAccess.CUSTOM);

        Exception caught = null;
        try {
            definitionService.getDefinition(descriptor);
        } catch(Exception e) {
            caught = e;
        }
        assertNotNull("component of a custom namespace shouldn't be able to include component of another custom namespace", caught);
        //Access to component 'cstring:testcomponent1' from namespace 'cstring1' in 'markup://cstring1:testapplication2(APPLICATION)' is not allowed
        assertTrue("got unexpected error message:"+caught.getMessage(), caught.getMessage().contains("is not allowed"));
    }
    @Test
    public void testApplicationWithCustomNamespaceIncludeComponentWithPrivilegedNamespaceInMarkupAccessPrivileged() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component extensible='true' access='Privileged'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testcomponent", NamespaceAccess.PRIVILEGED);
        //create application with above component in markup
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "/> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testapplication", NamespaceAccess.CUSTOM);

        Exception caught = null;
        try {
            definitionService.getDefinition(descriptor);
        } catch(Exception e) {
            caught = e;
        }
        assertNotNull("component of a custom namespace shouldn't be able to include component of a privileged namespace", caught);
        //Access to component 'privilegedNS:testcomponent1' from namespace 'cstring' in 'markup://cstring:testapplication2(APPLICATION)' is not allowed
        assertTrue("got unexpected error message:"+caught.getMessage(), caught.getMessage().contains("is not allowed"));
    }
    
    /**
     * Global access tests
     */
    @Test
    public void testApplicationWithPrivilegedNamespaceIncludeComponentWithSamePrivilegedNamespaceInMarkupAccessGlobal() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component extensible='true' access='Global'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testcomponent", NamespaceAccess.PRIVILEGED);
        //create application with above component in markup
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "/> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testapplication", NamespaceAccess.PRIVILEGED);
        definitionService.getDefinition(descriptor);
    }

    @Test
    public void testApplicationWithPrivilegedNamespaceIncludeComponentWithOtherPrivilegedNamespaceInMarkupAccessGlobal() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component extensible='true' access='Global'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testcomponent", NamespaceAccess.PRIVILEGED);
        //create application with above component in markup
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "/> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.OTHER_PRIVILEGED_NAMESPACE + ":testapplication", NamespaceAccess.PRIVILEGED);
        definitionService.getDefinition(descriptor);
    }

    @Test
    public void testApplicationWithPrivilegedNamespaceIncludeComponentWithSystemNamespaceInMarkupAccessGlobal() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component extensible='true' access='Global'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponent", NamespaceAccess.INTERNAL);
        //create application with above component in markup
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "/> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testapplication", NamespaceAccess.PRIVILEGED);
        definitionService.getDefinition(descriptor);
    }
    
    
    @Test
    public void testApplicationWithSystemNamespaceIncludeComponentWithSameSystemNamespaceInMarkupAccessGlobal() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component extensible='true' access='Global'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponent", NamespaceAccess.INTERNAL);
        //create application with above component in markup
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "/> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testapplication", NamespaceAccess.INTERNAL);
        definitionService.getDefinition(descriptor);
    }
    @Test
    public void testApplicationWithSystemNamespaceIncludeComponentWithOtherSystemNamespaceInMarkupAccessGlobal() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component extensible='true' access='Global'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.OTHER_NAMESPACE + ":testcomponent", NamespaceAccess.INTERNAL);
        //create application with above component in markup
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "/> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testapplication", NamespaceAccess.INTERNAL);
        definitionService.getDefinition(descriptor);
    }
    @Test
    public void testApplicationWithSystemNamespaceIncludeComponentWithPrivilegedNamespaceInMarkupAccessGlobal() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component extensible='true' access='Global'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testcomponent", NamespaceAccess.PRIVILEGED);
        //create application with above component in markup
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "/> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testapplication", NamespaceAccess.INTERNAL);
        definitionService.getDefinition(descriptor);
    }
    
    @Test
    public void testApplicationWithCustomNamespaceIncludeComponentWithSystemNamespaceInMarkupAccessGlobal() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component extensible='true' access='Global'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.OTHER_NAMESPACE + ":testcomponent", NamespaceAccess.INTERNAL);
        //create application with above component in markup
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "/> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testapplication", NamespaceAccess.CUSTOM);
            definitionService.getDefinition(descriptor);
    }
    @Test
    public void testApplicationWithCustomNamespaceIncludeComponentWithAnotherCustomNamespaceInMarkupAccessGlobal() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component extensible='true' access='Global'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponent", NamespaceAccess.CUSTOM);
        //create application with above component in markup
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "/> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.OTHER_CUSTOM_NAMESPACE + ":testapplication", NamespaceAccess.CUSTOM);
            definitionService.getDefinition(descriptor);
    }
    @Test
    public void testApplicationWithCustomNamespaceIncludeComponentWithPrivilegedNamespaceInMarkupAccessGlobal() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component extensible='true' access='Global'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testcomponent", NamespaceAccess.PRIVILEGED);
        //create application with above component in markup
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "/> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testapplication", NamespaceAccess.CUSTOM);
            definitionService.getDefinition(descriptor);
    }
    
    
    
    
    
    
    /**
     * tests where a component extends another component in markup start
     */
    /**
     * Default access
     */
    @Test
    public void testComponnetWithSystemNamespaceExtendsComponentWithSameSystemNamespace() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component extensible='true'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponent", NamespaceAccess.INTERNAL);
        //create component extends above component
        String source = "<aura:component extends='" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "'/>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponentChild", NamespaceAccess.INTERNAL);
        definitionService.getDefinition(descriptor);
    }
    @Test
    public void testComponentWithSystemNamespaceExtendsComponentWithOtherSystemNamespaceInMarkup() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component extensible='true'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.OTHER_NAMESPACE + ":testcomponent", NamespaceAccess.INTERNAL);
        //create component extends above component
        String source = "<aura:component extends='" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "'/>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponentChild", NamespaceAccess.INTERNAL);
        definitionService.getDefinition(descriptor);
    }
    @Test
    public void testComponentWithSystemNamespaceExtendsComponentWithPrivilegedNamespaceInMarkup() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component extensible='true'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testcomponent", NamespaceAccess.PRIVILEGED);
        //create component extends above component
        String source = "<aura:component extends='" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "'/>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponentChild", NamespaceAccess.INTERNAL);
        definitionService.getDefinition(descriptor);
    }
    @Test
    public void testComponentWithSystemNamespaceExtendsComponentWithCustomNamespaceInMarkup() throws QuickFixException {
        //create component with custom namespace
        String cmpSource = "<aura:component extensible='true'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponent", NamespaceAccess.CUSTOM);
        //create component extends above component
        String source = "<aura:component extends='" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "'/>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponentChild", NamespaceAccess.INTERNAL);
        definitionService.getDefinition(descriptor);
    }
    
    @Test
    public void testComponentWithCustomNamespaceExtendsComponentWithSystemNamespaceInMarkup() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component extensible='true'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.OTHER_NAMESPACE + ":testcomponent", NamespaceAccess.INTERNAL);
        //create component extends above component
        String source = "<aura:component extends='" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "'/>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponentChild", NamespaceAccess.CUSTOM);

        Exception caught = null;
        try {
            definitionService.getDefinition(descriptor);
        } catch(Exception e) {
            caught = e;
        }
        assertNotNull("component of a custom namespace shouldn't be able to extend a a component of a system namespace", caught);
        //Access to component 'string1:testcomponent1' from namespace 'cstring' in 'markup://cstring:testapplication2(APPLICATION)' is not allowed
        assertTrue("got unexpected error message:"+caught.getMessage(), caught.getMessage().contains("is not allowed"));
    }   
    @Test
    public void testComponentWithCustomNamespaceExtendsComponentWithPrivilegedNamespaceInMarkup() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component extensible='true'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testcomponent", NamespaceAccess.PRIVILEGED);
        //create component extends above component
        String source = "<aura:component extends='" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "'/>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponentChild", NamespaceAccess.CUSTOM);

        Exception caught = null;
        try {
            definitionService.getDefinition(descriptor);
        } catch(Exception e) {
            caught = e;
        }
        assertNotNull("component of a custom namespace shouldn't be able to extend a a component of a privileged namespace", caught);
        //Access to component 'string1:testcomponent1' from namespace 'cstring' in 'markup://cstring:testapplication2(APPLICATION)' is not allowed
        assertTrue("got unexpected error message:"+caught.getMessage(), caught.getMessage().contains("is not allowed"));
    } 
    @Test
    public void testComponentWithCustomNamespaceExtendsComponentWithSameCustomNamespaceInMarkup() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component extensible='true'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponent", NamespaceAccess.CUSTOM);
        //create component extends above component
        String source = "<aura:component extends='" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "'/>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponentChild", NamespaceAccess.CUSTOM);
        definitionService.getDefinition(descriptor);
    }
    @Test
    public void testComponentWithCustomNamespaceExtendsComponentWithAnotherCustomNamespaceInMarkup() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component extensible='true'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponent", NamespaceAccess.CUSTOM);
        //create component extends above component
        String source = "<aura:component extends='" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "'/>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.OTHER_CUSTOM_NAMESPACE + ":testcomponentChild", NamespaceAccess.CUSTOM);

        Exception caught = null;
        try {
            definitionService.getDefinition(descriptor);
        } catch(Exception e) {
            caught = e;
        }
        assertNotNull("component of a custom namespace shouldn't be able to extend a component of another custom namespace", caught);
        //Access to component 'cstring:testcomponent1' from namespace 'cstring1' in 'markup://cstring1:testapplication2(APPLICATION)' is not allowed
        assertTrue("got unexpected error message:"+caught.getMessage(), caught.getMessage().contains("is not allowed"));
    }
    
    
    @Test
    public void testComponnetWithPrivilegedNamespaceExtendsComponentWithSystemNamespace() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component extensible='true'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponent", NamespaceAccess.INTERNAL);
        //create component extends above component
        String source = "<aura:component extends='" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "'/>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testcomponentChild", NamespaceAccess.PRIVILEGED);

        Exception caught = null;
        try {
            definitionService.getDefinition(descriptor);
        } catch(Exception e) {
            caught = e;
        }
        assertNotNull("component of a privileged namespace shouldn't be able to extend a component of a system namespace", caught);
        //Access to component 'cstring:testcomponent1' from namespace 'cstring1' in 'markup://cstring1:testapplication2(APPLICATION)' is not allowed
        assertTrue("got unexpected error message:"+caught.getMessage(), caught.getMessage().contains("is not allowed"));
    }

    @Test
    public void testComponnetWithPrivilegedNamespaceExtendsComponentWithSystemNamespaceAccessInternal() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component extensible='true' access='Internal'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponent", NamespaceAccess.INTERNAL);
        //create component extends above component
        String source = "<aura:component extends='" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "'/>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testcomponentChild", NamespaceAccess.PRIVILEGED);

        Exception caught = null;
        try {
            definitionService.getDefinition(descriptor);
        } catch(Exception e) {
            caught = e;
        }
        assertNotNull("component of a privileged namespace shouldn't be able to extend a component of a system namespace", caught);
        //Access to component 'cstring:testcomponent1' from namespace 'cstring1' in 'markup://cstring1:testapplication2(APPLICATION)' is not allowed
        assertTrue("got unexpected error message:"+caught.getMessage(), caught.getMessage().contains("is not allowed"));
    }
    @Test
    public void testComponnetWithPrivilegedNamespaceExtendsComponentWithSamePrivilegedNamespace() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component extensible='true'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testcomponent", NamespaceAccess.PRIVILEGED);
        //create component extends above component
        String source = "<aura:component extends='" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "'/>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testcomponentChild", NamespaceAccess.PRIVILEGED);
        definitionService.getDefinition(descriptor);
    }

    @Test
    public void testComponnetWithPrivilegedNamespaceExtendsComponentWithOtherPrivilegedNamespace() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component extensible='true'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.OTHER_PRIVILEGED_NAMESPACE + ":testcomponent", NamespaceAccess.PRIVILEGED);
        //create component extends above component
        String source = "<aura:component extends='" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "'/>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testcomponentChild", NamespaceAccess.PRIVILEGED);

        Exception caught = null;
        try {
            definitionService.getDefinition(descriptor);
        } catch(Exception e) {
            caught = e;
        }
        assertNotNull("component of a privileged namespace shouldn't be able to extend a component of other privileged namespace", caught);
        //Access to component 'cstring:testcomponent1' from namespace 'cstring1' in 'markup://cstring1:testapplication2(APPLICATION)' is not allowed
        assertTrue("got unexpected error message:"+caught.getMessage(), caught.getMessage().contains("is not allowed"));
    }

    @Test
    public void testComponnetWithPrivilegedNamespaceExtendsComponentWithCustomNamespace() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component extensible='true'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponent", NamespaceAccess.CUSTOM);
        //create component extends above component
        String source = "<aura:component extends='" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "'/>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testcomponentChild", NamespaceAccess.PRIVILEGED);

        Exception caught = null;
        try {
            definitionService.getDefinition(descriptor);
        } catch(Exception e) {
            caught = e;
        }
        assertNotNull("component of a privileged namespace shouldn't be able to extend a component of a custom namespace", caught);
        //Access to component 'cstring:testcomponent1' from namespace 'cstring1' in 'markup://cstring1:testapplication2(APPLICATION)' is not allowed
        assertTrue("got unexpected error message:"+caught.getMessage(), caught.getMessage().contains("is not allowed"));
    }
        
    
    /**
     * Public access tests start
     */
    @Test
    public void testComponnetWithSystemNamespaceExtendsComponentWithSameSystemNamespaceAccessPublic() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component extensible='true' access='PUBLIC'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponent", NamespaceAccess.INTERNAL);
        //create component extends above component
        String source = "<aura:component extends='" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "'/>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponentChild", NamespaceAccess.INTERNAL);
        definitionService.getDefinition(descriptor);
    }
    @Test
    public void testComponentWithSystemNamespaceExtendsComponentWithOtherSystemNamespaceInMarkupAccessPublic() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component extensible='true' access='PUBLIC'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.OTHER_NAMESPACE + ":testcomponent", NamespaceAccess.INTERNAL);
        //create component extends above component
        String source = "<aura:component extends='" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "'/>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponentChild", NamespaceAccess.INTERNAL);
        definitionService.getDefinition(descriptor);
    }
    @Test
    public void testComponentWithSystemNamespaceExtendsComponentWithPrivilegedNamespaceInMarkupAccessPublic() throws QuickFixException {
        //create component with custom namespace
        String cmpSource = "<aura:component extensible='true' access='PUBLIC'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testcomponent", NamespaceAccess.PRIVILEGED);
        //create component extends above component
        String source = "<aura:component extends='" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "'/>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponentChild", NamespaceAccess.INTERNAL);
        definitionService.getDefinition(descriptor);
    }
    @Test
    public void testComponentWithSystemNamespaceExtendsComponentWithCustomNamespaceInMarkupAccessPublic() throws QuickFixException {
        //create component with custom namespace
        String cmpSource = "<aura:component extensible='true' access='PUBLIC'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponent", NamespaceAccess.CUSTOM);
        //create component extends above component
        String source = "<aura:component extends='" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "'/>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponentChild", NamespaceAccess.INTERNAL);
        definitionService.getDefinition(descriptor);
    }
    
    @Test
    public void testComponentWithCustomNamespaceExtendsComponentWithSystemNamespaceInMarkupAccessPublic() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component extensible='true' access='PUBLIC'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.OTHER_NAMESPACE + ":testcomponent", NamespaceAccess.INTERNAL);
        //create component extends above component
        String source = "<aura:component extends='" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "'/>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponentChild", NamespaceAccess.CUSTOM);

        Exception caught = null;
        try {
            definitionService.getDefinition(descriptor);
        } catch(Exception e) {
            caught = e;
        }
        assertNotNull("component of a custom namespace shouldn't be able to include component of a system namespace", caught);
        //Access to component 'string1:testcomponent1' from namespace 'cstring' in 'markup://cstring:testapplication2(APPLICATION)' is not allowed
        assertTrue("got unexpected error message:"+caught.getMessage(), caught.getMessage().contains("is not allowed"));
    }
    @Test
    public void testComponentWithCustomNamespaceExtendsComponentWithPrivilegedNamespaceInMarkupAccessPublic() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component extensible='true' access='PUBLIC'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testcomponent", NamespaceAccess.PRIVILEGED);
        //create component extends above component
        String source = "<aura:component extends='" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "'/>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponentChild", NamespaceAccess.CUSTOM);

        Exception caught = null;
        try {
            definitionService.getDefinition(descriptor);
        } catch(Exception e) {
            caught = e;
        }
        assertNotNull("component of a custom namespace shouldn't be able to include component of a privileged namespace", caught);
        //Access to component 'string1:testcomponent1' from namespace 'cstring' in 'markup://cstring:testapplication2(APPLICATION)' is not allowed
        assertTrue("got unexpected error message:"+caught.getMessage(), caught.getMessage().contains("is not allowed"));
    } 
    @Test
    public void testComponentWithCustomNamespaceExtendsComponentWithSameCustomNamespaceInMarkupAccessPublic() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component extensible='true' access='PUBLIC'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponent", NamespaceAccess.CUSTOM);
        //create component extends above component
        String source = "<aura:component extends='" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "'/>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponentChild", NamespaceAccess.CUSTOM);
        definitionService.getDefinition(descriptor);
    }
    @Test
    public void testComponentWithCustomNamespaceExtendsComponentWithAnotherCustomNamespaceInMarkupAccessPublic() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component extensible='true' access='PUBLIC'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponent", NamespaceAccess.CUSTOM);
        //create component extends above component
        String source = "<aura:component extends='" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "'/>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.OTHER_CUSTOM_NAMESPACE + ":testcomponentChild", NamespaceAccess.CUSTOM);

        Exception caught = null;
        try {
            definitionService.getDefinition(descriptor);
        } catch(Exception e) {
            caught = e;
        }
        assertNotNull("component of a custom namespace shouldn't be able to include component of another custom namespace", caught);
        //Access to component 'cstring:testcomponent1' from namespace 'cstring1' in 'markup://cstring1:testapplication2(APPLICATION)' is not allowed
        assertTrue("got unexpected error message:"+caught.getMessage(), caught.getMessage().contains("is not allowed"));
    }
    
    @Test
    public void testComponnetWithPrivilegedNamespaceExtendsComponentWithSystemNamespaceAccessPublic() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component extensible='true' access='PUBLIC'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponent", NamespaceAccess.INTERNAL);
        //create component extends above component
        String source = "<aura:component extends='" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "'/>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testcomponentChild", NamespaceAccess.PRIVILEGED);

        Exception caught = null;
        try {
            definitionService.getDefinition(descriptor);
        } catch(Exception e) {
            caught = e;
        }
        assertNotNull("component of a privileged namespace shouldn't be able to extend a component of a system namespace", caught);
        //Access to component 'cstring:testcomponent1' from namespace 'cstring1' in 'markup://cstring1:testapplication2(APPLICATION)' is not allowed
        assertTrue("got unexpected error message:"+caught.getMessage(), caught.getMessage().contains("is not allowed"));
    }
    @Test
    public void testComponnetWithPrivilegedNamespaceExtendsComponentWithSamePrivilegedNamespaceAccessPublic() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component extensible='true' access='PUBLIC'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testcomponent", NamespaceAccess.PRIVILEGED);
        //create component extends above component
        String source = "<aura:component extends='" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "'/>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testcomponentChild", NamespaceAccess.PRIVILEGED);
        definitionService.getDefinition(descriptor);
    }

    @Test
    public void testComponnetWithPrivilegedNamespaceExtendsComponentWithOtherPrivilegedNamespaceAccessPublic() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component extensible='true' access='PUBLIC'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.OTHER_PRIVILEGED_NAMESPACE + ":testcomponent", NamespaceAccess.PRIVILEGED);
        //create component extends above component
        String source = "<aura:component extends='" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "'/>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testcomponentChild", NamespaceAccess.PRIVILEGED);

        Exception caught = null;
        try {
            definitionService.getDefinition(descriptor);
        } catch(Exception e) {
            caught = e;
        }
        assertNotNull("component of a privileged namespace shouldn't be able to extend a component of other privileged namespace", caught);
        //Access to component 'cstring:testcomponent1' from namespace 'cstring1' in 'markup://cstring1:testapplication2(APPLICATION)' is not allowed
        assertTrue("got unexpected error message:"+caught.getMessage(), caught.getMessage().contains("is not allowed"));
    }

    @Test
    public void testComponnetWithPrivilegedNamespaceExtendsComponentWithCustomNamespaceAccessPublic() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component extensible='true' access='PUBLIC'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponent", NamespaceAccess.CUSTOM);
        //create component extends above component
        String source = "<aura:component extends='" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "'/>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testcomponentChild", NamespaceAccess.PRIVILEGED);

        Exception caught = null;
        try {
            definitionService.getDefinition(descriptor);
        } catch(Exception e) {
            caught = e;
        }
        assertNotNull("component of a privileged namespace shouldn't be able to extend a component of a custom namespace", caught);
        //Access to component 'cstring:testcomponent1' from namespace 'cstring1' in 'markup://cstring1:testapplication2(APPLICATION)' is not allowed
        assertTrue("got unexpected error message:"+caught.getMessage(), caught.getMessage().contains("is not allowed"));
    }
    
    /**
     * Global access  
     */
    @Test
    public void testComponnetWithSystemNamespaceExtendsComponentWithSameSystemNamespaceAccessGlobal() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component extensible='true' access='Global'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponent", NamespaceAccess.INTERNAL);
        //create component extends above component
        String source = "<aura:component extends='" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "'/>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponentChild", NamespaceAccess.INTERNAL);
        definitionService.getDefinition(descriptor);
    }
    @Test
    public void testComponentWithSystemNamespaceExtendsComponentWithOtherSystemNamespaceInMarkupAccessGlobal() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component extensible='true' access='Global'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.OTHER_NAMESPACE + ":testcomponent", NamespaceAccess.INTERNAL);
        //create component extends above component
        String source = "<aura:component extends='" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "'/>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponentChild", NamespaceAccess.INTERNAL);
        definitionService.getDefinition(descriptor);
    }
    @Test
    public void testComponentWithSystemNamespaceExtendsComponentWithCustomNamespaceInMarkupAccessGlobal() throws QuickFixException {
        //create component with custom namespace
        String cmpSource = "<aura:component extensible='true' access='Global'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponent", NamespaceAccess.CUSTOM);
        //create component extends above component
        String source = "<aura:component extends='" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "'/>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponentChild", NamespaceAccess.INTERNAL);
        definitionService.getDefinition(descriptor);
    }
    
    @Test
    public void testComponentWithCustomNamespaceExtendsComponentWithSystemNamespaceInMarkupAccessGlobal() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component extensible='true' access='Global'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.OTHER_NAMESPACE + ":testcomponent", NamespaceAccess.INTERNAL);
        //create component extends above component
        String source = "<aura:component extends='" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "'/>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponentChild", NamespaceAccess.CUSTOM);
        definitionService.getDefinition(descriptor);
    }  
    @Test
    public void testComponentWithCustomNamespaceExtendsComponentWithSameCustomNamespaceInMarkupAccessGlobal() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component extensible='true' access='Global'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponent", NamespaceAccess.CUSTOM);
        //create component extends above component
        String source = "<aura:component extends='" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "'/>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponentChild", NamespaceAccess.CUSTOM);
        definitionService.getDefinition(descriptor);
    }
    @Test
    public void testComponentWithCustomNamespaceExtendsComponentWithAnotherCustomNamespaceInMarkupAccessGlobal() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component extensible='true' access='Global'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponent", NamespaceAccess.CUSTOM);
        //create component extends above component
        String source = "<aura:component extends='" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "'/>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.OTHER_CUSTOM_NAMESPACE + ":testcomponentChild", NamespaceAccess.CUSTOM);
        definitionService.getDefinition(descriptor);
    }
    
    @Test
    public void testComponnetWithPrivilegedNamespaceExtendsComponentWithSystemNamespaceAccessGlobal() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component extensible='true' access='Global'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponent", NamespaceAccess.INTERNAL);
        //create component extends above component
        String source = "<aura:component extends='" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "'/>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testcomponentChild", NamespaceAccess.PRIVILEGED);
        definitionService.getDefinition(descriptor);
    }
    @Test
    public void testComponnetWithPrivilegedNamespaceExtendsComponentWithSamePrivilegedNamespaceAccessGlobal() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component extensible='true' access='Global'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testcomponent", NamespaceAccess.PRIVILEGED);
        //create component extends above component
        String source = "<aura:component extends='" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "'/>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testcomponentChild", NamespaceAccess.PRIVILEGED);
        definitionService.getDefinition(descriptor);
    }

    @Test
    public void testComponnetWithPrivilegedNamespaceExtendsComponentWithOtherPrivilegedNamespaceAccessGlobal() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component extensible='true' access='Global'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.OTHER_PRIVILEGED_NAMESPACE + ":testcomponent", NamespaceAccess.PRIVILEGED);
        //create component extends above component
        String source = "<aura:component extends='" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "'/>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testcomponentChild", NamespaceAccess.PRIVILEGED);
            definitionService.getDefinition(descriptor);
    }

    @Test
    public void testComponnetWithPrivilegedNamespaceExtendsComponentWithCustomNamespaceAccessGlobal() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component extensible='true' access='Global'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponent", NamespaceAccess.CUSTOM);
        //create component extends above component
        String source = "<aura:component extends='" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "'/>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testcomponentChild", NamespaceAccess.PRIVILEGED);
            definitionService.getDefinition(descriptor);
    }

    @Test
    public void testComponentDependencyWildCardIncludesOnlyAccessibleComponents() throws Exception {
        //create component with custom namespace
        String cmpTemplate = "<aura:component %s/>";

        DefDescriptor<? extends Definition> cmpGlobalDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, String.format(cmpTemplate, "access='Global'"),
                StringSourceLoader.ANOTHER_CUSTOM_NAMESPACE + ":testcomponent", NamespaceAccess.CUSTOM);
        DefDescriptor<? extends Definition> cmpInternalDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, String.format(cmpTemplate, ""),
                StringSourceLoader.ANOTHER_CUSTOM_NAMESPACE + ":testcomponent", NamespaceAccess.CUSTOM);

        //create application with above component in markup
        String source = "<aura:component><aura:dependency resource='markup://" + StringSourceLoader.ANOTHER_CUSTOM_NAMESPACE + ":*'/></aura:component>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcmpwithdependencydeclaration", NamespaceAccess.CUSTOM);

        Definition def = definitionService.getDefinition(descriptor);
        // test is successful because this didn't throw an exception trying to access a non-global component with the wildcard match
        List<DependencyDef> dependencies = ((ComponentDefImpl) def).getDependencies();
        assertEquals("Should have one dependency: " + dependencies, 1, dependencies.size());
    }
}
