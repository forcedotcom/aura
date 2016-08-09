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

import org.auraframework.def.ApplicationDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.test.source.StringSourceLoader;
import org.auraframework.test.source.StringSourceLoader.NamespaceAccess;
import org.auraframework.throwable.NoAccessException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.test.annotation.UnAdaptableTest;
import org.junit.Test;

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
        descriptor.getDef();
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
        descriptor.getDef();
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
        descriptor.getDef();
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
        try {
            descriptor.getDef();
            fail("Template from a custom namespace cannot be used in another custom namespace because their default access is PUBLIC");
        } catch (NoAccessException ignored) {
            // catch NoAccessException only. Anything else fails test.
        }
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
        try {
            descriptor.getDef();
            fail("Template from a custom namespace cannot be used in another custom namespace because their default access is PUBLIC");
        } catch (NoAccessException ignored) {
            // catch NoAccessException only. Anything else fails test.
        }
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
        descriptor.getDef();
    }
    
    
//JBUCH:    @Test
    public void testApplicationWithPrivilegedNamespaceImplementsTemplateWithCustomNamespace() throws QuickFixException {
        //create component with custom namespace
        String cmpSource = "<aura:component isTemplate='true'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponent", NamespaceAccess.CUSTOM);
        //create application with above component in markup
        String source = "<aura:application template='" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "'/>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testapplication", NamespaceAccess.PRIVILEGED);
        try {
        	descriptor.getDef();
            fail("Template from a privileged namespace cannot be used in another custom namespace with default access");
        } catch (NoAccessException ignored) {
            // catch NoAccessException only. Anything else fails test.
        }
    }
//JBUCH:    @Test
    public void testApplicationWithPrivilegedNamespaceImplementsTemplateWithCustomNamespaceAccessPublic() throws QuickFixException {
        //create component with custom namespace
        String cmpSource = "<aura:component isTemplate='true' access='Public'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponent", NamespaceAccess.CUSTOM);
        //create application with above component in markup
        String source = "<aura:application template='" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "'/>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testapplication", NamespaceAccess.PRIVILEGED);
        try {
        	descriptor.getDef();
            fail("Template from a privileged namespace cannot be used in another custom namespace with PUBLIC access");
        } catch (NoAccessException ignored) {
            // catch NoAccessException only. Anything else fails test.
        }
    }
//JBUCH:    @Test
    public void testApplicationWithPrivilegedNamespaceImplementsTemplateWithCustomNamespaceAccessGlobal() throws QuickFixException {
        //create component with custom namespace
        String cmpSource = "<aura:component isTemplate='true' access='Global'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponent", NamespaceAccess.CUSTOM);
        //create application with above component in markup
        String source = "<aura:application template='" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "'/>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testapplication", NamespaceAccess.PRIVILEGED);
        descriptor.getDef();
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
        descriptor.getDef();
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
        descriptor.getDef();
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
        descriptor.getDef();
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
        descriptor.getDef();
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
        descriptor.getDef();
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
        descriptor.getDef();
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
        descriptor.getDef();
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
        descriptor.getDef();
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
        descriptor.getDef();
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
        descriptor.getDef();
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
        descriptor.getDef();
    }
    
    
//JBUCH:    @Test
    public void testApplicationWithPrivilegedNamespaceImplementsTemplateWithOtherPrivilegedNamespace() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component isTemplate='true'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testcomponent", NamespaceAccess.PRIVILEGED);
        //create application with above component in markup
        String source = "<aura:application template='" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "'/>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.OTHER_PRIVILEGED_NAMESPACE + ":testapplication", NamespaceAccess.PRIVILEGED);
        try {
        	descriptor.getDef();
            fail("Template from a privileged namespace cannot be used in another privileged namespace with default access");
        } catch (NoAccessException ignored) {
            // catch NoAccessException only. Anything else fails test.
        }
    }
