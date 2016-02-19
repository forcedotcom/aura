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

import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.test.source.StringSourceLoader;
import org.auraframework.util.test.annotation.UnAdaptableTest;
import org.junit.Test;

import javax.inject.Inject;

@UnAdaptableTest("namespace start with c means something special in core")
public class AccessAttributeEnforcementTest extends AuraImplTestCase {
	
	@Inject
    protected StringSourceLoader stringSourceLoader;

    public AccessAttributeEnforcementTest(String name) throws Exception {
        super(name);
    }
    
    @Test
    public void testComponentWithTextWithSystemNamespace() throws Exception {
    	String componentCource = "<aura:component><aura:text value='Hello World!' /></aura:component>";
    	DefDescriptor<? extends Definition> componentDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, 
    			componentCource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testinterface", true);
    	componentDescriptor.getDef();
    }
    
    @Test
    public void testComponentWithTextWithCustomNamespace() throws Exception {
    	String componentCource = "<aura:component><aura:text value='Hello World!' /></aura:component>";
    	DefDescriptor<? extends Definition> componentDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, 
    			componentCource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testinterface", false);
    	componentDescriptor.getDef();
    }
    
    
    @Test
    public void testComponentWithHTMLWithSystemNamespace() throws Exception {
    	String componentCource = "<aura:component><aura:html tag='b' body='Hello World!' /></aura:component>";
    	DefDescriptor<? extends Definition> componentDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, 
    			componentCource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testinterface", true);
    	componentDescriptor.getDef();
    }
    
    @Test
    public void testComponentWithHTMLWithCustomNamespace() throws Exception {
    	String componentCource = "<aura:component><aura:html tag='b' body='Hello World!' /></aura:component>";
    	DefDescriptor<? extends Definition> componentDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, 
    			componentCource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testinterface", false);
    	componentDescriptor.getDef();
    }
  

    @Test
    public void testComponentWithUnescapedHTMLWithSystemNamespace() throws Exception {
    	String componentCource = "<aura:component><aura:unescapedHtml value='Hello World!'/></aura:component>";
    	DefDescriptor<? extends Definition> componentDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, 
    			componentCource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testinterface", true);
    	componentDescriptor.getDef();
    }
    
    @Test
    public void testComponentWithUnescapedHTMLWithCustomNamespace() throws Exception {
    	String componentCource = "<aura:component><aura:unescapedHtml value='Hello World!'/></aura:component>";
    	DefDescriptor<? extends Definition> componentDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, 
    			componentCource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testinterface", false);
    	componentDescriptor.getDef();
    }
    
    @Test
    public void testComponentWithExpressionWithSystemNamespace() throws Exception {
    	String componentCource = "<aura:component><aura:expression value='Hello + World!' /></aura:component>";
    	DefDescriptor<? extends Definition> componentDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, 
    			componentCource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testinterface", true);
    	componentDescriptor.getDef();
    }
    
    @Test
    public void testComponentWithExpressionWithCustomNamespace() throws Exception {
    	String componentCource = "<aura:component><aura:expression value='Hello + World!' /></aura:component>";
    	DefDescriptor<? extends Definition> componentDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, 
    			componentCource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testinterface", false);
    	componentDescriptor.getDef();
    }
    
    @Test
    public void testComponentWithIfWithSystemNamespace() throws Exception {
    	String componentCource = "<aura:component><aura:if isTrue='True' body='' else='' /></aura:component>";
    	DefDescriptor<? extends Definition> componentDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, 
    			componentCource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testinterface", true);
    	componentDescriptor.getDef();
    }
    
    @Test
    public void testComponentWithIfWithCustomNamespace() throws Exception {
    	String componentCource = "<aura:component><aura:if isTrue='True' body='' else='' /></aura:component>";
    	DefDescriptor<? extends Definition> componentDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, 
    			componentCource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testinterface", false);
    	componentDescriptor.getDef();
    }
    
    @Test
    public void testComponentWithRenderIfWithSystemNamespace() throws Exception {
    	String componentCource = "<aura:component><aura:renderIf isTrue='True' body='' else='' /></aura:component>";
    	DefDescriptor<? extends Definition> componentDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, 
    			componentCource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testinterface", true);
    	componentDescriptor.getDef();
    }
    
    @Test
    public void testComponentWithRenderIfWithCustomNamespace() throws Exception {
    	String componentCource = "<aura:component><aura:renderIf isTrue='True' body='' else='' /></aura:component>";
    	DefDescriptor<? extends Definition> componentDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, 
    			componentCource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testinterface", false);
    	componentDescriptor.getDef();
    }
    
    @Test
    public void testComponentWithDependencyWithSystemNamespace() throws Exception {
    	DefDescriptor<ComponentDef> cmpDescA = addSourceAutoCleanup(ComponentDef.class, "<aura:component/>");
        String componentCource = "<aura:component><aura:dependency resource='" + cmpDescA.getQualifiedName() + "'/></aura:component>";
    	DefDescriptor<? extends Definition> componentDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, 
    			componentCource,
                StringSourceLoader.DEFAULT_NAMESPACE + ":testinterface", true);
    	componentDescriptor.getDef();
    }
    
    @Test
    public void testComponentWithDependencyWithCustomNamespace() throws Exception {
    	DefDescriptor<ComponentDef> cmpDescA = addSourceAutoCleanup(ComponentDef.class, "<aura:component/>");
        String componentCource = "<aura:component><aura:dependency resource='" + cmpDescA.getQualifiedName() + "'/></aura:component>";
    	DefDescriptor<? extends Definition> componentDescriptor = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class, 
    			componentCource,
                StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE + ":testinterface", false);
    	componentDescriptor.getDef();
    }

}
