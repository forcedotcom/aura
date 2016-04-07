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

import org.auraframework.Aura;
import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.test.source.StringSourceLoader;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.test.annotation.UnAdaptableTest;
import org.junit.Test;

@UnAdaptableTest("namespace start with c means something special in core")
public class ApplicationAccessAttributeEnforcementTest extends AuraImplTestCase {

    public ApplicationAccessAttributeEnforcementTest(String name) throws Exception {
        super(name);
        
        ConfigAdapter adapter = Aura.getConfigAdapter();
        adapter.addPrivilegedNamespace("privilegedNS");
    }
    
    /**
     * Default Access Tests start
     */
    /**
     * tests around Privileged namespace start
     */
    @Test
    public void testApplicationWithPrivilegedNamespaceExtendsApplicationWithSystemNamespace() throws QuickFixException {
        //create application with system namespace
        String appSource = "<aura:application extensible='true'/>";
        DefDescriptor<? extends Definition> appDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, appSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testapplication", true);
        //create application extends the application
        String appSource2 = "<aura:application extends='" + appDescriptor.getNamespace() + ":" + appDescriptor.getName() + "' /> ";
        DefDescriptor<ApplicationDef> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, appSource2,
        		StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE+":testapplicationChild", false, true);
        try {
        	descriptor.getDef();
        	fail("application of privileged namespace shouldn't be able to extends application of system namespace");
        } catch(Exception e) {
        	//expect 
    		//System.out.println(e.getMessage());
    		//Access to application 'string:testapplication1' from namespace 'privilegedNS' in 'markup://privilegedNS:testapplicationChild2(APPLICATION)' disallowed by MasterDefRegistry.assertAccess()
    		assertTrue("get un-expected error message:"+e.getMessage(), e.getMessage().contains("disallowed by MasterDefRegistry.assertAccess()"));
        }
    }
    @Test
    public void testApplicationWithPrivilegedNamespaceExtendsApplicationWithSystemNamespaceAccessInternal() throws QuickFixException {
        //create application with system namespace
        String appSource = "<aura:application extensible='true' access='Internal'/>";
        DefDescriptor<? extends Definition> appDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, appSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testapplication", true);
        //create application extends the application
        String appSource2 = "<aura:application extends='" + appDescriptor.getNamespace() + ":" + appDescriptor.getName() + "' /> ";
        DefDescriptor<ApplicationDef> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, appSource2,
        		StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE+":testapplicationChild", false, true);
        try {
        	descriptor.getDef();
        	fail("application of privileged namespace shouldn't be able to extends application of system namespace");
        } catch(Exception e) {
        	//expect 
    		//System.out.println(e.getMessage());
    		//Access to application 'string:testapplication1' from namespace 'privilegedNS' in 'markup://privilegedNS:testapplicationChild2(APPLICATION)' disallowed by MasterDefRegistry.assertAccess()
    		assertTrue("get un-expected error message:"+e.getMessage(), e.getMessage().contains("disallowed by MasterDefRegistry.assertAccess()"));
        }
    }
    
    @Test
    public void testApplicationWithPrivilegedNamespaceExtendsApplicationWithSamePrivilegedNamespace() throws QuickFixException {
        //create application with system namespace
        String appSource = "<aura:application extensible='true'/>";
        DefDescriptor<? extends Definition> appDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, appSource,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testapplication", false, true);
        //create application extends the application
        String appSource2 = "<aura:application extends='" + appDescriptor.getNamespace() + ":" + appDescriptor.getName() + "' /> ";
        DefDescriptor<ApplicationDef> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, appSource2,
        		StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE+":testapplicationChild", false, true);
        descriptor.getDef();
    }
    
    @Test
    public void testApplicationWithPrivilegedNamespaceExtendsApplicationWithOtherPrivilegedNamespace() throws QuickFixException {
        //create application with system namespace
        String appSource = "<aura:application extensible='true'/>";
        DefDescriptor<? extends Definition> appDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, appSource,
                StringSourceLoader.OTHER_PRIVILEGED_NAMESPACE + ":testapplication", false, true);
        //create application extends the application
        String appSource2 = "<aura:application extends='" + appDescriptor.getNamespace() + ":" + appDescriptor.getName() + "' /> ";
        DefDescriptor<ApplicationDef> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, appSource2,
        		StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE+":testapplicationChild", false, true);
        try {
        	descriptor.getDef();
        	fail("application of privileged namespace shouldn't be able to extends application of another privileged namespace");
        } catch(Exception e) {
        	//expect 
    		//System.out.println(e.getMessage());
        	//Access to application 'privilegedNS1:testapplication1' from namespace 'privilegedNS' in 'markup://privilegedNS:testapplicationChild2(APPLICATION)' disallowed by MasterDefRegistry.assertAccess()
    		assertTrue("get un-expected error message:"+e.getMessage(), e.getMessage().contains("disallowed by MasterDefRegistry.assertAccess()"));
        }
    }
    
    @Test
    public void testApplicationWithPrivilegedNamespaceExtendsApplicationWithCustomNamespace() throws QuickFixException {
        //create application with system namespace
        String appSource = "<aura:application extensible='true'/>";
        DefDescriptor<? extends Definition> appDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, appSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testapplication", false);
        //create application extends the application
        String appSource2 = "<aura:application extends='" + appDescriptor.getNamespace() + ":" + appDescriptor.getName() + "' /> ";
        DefDescriptor<ApplicationDef> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, appSource2,
        		StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE+":testapplicationChild", false, true);
        try {
        	descriptor.getDef();
        	fail("application of privileged namespace shouldn't be able to extends application of custom namespace");
        } catch(Exception e) {
        	//expect 
    		//System.out.println(e.getMessage());
        	//Access to application 'cstring:testapplication1' from namespace 'privilegedNS' in 'markup://privilegedNS:testapplicationChild2(APPLICATION)' disallowed by MasterDefRegistry.assertAccess()
    		assertTrue("get un-expected error message:"+e.getMessage(), e.getMessage().contains("disallowed by MasterDefRegistry.assertAccess()"));
        }
    }
    
    @Test
    public void testApplicationWithSystemNamespaceExtendsApplicationWithPrivilegedNamespace() throws QuickFixException {
        //create application with system namespace
        String appSource = "<aura:application extensible='true'/>";
        DefDescriptor<? extends Definition> appDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, appSource,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testapplication", false, true);
        //create application extends the application
        String appSource2 = "<aura:application extends='" + appDescriptor.getNamespace() + ":" + appDescriptor.getName() + "' /> ";
        DefDescriptor<ApplicationDef> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, appSource2,
        		StringSourceLoader.DEFAULT_NAMESPACE+":testapplicationChild", true);
        descriptor.getDef();
    }
    
    @Test
    public void testApplicationWithCustomNamespaceExtendsApplicationWithPrivilegedNamespace() throws QuickFixException {
        //create application with system namespace
        String appSource = "<aura:application extensible='true'/>";
        DefDescriptor<? extends Definition> appDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, appSource,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testapplication", false, true);
        //create application extends the application
        String appSource2 = "<aura:application extends='" + appDescriptor.getNamespace() + ":" + appDescriptor.getName() + "' /> ";
        DefDescriptor<ApplicationDef> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, appSource2,
        		StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testapplicationChild", false);
        try {
        	descriptor.getDef();
        	fail("application of custom namespace shouldn't be able to extends application of privileged namespace");
        } catch(Exception e) {
        	//expect 
    		//System.out.println(e.getMessage());
        	//Access to application 'privilegedNS:testapplication1' from namespace 'cstring' in 'markup://cstring:testapplicationChild2(APPLICATION)' disallowed by MasterDefRegistry.assertAccess()
    		assertTrue("get un-expected error message:"+e.getMessage(), e.getMessage().contains("disallowed by MasterDefRegistry.assertAccess()"));
        }
    }
    
    
    
    @Test
    public void testApplicationWithSystemNamespaceExtendsApplicationWithSameSystemNamespace() throws QuickFixException {
        //create application with system namespace
        String appSource = "<aura:application extensible='true'/>";
        DefDescriptor<? extends Definition> appDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, appSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testapplication", true);
        //create application extends the application
        String source = "<aura:application extends='" + appDescriptor.getNamespace() + ":" + appDescriptor.getName() + "' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testapplicationChild", true);
        descriptor.getDef();
    }
    
    @Test
    public void testApplicationWithSystemNamespaceExtendsApplicationWithOtherSystemNamespace() throws QuickFixException {
        //create application with system namespace
        String appSource = "<aura:application extensible='true'/>";
        DefDescriptor<? extends Definition> appDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, appSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testapplication", true);
        //create application extends the application
        String source = "<aura:application extends='" + appDescriptor.getNamespace() + ":" + appDescriptor.getName() + "' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.OTHER_NAMESPACE + ":testapplicationChild", true);
        descriptor.getDef();
    }
    
    /**
     * Verify Default access enforcement
     * verifyAccess for Application,System,Custom
     * verifyAccess for Application,System,CustomOther
     * verifyAccess for Application,SystemOther,Custom
     * verifyAccess for Application,SystemOther,CustomOther
     */
    @Test
    public void testApplicationWithCustomNamespaceExtendsApplicationWithSystemNamespace() throws QuickFixException {
        //create application with system namespace
        String appSource = "<aura:application extensible='true'/>";
        DefDescriptor<? extends Definition> appDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, appSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testapplication", true);
        //create application extends the application
        String source = "<aura:application extends='" + appDescriptor.getNamespace() + ":" + appDescriptor.getName() + "' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testapplicationChild", false);
        try {
        	descriptor.getDef();
        	fail("application of custom namespace shouldn't be able to extends application of system namespace");
        } catch(Exception e) {
        	//expect 
    		//System.out.println(e.getMessage());
    		//Access to application 'string:testapplication1' from namespace 'cstring' in 'markup://cstring:testapplicationChild2(APPLICATION)' disallowed by MasterDefRegistry.assertAccess()
        }
    }
    
    /**
     * Verify Default access enforcement
     * verifyAccess for Application,Custom,System
     * verifyAccess for Application,Custom,SystemOther
     * verifyAccess for Application,CustomOther,System
     * verifyAccess for Application,CustomOther,SystemOther
     */
    @Test
    public void testApplicationWithSystemNamespaceExtendsApplicationWithCustomNamespace() throws QuickFixException {
        //create application with custom namespace
        String appSource = "<aura:application extensible='true'/>";
        DefDescriptor<? extends Definition> appDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, appSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testapplication", false);
        //create application extends the application
        String source = "<aura:application extends='" + appDescriptor.getNamespace() + ":" + appDescriptor.getName() + "' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testapplicationChild", true);
        descriptor.getDef();
    }
    
    /**
     * Verify Default access enforcement
     * verifyAccess for Application,Custom,Custom
     * verifyAccess for Application,CustomOther,CustomOther
     */
    @Test
    public void testApplicationWithCustomNamespaceExtendsApplicationWithSameCustomNamespace() throws QuickFixException {
        //create application with custom namespace
        String appSource = "<aura:application extensible='true'/>";
        DefDescriptor<? extends Definition> appDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, appSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testapplication", false);
        //create application extends the application
        String source = "<aura:application extends='" + appDescriptor.getNamespace() + ":" + appDescriptor.getName() + "' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testapplicationChild", false);
        descriptor.getDef();
    }
    
    /**
     * Verify Default access enforcement
     * verifyAccess for Application,Custom,CustomOther
     * verifyAccess for Application,CustomOther,Custom
     */
    @Test
    public void testApplicationWithCustomNamespaceExtendsApplicationWithAnotherCustomNamespace() throws QuickFixException {
        //create application with custom namespace
        String appSource = "<aura:application extensible='true'/>";
        DefDescriptor<? extends Definition> appDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, appSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testapplication", false);
        //create application extends the application
        String source = "<aura:application extends='" + appDescriptor.getNamespace() + ":" + appDescriptor.getName() + "' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.OTHER_CUSTOM_NAMESPACE + ":testapplicationChild", false);
        try {
        	descriptor.getDef();
        	fail("application of custom namespace shouldn't be able to extends application of another custom namespace");
        } catch(Exception e) {
        	//expect 
    		//System.out.println(e.getMessage());
    		//Access to application 'string:testapplication1' from namespace 'cstring' in 'markup://cstring:testapplicationChild2(APPLICATION)' disallowed by MasterDefRegistry.assertAccess()
        }
    }
    

    /**
     * Public Access Tests start
     */
   
    /**
     * Tests around PrivilegedNamespace
     */
    @Test
    public void testApplicationWithPrivilegedNamespaceExtendsApplicationWithSystemNamespaceAccessPublic() throws QuickFixException {
        //create application with system namespace
        String appSource = "<aura:application extensible='true' access='Public'/>";
        DefDescriptor<? extends Definition> appDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, appSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testapplication", true);
        //create application extends the application
        String appSource2 = "<aura:application extends='" + appDescriptor.getNamespace() + ":" + appDescriptor.getName() + "' /> ";
        DefDescriptor<ApplicationDef> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, appSource2,
        		StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE+":testapplicationChild", false, true);
        try {
        	descriptor.getDef();
        	fail("application of privileged namespace shouldn't be able to extends application of system namespace");
        } catch(Exception e) {
        	//expect 
    		//System.out.println(e.getMessage());
    		//Access to application 'string:testapplication1' from namespace 'privilegedNS' in 'markup://privilegedNS:testapplicationChild2(APPLICATION)' disallowed by MasterDefRegistry.assertAccess()
    		assertTrue("get un-expected error message:"+e.getMessage(), e.getMessage().contains("disallowed by MasterDefRegistry.assertAccess()"));
        }
    }
    
    @Test
    public void testApplicationWithPrivilegedNamespaceExtendsApplicationWithSamePrivilegedNamespaceAccessPublic() throws QuickFixException {
        //create application with system namespace
        String appSource = "<aura:application extensible='true' access='Public'/>";
        DefDescriptor<? extends Definition> appDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, appSource,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testapplication", false, true);
        //create application extends the application
        String appSource2 = "<aura:application extends='" + appDescriptor.getNamespace() + ":" + appDescriptor.getName() + "' /> ";
        DefDescriptor<ApplicationDef> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, appSource2,
        		StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE+":testapplicationChild", false, true);
        descriptor.getDef();
    }
    
    @Test
    public void testApplicationWithPrivilegedNamespaceExtendsApplicationWithOtherPrivilegedNamespaceAccessPublic() throws QuickFixException {
        //create application with system namespace
        String appSource = "<aura:application extensible='true' access='Public'/>";
        DefDescriptor<? extends Definition> appDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, appSource,
                StringSourceLoader.OTHER_PRIVILEGED_NAMESPACE + ":testapplication", false, true);
        //create application extends the application
        String appSource2 = "<aura:application extends='" + appDescriptor.getNamespace() + ":" + appDescriptor.getName() + "' /> ";
        DefDescriptor<ApplicationDef> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, appSource2,
        		StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE+":testapplicationChild", false, true);
        try {
        	descriptor.getDef();
        	fail("application of privileged namespace shouldn't be able to extends application of another privileged namespace");
        } catch(Exception e) {
        	//expect 
    		//System.out.println(e.getMessage());
        	//Access to application 'privilegedNS1:testapplication1' from namespace 'privilegedNS' in 'markup://privilegedNS:testapplicationChild2(APPLICATION)' disallowed by MasterDefRegistry.assertAccess()
    		assertTrue("get un-expected error message:"+e.getMessage(), e.getMessage().contains("disallowed by MasterDefRegistry.assertAccess()"));
        }
    }
    
    @Test
    public void testApplicationWithPrivilegedNamespaceExtendsApplicationWithCustomNamespaceAccessPublic() throws QuickFixException {
        //create application with system namespace
        String appSource = "<aura:application extensible='true' access='Public'/>";
        DefDescriptor<? extends Definition> appDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, appSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testapplication", false);
        //create application extends the application
        String appSource2 = "<aura:application extends='" + appDescriptor.getNamespace() + ":" + appDescriptor.getName() + "' /> ";
        DefDescriptor<ApplicationDef> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, appSource2,
        		StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE+":testapplicationChild", false, true);
        try {
        	descriptor.getDef();
        	fail("application of privileged namespace shouldn't be able to extends application of custom namespace");
        } catch(Exception e) {
        	//expect 
    		//System.out.println(e.getMessage());
        	//Access to application 'cstring:testapplication1' from namespace 'privilegedNS' in 'markup://privilegedNS:testapplicationChild2(APPLICATION)' disallowed by MasterDefRegistry.assertAccess()
    		assertTrue("get un-expected error message:"+e.getMessage(), e.getMessage().contains("disallowed by MasterDefRegistry.assertAccess()"));
        }
    }
    
    @Test
    public void testApplicationWithSystemNamespaceExtendsApplicationWithPrivilegedNamespaceAccessPublic() throws QuickFixException {
        //create application with system namespace
        String appSource = "<aura:application extensible='true' access='PUBLIC'/>";
        DefDescriptor<? extends Definition> appDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, appSource,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testapplication", false, true);
        //create application extends the application
        String appSource2 = "<aura:application extends='" + appDescriptor.getNamespace() + ":" + appDescriptor.getName() + "' /> ";
        DefDescriptor<ApplicationDef> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, appSource2,
        		StringSourceLoader.DEFAULT_NAMESPACE+":testapplicationChild", true);
        descriptor.getDef();
    }
    
    @Test
    public void testApplicationWithCustomNamespaceExtendsApplicationWithPrivilegedNamespaceAccessPublic() throws QuickFixException {
        //create application with system namespace
        String appSource = "<aura:application extensible='true' access='PUBLIC'/>";
        DefDescriptor<? extends Definition> appDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, appSource,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testapplication", false, true);
        //create application extends the application
        String appSource2 = "<aura:application extends='" + appDescriptor.getNamespace() + ":" + appDescriptor.getName() + "' /> ";
        DefDescriptor<ApplicationDef> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, appSource2,
        		StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testapplicationChild", false);
        try {
        	descriptor.getDef();
        	fail("application of custom namespace shouldn't be able to extends application of privileged namespace");
        } catch(Exception e) {
        	//expect 
    		//System.out.println(e.getMessage());
        	//Access to application 'privilegedNS:testapplication1' from namespace 'cstring' in 'markup://cstring:testapplicationChild2(APPLICATION)' disallowed by MasterDefRegistry.assertAccess()
    		assertTrue("get un-expected error message:"+e.getMessage(), e.getMessage().contains("disallowed by MasterDefRegistry.assertAccess()"));
        }
    }
    
    
    @Test
    public void testApplicationWithSystemNamespaceExtendsApplicationWithSameSystemNamespaceAccessPublic() throws QuickFixException {
        //create application with system namespace
        String appSource = "<aura:application extensible='true' access='PUBLIC' />";
        DefDescriptor<? extends Definition> appDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, appSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testapplication", true);
        //create application extends the application
        String source = "<aura:application extends='" + appDescriptor.getNamespace() + ":" + appDescriptor.getName() + "' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testapplicationChild", true);
        descriptor.getDef();
    }
    
    /**
     * Verify Public access enforcement
     * verifyAccess for Application,System,SystemOther
     * verifyAccess for Application,SystemOther,System
     */
    @Test
    public void testApplicationWithSystemNamespaceExtendsApplicationWithOtherSystemNamespaceAccessPublic() throws QuickFixException {
        //create application with system namespace
        String appSource = "<aura:application extensible='true' access='PUBLIC' />";
        DefDescriptor<? extends Definition> appDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, appSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testapplication", true);
        //create application extends the application
        String source = "<aura:application extends='" + appDescriptor.getNamespace() + ":" + appDescriptor.getName() + "' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.OTHER_NAMESPACE + ":testapplicationChild", true);
        descriptor.getDef();
    }
    
    /**
     * Verify Public access enforcement
     * verifyAccess for Application,System,Custom
     * verifyAccess for Application,System,CustomOther
     * verifyAccess for Application,SystemOther,Custom
     * verifyAccess for Application,SystemOther,CustomOther
     */
    @Test
    public void testApplicationWithCustomNamespaceExtendsApplicationWithSystemNamespaceAccessPublic() throws QuickFixException {
        //create application with system namespace
        String appSource = "<aura:application extensible='true' access='PUBLIC' />";
        DefDescriptor<? extends Definition> appDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, appSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testapplication", true);
        //create application extends the application
        String source = "<aura:application extends='" + appDescriptor.getNamespace() + ":" + appDescriptor.getName() + "' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testapplicationChild", false);
        try {
        	descriptor.getDef();
        	fail("application of custom namespace shouldn't be able to extends application of system namespace");
        } catch(Exception e) {
        	//expect 
    		//System.out.println(e.getMessage());
    		//Access to application 'string:testapplication1' from namespace 'cstring' in 'markup://cstring:testapplicationChild2(APPLICATION)' disallowed by MasterDefRegistry.assertAccess()
        }
    }
    
    /**
     * Verify Public access enforcement
     * verifyAccess for Application,Custom,System
     * verifyAccess for Application,Custom,SystemOther
     * verifyAccess for Application,CustomOther,System
     * verifyAccess for Application,CustomOther,SystemOther
     */
    @Test
    public void testApplicationWithSystemNamespaceExtendsApplicationWithCustomNamespaceAccessPublic() throws QuickFixException {
        //create application with custom namespace
        String appSource = "<aura:application extensible='true' access='PUBLIC' />";
        DefDescriptor<? extends Definition> appDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, appSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testapplication", false);
        //create application extends the application
        String source = "<aura:application extends='" + appDescriptor.getNamespace() + ":" + appDescriptor.getName() + "' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testapplicationChild", true);
        descriptor.getDef();
    }
    
    /**
     * Verify Public access enforcement
     * verifyAccess for Application,Custom,Custom
     * verifyAccess for Application,CustomOther,CustomOther
     */
    @Test
    public void testApplicationWithCustomNamespaceExtendsApplicationWithSameCustomNamespaceAccessPublic() throws QuickFixException {
        //create application with custom namespace
        String appSource = "<aura:application extensible='true' access='PUBLIC' />";
        DefDescriptor<? extends Definition> appDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, appSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testapplication", false);
        //create application extends the application
        String source = "<aura:application extends='" + appDescriptor.getNamespace() + ":" + appDescriptor.getName() + "' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testapplicationChild", false);
        descriptor.getDef();
    }
    
    /**
     * Verify Public access enforcement
     * verifyAccess for Application,Custom,CustomOther
     * verifyAccess for Application,CustomOther,Custom
     */
    @Test
    public void testApplicationWithCustomNamespaceExtendsApplicationWithAnotherCustomNamespaceAccessPublic() throws QuickFixException {
        //create application with custom namespace
        String appSource = "<aura:application extensible='true' access='PUBLIC' />";
        DefDescriptor<? extends Definition> appDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, appSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testapplication", false);
        //create application extends the application
        String source = "<aura:application extends='" + appDescriptor.getNamespace() + ":" + appDescriptor.getName() + "' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.OTHER_CUSTOM_NAMESPACE + ":testapplicationChild", false);
        try {
        	descriptor.getDef();
        	fail("application of custom namespace shouldn't be able to extends application of another custom namespace");
        } catch(Exception e) {
        	//expect 
    		//System.out.println(e.getMessage());
    		//Access to application 'string:testapplication1' from namespace 'cstring' in 'markup://cstring:testapplicationChild2(APPLICATION)' disallowed by MasterDefRegistry.assertAccess()
        }
    }
    
   
    /**
     * Global Access Tests start
     */
    
    
    /**
     * Tests around PrivilegedNamespace
     */
    @Test
    public void testApplicationWithPrivilegedNamespaceExtendsApplicationWithSystemNamespaceAccessGlobal() throws QuickFixException {
        //create application with system namespace
        String appSource = "<aura:application extensible='true' access='GLOBAL'/>";
        DefDescriptor<? extends Definition> appDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, appSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testapplication", true);
        //create application extends the application
        String appSource2 = "<aura:application extends='" + appDescriptor.getNamespace() + ":" + appDescriptor.getName() + "' /> ";
        DefDescriptor<ApplicationDef> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, appSource2,
        		StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE+":testapplicationChild", false, true);
        	descriptor.getDef();
    }
    
    @Test
    public void testApplicationWithPrivilegedNamespaceExtendsApplicationWithSamePrivilegedNamespaceAccessGlobal() throws QuickFixException {
        //create application with system namespace
        String appSource = "<aura:application extensible='true' access='GLOBAL'/>";
        DefDescriptor<? extends Definition> appDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, appSource,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testapplication", false, true);
        //create application extends the application
        String appSource2 = "<aura:application extends='" + appDescriptor.getNamespace() + ":" + appDescriptor.getName() + "' /> ";
        DefDescriptor<ApplicationDef> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, appSource2,
        		StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE+":testapplicationChild", false, true);
        descriptor.getDef();
    }
    
    @Test
    public void testApplicationWithPrivilegedNamespaceExtendsApplicationWithOtherPrivilegedNamespaceAccessGlobal() throws QuickFixException {
        //create application with system namespace
        String appSource = "<aura:application extensible='true' access='GLOBAL'/>";
        DefDescriptor<? extends Definition> appDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, appSource,
                StringSourceLoader.OTHER_PRIVILEGED_NAMESPACE + ":testapplication", false, true);
        //create application extends the application
        String appSource2 = "<aura:application extends='" + appDescriptor.getNamespace() + ":" + appDescriptor.getName() + "' /> ";
        DefDescriptor<ApplicationDef> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, appSource2,
        		StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE+":testapplicationChild", false, true);
        	descriptor.getDef();
    }
    
    @Test
    public void testApplicationWithPrivilegedNamespaceExtendsApplicationWithCustomNamespaceAccessGlobal() throws QuickFixException {
        //create application with system namespace
        String appSource = "<aura:application extensible='true' access='GLOBAL'/>";
        DefDescriptor<? extends Definition> appDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, appSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testapplication", false);
        //create application extends the application
        String appSource2 = "<aura:application extends='" + appDescriptor.getNamespace() + ":" + appDescriptor.getName() + "' /> ";
        DefDescriptor<ApplicationDef> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, appSource2,
        		StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE+":testapplicationChild", false, true);
        	descriptor.getDef();
    }
    
    @Test
    public void testApplicationWithSystemNamespaceExtendsApplicationWithPrivilegedNamespaceAccessGlobal() throws QuickFixException {
        //create application with system namespace
        String appSource = "<aura:application extensible='true' access='GLOBAL'/>";
        DefDescriptor<? extends Definition> appDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, appSource,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testapplication", false, true);
        //create application extends the application
        String appSource2 = "<aura:application extends='" + appDescriptor.getNamespace() + ":" + appDescriptor.getName() + "' /> ";
        DefDescriptor<ApplicationDef> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, appSource2,
        		StringSourceLoader.DEFAULT_NAMESPACE+":testapplicationChild", true);
        descriptor.getDef();
    }
    
    @Test
    public void testApplicationWithCustomNamespaceExtendsApplicationWithPrivilegedNamespaceAccessGlobal() throws QuickFixException {
        //create application with system namespace
        String appSource = "<aura:application extensible='true' access='GLOBAL'/>";
        DefDescriptor<? extends Definition> appDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, appSource,
                StringSourceLoader.DEFAULT_PRIVILEGED_NAMESPACE + ":testapplication", false, true);
        //create application extends the application
        String appSource2 = "<aura:application extends='" + appDescriptor.getNamespace() + ":" + appDescriptor.getName() + "' /> ";
        DefDescriptor<ApplicationDef> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, appSource2,
        		StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE+":testapplicationChild", false);
        	descriptor.getDef();
    }
    
    /**
     * Verify Global access enforcement
     */
    @Test
    public void testApplicationWithSystemNamespaceExtendsApplicationWithSameSystemNamespaceAccessGlobal() throws QuickFixException {
        //create application with system namespace
        String appSource = "<aura:application extensible='true' access='GLOBAL'/>";
        DefDescriptor<? extends Definition> appDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, appSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testapplication", true);
        //create application extends the application
        String source = "<aura:application extends='" + appDescriptor.getNamespace() + ":" + appDescriptor.getName() + "' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testapplicationChild", true);
        descriptor.getDef();
    }
    
    /**
     * Verify Global access enforcement
     */
    @Test
    public void testApplicationWithSystemNamespaceExtendsApplicationWithOtherSystemNamespaceAccessGlobal() throws QuickFixException {
        //create application with system namespace
        String appSource = "<aura:application extensible='true' access='GLOBAL'/>";
        DefDescriptor<? extends Definition> appDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, appSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testapplication", true);
        //create application extends the application
        String source = "<aura:application extends='" + appDescriptor.getNamespace() + ":" + appDescriptor.getName() + "' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.OTHER_NAMESPACE + ":testapplicationChild", true);
        descriptor.getDef();
    }
    
    /**
     * Verify Global access enforcement
     * verifyAccess for Application,System,Custom
     * verifyAccess for Application,System,CustomOther
     * verifyAccess for Application,SystemOther,Custom
     * verifyAccess for Application,SystemOther,CustomOther
     */
    @Test
    public void testApplicationWithCustomNamespaceExtendsApplicationWithSystemNamespaceAccessGlobal() throws QuickFixException {
        //create application with system namespace
        String appSource = "<aura:application extensible='true' access='GLOBAL'/>";
        DefDescriptor<? extends Definition> appDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, appSource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testapplication", true);
        //create application extends the application
        String source = "<aura:application extends='" + appDescriptor.getNamespace() + ":" + appDescriptor.getName() + "' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testapplicationChild", false);
        descriptor.getDef();
    }
    
    /**
     * Verify Global access enforcement
     */
    @Test
    public void testApplicationWithSystemNamespaceExtendsApplicationWithCustomNamespaceAccessGlobal() throws QuickFixException {
        //create application with custom namespace
        String appSource = "<aura:application extensible='true' access='GLOBAL'/>";
        DefDescriptor<? extends Definition> appDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, appSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testapplication", false);
        //create application extends the application
        String source = "<aura:application extends='" + appDescriptor.getNamespace() + ":" + appDescriptor.getName() + "' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testapplicationChild", true);
        descriptor.getDef();
    }
    
    /**
     * Verify Global access enforcement
     */
    @Test
    public void testApplicationWithCustomNamespaceExtendsApplicationWithSameCustomNamespaceAccessGlobal() throws QuickFixException {
        //create application with custom namespace
        String appSource = "<aura:application extensible='true' access='GLOBAL'/>";
        DefDescriptor<? extends Definition> appDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, appSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testapplication", false);
        //create application extends the application
        String source = "<aura:application extends='" + appDescriptor.getNamespace() + ":" + appDescriptor.getName() + "' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testapplicationChild", false);
        descriptor.getDef();
    }
    
    /**
     * Verify Global access enforcement
     * verifyAccess for Application,Custom,CustomOther
     * verifyAccess for Application,CustomOther,Custom
     */
    @Test
    public void testApplicationWithCustomNamespaceExtendsApplicationWithAnotherCustomNamespaceAccessGlobal() throws QuickFixException {
        //create application with custom namespace
        String appSource = "<aura:application extensible='true' access='GLOBAL'/>";
        DefDescriptor<? extends Definition> appDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, appSource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testapplication", false);
        //create application extends the application
        String source = "<aura:application extends='" + appDescriptor.getNamespace() + ":" + appDescriptor.getName() + "' /> ";
        DefDescriptor<? extends Definition> descriptor = getAuraTestingUtil().addSourceAutoCleanup(ApplicationDef.class, source,
                StringSourceLoader.OTHER_CUSTOM_NAMESPACE + ":testapplicationChild", false);
        descriptor.getDef();
    }
}