//JBUCH:    @Test
    public void testApplicationWithPrivilegedNamespaceImplementsTemplateWithOtherPrivilegedNamespaceAccessPublic() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component isTemplate='true' access='Public'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testcomponent", NamespaceAccess.PRIVILEGED);
        //create application with above component in markup
        String source = "<aura:application template='" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "'/>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.OTHER_PRIVILEGED_NAMESPACE + ":testapplication", NamespaceAccess.PRIVILEGED);
        try {
        	descriptor.getDef();
            fail("Template from a privileged namespace cannot be used in another privileged namespace with default access");
        } catch (NoAccessException ignored) {
            // catch NoAccessException only. Anything else fails test.
        }
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
        descriptor.getDef();
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
        descriptor.getDef();
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
        try {
        	descriptor.getDef();
            fail("Template from a privileged namespace cannot be used in custom namespace with default access");
        } catch (NoAccessException ignored) {
            // catch NoAccessException only. Anything else fails test.
        }
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
        try {
        	descriptor.getDef();
            fail("Template from a privileged namespace cannot be used in custom namespace with Public access");
        } catch (NoAccessException ignored) {
            // catch NoAccessException only. Anything else fails test.
        }
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
        descriptor.getDef();
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
        try {
        	descriptor.getDef();
            fail("Template from a privileged namespace cannot be used in custom namespace with Privileged access");
        } catch (NoAccessException ignored) {
            // catch NoAccessException only. Anything else fails test.
        }
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
        descriptor.getDef();
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
        descriptor.getDef();
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
        descriptor.getDef();
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
        descriptor.getDef();
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
        descriptor.getDef();
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
        descriptor.getDef();
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
        descriptor.getDef();
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
        descriptor.getDef();
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
        descriptor.getDef();
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
        descriptor.getDef();
    }
    
    
//JBUCH:    @Test
    public void testApplicationWithPrivilegedNamespaceImplementsTemplateWithSystemNamespace() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component isTemplate='true'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponent", NamespaceAccess.INTERNAL);
        //create application with above component in markup
        String source = "<aura:application template='" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "'/>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testapplication", NamespaceAccess.PRIVILEGED);
        try {
        	descriptor.getDef();
            fail("Template from a privileged namespace cannot be used in privileged namespace with default access");
        } catch (NoAccessException ignored) {
            // catch NoAccessException only. Anything else fails test.
        }
    }
//JBUCH:    @Test
    public void testApplicationWithPrivilegedNamespaceImplementsTemplateWithSystemNamespaceAccessPublic() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component isTemplate='true' access='Public'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponent", NamespaceAccess.INTERNAL);
        //create application with above component in markup
        String source = "<aura:application template='" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "'/>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testapplication", NamespaceAccess.PRIVILEGED);
        try {
        	descriptor.getDef();
            fail("Template from a privileged namespace cannot be used in privileged namespace with public access");
        } catch (NoAccessException ignored) {
            // catch NoAccessException only. Anything else fails test.
        }
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
        descriptor.getDef();
    }
//JBUCH:    @Test
    public void testApplicationWithPrivilegedNamespaceImplementsTemplateWithSystemNamespaceAccessInternal() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component isTemplate='true' access='Internal'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponent", NamespaceAccess.INTERNAL);
        //create application with above component in markup
        String source = "<aura:application template='" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "'/>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testapplication", NamespaceAccess.PRIVILEGED);
        try {
        	descriptor.getDef();
            fail("Template from a privileged namespace cannot be used in privileged namespace with internal access");
        } catch (NoAccessException ignored) {
            // catch NoAccessException only. Anything else fails test.
        }
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
        descriptor.getDef();
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
        try {
        	descriptor.getDef();
            fail("Template from a system namespace cannot be used in custom namespace with default access");
        } catch (NoAccessException ignored) {
            // catch NoAccessException only. Anything else fails test.
        }
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
        try {
        	descriptor.getDef();
            fail("Template from a system namespace cannot be used in custom namespace with Public access");
        } catch (NoAccessException ignored) {
            // catch NoAccessException only. Anything else fails test.
        }
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
        descriptor.getDef();
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
        try {
        	descriptor.getDef();
            fail("Template from a system namespace cannot be used in custom namespace with internal access");
        } catch (NoAccessException ignored) {
            // catch NoAccessException only. Anything else fails test.
        }
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
        try {
        	descriptor.getDef();
            fail("Template from a system namespace cannot be used in custom namespace with privileged access");
        } catch (NoAccessException ignored) {
            // catch NoAccessException only. Anything else fails test.
        }
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
        descriptor.getDef();
    }
//JBUCH:    @Test
    public void testApplicationWithPrivilegedNamespaceIncludeComponentWithOtherPrivilegedNamespaceInMarkup() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component extensible='true'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testcomponent", NamespaceAccess.PRIVILEGED);
        //create application with above component in markup
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "/> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.OTHER_PRIVILEGED_NAMESPACE + ":testapplication", NamespaceAccess.PRIVILEGED);
        try {
        	descriptor.getDef();
         	fail("component of privileged namespace shouldn't be able to include component of another privileged namespace");
        } catch(Exception e) {
        	assertTrue("get unexpected message:"+e.getMessage(), e.getMessage().contains("disallowed by MasterDefRegistry.assertAccess()"));
        	//expect 
    		//System.out.println(e.getMessage());
        }
    }
