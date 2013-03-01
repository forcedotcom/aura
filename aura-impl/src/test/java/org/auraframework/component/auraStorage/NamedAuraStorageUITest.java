/*
 * Copyright (C) 2012 salesforce.com, inc.
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
package org.auraframework.component.auraStorage;

import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.test.WebDriverTestCase;

public class NamedAuraStorageUITest extends WebDriverTestCase {
    public NamedAuraStorageUITest(String name){
        super(name);
    }
    
    /**
     * Verify that registering duplicate named storage using auraStorage:init in a template will throw an error.
     */
    public void testDuplicateNamedStorageInTemplate() throws Exception{
        String bodyMarkup = "<aura:set attribute='auraPreInitBlock'><auraStorage:init name='dup'/><auraStorage:init name='dup'/></aura:set>";
        DefDescriptor<ComponentDef> template = addSourceAutoCleanup(ComponentDef.class, 
                String.format(baseComponentTag, "isTemplate='true' extends='aura:template'", 
                        bodyMarkup));
        DefDescriptor<ComponentDef> testCmp = addSourceAutoCleanup(ComponentDef.class, 
                String.format(baseComponentTag, "render='client' template='"+template.getDescriptorName()+"'", ""));
        
        openNoAura(getUrl(testCmp));
        String jsErrors = (String)auraUITestingUtil.getRawEval("return window.$A.test.getErrors()"); 
        assertNotNull("Expected to see JS errors while loading component.", jsErrors);
        assertTrue("Unexpected error message.", jsErrors.contains("Storage named 'dup' already exists!"));
    }
    
}
