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
package org.auraframework.test.page;

import java.net.MalformedURLException;
import java.net.URISyntaxException;

import org.auraframework.Aura;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.test.configuration.TestServletConfig;

public abstract class AuraPageObject<T extends BaseComponentDef> implements PageObject {
    
    //we need servletConfig to convert url to uri, TODO: maybe this should be a function from xxxUtil as well?
    private TestServletConfig servletConfig;
    
    private final String name;
    
    //defDescriptor is created by passing in descriptorString during contruction
    private final DefDescriptor<T> defDescriptor;
    
    protected PageObjectTestCase<?> pageObjectTestCase;
    
    
    @SuppressWarnings("unchecked")
    public AuraPageObject(String name, Boolean isComponent, String descriptorString, PageObjectTestCase<?> potc) {
        //the test function name that create this page object
        this.name = name;
        //append '.app' or '.cmp' to the link
        if(isComponent) {
            this.defDescriptor = (DefDescriptor<T>) Aura.getDefinitionService().getDefDescriptor(descriptorString, ComponentDef.class);
        } else {
            this.defDescriptor = (DefDescriptor<T>) Aura.getDefinitionService().getDefDescriptor(descriptorString, ApplicationDef.class);
        }
        
        //init servletConfig
        if(this.servletConfig == null) {
            this.servletConfig = Aura.get(TestServletConfig.class);
        }
        
        this.pageObjectTestCase = potc;
    }
    
    @Override
    public String getName() {
        return this.name;
    }
    
    public void open() throws MalformedURLException, URISyntaxException {
        pageObjectTestCase.open(defDescriptor);
    }
}