//JBUCH:    @Test
    public void testApplicationWithPrivilegedNamespaceIncludeComponentWithSystemNamespaceInMarkup() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component extensible='true'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponent", NamespaceAccess.INTERNAL);
        //create application with above component in markup
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "/> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testapplication", NamespaceAccess.PRIVILEGED);
        try {
        	descriptor.getDef();
         	fail("component of privileged namespace shouldn't be able to include component of system namespace");
        } catch(Exception e) {
        	assertTrue("get unexpected message:"+e.getMessage(), e.getMessage().contains("disallowed by MasterDefRegistry.assertAccess()"));
        	//expect 
    		//System.out.println(e.getMessage());
        	//Access to component 'string:testcomponent1' from namespace 'privilegedNS' in 'markup://privilegedNS:testapplication2(APPLICATION)' disallowed by MasterDefRegistry.assertAccess()
        }
    }
//JBUCH:    @Test
    public void testApplicationWithPrivilegedNamespaceIncludeComponentWithSystemNamespaceInMarkupAccessInternal() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component extensible='true' access='Internal'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponent", NamespaceAccess.INTERNAL);
        //create application with above component in markup
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "/> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testapplication", NamespaceAccess.PRIVILEGED);
        try {
        	descriptor.getDef();
        	fail("component of privileged namespace shouldn't be able to include component of system namespace");
        } catch(Exception e) {
        	assertTrue("get unexpected message:"+e.getMessage(), e.getMessage().contains("disallowed by MasterDefRegistry.assertAccess()"));
        	//expect 
    		//System.out.println(e.getMessage());
        	//Access to component 'string:testcomponent1' from namespace 'privilegedNS' in 'markup://privilegedNS:testapplication2(APPLICATION)' disallowed by MasterDefRegistry.assertAccess()
        }
    }
//JBUCH:    @Test
    public void testApplicationWithPrivilegedNamespaceIncludeComponentWithCustomNamespaceInMarkup() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component extensible='true'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponent", NamespaceAccess.CUSTOM);
        //create application with above component in markup
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "/> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testapplication", NamespaceAccess.PRIVILEGED);
        try {
        	descriptor.getDef();
        	fail("component of privileged namespace shouldn't be able to include component of custom namespace");
        } catch(Exception e) {
        	assertTrue("get unexpected message:"+e.getMessage(), e.getMessage().contains("disallowed by MasterDefRegistry.assertAccess()"));
        	//expect 
    		//System.out.println(e.getMessage());
        	//Access to component 'cstring:testcomponent1' from namespace 'privilegedNS' in 'markup://privilegedNS:testapplication2(APPLICATION)' disallowed by MasterDefRegistry.assertAccess()
        }
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
        descriptor.getDef();
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
        descriptor.getDef();
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
        descriptor.getDef();
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
        descriptor.getDef();
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
        try {
        	descriptor.getDef();
         	fail("component of custom namespace shouldn't be able to include component of system namespace");
        } catch(Exception e) {
        	//expect 
    		//System.out.println(e.getMessage());
    		//Access to component 'string1:testcomponent1' from namespace 'cstring' in 'markup://cstring:testapplication2(APPLICATION)' disallowed by MasterDefRegistry.assertAccess()
        }
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
        descriptor.getDef();
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
        try {
        	descriptor.getDef();
        	fail("component of custom namespace shouldn't be able to include componet of another custom namespace");
        } catch(Exception e) {
        	//expect 
    		//System.out.println(e.getMessage());
    		//Access to component 'cstring:testcomponent1' from namespace 'cstring1' in 'markup://cstring1:testapplication2(APPLICATION)' disallowed by MasterDefRegistry.assertAccess()
        }
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
        try {
        	descriptor.getDef();
         	fail("component of custom namespace shouldn't be able to include component of privileged namespace");
        } catch(Exception e) {
        	assertTrue("get unexpected message:"+e.getMessage(), e.getMessage().contains("disallowed by MasterDefRegistry.assertAccess()"));
        	//expect 
    		//System.out.println(e.getMessage());
        	//Access to component 'privilegedNS:testcomponent1' from namespace 'cstring' in 'markup://cstring:testapplication2(APPLICATION)' disallowed by MasterDefRegistry.assertAccess()
        }
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
        descriptor.getDef();
    }
