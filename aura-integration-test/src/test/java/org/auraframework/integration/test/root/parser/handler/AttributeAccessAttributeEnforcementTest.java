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
import org.junit.Test;

public class AttributeAccessAttributeEnforcementTest extends AuraImplTestCase {
    /**
     * Privileged access tests start.
     * for component inside custom namespace, we do not allow to have attribute with access='Privileged'
     */

    @Test
    public void testApplicationWithPrivilegedNamespaceHasComponentWithSystemNamespaceInMarkupAccessPrivileged() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component access='GLOBAL'><aura:attribute name='testattribute' type='String' access='Privileged'/></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor= getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponnet", NamespaceAccess.INTERNAL);
        //create application with above component in markup, set the attribute
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testattribute='' /> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testapplication", NamespaceAccess.PRIVILEGED);
        definitionService.getDefinition(descriptor);
    }
    @Test
    public void testApplicationWithPrivilegedNamespaceHasComponentWithSamePrivilegedNamespaceInMarkupAccessPrivileged() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component access='GLOBAL'><aura:attribute name='testattribute' type='String' access='Privileged'/></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor= getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testcomponnet", NamespaceAccess.PRIVILEGED);
        //create application with above component in markup, set the attribute
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testattribute='' /> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testapplication", NamespaceAccess.PRIVILEGED);
        definitionService.getDefinition(descriptor);
    }

    @Test
    public void testApplicationWithPrivilegedNamespaceHasComponentWithOtherPrivilegedNamespaceInMarkupAccessPrivileged() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component access='GLOBAL'><aura:attribute name='testattribute' type='String' access='Privileged'/></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor= getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.OTHER_PRIVILEGED_NAMESPACE + ":testcomponnet", NamespaceAccess.PRIVILEGED);
        //create application with above component in markup, set the attribute
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testattribute='' /> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testapplication", NamespaceAccess.PRIVILEGED);
        definitionService.getDefinition(descriptor);
    }
    
    @Test
    public void testApplicationWithSystemNamespaceHasComponentWithSameSystemNamespaceInMarkupAccessPrivileged() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component access='GLOBAL'><aura:attribute name='testattribute' type='String' access='Privileged'/></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor= getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponnet", NamespaceAccess.INTERNAL);
        //create application with above component in markup, set the attribute
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testattribute='' /> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testapplication", NamespaceAccess.INTERNAL);
        definitionService.getDefinition(descriptor);
    }
    @Test
    public void testApplicationWithSystemNamespaceHasComponentWithOtherSystemNamespaceInMarkupAccessPrivileged() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component access='GLOBAL'><aura:attribute name='testattribute' type='String' access='Privileged'/></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor= getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponnet", NamespaceAccess.INTERNAL);
        //create application with above component in markup, set the attribute
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testattribute='' /> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.OTHER_NAMESPACE + ":testapplication", NamespaceAccess.INTERNAL);
        definitionService.getDefinition(descriptor);
    }
    @Test
    public void testApplicationWithSystemNamespaceHasComponentWithPrivilegedNamespaceInMarkupAccessPrivileged() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component access='GLOBAL'><aura:attribute name='testattribute' type='String' access='Privileged'/></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor= getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testcomponnet", NamespaceAccess.PRIVILEGED);
        //create application with above component in markup, set the attribute
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testattribute='' /> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.OTHER_NAMESPACE + ":testapplication", NamespaceAccess.INTERNAL);
        definitionService.getDefinition(descriptor);
    }
    
    @Test
    public void testApplicationWithCustomNamespaceHasComponentWithSystemNamespaceInMarkupAccessPrivileged() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component access='GLOBAL'><aura:attribute name='testattribute' type='String' access='Privileged'/></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor= getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponnet", NamespaceAccess.INTERNAL);
        //create application with above component in markup, set the attribute
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testattribute='' /> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testapplication", NamespaceAccess.CUSTOM);

        Exception caught = null;
        try {
            definitionService.getDefinition(descriptor);
        } catch(Exception e) {
            caught = e;
        }
        assertNotNull("application of custom namespace shouldn't be able to access attribute of system namespace with privileged", caught);
        //Access to application 'string:testapplication1' from namespace 'privilegedNS' in 'markup://privilegedNS:testapplicationChild2(APPLICATION)' is not allowed
        assertTrue("got unexpected message:"+caught.getMessage(), caught.getMessage().contains("is not allowed"));
    }
    @Test
    public void testApplicationWithCustomNamespaceHasComponentWithPrivilegedNamespaceInMarkupAccessPrivileged() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component access='GLOBAL'><aura:attribute name='testattribute' type='String' access='Privileged'/></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor= getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testcomponnet", NamespaceAccess.PRIVILEGED);
        //create application with above component in markup, set the attribute
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testattribute='' /> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testapplication", NamespaceAccess.CUSTOM);

        Exception caught = null;
        try {
            definitionService.getDefinition(descriptor);
        } catch(Exception e) {
            caught = e;
        }
        assertNotNull("application of custom namespace shouldn't be able to access attribute of privileged namespace with privileged", caught);
        //Access to application 'string:testapplication1' from namespace 'privilegedNS' in 'markup://privilegedNS:testapplicationChild2(APPLICATION)' is not allowed
        assertTrue("got unexpected message:"+caught.getMessage(), caught.getMessage().contains("is not allowed"));
    }
    
    
    /**
     * Default access tests start
     */
    /**
     * tests around privileged namespace
     */
    @Test
    public void testApplicationWithPrivilegedNamespaceHasComponentWithSamePrivilegedNamespaceInMarkup() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component access='GLOBAL'><aura:attribute name='testattribute' type='String'/></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor= getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testcomponnet",
                        NamespaceAccess.PRIVILEGED);
        //create application with above component in markup, set the attribute
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testattribute='' /> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testapplication",
                        NamespaceAccess.PRIVILEGED);
        definitionService.getDefinition(descriptor);
    }

    @Test
    public void testApplicationWithPrivilegedNamespaceHasComponentWithOtherPrivilegedNamespaceInMarkup() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component access='GLOBAL'><aura:attribute name='testattribute' type='String'/></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor= getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testcomponnet",
                        NamespaceAccess.PRIVILEGED);
        //create application with above component in markup, set the attribute
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testattribute='' /> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.OTHER_PRIVILEGED_NAMESPACE + ":testapplication",
                        NamespaceAccess.PRIVILEGED);

        Exception caught = null;
        try {
            definitionService.getDefinition(descriptor);
        } catch(Exception e) {
            caught = e;
        }
        assertNotNull("application of privileged namespace shouldn't be able to access attribute of another privileged namespace", caught);
        //Access to application 'string:testapplication1' from namespace 'privilegedNS' in 'markup://privilegedNS:testapplicationChild2(APPLICATION)' is not allowed
        assertTrue("got unexpected message:"+caught.getMessage(), caught.getMessage().contains("is not allowed"));
    }

    @Test
    public void testApplicationWithPrivilegedNamespaceHasComponentWithSystemNamespaceInMarkup() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component access='GLOBAL'><aura:attribute name='testattribute' type='String'/></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor= getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponnet",
                        NamespaceAccess.INTERNAL);
        //create application with above component in markup, set the attribute
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testattribute='' /> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.OTHER_PRIVILEGED_NAMESPACE + ":testapplication",
                        NamespaceAccess.PRIVILEGED);

        Exception caught = null;
        try {
            definitionService.getDefinition(descriptor);
        } catch(Exception e) {
            caught = e;
        }
        assertNotNull("application of privileged namespace shouldn't be able to access attribute of system application namespace", caught);
        //Access to application 'string:testapplication1' from namespace 'privilegedNS' in 'markup://privilegedNS:testapplicationChild2(APPLICATION)' is not allowed
        assertTrue("got unexpected message:"+caught.getMessage(), caught.getMessage().contains("is not allowed"));
    }

    @Test
    public void testApplicationWithPrivilegedNamespaceHasComponentWithSystemNamespaceInMarkupAccessInternal() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component access='GLOBAL'><aura:attribute name='testattribute' type='String' access='Internal'/></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor= getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponnet",
                        NamespaceAccess.INTERNAL);
        //create application with above component in markup, set the attribute
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testattribute='' /> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.OTHER_PRIVILEGED_NAMESPACE + ":testapplication",
                        NamespaceAccess.PRIVILEGED);

        Exception caught = null;
        try {
            definitionService.getDefinition(descriptor);
        } catch(Exception e) {
            caught = e;
        }
        assertNotNull("application of privileged namespace shouldn't be able to access attribute of system application namespace", caught);
        //Access to application 'string:testapplication1' from namespace 'privilegedNS' in 'markup://privilegedNS:testapplicationChild2(APPLICATION)' is not allowed
        assertTrue("got unexpected message:"+caught.getMessage(), caught.getMessage().contains("is not allowed"));
    }

    @Test
    public void testApplicationWithPrivilegedNamespaceHasComponentWithCustomNamespaceInMarkup() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component access='GLOBAL'><aura:attribute name='testattribute' type='String'/></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor= getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponnet",
                        NamespaceAccess.CUSTOM);
        //create application with above component in markup, set the attribute
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testattribute='' /> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.OTHER_PRIVILEGED_NAMESPACE + ":testapplication",
                        NamespaceAccess.PRIVILEGED);

        Exception caught = null;
        try {
            definitionService.getDefinition(descriptor);
        } catch(Exception e) {
            caught = e;
        }
        assertNotNull("application of privileged namespace shouldn't be able to access attribute of custom application namespace", caught);
        //Access to application 'string:testapplication1' from namespace 'privilegedNS' in 'markup://privilegedNS:testapplicationChild2(APPLICATION)' is not allowed
        assertTrue("got unexpected message:"+caught.getMessage(), caught.getMessage().contains("is not allowed"));
    }
    @Test
    public void testApplicationWithCustomNamespaceHasComponentWithPrivilegedNamespaceInMarkup() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component access='GLOBAL'><aura:attribute name='testattribute' type='String'/></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor= getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testcomponnet",
                        NamespaceAccess.PRIVILEGED);
        //create application with above component in markup, set the attribute
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testattribute='' /> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testapplication",
                        NamespaceAccess.CUSTOM);

        Exception caught = null;
        try {
            definitionService.getDefinition(descriptor);
        } catch(Exception e) {
            caught = e;
        }
        assertNotNull("application of custom namespace shouldn't be able to access attribute of privileged application namespace", caught);
        //Access to application 'string:testapplication1' from namespace 'privilegedNS' in 'markup://privilegedNS:testapplicationChild2(APPLICATION)' is not allowed
        assertTrue("got unexpected message:"+caught.getMessage(), caught.getMessage().contains("is not allowed"));
    }
    @Test
    public void testApplicationWithSystemNamespaceHasComponentWithPrivilegedNamespaceInMarkup() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component access='GLOBAL'><aura:attribute name='testattribute' type='String'/></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor= getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testcomponnet",
                        NamespaceAccess.PRIVILEGED);
        //create application with above component in markup, set the attribute
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testattribute='' /> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testapplication",
                        NamespaceAccess.INTERNAL);
        definitionService.getDefinition(descriptor);
    }

    /**
     * verifyAccess for Application,System,System
     */
    @Test
    public void testApplicationWithSystemNamespaceHasComponentWithSameSystemNamespaceInMarkup() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component access='GLOBAL'><aura:attribute name='testattribute' type='String'/></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor= getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponnet",
                        NamespaceAccess.INTERNAL);
        //create application with above component in markup, set the attribute
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testattribute='' /> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testapplication",
                        NamespaceAccess.INTERNAL);
        definitionService.getDefinition(descriptor);
    }
    @Test
    public void testApplicationWithSystemNamespaceHasComponentWithSameSystemNamespaceInMarkupInternal() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component access='GLOBAL'><aura:attribute name='testattribute' type='String' access='Internal'/></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor= getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponnet",
                        NamespaceAccess.INTERNAL);
        //create application with above component in markup, set the attribute
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testattribute='' /> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testapplication",
                        NamespaceAccess.INTERNAL);
        definitionService.getDefinition(descriptor);
    }
    
    /**
     * verifyAccess for Application,System,SystemOther
     */
    @Test
    public void testApplicationWithSystemNamespaceHasComponentWithOtherSystemNamespaceInMarkup() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component access='GLOBAL'><aura:attribute name='testattribute' type='String'/></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor= getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.OTHER_NAMESPACE + ":testcomponnet",
                        NamespaceAccess.INTERNAL);
        //create application with above component in markup, set the attribute
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testattribute='' /> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testapplication",
                        NamespaceAccess.INTERNAL);
        definitionService.getDefinition(descriptor);
    }
    @Test
    public void testApplicationWithSystemNamespaceHasComponentWithOtherSystemNamespaceInMarkupInternal() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component access='GLOBAL'><aura:attribute name='testattribute' type='String' access='Internal'/></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor= getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.OTHER_NAMESPACE + ":testcomponnet",
                        NamespaceAccess.INTERNAL);
        //create application with above component in markup, set the attribute
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testattribute='' /> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testapplication",
                        NamespaceAccess.INTERNAL);
        definitionService.getDefinition(descriptor);
    }
    
    /**
     * verifyAccess for Application,System,Custom
     */
    @Test
    public void testApplicationWithCustomNamespaceHasComponentWithSystemNamespaceInMarkup() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component access='GLOBAL'><aura:attribute name='testattribute' type='String'/></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor= getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponnet",
                        NamespaceAccess.INTERNAL);
        //create application with above component in markup, set the attribute
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testattribute='' /> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testapplication",
                        NamespaceAccess.CUSTOM);

        Exception caught = null;
        try {
            definitionService.getDefinition(descriptor);
        } catch(Exception e) {
            caught = e;
        }
        assertNotNull("application of custom namespace shouldn't be able to set attribute of component with system namespace", caught);
        //Access to attribute 'string:testcomponnet1.testattribute' from namespace 'cstring' in 'markup://cstring:testapplication2(APPLICATION)' is not allowed
        assertTrue("got unexpected message:"+caught.getMessage(), caught.getMessage().contains("is not allowed"));
    }
    @Test
    public void testApplicationWithCustomNamespaceHasComponentWithSystemNamespaceInMarkupAccessInternal() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component access='GLOBAL'><aura:attribute name='testattribute' type='String' access='Internal'/></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor= getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponnet",
                        NamespaceAccess.INTERNAL);
        //create application with above component in markup, set the attribute
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testattribute='' /> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testapplication",
                        NamespaceAccess.CUSTOM);

        Exception caught = null;
        try {
            definitionService.getDefinition(descriptor);
        } catch(Exception e) {
            caught = e;
        }
        assertNotNull("application of custom namespace shouldn't be able to set attribute of component with system namespace", caught);
        //Access to attribute 'string:testcomponnet1.testattribute' from namespace 'cstring' in 'markup://cstring:testapplication2(APPLICATION)' is not allowed
        assertTrue("got unexpected message:"+caught.getMessage(), caught.getMessage().contains("is not allowed"));
    }
    
    /**
     * verifyAccess for Application,Custom,Custom
     */
    @Test
    public void testApplicationWithCustomNamespaceHasComponentWithSameCustomNamespaceInMarkup() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component access='GLOBAL'><aura:attribute name='testattribute' type='String'/></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor= getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponnet",
                        NamespaceAccess.CUSTOM);
        //create application with above component in markup, set the attribute
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testattribute='' /> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testapplication",
                        NamespaceAccess.CUSTOM);
        definitionService.getDefinition(descriptor);
    }
    
    /**
     * verifyAccess for Application,Custom,CustomOther
     */
    @Test
    public void testApplicationWithCustomNamespaceHasComponentWithOtherCustomNamespaceInMarkup() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component access='GLOBAL'><aura:attribute name='testattribute' type='String'/></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor= getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponnet",
                        NamespaceAccess.CUSTOM);
        //create application with above component in markup, set the attribute
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testattribute='' /> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.OTHER_CUSTOM_NAMESPACE + ":testapplication",
                        NamespaceAccess.CUSTOM);

        Exception caught = null;
        try {
            definitionService.getDefinition(descriptor);
        } catch(Exception e) {
            caught = e;
        }
        assertNotNull("application of custom namespace shouldn't be able to set attribute of component with other custom namespace", caught);
        //Access to attribute 'cstring:testcomponnet1.testattribute' from namespace 'cstring1' in 'markup://cstring1:testapplication2(APPLICATION)' is not allowed
        assertTrue("got unexpected message:"+caught.getMessage(), caught.getMessage().contains("is not allowed"));
    }
    
    /**
     * verifyAccess for Application,Custom,System
     */
    @Test
    public void testApplicationWithSystemNamespaceHasComponentWithCustomNamespaceInMarkup() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component access='GLOBAL'><aura:attribute name='testattribute' type='String'/></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor= getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponnet",
                        NamespaceAccess.CUSTOM);
        //create application with above component in markup, set the attribute
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testattribute='' /> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testapplication",
                        NamespaceAccess.INTERNAL);
        definitionService.getDefinition(descriptor);
    }
    
    
    /**
     * verifyAccess for Component,System,System
     */
    @Test
    public void testComponentWithSystemNamespaceHasComponentWithSameSystemNamespaceInMarkup() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component access='GLOBAL'><aura:attribute name='testattribute' type='String'/></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor= getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponnet",
                        NamespaceAccess.INTERNAL);
        //create component with above component in markup, set the attribute
        String source = "<aura:component> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testattribute='' /> </aura:component>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponnet2",
                        NamespaceAccess.INTERNAL);
        definitionService.getDefinition(descriptor);
    }
    @Test
    public void testComponentWithSystemNamespaceHasComponentWithSameSystemNamespaceInMarkupInternal() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component access='GLOBAL'><aura:attribute name='testattribute' type='String' access='Global'/></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor= getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponnet",
                        NamespaceAccess.INTERNAL);
        //create component with above component in markup, set the attribute
        String source = "<aura:component> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testattribute='' /> </aura:component>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponnet2",
                        NamespaceAccess.INTERNAL);
        definitionService.getDefinition(descriptor);
    }
    
    
    /**
     * verifyAccess for Component,System,SystemOther
     */
    @Test
    public void testComponentWithSystemNamespaceHasComponentWitOtherSystemNamespaceInMarkup() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component access='GLOBAL'><aura:attribute name='testattribute' type='String'/></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor= getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.OTHER_NAMESPACE + ":testcomponnet",
                        NamespaceAccess.INTERNAL);
        //create component with above component in markup, set the attribute
        String source = "<aura:component> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testattribute='' /> </aura:component>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponnet2",
                        NamespaceAccess.INTERNAL);
        definitionService.getDefinition(descriptor);
    }
    
    /**
     * verifyAccess for Component,System,Custom
     */
    @Test
    public void testComponentWithCustomNamespaceHasComponentWithSystemNamespaceInMarkup() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component access='GLOBAL'><aura:attribute name='testattribute' type='String'/></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor= getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponnet",
                        NamespaceAccess.INTERNAL);
        //create component with above component in markup, set the attribute
        String source = "<aura:component> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testattribute='' /> </aura:component>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponnet2",
                        NamespaceAccess.CUSTOM);

        Exception caught = null;
        try {
            definitionService.getDefinition(descriptor);
        } catch(Exception e) {
            caught = e;
        }
        assertNotNull("component of custom namespace shouldn't be able to set attribute of component with system namespace", caught);
        //Access to attribute 'string:testcomponnet1.testattribute' from namespace 'cstring' in 'markup://cstring:testcomponnet22(COMPONENT)' is not allowed
        assertTrue("got unexpected message:"+caught.getMessage(), caught.getMessage().contains("is not allowed"));
    }
    
    /**
     * verifyAccess for Component,Custom,Custom
     */
    @Test
    public void testComponentWithCustomNamespaceHasComponentWithSameCustomNamespaceInMarkup() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component access='GLOBAL'><aura:attribute name='testattribute' type='String'/></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor= getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponnet",
                        NamespaceAccess.CUSTOM);
        //create component with above component in markup, set the attribute
        String source = "<aura:component> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testattribute='' /> </aura:component>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponnet2",
                        NamespaceAccess.CUSTOM);
        definitionService.getDefinition(descriptor);
    }
    
    /**
     * verifyAccess for Component,Custom,CustomOther
     */
    @Test
    public void testComponentWithCustomNamespaceHasComponentWithOtherCustomNamespaceInMarkup() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component access='GLOBAL'><aura:attribute name='testattribute' type='String'/></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor= getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponnet",
                        NamespaceAccess.CUSTOM);
        //create application with above component in markup, set the attribute
        String source = "<aura:component> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testattribute='' /> </aura:component>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.OTHER_CUSTOM_NAMESPACE + ":testcomponnet2",
                        NamespaceAccess.CUSTOM);

        Exception caught = null;
        try {
            definitionService.getDefinition(descriptor);
        } catch(Exception e) {
            caught = e;
        }
        assertNotNull("component of custom namespace shouldn't be able to set attribute of component with other custom namespace", caught);
        //Access to attribute 'cstring:testcomponnet1.testattribute' from namespace 'cstring1' in 'markup://cstring1:testcomponnet22(COMPONENT)' is not allowed
        assertTrue("got unexpected message:"+caught.getMessage(), caught.getMessage().contains("is not allowed"));
    }
    
    /**
     * verifyAccess for Component,Custom,System
     */
    @Test
    public void testComponentWithSystemNamespaceHasComponentWithCustomNamespaceInMarkup() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component access='GLOBAL'><aura:attribute name='testattribute' type='String'/></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor= getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponnet",
                        NamespaceAccess.CUSTOM);
        //create component with above component in markup, set the attribute
        String source = "<aura:component> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testattribute='' /> </aura:component>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponnet2",
                        NamespaceAccess.INTERNAL);
        definitionService.getDefinition(descriptor);
    }
    
    
    /**
     * Verify Private access enforcement
     * @throws Exception
     */
    /*public void _testPrivateAccess() throws Exception {
        testCase = TestCase.PRIVATE;
        verifyAccess(consumers);
    }*/
    /**
     * Private access tests start
     */

    
    /**
     * Public access tests start
     */
    /**
     * tests around privileged namespace
     */
    @Test
    public void testApplicationWithPrivilegedNamespaceHasComponentWithSamePrivilegedNamespaceInMarkupAccessPublic() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component access='GLOBAL'><aura:attribute name='testattribute' type='String' access='PUBLIC'/></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor= getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testcomponnet",
                        NamespaceAccess.PRIVILEGED);
        //create application with above component in markup, set the attribute
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testattribute='' /> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testapplication",
                        NamespaceAccess.PRIVILEGED);
        definitionService.getDefinition(descriptor);
    }

    @Test
    public void testApplicationWithPrivilegedNamespaceHasComponentWithOtherPrivilegedNamespaceInMarkupAccessPublic() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component access='GLOBAL'><aura:attribute name='testattribute' type='String' access='PUBLIC'/></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor= getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testcomponnet",
                        NamespaceAccess.PRIVILEGED);
        //create application with above component in markup, set the attribute
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testattribute='' /> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.OTHER_PRIVILEGED_NAMESPACE + ":testapplication",
                        NamespaceAccess.PRIVILEGED);

        Exception caught = null;
        try {
            definitionService.getDefinition(descriptor);
        } catch(Exception e) {
            caught = e;
        }
        assertNotNull("application of privileged namespace shouldn't be able to access attribute of another privileged namespace", caught);
        //Access to application 'string:testapplication1' from namespace 'privilegedNS' in 'markup://privilegedNS:testapplicationChild2(APPLICATION)' is not allowed
        assertTrue("got unexpected message:"+caught.getMessage(), caught.getMessage().contains("is not allowed"));
    }

    @Test
    public void testApplicationWithPrivilegedNamespaceHasComponentWithSystemNamespaceInMarkupAccessPublic() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component access='GLOBAL'><aura:attribute name='testattribute' type='String' access='PUBLIC'/></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor= getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponnet",
                        NamespaceAccess.INTERNAL);
        //create application with above component in markup, set the attribute
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testattribute='' /> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.OTHER_PRIVILEGED_NAMESPACE + ":testapplication",
                        NamespaceAccess.PRIVILEGED);

        Exception caught = null;
        try {
            definitionService.getDefinition(descriptor);
        } catch(Exception e) {
            caught = e;
        }
        assertNotNull("application of privileged namespace shouldn't be able to access attribute of system application namespace", caught);
        //Access to application 'string:testapplication1' from namespace 'privilegedNS' in 'markup://privilegedNS:testapplicationChild2(APPLICATION)' is not allowed
        assertTrue("got unexpected message:"+caught.getMessage(), caught.getMessage().contains("is not allowed"));
    }

    @Test
    public void testApplicationWithPrivilegedNamespaceHasComponentWithCustomNamespaceInMarkupAccessPublic() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component access='GLOBAL'><aura:attribute name='testattribute' type='String' access='PUBLIC'/></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor= getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponnet",
                        NamespaceAccess.CUSTOM);
        //create application with above component in markup, set the attribute
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testattribute='' /> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.OTHER_PRIVILEGED_NAMESPACE + ":testapplication",
                        NamespaceAccess.PRIVILEGED);

        Exception caught = null;
        try {
            definitionService.getDefinition(descriptor);
        } catch(Exception e) {
            caught = e;
        }
        assertNotNull("application of privileged namespace shouldn't be able to access attribute of custom application namespace", caught);
        //Access to application 'string:testapplication1' from namespace 'privilegedNS' in 'markup://privilegedNS:testapplicationChild2(APPLICATION)' is not allowed
        assertTrue("got unexpected message:"+caught.getMessage(), caught.getMessage().contains("is not allowed"));
    }
    @Test
    public void testApplicationWithCustomNamespaceHasComponentWithPrivilegedNamespaceInMarkupAccessPublic() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component access='GLOBAL'><aura:attribute name='testattribute' type='String' access='PUBLIC'/></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor= getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testcomponnet",
                        NamespaceAccess.PRIVILEGED);
        //create application with above component in markup, set the attribute
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testattribute='' /> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testapplication",
                        NamespaceAccess.CUSTOM);

        Exception caught = null;
        try {
            definitionService.getDefinition(descriptor);
        } catch(Exception e) {
            caught = e;
        }
        assertNotNull("application of custom namespace shouldn't be able to access attribute of privileged application namespace", caught);
        //Access to application 'string:testapplication1' from namespace 'privilegedNS' in 'markup://privilegedNS:testapplicationChild2(APPLICATION)' is not allowed
        assertTrue("got unexpected message:"+caught.getMessage(), caught.getMessage().contains("is not allowed"));
    }
    @Test
    public void testApplicationWithSystemNamespaceHasComponentWithPrivilegedNamespaceInMarkupAccessPublic() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component access='GLOBAL'><aura:attribute name='testattribute' type='String' access='PUBLIC'/></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor= getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testcomponnet",
                        NamespaceAccess.PRIVILEGED);
        //create application with above component in markup, set the attribute
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testattribute='' /> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testapplication",
                        NamespaceAccess.INTERNAL);
        definitionService.getDefinition(descriptor);
    }
    
    /**
     * verifyAccess for Application,System,System
     */
    @Test
    public void testApplicationWithSystemNamespaceHasComponentWithSameSystemNamespaceInMarkupAccessPublic() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component access='GLOBAL'><aura:attribute name='testattribute' type='String' access='PUBLIC'/></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor= getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponnet",
                        NamespaceAccess.INTERNAL);
        //create application with above component in markup, set the attribute
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testattribute='' /> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testapplication",
                        NamespaceAccess.INTERNAL);
        definitionService.getDefinition(descriptor);
    }
    
    /**
     * verifyAccess for Application,System,SystemOther
     */
    @Test
    public void testApplicationWithSystemNamespaceHasComponentWithOtherSystemNamespaceInMarkupAccessPublic() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component access='GLOBAL'><aura:attribute name='testattribute' type='String' access='PUBLIC'/></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor= getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.OTHER_NAMESPACE + ":testcomponnet",
                        NamespaceAccess.INTERNAL);
        //create application with above component in markup, set the attribute
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testattribute='' /> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testapplication",
                        NamespaceAccess.INTERNAL);
        definitionService.getDefinition(descriptor);
    }
    
    /**
     * verifyAccess for Application,System,Custom
     */
    @Test
    public void testApplicationWithCustomNamespaceHasComponentWithSystemNamespaceInMarkupAccessPublic() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component access='GLOBAL'><aura:attribute name='testattribute' type='String' access='PUBLIC'/></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor= getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponnet",
                        NamespaceAccess.INTERNAL);
        //create application with above component in markup, set the attribute
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testattribute='' /> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testapplication",
                        NamespaceAccess.CUSTOM);

        Exception caught = null;
        try {
            definitionService.getDefinition(descriptor);
        } catch(Exception e) {
            caught = e;
        }
        assertNotNull("application of custom namespace shouldn't be able to set attribute of component with system namespace", caught);
        //Access to attribute 'string:testcomponnet1.testattribute' from namespace 'cstring' in 'markup://cstring:testapplication2(APPLICATION)' is not allowed
        assertTrue("got unexpected message:"+caught.getMessage(), caught.getMessage().contains("is not allowed"));
    }
    
    /**
     * verifyAccess for Application,Custom,Custom
     */
    @Test
    public void testApplicationWithCustomNamespaceHasComponentWithSameCustomNamespaceInMarkupAccessPublic() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component access='GLOBAL'><aura:attribute name='testattribute' type='String' access='PUBLIC'/></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor= getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponnet",
                        NamespaceAccess.CUSTOM);
        //create application with above component in markup, set the attribute
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testattribute='' /> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testapplication",
                        NamespaceAccess.CUSTOM);
        definitionService.getDefinition(descriptor);
    }
    
    /**
     * verifyAccess for Application,Custom,CustomOther
     */
    @Test
    public void testApplicationWithCustomNamespaceHasComponentWithOtherCustomNamespaceInMarkupAccessPublic() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component access='GLOBAL'><aura:attribute name='testattribute' type='String' access='PUBLIC'/></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor= getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponnet",
                        NamespaceAccess.CUSTOM);
        //create application with above component in markup, set the attribute
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testattribute='' /> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.OTHER_CUSTOM_NAMESPACE + ":testapplication",
                        NamespaceAccess.CUSTOM);

        Exception caught = null;
        try {
            definitionService.getDefinition(descriptor);
        } catch(Exception e) {
            caught = e;
        }
        assertNotNull("application of custom namespace shouldn't be able to set attribute of component with other custom namespace", caught);
        //Access to attribute 'cstring:testcomponnet1.testattribute' from namespace 'cstring1' in 'markup://cstring1:testapplication2(APPLICATION)' is not allowed
        assertTrue("got unexpected message:"+caught.getMessage(), caught.getMessage().contains("is not allowed"));
    }
    
    /**
     * verifyAccess for Application,Custom,System
     */
    @Test
    public void testApplicationWithSystemNamespaceHasComponentWithCustomNamespaceInMarkupAccessPublic() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component access='GLOBAL'><aura:attribute name='testattribute' type='String' access='PUBLIC'/></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor= getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponnet",
                        NamespaceAccess.CUSTOM);
        //create application with above component in markup, set the attribute
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testattribute='' /> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testapplication",
                        NamespaceAccess.INTERNAL);
        definitionService.getDefinition(descriptor);
    }
    
    
    /**
     * verifyAccess for Component,System,System
     */
    @Test
    public void testComponentWithSystemNamespaceHasComponentWithSameSystemNamespaceInMarkupAccessPublic() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component access='GLOBAL'><aura:attribute name='testattribute' type='String' access='PUBLIC'/></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor= getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponnet",
                        NamespaceAccess.INTERNAL);
        //create component with above component in markup, set the attribute
        String source = "<aura:component> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testattribute='' /> </aura:component>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponnet2",
                        NamespaceAccess.INTERNAL);
        definitionService.getDefinition(descriptor);
    }
    
    /**
     * verifyAccess for Component,System,SystemOther
     */
    @Test
    public void testComponentWithSystemNamespaceHasComponentWitOtherSystemNamespaceInMarkupAccessPublic() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component access='GLOBAL'><aura:attribute name='testattribute' type='String' access='PUBLIC'/></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor= getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.OTHER_NAMESPACE + ":testcomponnet",
                        NamespaceAccess.INTERNAL);
        //create component with above component in markup, set the attribute
        String source = "<aura:component> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testattribute='' /> </aura:component>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponnet2",
                        NamespaceAccess.INTERNAL);
        definitionService.getDefinition(descriptor);
    }
    
    /**
     * verifyAccess for Component,System,Custom
     */
    @Test
    public void testComponentWithCustomNamespaceHasComponentWithSystemNamespaceInMarkupAccessPublic() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component access='GLOBAL'><aura:attribute name='testattribute' type='String' access='PUBLIC'/></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor= getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponnet",
                        NamespaceAccess.INTERNAL);
        //create component with above component in markup, set the attribute
        String source = "<aura:component> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testattribute='' /> </aura:component>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponnet2",
                        NamespaceAccess.CUSTOM);

        Exception caught = null;
        try {
            definitionService.getDefinition(descriptor);
        } catch(Exception e) {
            caught = e;
        }
        assertNotNull("component of custom namespace shouldn't be able to set attribute of component with system namespace", caught);
        //Access to attribute 'string:testcomponnet1.testattribute' from namespace 'cstring' in 'markup://cstring:testcomponnet22(COMPONENT)' is not allowed
        assertTrue("got unexpected message:"+caught.getMessage(), caught.getMessage().contains("is not allowed"));
    }
    
    /**
     * verifyAccess for Component,Custom,Custom
     */
    @Test
    public void testComponentWithCustomNamespaceHasComponentWithSameCustomNamespaceInMarkupAccessPublic() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component access='GLOBAL'><aura:attribute name='testattribute' type='String' access='PUBLIC'/></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor= getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponnet",
                        NamespaceAccess.CUSTOM);
        //create component with above component in markup, set the attribute
        String source = "<aura:component> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testattribute='' /> </aura:component>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponnet2",
                        NamespaceAccess.CUSTOM);
        definitionService.getDefinition(descriptor);
    }
    
    /**
     * verifyAccess for Component,Custom,CustomOther
     */
    @Test
    public void testComponentWithCustomNamespaceHasComponentWithOtherCustomNamespaceInMarkupAccessPublic() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component access='GLOBAL'><aura:attribute name='testattribute' type='String' access='PUBLIC'/></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor= getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponnet",
                        NamespaceAccess.CUSTOM);
        //create application with above component in markup, set the attribute
        String source = "<aura:component> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testattribute='' /> </aura:component>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.OTHER_CUSTOM_NAMESPACE + ":testcomponnet2",
                        NamespaceAccess.CUSTOM);

        Exception caught = null;
        try {
            definitionService.getDefinition(descriptor);
        } catch(Exception e) {
            caught = e;
        }
        assertNotNull("component of custom namespace shouldn't be able to set attribute of component with other custom namespace", caught);
        //Access to attribute 'cstring:testcomponnet1.testattribute' from namespace 'cstring1' in 'markup://cstring1:testcomponnet22(COMPONENT)' is not allowed
        assertTrue("got unexpected message:"+caught.getMessage(), caught.getMessage().contains("is not allowed"));
    }
    
    /**
     * verifyAccess for Component,Custom,System
     */
    @Test
    public void testComponentWithSystemNamespaceHasComponentWithCustomNamespaceInMarkupAccessPublic() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component access='GLOBAL'><aura:attribute name='testattribute' type='String' access='PUBLIC'/></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor= getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponnet",
                        NamespaceAccess.CUSTOM);
        //create component with above component in markup, set the attribute
        String source = "<aura:component> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testattribute='' /> </aura:component>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponnet2",
                        NamespaceAccess.INTERNAL);
        definitionService.getDefinition(descriptor);
    }
    
    
    
    
    

    /**
     * Global access tests start
     */
    /**
     * tests around privileged namespace
     */
    @Test
    public void testApplicationWithPrivilegedNamespaceHasComponentWithSamePrivilegedNamespaceInMarkupAccessGLOBAL() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component access='GLOBAL'><aura:attribute name='testattribute' type='String' access='GLOBAL'/></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor= getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testcomponnet",
                        NamespaceAccess.PRIVILEGED);
        //create application with above component in markup, set the attribute
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testattribute='' /> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testapplication",
                        NamespaceAccess.PRIVILEGED);
        definitionService.getDefinition(descriptor);
    }

    @Test
    public void testApplicationWithPrivilegedNamespaceHasComponentWithOtherPrivilegedNamespaceInMarkupAccessGLOBAL() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component access='GLOBAL'><aura:attribute name='testattribute' type='String' access='GLOBAL'/></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor= getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testcomponnet",
                        NamespaceAccess.PRIVILEGED);
        //create application with above component in markup, set the attribute
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testattribute='' /> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.OTHER_PRIVILEGED_NAMESPACE + ":testapplication",
                        NamespaceAccess.PRIVILEGED);
            definitionService.getDefinition(descriptor);
    }

    @Test
    public void testApplicationWithPrivilegedNamespaceHasComponentWithSystemNamespaceInMarkupAccessGLOBAL() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component access='GLOBAL'><aura:attribute name='testattribute' type='String' access='GLOBAL'/></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor= getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponnet",
                        NamespaceAccess.INTERNAL);
        //create application with above component in markup, set the attribute
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testattribute='' /> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.OTHER_PRIVILEGED_NAMESPACE + ":testapplication",
                        NamespaceAccess.PRIVILEGED);
            definitionService.getDefinition(descriptor);
    }
    @Test
    public void testApplicationWithPrivilegedNamespaceHasComponentWithCustomNamespaceInMarkupAccessGLOBAL() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component access='GLOBAL'><aura:attribute name='testattribute' type='String' access='GLOBAL'/></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor= getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponnet",
                        NamespaceAccess.CUSTOM);
        //create application with above component in markup, set the attribute
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testattribute='' /> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.OTHER_PRIVILEGED_NAMESPACE + ":testapplication",
                        NamespaceAccess.PRIVILEGED);
            definitionService.getDefinition(descriptor);
    }
    @Test
    public void testApplicationWithCustomNamespaceHasComponentWithPrivilegedNamespaceInMarkupAccessGLOBAL() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component access='GLOBAL'><aura:attribute name='testattribute' type='String' access='GLOBAL'/></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor= getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testcomponnet",
                        NamespaceAccess.PRIVILEGED);
        //create application with above component in markup, set the attribute
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testattribute='' /> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testapplication",
                        NamespaceAccess.CUSTOM);
            definitionService.getDefinition(descriptor);
    }
    @Test
    public void testApplicationWithSystemNamespaceHasComponentWithPrivilegedNamespaceInMarkupAccessGLOBAL() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component access='GLOBAL'><aura:attribute name='testattribute' type='String' access='GLOBAL'/></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor= getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testcomponnet",
                        NamespaceAccess.PRIVILEGED);
        //create application with above component in markup, set the attribute
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testattribute='' /> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testapplication",
                        NamespaceAccess.INTERNAL);
        definitionService.getDefinition(descriptor);
    }
    
    
    /**
     * verifyAccess for Application,System,System
     */
    @Test
    public void testApplicationWithSystemNamespaceHasComponentWithSameSystemNamespaceInMarkupAccessGlobal() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component access='GLOBAL'><aura:attribute name='testattribute' type='String' access='GLOBAL'/></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor= getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponnet",
                        NamespaceAccess.INTERNAL);
        //create application with above component in markup, set the attribute
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testattribute='' /> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testapplication",
                        NamespaceAccess.INTERNAL);
        definitionService.getDefinition(descriptor);
    }
    
    /**
     * verifyAccess for Application,System,SystemOther
     */
    @Test
    public void testApplicationWithSystemNamespaceHasComponentWithOtherSystemNamespaceInMarkupAccessGlobal() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component access='GLOBAL'><aura:attribute name='testattribute' type='String' access='GLOBAL'/></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor= getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.OTHER_NAMESPACE + ":testcomponnet",
                        NamespaceAccess.INTERNAL);
        //create application with above component in markup, set the attribute
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testattribute='' /> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testapplication",
                        NamespaceAccess.INTERNAL);
        definitionService.getDefinition(descriptor);
    }
    
    /**
     * verifyAccess for Application,System,Custom
     */
    @Test
    public void testApplicationWithCustomNamespaceHasComponentWithSystemNamespaceInMarkupAccessGlobal() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component access='GLOBAL'><aura:attribute name='testattribute' type='String' access='GLOBAL'/></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor= getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponnet",
                        NamespaceAccess.INTERNAL);
        //create application with above component in markup, set the attribute
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testattribute='' /> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testapplication",
                        NamespaceAccess.CUSTOM);
            definitionService.getDefinition(descriptor);
    }
    
    /**
     * verifyAccess for Application,Custom,Custom
     */
    @Test
    public void testApplicationWithCustomNamespaceHasComponentWithSameCustomNamespaceInMarkupAccessGlobal() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component access='GLOBAL'><aura:attribute name='testattribute' type='String' access='GLOBAL'/></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor= getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponnet",
                        NamespaceAccess.CUSTOM);
        //create application with above component in markup, set the attribute
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testattribute='' /> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testapplication",
                        NamespaceAccess.CUSTOM);
        definitionService.getDefinition(descriptor);
    }
    
    /**
     * verifyAccess for Application,Custom,CustomOther
     */
    @Test
    public void testApplicationWithCustomNamespaceHasComponentWithOtherCustomNamespaceInMarkupAccessGlobal() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component access='GLOBAL'><aura:attribute name='testattribute' type='String' access='GLOBAL'/></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor= getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponnet",
                        NamespaceAccess.CUSTOM);
        //create application with above component in markup, set the attribute
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testattribute='' /> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.OTHER_CUSTOM_NAMESPACE + ":testapplication",
                        NamespaceAccess.CUSTOM);
            definitionService.getDefinition(descriptor);
    }
    
    /**
     * verifyAccess for Application,Custom,System
     */
    @Test
    public void testApplicationWithSystemNamespaceHasComponentWithCustomNamespaceInMarkupAccessGlobal() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component access='GLOBAL'><aura:attribute name='testattribute' type='String' access='GLOBAL'/></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor= getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponnet",
                        NamespaceAccess.CUSTOM);
        //create application with above component in markup, set the attribute
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testattribute='' /> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testapplication",
                        NamespaceAccess.INTERNAL);
        definitionService.getDefinition(descriptor);
    }
    
    
    /**
     * verifyAccess for Component,System,System
     */
    @Test
    public void testComponentWithSystemNamespaceHasComponentWithSameSystemNamespaceInMarkupAccessGlobal() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component access='GLOBAL'><aura:attribute name='testattribute' type='String' access='GLOBAL'/></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor= getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponnet",
                        NamespaceAccess.INTERNAL);
        //create component with above component in markup, set the attribute
        String source = "<aura:component> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testattribute='' /> </aura:component>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponnet2",
                        NamespaceAccess.INTERNAL);
        definitionService.getDefinition(descriptor);
    }
    
    /**
     * verifyAccess for Component,System,SystemOther
     */
    @Test
    public void testComponentWithSystemNamespaceHasComponentWithOtherSystemNamespaceInMarkupAccessGlobal() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component access='GLOBAL'><aura:attribute name='testattribute' type='String' access='GLOBAL'/></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor= getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.OTHER_NAMESPACE + ":testcomponnet",
                        NamespaceAccess.INTERNAL);
        //create component with above component in markup, set the attribute
        String source = "<aura:component> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testattribute='' /> </aura:component>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponnet2",
                        NamespaceAccess.INTERNAL);
        definitionService.getDefinition(descriptor);
    }
    
    /**
     * verifyAccess for Component,System,Custom
     */
    @Test
    public void testComponentWithCustomNamespaceHasComponentWithSystemNamespaceInMarkupAccessGlobal() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component access='GLOBAL'><aura:attribute name='testattribute' type='String' access='GLOBAL'/></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor= getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponnet",
                        NamespaceAccess.INTERNAL);
        //create component with above component in markup, set the attribute
        String source = "<aura:component> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testattribute='' /> </aura:component>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponnet2",
                        NamespaceAccess.CUSTOM);
            definitionService.getDefinition(descriptor);
    }
    
    /**
     * verifyAccess for Component,Custom,Custom
     */
    @Test
    public void testComponentWithCustomNamespaceHasComponentWithSameCustomNamespaceInMarkupAccessGlobal() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component access='GLOBAL'><aura:attribute name='testattribute' type='String' access='GLOBAL'/></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor= getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponnet",
                        NamespaceAccess.CUSTOM);
        //create component with above component in markup, set the attribute
        String source = "<aura:component> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testattribute='' /> </aura:component>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponnet2",
                        NamespaceAccess.CUSTOM);
        definitionService.getDefinition(descriptor);
    }
    
    /**
     * verifyAccess for Component,Custom,CustomOther
     */
    @Test
    public void testComponentWithCustomNamespaceHasComponentWithOtherCustomNamespaceInMarkupAccessGlobal() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component access='GLOBAL'><aura:attribute name='testattribute' type='String' access='GLOBAL'/></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor= getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponnet",
                        NamespaceAccess.CUSTOM);
        //create application with above component in markup, set the attribute
        String source = "<aura:component> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testattribute='' /> </aura:component>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.OTHER_CUSTOM_NAMESPACE + ":testcomponnet2",
                        NamespaceAccess.CUSTOM);
            definitionService.getDefinition(descriptor);
    }
    
    /**
     * verifyAccess for Component,Custom,System
     */
    @Test
    public void testComponentWithSystemNamespaceHasComponentWithCustomNamespaceInMarkupAccessGlobal() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component access='GLOBAL'><aura:attribute name='testattribute' type='String' access='GLOBAL'/></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor= getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponnet",
                        NamespaceAccess.CUSTOM);
        //create component with above component in markup, set the attribute
        String source = "<aura:component> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testattribute='' /> </aura:component>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponnet2",
                        NamespaceAccess.INTERNAL);
        definitionService.getDefinition(descriptor);
    }
    
    /**
     * Privates Access start
     */
    /**
     * tests around privileged namespace
     */

    @Test
    public void testApplicationWithPrivilegedNamespaceHasComponentWithSamePrivilegedNamespaceInMarkupAccessPrivate() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component access='GLOBAL'><aura:attribute name='testattribute' type='String' access='Private'/></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor= getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testcomponnet",
                        NamespaceAccess.PRIVILEGED);
        //create application with above component in markup, set the attribute
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testattribute='' /> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testapplication",
                        NamespaceAccess.PRIVILEGED);

        Exception caught = null;
        try {
            definitionService.getDefinition(descriptor);
        } catch(NoAccessException e) {
            caught = e;
        }
        assertNotNull("Attribute marked as PRIVATE cannot be accessed even in the same privileged namespace", caught);
        // missing message
        assertTrue("got unexpected message: " + caught.getMessage(), caught.getMessage().contains("with access PRIVATE"));
    }

    @Test
    public void testApplicationWithPrivilegedNamespaceHasComponentWithOtherPrivilegedNamespaceInMarkupAccessPrivate() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component access='GLOBAL'><aura:attribute name='testattribute' type='String' access='Private'/></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor= getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testcomponnet",
                        NamespaceAccess.PRIVILEGED);
        //create application with above component in markup, set the attribute
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testattribute='' /> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.OTHER_PRIVILEGED_NAMESPACE + ":testapplication",
                        NamespaceAccess.PRIVILEGED);

        Exception caught = null;
        try {
            definitionService.getDefinition(descriptor);
        } catch(Exception e) {
            caught = e;
        }
        assertNotNull("application of privileged namespace shouldn't be able to access attribute of another privileged namespace", caught);
        //Access to application 'string:testapplication1' from namespace 'privilegedNS' in 'markup://privilegedNS:testapplicationChild2(APPLICATION)' is not allowed
        assertTrue("got unexpected message:"+caught.getMessage(), caught.getMessage().contains("is not allowed"));
    }

    @Test
    public void testApplicationWithPrivilegedNamespaceHasComponentWithSystemNamespaceInMarkupAccessPrivate() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component access='GLOBAL'><aura:attribute name='testattribute' type='String' access='Private'/></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor= getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponnet",
                        NamespaceAccess.INTERNAL);
        //create application with above component in markup, set the attribute
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testattribute='' /> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.OTHER_PRIVILEGED_NAMESPACE + ":testapplication",
                        NamespaceAccess.PRIVILEGED);

        Exception caught = null;
        try {
            definitionService.getDefinition(descriptor);
        } catch(Exception e) {
            caught = e;
        }
        assertNotNull("application of privileged namespace shouldn't be able to access attribute of system application namespace", caught);
        //Access to application 'string:testapplication1' from namespace 'privilegedNS' in 'markup://privilegedNS:testapplicationChild2(APPLICATION)' is not allowed
        assertTrue("got unexpected message:"+caught.getMessage(), caught.getMessage().contains("is not allowed"));
    }

    @Test
    public void testApplicationWithPrivilegedNamespaceHasComponentWithCustomNamespaceInMarkupAccessPrivate() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component access='GLOBAL'><aura:attribute name='testattribute' type='String' access='Private'/></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor= getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponnet",
                        NamespaceAccess.CUSTOM);
        //create application with above component in markup, set the attribute
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testattribute='' /> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.OTHER_PRIVILEGED_NAMESPACE + ":testapplication",
                        NamespaceAccess.PRIVILEGED);

        Exception caught = null;
        try {
            definitionService.getDefinition(descriptor);
        } catch(Exception e) {
            caught = e;
        }
        assertNotNull("application of privileged namespace shouldn't be able to access attribute of custom application namespace", caught);
        //Access to application 'string:testapplication1' from namespace 'privilegedNS' in 'markup://privilegedNS:testapplicationChild2(APPLICATION)' is not allowed
        assertTrue("got unexpected message:"+caught.getMessage(), caught.getMessage().contains("is not allowed"));
    }
    @Test
    public void testApplicationWithCustomNamespaceHasComponentWithPrivilegedNamespaceInMarkupAccessPrivate() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component access='GLOBAL'><aura:attribute name='testattribute' type='String' access='Private'/></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor= getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testcomponnet",
                        NamespaceAccess.PRIVILEGED);
        //create application with above component in markup, set the attribute
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testattribute='' /> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testapplication",
                        NamespaceAccess.CUSTOM);

        Exception caught = null;
        try {
            definitionService.getDefinition(descriptor);
        } catch(Exception e) {
            caught = e;
        }
        assertNotNull("application of custom namespace shouldn't be able to access attribute of privileged application namespace", caught);
        //Access to application 'string:testapplication1' from namespace 'privilegedNS' in 'markup://privilegedNS:testapplicationChild2(APPLICATION)' is not allowed
        assertTrue("got unexpected message:"+caught.getMessage(), caught.getMessage().contains("is not allowed"));
    }
    @Test
    public void testApplicationWithSystemNamespaceHasComponentWithPrivilegedNamespaceInMarkupAccessPrivate() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component access='GLOBAL'><aura:attribute name='testattribute' type='String' access='Private'/></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor= getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testcomponnet",
                        NamespaceAccess.PRIVILEGED);
        //create application with above component in markup, set the attribute
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testattribute='' /> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testapplication",
                        NamespaceAccess.INTERNAL);
        definitionService.getDefinition(descriptor);
    }
    
    /**
     * verifyAccess for Application,System,SystemOther
     */
    @Test
    public void testApplicationWithSystemNamespaceHasComponentWithOtherSystemNamespaceInMarkupAccessPrivate() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component access='GLOBAL'><aura:attribute name='testattribute' type='String' access='Private'/></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor= getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.OTHER_NAMESPACE + ":testcomponnet",
                        NamespaceAccess.INTERNAL);
        //create application with above component in markup, set the attribute
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testattribute='' /> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testapplication",
                        NamespaceAccess.INTERNAL);
        definitionService.getDefinition(descriptor);
    }
    
    /**
     * verifyAccess for Application,System,SystemOther
     */
    @Test
    public void testApplicationWithSystemNamespaceHasComponentWithSameSystemNamespaceInMarkupAccessPrivate() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component access='GLOBAL'><aura:attribute name='testattribute' type='String' access='Private'/></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor= getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponnet",
                        NamespaceAccess.INTERNAL);
        //create application with above component in markup, set the attribute
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testattribute='' /> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testapplication",
                        NamespaceAccess.INTERNAL);
        definitionService.getDefinition(descriptor);
    }
    
    @Test
    public void testApplicationWithSystemNamespaceHasComponentWithCustomNamespaceInMarkupAccessPrivate() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component access='GLOBAL'><aura:attribute name='testattribute' type='String' access='Private'/></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor= getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponnet",
                        NamespaceAccess.CUSTOM);
        //create application with above component in markup, set the attribute
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testattribute='' /> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testapplication",
                        NamespaceAccess.INTERNAL);
        definitionService.getDefinition(descriptor);
    }
    
    @Test
    public void testApplicationWithCustomNamespaceHasComponentWithSameCustomNamespaceInMarkupAccessPrivate() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component access='GLOBAL'><aura:attribute name='testattribute' type='String' access='Private'/></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor= getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponent",
                        NamespaceAccess.CUSTOM);
        //create application with above component in markup, set the attribute
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testattribute='' /> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testapplication",
                        NamespaceAccess.CUSTOM);

        Exception caught = null;
        try {
            definitionService.getDefinition(descriptor);
        } catch(NoAccessException e) {
            caught = e;
        }
        assertNotNull("Attribute marked as PRIVATE cannot be accessed even in the same custom namespace", caught);
        // missing message
        assertTrue("got unexpected message: " + caught.getMessage(), caught.getMessage().contains("with access PRIVATE"));
    }
    
    /**
     * verifyAccess for Application,Custom,CustomOther
     */
    @Test
    public void testApplicationWithCustomNamespaceHasComponentWithOtherCustomNamespaceInMarkupAccessPrivate() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component access='GLOBAL'><aura:attribute name='testattribute' type='String' access='Private'/></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor= getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponnet",
                        NamespaceAccess.CUSTOM);
        //create application with above component in markup, set the attribute
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testattribute='' /> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.OTHER_CUSTOM_NAMESPACE + ":testapplication",
                        NamespaceAccess.CUSTOM);

        Exception caught = null;
        try {
            definitionService.getDefinition(descriptor);
        } catch (NoAccessException e) {
            caught = e;
        }
        assertNotNull("application of custom namespace shouldn't be able to set attribute of component with other custom namespace with access='Private'", caught);
        //Access to attribute 'cstring:testcomponnet1.testattribute' from namespace 'cstring1' in 'markup://cstring1:testapplication2(APPLICATION)' is not allowed
        assertTrue("got unexpected message:"+caught.getMessage(), caught.getMessage().contains("is not allowed"));
    }
    
    @Test
    public void testApplicationWithCustomNamespaceHasComponentWithSystemNamespaceInMarkupAccessPrivate() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component access='GLOBAL'><aura:attribute name='testattribute' type='String' access='Private'/></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor= getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponnet",
                        NamespaceAccess.INTERNAL);
        //create application with above component in markup, set the attribute
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testattribute='' /> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testapplication",
                        NamespaceAccess.CUSTOM);

        Exception caught = null;
        try {
            definitionService.getDefinition(descriptor);
        } catch(Exception e) {
            caught = e;
        }
        assertNotNull("application of custom namespace shouldn't be able to set attribute of component with system namespace", caught);
        //Access to attribute 'string:testcomponnet1.testattribute' from namespace 'cstring' in 'markup://cstring:testapplication2(APPLICATION)' is not allowed
        assertTrue("got unexpected message:"+caught.getMessage(), caught.getMessage().contains("is not allowed"));
    }
    

}
