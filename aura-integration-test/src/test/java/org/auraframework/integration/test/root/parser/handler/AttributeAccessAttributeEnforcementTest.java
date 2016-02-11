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
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.test.annotation.UnAdaptableTest;
import org.junit.Test;

@UnAdaptableTest("namespace start with c means something special in core")
public class AttributeAccessAttributeEnforcementTest extends AuraImplTestCase {
    
    public AttributeAccessAttributeEnforcementTest(String name) throws Exception {
        super(name);
    }       
    
    /**
     * Default access tests start
     */
    /**
     * verifyAccess for Application,System,System
     */
    @Test
    public void testApplicationWithSystemNamespaceHasComponentWithSameSystemNamespaceInMarkup() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component access='GLOBAL'><aura:attribute name='testattribute' type='String'/></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor= getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponnet", true);
        //create application with above component in markup, set the attribute
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testattribute='' /> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testapplication", true);
        descriptor.getDef();
    }
    
    /**
     * verifyAccess for Application,System,SystemOther
     */
    @Test
    public void testApplicationWithSystemNamespaceHasComponentWitOtherSystemNamespaceInMarkup() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component access='GLOBAL'><aura:attribute name='testattribute' type='String'/></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor= getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.OTHER_NAMESPACE + ":testcomponnet", true);
        //create application with above component in markup, set the attribute
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testattribute='' /> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testapplication", true);
        descriptor.getDef();
    }
    
    /**
     * verifyAccess for Application,System,Custom
     */
    @Test
    public void testApplicationWithCustomNamespaceHasComponentWitSystemNamespaceInMarkup() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component access='GLOBAL'><aura:attribute name='testattribute' type='String'/></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor= getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponnet", true);
        //create application with above component in markup, set the attribute
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testattribute='' /> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testapplication", false);
        try{
        	descriptor.getDef();
        	fail("application of custom namespace shouldn't be able to set attribute of component with system namespace");
        } catch(Exception e) {
        	//expect 
    		//System.out.println(e.getMessage());
    		//Access to attribute 'string:testcomponnet1.testattribute' from namespace 'cstring' in 'markup://cstring:testapplication2(APPLICATION)' disallowed by MasterDefRegistry.assertAccess()
        }
    }
    
    /**
     * verifyAccess for Application,Custom,Custom
     */
    @Test
    public void testApplicationWithCustomNamespaceHasComponentWithSameCustomNamespaceInMarkup() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component access='GLOBAL'><aura:attribute name='testattribute' type='String'/></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor= getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponnet", false);
        //create application with above component in markup, set the attribute
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testattribute='' /> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testapplication", false);
        descriptor.getDef();
    }
    
    /**
     * verifyAccess for Application,Custom,CustomOther
     */
    @Test
    public void testApplicationWithCustomNamespaceHasComponentWithOtherCustomNamespaceInMarkup() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component access='GLOBAL'><aura:attribute name='testattribute' type='String'/></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor= getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponnet", false);
        //create application with above component in markup, set the attribute
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testattribute='' /> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.OTHER_CUSTOM_NAMESPACE + ":testapplication", false);
        try {
        	descriptor.getDef();
        	fail("application of custom namespace shouldn't be able to set attribute of component with other custom namespace");
        } catch(Exception e) {
        	//expect 
    		//System.out.println(e.getMessage());
        	//Access to attribute 'cstring:testcomponnet1.testattribute' from namespace 'cstring1' in 'markup://cstring1:testapplication2(APPLICATION)' disallowed by MasterDefRegistry.assertAccess()
        }
    }
    
    /**
     * verifyAccess for Application,Custom,System
     */
    @Test
    public void testApplicationWithSystemNamespaceHasComponentWithCustomNamespaceInMarkup() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component access='GLOBAL'><aura:attribute name='testattribute' type='String'/></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor= getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponnet", false);
        //create application with above component in markup, set the attribute
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testattribute='' /> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testapplication", true);
        descriptor.getDef();
    }
    
    
    /**
     * verifyAccess for Component,System,System
     */
    @Test
    public void testComponentWithSystemNamespaceHasComponentWithSameSystemNamespaceInMarkup() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component access='GLOBAL'><aura:attribute name='testattribute' type='String'/></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor= getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponnet", true);
        //create component with above component in markup, set the attribute
        String source = "<aura:component> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testattribute='' /> </aura:component>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponnet2", true);
        descriptor.getDef();
    }
    
    /**
     * verifyAccess for Component,System,SystemOther
     */
    @Test
    public void testComponentWithSystemNamespaceHasComponentWitOtherSystemNamespaceInMarkup() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component access='GLOBAL'><aura:attribute name='testattribute' type='String'/></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor= getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.OTHER_NAMESPACE + ":testcomponnet", true);
        //create component with above component in markup, set the attribute
        String source = "<aura:component> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testattribute='' /> </aura:component>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponnet2", true);
        descriptor.getDef();
    }
    
    /**
     * verifyAccess for Component,System,Custom
     */
    @Test
    public void testComponentWithCustomNamespaceHasComponentWitSystemNamespaceInMarkup() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component access='GLOBAL'><aura:attribute name='testattribute' type='String'/></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor= getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponnet", true);
        //create component with above component in markup, set the attribute
        String source = "<aura:component> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testattribute='' /> </aura:component>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponnet2", false);
        try{
        	descriptor.getDef();
        	fail("component of custom namespace shouldn't be able to set attribute of component with system namespace");
        } catch(Exception e) {
        	//expect 
    		//System.out.println(e.getMessage());
    		//Access to attribute 'string:testcomponnet1.testattribute' from namespace 'cstring' in 'markup://cstring:testcomponnet22(COMPONENT)' disallowed by MasterDefRegistry.assertAccess()
        }
    }
    
    /**
     * verifyAccess for Component,Custom,Custom
     */
    @Test
    public void testComponentWithCustomNamespaceHasComponentWithSameCustomNamespaceInMarkup() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component access='GLOBAL'><aura:attribute name='testattribute' type='String'/></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor= getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponnet", false);
        //create component with above component in markup, set the attribute
        String source = "<aura:component> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testattribute='' /> </aura:component>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponnet2", false);
        descriptor.getDef();
    }
    
    /**
     * verifyAccess for Component,Custom,CustomOther
     */
    @Test
    public void testComponentWithCustomNamespaceHasComponentWithOtherCustomNamespaceInMarkup() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component access='GLOBAL'><aura:attribute name='testattribute' type='String'/></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor= getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponnet", false);
        //create application with above component in markup, set the attribute
        String source = "<aura:component> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testattribute='' /> </aura:component>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.OTHER_CUSTOM_NAMESPACE + ":testcomponnet2", false);
        try {
        	descriptor.getDef();
        	fail("component of custom namespace shouldn't be able to set attribute of component with other custom namespace");
        } catch(Exception e) {
        	//expect 
    		//System.out.println(e.getMessage());
    		//Access to attribute 'cstring:testcomponnet1.testattribute' from namespace 'cstring1' in 'markup://cstring1:testcomponnet22(COMPONENT)' disallowed by MasterDefRegistry.assertAccess()
        }
    }
    
    /**
     * verifyAccess for Component,Custom,System
     */
    @Test
    public void testComponentWithSystemNamespaceHasComponentWithCustomNamespaceInMarkup() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component access='GLOBAL'><aura:attribute name='testattribute' type='String'/></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor= getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponnet", false);
        //create component with above component in markup, set the attribute
        String source = "<aura:component> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testattribute='' /> </aura:component>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponnet2", true);
        descriptor.getDef();
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
     * verifyAccess for Application,System,System
     */
    @Test
    public void testApplicationWithSystemNamespaceHasComponentWithSameSystemNamespaceInMarkupAccessPublic() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component access='GLOBAL'><aura:attribute name='testattribute' type='String' access='PUBLIC'/></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor= getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponnet", true);
        //create application with above component in markup, set the attribute
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testattribute='' /> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testapplication", true);
        descriptor.getDef();
    }
    
    /**
     * verifyAccess for Application,System,SystemOther
     */
    @Test
    public void testApplicationWithSystemNamespaceHasComponentWitOtherSystemNamespaceInMarkupAccessPublic() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component access='GLOBAL'><aura:attribute name='testattribute' type='String' access='PUBLIC'/></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor= getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.OTHER_NAMESPACE + ":testcomponnet", true);
        //create application with above component in markup, set the attribute
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testattribute='' /> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testapplication", true);
        descriptor.getDef();
    }
    
    /**
     * verifyAccess for Application,System,Custom
     */
    @Test
    public void testApplicationWithCustomNamespaceHasComponentWitSystemNamespaceInMarkupAccessPublic() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component access='GLOBAL'><aura:attribute name='testattribute' type='String' access='PUBLIC'/></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor= getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponnet", true);
        //create application with above component in markup, set the attribute
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testattribute='' /> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testapplication", false);
        try{
        	descriptor.getDef();
        	fail("application of custom namespace shouldn't be able to set attribute of component with system namespace");
        } catch(Exception e) {
        	//expect 
    		//System.out.println(e.getMessage());
    		//Access to attribute 'string:testcomponnet1.testattribute' from namespace 'cstring' in 'markup://cstring:testapplication2(APPLICATION)' disallowed by MasterDefRegistry.assertAccess()
        }
    }
    
    /**
     * verifyAccess for Application,Custom,Custom
     */
    @Test
    public void testApplicationWithCustomNamespaceHasComponentWithSameCustomNamespaceInMarkupAccessPublic() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component access='GLOBAL'><aura:attribute name='testattribute' type='String' access='PUBLIC'/></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor= getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponnet", false);
        //create application with above component in markup, set the attribute
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testattribute='' /> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testapplication", false);
        descriptor.getDef();
    }
    
    /**
     * verifyAccess for Application,Custom,CustomOther
     */
    @Test
    public void testApplicationWithCustomNamespaceHasComponentWithOtherCustomNamespaceInMarkupAccessPublic() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component access='GLOBAL'><aura:attribute name='testattribute' type='String' access='PUBLIC'/></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor= getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponnet", false);
        //create application with above component in markup, set the attribute
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testattribute='' /> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.OTHER_CUSTOM_NAMESPACE + ":testapplication", false);
        try {
        	descriptor.getDef();
        	fail("application of custom namespace shouldn't be able to set attribute of component with other custom namespace");
        } catch(Exception e) {
        	//expect 
    		//System.out.println(e.getMessage());
        	//Access to attribute 'cstring:testcomponnet1.testattribute' from namespace 'cstring1' in 'markup://cstring1:testapplication2(APPLICATION)' disallowed by MasterDefRegistry.assertAccess()
        }
    }
    
    /**
     * verifyAccess for Application,Custom,System
     */
    @Test
    public void testApplicationWithSystemNamespaceHasComponentWithCustomNamespaceInMarkupAccessPublic() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component access='GLOBAL'><aura:attribute name='testattribute' type='String' access='PUBLIC'/></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor= getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponnet", false);
        //create application with above component in markup, set the attribute
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testattribute='' /> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testapplication", true);
        descriptor.getDef();
    }
    
    
    /**
     * verifyAccess for Component,System,System
     */
    @Test
    public void testComponentWithSystemNamespaceHasComponentWithSameSystemNamespaceInMarkupAccessPublic() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component access='GLOBAL'><aura:attribute name='testattribute' type='String' access='PUBLIC'/></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor= getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponnet", true);
        //create component with above component in markup, set the attribute
        String source = "<aura:component> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testattribute='' /> </aura:component>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponnet2", true);
        descriptor.getDef();
    }
    
    /**
     * verifyAccess for Component,System,SystemOther
     */
    @Test
    public void testComponentWithSystemNamespaceHasComponentWitOtherSystemNamespaceInMarkupAccessPublic() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component access='GLOBAL'><aura:attribute name='testattribute' type='String' access='PUBLIC'/></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor= getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.OTHER_NAMESPACE + ":testcomponnet", true);
        //create component with above component in markup, set the attribute
        String source = "<aura:component> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testattribute='' /> </aura:component>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponnet2", true);
        descriptor.getDef();
    }
    
    /**
     * verifyAccess for Component,System,Custom
     */
    @Test
    public void testComponentWithCustomNamespaceHasComponentWitSystemNamespaceInMarkupAccessPublic() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component access='GLOBAL'><aura:attribute name='testattribute' type='String' access='PUBLIC'/></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor= getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponnet", true);
        //create component with above component in markup, set the attribute
        String source = "<aura:component> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testattribute='' /> </aura:component>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponnet2", false);
        try{
        	descriptor.getDef();
        	fail("component of custom namespace shouldn't be able to set attribute of component with system namespace");
        } catch(Exception e) {
        	//expect 
    		//System.out.println(e.getMessage());
    		//Access to attribute 'string:testcomponnet1.testattribute' from namespace 'cstring' in 'markup://cstring:testcomponnet22(COMPONENT)' disallowed by MasterDefRegistry.assertAccess()
        }
    }
    
    /**
     * verifyAccess for Component,Custom,Custom
     */
    @Test
    public void testComponentWithCustomNamespaceHasComponentWithSameCustomNamespaceInMarkupAccessPublic() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component access='GLOBAL'><aura:attribute name='testattribute' type='String' access='PUBLIC'/></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor= getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponnet", false);
        //create component with above component in markup, set the attribute
        String source = "<aura:component> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testattribute='' /> </aura:component>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponnet2", false);
        descriptor.getDef();
    }
    
    /**
     * verifyAccess for Component,Custom,CustomOther
     */
    @Test
    public void testComponentWithCustomNamespaceHasComponentWithOtherCustomNamespaceInMarkupAccessPublic() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component access='GLOBAL'><aura:attribute name='testattribute' type='String' access='PUBLIC'/></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor= getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponnet", false);
        //create application with above component in markup, set the attribute
        String source = "<aura:component> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testattribute='' /> </aura:component>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.OTHER_CUSTOM_NAMESPACE + ":testcomponnet2", false);
        try {
        	descriptor.getDef();
        	fail("component of custom namespace shouldn't be able to set attribute of component with other custom namespace");
        } catch(Exception e) {
        	//expect 
    		//System.out.println(e.getMessage());
    		//Access to attribute 'cstring:testcomponnet1.testattribute' from namespace 'cstring1' in 'markup://cstring1:testcomponnet22(COMPONENT)' disallowed by MasterDefRegistry.assertAccess()
        }
    }
    
    /**
     * verifyAccess for Component,Custom,System
     */
    @Test
    public void testComponentWithSystemNamespaceHasComponentWithCustomNamespaceInMarkupAccessPublic() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component access='GLOBAL'><aura:attribute name='testattribute' type='String' access='PUBLIC'/></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor= getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponnet", false);
        //create component with above component in markup, set the attribute
        String source = "<aura:component> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testattribute='' /> </aura:component>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponnet2", true);
        descriptor.getDef();
    }
    
    
    
    
    

    /**
     * Global access tests start
     */
    /**
     * verifyAccess for Application,System,System
     */
    @Test
    public void testApplicationWithSystemNamespaceHasComponentWithSameSystemNamespaceInMarkupAccessGlobal() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component access='GLOBAL'><aura:attribute name='testattribute' type='String' access='GLOBAL'/></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor= getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponnet", true);
        //create application with above component in markup, set the attribute
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testattribute='' /> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testapplication", true);
        descriptor.getDef();
    }
    
    /**
     * verifyAccess for Application,System,SystemOther
     */
    @Test
    public void testApplicationWithSystemNamespaceHasComponentWitOtherSystemNamespaceInMarkupAccessGlobal() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component access='GLOBAL'><aura:attribute name='testattribute' type='String' access='GLOBAL'/></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor= getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.OTHER_NAMESPACE + ":testcomponnet", true);
        //create application with above component in markup, set the attribute
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testattribute='' /> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testapplication", true);
        descriptor.getDef();
    }
    
    /**
     * verifyAccess for Application,System,Custom
     */
    @Test
    public void testApplicationWithCustomNamespaceHasComponentWitSystemNamespaceInMarkupAccessGlobal() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component access='GLOBAL'><aura:attribute name='testattribute' type='String' access='GLOBAL'/></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor= getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponnet", true);
        //create application with above component in markup, set the attribute
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testattribute='' /> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testapplication", false);
        	descriptor.getDef();
    }
    
    /**
     * verifyAccess for Application,Custom,Custom
     */
    @Test
    public void testApplicationWithCustomNamespaceHasComponentWithSameCustomNamespaceInMarkupAccessGlobal() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component access='GLOBAL'><aura:attribute name='testattribute' type='String' access='GLOBAL'/></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor= getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponnet", false);
        //create application with above component in markup, set the attribute
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testattribute='' /> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testapplication", false);
        descriptor.getDef();
    }
    
    /**
     * verifyAccess for Application,Custom,CustomOther
     */
    @Test
    public void testApplicationWithCustomNamespaceHasComponentWithOtherCustomNamespaceInMarkupAccessGlobal() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component access='GLOBAL'><aura:attribute name='testattribute' type='String' access='GLOBAL'/></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor= getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponnet", false);
        //create application with above component in markup, set the attribute
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testattribute='' /> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.OTHER_CUSTOM_NAMESPACE + ":testapplication", false);
        	descriptor.getDef();
    }
    
    /**
     * verifyAccess for Application,Custom,System
     */
    @Test
    public void testApplicationWithSystemNamespaceHasComponentWithCustomNamespaceInMarkupAccessGlobal() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component access='GLOBAL'><aura:attribute name='testattribute' type='String' access='GLOBAL'/></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor= getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponnet", false);
        //create application with above component in markup, set the attribute
        String source = "<aura:application> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testattribute='' /> </aura:application>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testapplication", true);
        descriptor.getDef();
    }
    
    
    /**
     * verifyAccess for Component,System,System
     */
    @Test
    public void testComponentWithSystemNamespaceHasComponentWithSameSystemNamespaceInMarkupAccessGlobal() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component access='GLOBAL'><aura:attribute name='testattribute' type='String' access='GLOBAL'/></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor= getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponnet", true);
        //create component with above component in markup, set the attribute
        String source = "<aura:component> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testattribute='' /> </aura:component>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponnet2", true);
        descriptor.getDef();
    }
    
    /**
     * verifyAccess for Component,System,SystemOther
     */
    @Test
    public void testComponentWithSystemNamespaceHasComponentWitOtherSystemNamespaceInMarkupAccessGlobal() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component access='GLOBAL'><aura:attribute name='testattribute' type='String' access='GLOBAL'/></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor= getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.OTHER_NAMESPACE + ":testcomponnet", true);
        //create component with above component in markup, set the attribute
        String source = "<aura:component> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testattribute='' /> </aura:component>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponnet2", true);
        descriptor.getDef();
    }
    
    /**
     * verifyAccess for Component,System,Custom
     */
    @Test
    public void testComponentWithCustomNamespaceHasComponentWitSystemNamespaceInMarkupAccessGlobal() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component access='GLOBAL'><aura:attribute name='testattribute' type='String' access='GLOBAL'/></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor= getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponnet", true);
        //create component with above component in markup, set the attribute
        String source = "<aura:component> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testattribute='' /> </aura:component>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponnet2", false);
        	descriptor.getDef();
    }
    
    /**
     * verifyAccess for Component,Custom,Custom
     */
    @Test
    public void testComponentWithCustomNamespaceHasComponentWithSameCustomNamespaceInMarkupAccessGlobal() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component access='GLOBAL'><aura:attribute name='testattribute' type='String' access='GLOBAL'/></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor= getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponnet", false);
        //create component with above component in markup, set the attribute
        String source = "<aura:component> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testattribute='' /> </aura:component>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponnet2", false);
        descriptor.getDef();
    }
    
    /**
     * verifyAccess for Component,Custom,CustomOther
     */
    @Test
    public void testComponentWithCustomNamespaceHasComponentWithOtherCustomNamespaceInMarkupAccessGlobal() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component access='GLOBAL'><aura:attribute name='testattribute' type='String' access='GLOBAL'/></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor= getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponnet", false);
        //create application with above component in markup, set the attribute
        String source = "<aura:component> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testattribute='' /> </aura:component>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.OTHER_CUSTOM_NAMESPACE + ":testcomponnet2", false);
        	descriptor.getDef();
    }
    
    /**
     * verifyAccess for Component,Custom,System
     */
    @Test
    public void testComponentWithSystemNamespaceHasComponentWithCustomNamespaceInMarkupAccessGlobal() throws QuickFixException {
        //create component with system namespace
        String cmpSource = "<aura:component access='GLOBAL'><aura:attribute name='testattribute' type='String' access='GLOBAL'/></aura:component>";
        DefDescriptor<? extends Definition> cmpDescriptor= getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, cmpSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testcomponnet", false);
        //create component with above component in markup, set the attribute
        String source = "<aura:component> <" + cmpDescriptor.getNamespace() + ":" + cmpDescriptor.getName() + " testattribute='' /> </aura:component>";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testcomponnet2", true);
        descriptor.getDef();
    }
    

}