//JBUCH:    @Test
    public void testApplicationWithPrivilegedNamespaceIncludeComponentWithOtherPrivilegedNamespaceInMarkupAccessPublic() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component extensible='true' access='Public'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testcomponent", NamespaceAccess.PRIVILEGED);
        //create application with above component in markup
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "/> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.OTHER_PRIVILEGED_NAMESPACE + ":testapplication", NamespaceAccess.PRIVILEGED);
        try {
        	descriptor.getDef();
         	fail("component of privileged namespace shouldn't be able to include component of another privileged namespace");
        } catch(Exception e) {
        	assertTrue("get unexpected message:"+e.getMessage(), e.getMessage().contains("disallowed by MasterDefRegistry.assertAccess()"));
        	//expect 
    		//System.out.println(e.getMessage());
        }
    }
//JBUCH:    @Test
    public void testApplicationWithPrivilegedNamespaceIncludeComponentWithSystemNamespaceInMarkupAccessPublic() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component extensible='true' access='Public'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponent", NamespaceAccess.INTERNAL);
        //create application with above component in markup
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "/> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testapplication", NamespaceAccess.PRIVILEGED);
        try {
        	descriptor.getDef();
         	fail("component of privileged namespace shouldn't be able to include component of system namespace");
        } catch(Exception e) {
        	assertTrue("get unexpected message:"+e.getMessage(), e.getMessage().contains("disallowed by MasterDefRegistry.assertAccess()"));
        	//expect 
    		//System.out.println(e.getMessage());
        	//Access to component 'string:testcomponent1' from namespace 'privilegedNS' in 'markup://privilegedNS:testapplication2(APPLICATION)' disallowed by MasterDefRegistry.assertAccess()
        }
    }
//JBUCH:    @Test
    public void testApplicationWithPrivilegedNamespaceIncludeComponentWithCustomNamespaceInMarkupAccessPublic() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component extensible='true' access='Public'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponent", NamespaceAccess.CUSTOM);
        //create application with above component in markup
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "/> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testapplication", NamespaceAccess.PRIVILEGED);
        try {
        	descriptor.getDef();
        	fail("component of privileged namespace shouldn't be able to include component of custom namespace");
        } catch(Exception e) {
        	assertTrue("get unexpected message:"+e.getMessage(), e.getMessage().contains("disallowed by MasterDefRegistry.assertAccess()"));
        	//expect 
    		//System.out.println(e.getMessage());
        	//Access to component 'cstring:testcomponent1' from namespace 'privilegedNS' in 'markup://privilegedNS:testapplication2(APPLICATION)' disallowed by MasterDefRegistry.assertAccess()
        }
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
        descriptor.getDef();
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
        descriptor.getDef();
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
        descriptor.getDef();
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
        descriptor.getDef();
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
        try {
        	descriptor.getDef();
         	fail("component of custom namespace shouldn't be able to include component of system namespace");
        } catch(Exception e) {
        	//expect 
    		//System.out.println(e.getMessage());
    		//Access to component 'string1:testcomponent1' from namespace 'cstring' in 'markup://cstring:testapplication2(APPLICATION)' disallowed by MasterDefRegistry.assertAccess()
        }
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
        descriptor.getDef();
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
        try {
        	descriptor.getDef();
        	fail("component of custom namespace shouldn't be able to include componet of another custom namespace");
        } catch(Exception e) {
        	//expect 
    		//System.out.println(e.getMessage());
    		//Access to component 'cstring:testcomponent1' from namespace 'cstring1' in 'markup://cstring1:testapplication2(APPLICATION)' disallowed by MasterDefRegistry.assertAccess()
        }
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
        try {
        	descriptor.getDef();
         	fail("component of custom namespace shouldn't be able to include component of privileged namespace");
        } catch(Exception e) {
        	assertTrue("get unexpected message:"+e.getMessage(), e.getMessage().contains("disallowed by MasterDefRegistry.assertAccess()"));
        	//expect 
    		//System.out.println(e.getMessage());
        	//Access to component 'privilegedNS:testcomponent1' from namespace 'cstring' in 'markup://cstring:testapplication2(APPLICATION)' disallowed by MasterDefRegistry.assertAccess()
        }
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
        descriptor.getDef();
    }
//JBUCH:    @Test
    public void testApplicationWithPrivilegedNamespaceIncludeComponentWithOtherPrivilegedNamespaceInMarkupAccessPrivileged() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component extensible='true' access='Privileged'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testcomponent", NamespaceAccess.PRIVILEGED);
        //create application with above component in markup
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "/> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.OTHER_PRIVILEGED_NAMESPACE + ":testapplication", NamespaceAccess.PRIVILEGED);
        descriptor.getDef();
    }
//JBUCH:    @Test
    public void testApplicationWithPrivilegedNamespaceIncludeComponentWithSystemNamespaceInMarkupAccessPrivileged() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component extensible='true' access='Privileged'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponent", NamespaceAccess.INTERNAL);
        //create application with above component in markup
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "/> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testapplication", NamespaceAccess.PRIVILEGED);
        descriptor.getDef();
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
        descriptor.getDef();
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
        descriptor.getDef();
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
        descriptor.getDef();
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
        try {
        	descriptor.getDef();
         	fail("component of custom namespace shouldn't be able to include component of system namespace");
        } catch(Exception e) {
        	//expect 
    		//System.out.println(e.getMessage());
    		//Access to component 'string1:testcomponent1' from namespace 'cstring' in 'markup://cstring:testapplication2(APPLICATION)' disallowed by MasterDefRegistry.assertAccess()
        }
    }
    @Test
    public void testApplicationWithCustomNamespaceIncludeComponentWithAnotherCustomNamespaceInMarkupAccessPrivileged() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component extensible='true' access='Privileged'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponent", NamespaceAccess.CUSTOM);
        //create application with above component in markup
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "/> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.OTHER_CUSTOM_NAMESPACE + ":testapplication", NamespaceAccess.CUSTOM);
        try {
        	descriptor.getDef();
        	fail("component of custom namespace shouldn't be able to include componet of another custom namespace");
        } catch(Exception e) {
        	//expect 
    		//System.out.println(e.getMessage());
    		//Access to component 'cstring:testcomponent1' from namespace 'cstring1' in 'markup://cstring1:testapplication2(APPLICATION)' disallowed by MasterDefRegistry.assertAccess()
        }
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
        try {
        	descriptor.getDef();
         	fail("component of custom namespace shouldn't be able to include component of privileged namespace");
        } catch(Exception e) {
        	assertTrue("get unexpected message:"+e.getMessage(), e.getMessage().contains("disallowed by MasterDefRegistry.assertAccess()"));
        	//expect 
    		//System.out.println(e.getMessage());
        	//Access to component 'privilegedNS:testcomponent1' from namespace 'cstring' in 'markup://cstring:testapplication2(APPLICATION)' disallowed by MasterDefRegistry.assertAccess()
        }
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
        descriptor.getDef();
    }
//JBUCH:    @Test
    public void testApplicationWithPrivilegedNamespaceIncludeComponentWithOtherPrivilegedNamespaceInMarkupAccessGlobal() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component extensible='true' access='Global'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testcomponent", NamespaceAccess.PRIVILEGED);
        //create application with above component in markup
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "/> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.OTHER_PRIVILEGED_NAMESPACE + ":testapplication", NamespaceAccess.PRIVILEGED);
        descriptor.getDef();
    }
//JBUCH:    @Test
    public void testApplicationWithPrivilegedNamespaceIncludeComponentWithSystemNamespaceInMarkupAccessGlobal() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component extensible='true' access='Global'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponent", NamespaceAccess.INTERNAL);
        //create application with above component in markup
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "/> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testapplication", NamespaceAccess.PRIVILEGED);
        descriptor.getDef();
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
        descriptor.getDef();
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
        descriptor.getDef();
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
        descriptor.getDef();
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
        	descriptor.getDef();
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
        	descriptor.getDef();
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
        	descriptor.getDef();
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
        descriptor.getDef();
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
        descriptor.getDef();
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
        descriptor.getDef();
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
        descriptor.getDef();
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
        try {
        	descriptor.getDef();
         	fail("component of custom namespace shouldn't be able to extend component of system namespace");
        } catch(Exception e) {
        	//expect 
    		//System.out.println(e.getMessage());
    		//Access to component 'string1:testcomponent1' from namespace 'cstring' in 'markup://cstring:testapplication2(APPLICATION)' disallowed by MasterDefRegistry.assertAccess()
        }
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
        try {
        	descriptor.getDef();
         	fail("component of custom namespace shouldn't be able to extend component of privileged namespace");
        } catch(Exception e) {
        	//expect 
    		//System.out.println(e.getMessage());
    		//Access to component 'string1:testcomponent1' from namespace 'cstring' in 'markup://cstring:testapplication2(APPLICATION)' disallowed by MasterDefRegistry.assertAccess()
        }
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
        descriptor.getDef();
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
        try {
        	descriptor.getDef();
        	fail("component of custom namespace shouldn't be able to extend componet of another custom namespace");
        } catch(Exception e) {
        	//expect 
    		//System.out.println(e.getMessage());
    		//Access to component 'cstring:testcomponent1' from namespace 'cstring1' in 'markup://cstring1:testapplication2(APPLICATION)' disallowed by MasterDefRegistry.assertAccess()
        }
    }
    
    
//JBUCH:    @Test
    public void testComponnetWithPrivilegedNamespaceExtendsComponentWithSystemNamespace() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component extensible='true'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponent", NamespaceAccess.INTERNAL);
        //create component extends above component
        String source = "<aura:component extends='" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "'/>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testcomponentChild", NamespaceAccess.PRIVILEGED);
        try {
        	descriptor.getDef();
        	fail("component of privileged namespace shouldn't be able to extend componet of system namespace");
        } catch(Exception e) {
        	//expect 
    		//System.out.println(e.getMessage());
    		//Access to component 'cstring:testcomponent1' from namespace 'cstring1' in 'markup://cstring1:testapplication2(APPLICATION)' disallowed by MasterDefRegistry.assertAccess()
        }
    }
//JBUCH:    @Test
    public void testComponnetWithPrivilegedNamespaceExtendsComponentWithSystemNamespaceAccessInternal() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component extensible='true' access='Internal'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponent", NamespaceAccess.INTERNAL);
        //create component extends above component
        String source = "<aura:component extends='" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "'/>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testcomponentChild", NamespaceAccess.PRIVILEGED);
        try {
        	descriptor.getDef();
        	fail("component of privileged namespace shouldn't be able to extend componet of system namespace");
        } catch(Exception e) {
        	//expect 
    		//System.out.println(e.getMessage());
    		//Access to component 'cstring:testcomponent1' from namespace 'cstring1' in 'markup://cstring1:testapplication2(APPLICATION)' disallowed by MasterDefRegistry.assertAccess()
        }
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
        descriptor.getDef();
    }
//JBUCH:    @Test
    public void testComponnetWithPrivilegedNamespaceExtendsComponentWithOtherPrivilegedNamespace() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component extensible='true'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.OTHER_PRIVILEGED_NAMESPACE + ":testcomponent", NamespaceAccess.PRIVILEGED);
        //create component extends above component
        String source = "<aura:component extends='" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "'/>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testcomponentChild", NamespaceAccess.PRIVILEGED);
        try {
        	descriptor.getDef();
        	fail("component of privileged namespace shouldn't be able to extend componet of other privileged namespace");
        } catch(Exception e) {
        	//expect 
    		//System.out.println(e.getMessage());
    		//Access to component 'cstring:testcomponent1' from namespace 'cstring1' in 'markup://cstring1:testapplication2(APPLICATION)' disallowed by MasterDefRegistry.assertAccess()
        }
    }
//JBUCH:    @Test
    public void testComponnetWithPrivilegedNamespaceExtendsComponentWithCustomNamespace() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component extensible='true'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponent", NamespaceAccess.CUSTOM);
        //create component extends above component
        String source = "<aura:component extends='" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "'/>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testcomponentChild", NamespaceAccess.PRIVILEGED);
        try {
        	descriptor.getDef();
        	fail("component of privileged namespace shouldn't be able to extend componet of custom namespace");
        } catch(Exception e) {
        	//expect 
    		//System.out.println(e.getMessage());
    		//Access to component 'cstring:testcomponent1' from namespace 'cstring1' in 'markup://cstring1:testapplication2(APPLICATION)' disallowed by MasterDefRegistry.assertAccess()
        }
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
        descriptor.getDef();
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
        descriptor.getDef();
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
        descriptor.getDef();
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
        descriptor.getDef();
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
        try {
        	descriptor.getDef();
         	fail("component of custom namespace shouldn't be able to include component of system namespace");
        } catch(Exception e) {
        	//expect 
    		//System.out.println(e.getMessage());
    		//Access to component 'string1:testcomponent1' from namespace 'cstring' in 'markup://cstring:testapplication2(APPLICATION)' disallowed by MasterDefRegistry.assertAccess()
        }
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
        try {
        	descriptor.getDef();
         	fail("component of custom namespace shouldn't be able to include component of privileged namespace");
        } catch(Exception e) {
        	//expect 
    		//System.out.println(e.getMessage());
    		//Access to component 'string1:testcomponent1' from namespace 'cstring' in 'markup://cstring:testapplication2(APPLICATION)' disallowed by MasterDefRegistry.assertAccess()
        }
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
        descriptor.getDef();
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
        try {
        	descriptor.getDef();
        	fail("component of custom namespace shouldn't be able to include componet of another custom namespace");
        } catch(Exception e) {
        	//expect 
    		//System.out.println(e.getMessage());
    		//Access to component 'cstring:testcomponent1' from namespace 'cstring1' in 'markup://cstring1:testapplication2(APPLICATION)' disallowed by MasterDefRegistry.assertAccess()
        }
    }
    
//JBUCH:    @Test
    public void testComponnetWithPrivilegedNamespaceExtendsComponentWithSystemNamespaceAccessPublic() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component extensible='true' access='PUBLIC'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponent", NamespaceAccess.INTERNAL);
        //create component extends above component
        String source = "<aura:component extends='" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "'/>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testcomponentChild", NamespaceAccess.PRIVILEGED);
        try {
        	descriptor.getDef();
        	fail("component of privileged namespace shouldn't be able to extend componet of system namespace");
        } catch(Exception e) {
        	//expect 
    		//System.out.println(e.getMessage());
    		//Access to component 'cstring:testcomponent1' from namespace 'cstring1' in 'markup://cstring1:testapplication2(APPLICATION)' disallowed by MasterDefRegistry.assertAccess()
        }
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
        descriptor.getDef();
    }
//JBUCH:    @Test
    public void testComponnetWithPrivilegedNamespaceExtendsComponentWithOtherPrivilegedNamespaceAccessPublic() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component extensible='true' access='PUBLIC'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.OTHER_PRIVILEGED_NAMESPACE + ":testcomponent", NamespaceAccess.PRIVILEGED);
        //create component extends above component
        String source = "<aura:component extends='" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "'/>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testcomponentChild", NamespaceAccess.PRIVILEGED);
        try {
        	descriptor.getDef();
        	fail("component of privileged namespace shouldn't be able to extend componet of other privileged namespace");
        } catch(Exception e) {
        	//expect 
    		//System.out.println(e.getMessage());
    		//Access to component 'cstring:testcomponent1' from namespace 'cstring1' in 'markup://cstring1:testapplication2(APPLICATION)' disallowed by MasterDefRegistry.assertAccess()
        }
    }
//JBUCH:    @Test
    public void testComponnetWithPrivilegedNamespaceExtendsComponentWithCustomNamespaceAccessPublic() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component extensible='true' access='PUBLIC'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponent", NamespaceAccess.CUSTOM);
        //create component extends above component
        String source = "<aura:component extends='" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "'/>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testcomponentChild", NamespaceAccess.PRIVILEGED);
        try {
        	descriptor.getDef();
        	fail("component of privileged namespace shouldn't be able to extend componet of custom namespace");
        } catch(Exception e) {
        	//expect 
    		//System.out.println(e.getMessage());
    		//Access to component 'cstring:testcomponent1' from namespace 'cstring1' in 'markup://cstring1:testapplication2(APPLICATION)' disallowed by MasterDefRegistry.assertAccess()
        }
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
        descriptor.getDef();
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
        descriptor.getDef();
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
        descriptor.getDef();
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
        descriptor.getDef();
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
        descriptor.getDef();
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
        descriptor.getDef();
    }
    
//JBUCH:    @Test
    public void testComponnetWithPrivilegedNamespaceExtendsComponentWithSystemNamespaceAccessGlobal() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component extensible='true' access='Global'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponent", NamespaceAccess.INTERNAL);
        //create component extends above component
        String source = "<aura:component extends='" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "'/>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testcomponentChild", NamespaceAccess.PRIVILEGED);
        	descriptor.getDef();
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
        descriptor.getDef();
    }
//JBUCH:    @Test
    public void testComponnetWithPrivilegedNamespaceExtendsComponentWithOtherPrivilegedNamespaceAccessGlobal() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component extensible='true' access='Global'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.OTHER_PRIVILEGED_NAMESPACE + ":testcomponent", NamespaceAccess.PRIVILEGED);
        //create component extends above component
        String source = "<aura:component extends='" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "'/>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testcomponentChild", NamespaceAccess.PRIVILEGED);
        	descriptor.getDef();
    }
//JBUCH:    @Test
    public void testComponnetWithPrivilegedNamespaceExtendsComponentWithCustomNamespaceAccessGlobal() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component extensible='true' access='Global'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponent", NamespaceAccess.CUSTOM);
        //create component extends above component
        String source = "<aura:component extends='" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "'/>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testcomponentChild", NamespaceAccess.PRIVILEGED);
        	descriptor.getDef();
    }
    
    
    
    
    
    
    
    
    /**
     * Tests for a component to include another abstract component in the markup start : these are far away from complete, we need more coverage here
     */
    @Test
    public void testComponentWithSystemNamespaceHasAbstractComponentWithSameSystemNamespaceInMarkup() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component abstract='true' access='GLOBAL'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponent", NamespaceAccess.INTERNAL);
        //create component with above component in markup
        String source = "<aura:component> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "/> </aura:component>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponent2", NamespaceAccess.INTERNAL);
        descriptor.getDef();
    }
    @Test
    public void testComponentWithSystemNamespaceHasAbstractComponentWithOtherSystemNamespaceInMarkup() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component abstract='true' access='GLOBAL'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponent", NamespaceAccess.INTERNAL);
        //create component with above component in markup
        String source = "<aura:component> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "/> </aura:component>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.OTHER_NAMESPACE + ":testcomponent2", NamespaceAccess.INTERNAL);
        descriptor.getDef();
    }
    @Test
    public void testComponentWithSystemNamespaceHasAbstractComponentWithCustomNamespaceInMarkup() throws QuickFixException {
        //create component with custom namespace
        String cmpSource = "<aura:component abstract='true' access='GLOBAL'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponent", NamespaceAccess.CUSTOM);
        //create component with above component in markup
        String source = "<aura:component> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "/> </aura:component>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponent2", NamespaceAccess.INTERNAL);
        descriptor.getDef();
    }
    @Test
    public void testComponentWithSystemNamespaceHasAbstractComponentWithPrivilegedNamespaceInMarkup() throws QuickFixException {
        //create component with custom namespace
        String cmpSource = "<aura:component abstract='true' access='GLOBAL'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testcomponent", NamespaceAccess.PRIVILEGED);
        //create component with above component in markup
        String source = "<aura:component> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "/> </aura:component>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponent2", NamespaceAccess.INTERNAL);
        descriptor.getDef();
    }
    
    @Test
    public void testComponentWithCustomNamespaceHasAbstractComponentWithSystemNamespaceInMarkup() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component abstract='true' access='GLOBAL'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponent", NamespaceAccess.INTERNAL);
        //create component with above component in markup
        String source = "<aura:component> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "/> </aura:component>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponent2", NamespaceAccess.CUSTOM);
        descriptor.getDef();
    }
    @Test
    public void testComponentWithCustomNamespaceHasAbstractComponentWithSameCustomNamespaceInMarkup() throws QuickFixException {
        //create component with custom namespace
        String cmpSource = "<aura:component abstract='true' access='GLOBAL'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponent", NamespaceAccess.CUSTOM);
        //create component with above component in markup
        String source = "<aura:component> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "/> </aura:component>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponent2", NamespaceAccess.CUSTOM);
        descriptor.getDef();
    }
    @Test
    public void testComponentWithCustomNamespaceHasAbstractComponentWithAnotherCustomNamespaceInMarkup() throws QuickFixException {
        //create component with custom namespace
        String cmpSource = "<aura:component abstract='true' access='GLOBAL'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponent", NamespaceAccess.CUSTOM);
        //create component with above component in markup
        String source = "<aura:component> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "/> </aura:component>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.OTHER_CUSTOM_NAMESPACE + ":testcomponent2", NamespaceAccess.CUSTOM);
        descriptor.getDef();
    }
    @Test
    public void testComponentWithCustomNamespaceHasAbstractComponentWithPrivilegedNamespaceInMarkup() throws QuickFixException {
        //create component with custom namespace
        String cmpSource = "<aura:component abstract='true' access='GLOBAL'/>";
        DefDescriptor<? extends Definition> cmpDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testcomponent", NamespaceAccess.PRIVILEGED);
        //create component with above component in markup
        String source = "<aura:component> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + "/> </aura:component>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.OTHER_CUSTOM_NAMESPACE + ":testcomponent2", NamespaceAccess.CUSTOM);
        descriptor.getDef();
    }
    
    

}
