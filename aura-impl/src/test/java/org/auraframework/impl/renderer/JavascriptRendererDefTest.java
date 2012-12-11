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
package org.auraframework.impl.renderer;

import java.io.StringWriter;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.RendererDef;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.javascript.renderer.JavascriptRendererDef;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.instance.Component;
/**
 * Test class to verify implementation of Javascript renderers for component.
 *
 * @hierarchy Aura.Components.Renderer
 * @priority high
 * @userStory a07B0000000Doob
 */
public class JavascriptRendererDefTest extends AuraImplTestCase {
    public JavascriptRendererDefTest(String name){
        super(name);
    }
    /**
     * Verify that Javascript renderers are defined as non-local.
     * @throws Exception
     */
    public void testIsLocal() throws Exception{
        JavascriptRendererDef.Builder builder = new JavascriptRendererDef.Builder();
        JavascriptRendererDef def = builder.build();
        assertFalse("Javascript renderers should not be defined as Local, they are run in clients",def.isLocal());
    }
    /**
     * Verify that rendering components locally using client side renderers is Unsupported.
     * @throws Exception
     */
    public void testUseOfJSRendererLocally() throws Exception{
        Component dummyCmp  = null;
        StringWriter sw = new StringWriter();
        DefDescriptor<RendererDef> descriptor = DefDescriptorImpl.getInstance("js://test.testJSRenderer",RendererDef.class);
        RendererDef def = descriptor.getDef();
        try{
            def.render(dummyCmp, sw);
            fail("Should not able to use a ClientSide renderer to render a component locally.");
        }catch (UnsupportedOperationException expected){}
    }

    /**
     * Verify that Javascript renderer with comments is acceptable.
     * @hierarchy Aura.Unit Tests.Json StreamReader
     * @userStorySyncIdOrName a07B0000000DUGnIAO
     * @priority medium
     */
    public void testRendererWithComments() throws Exception{
        DefDescriptor<RendererDef> descriptor = DefDescriptorImpl.getInstance("js://test.test_JSRenderer_WithComments",RendererDef.class);
        RendererDef def = descriptor.getDef();
        assertNotNull("Failed to fetch the definition of the Javascript Renderer.", def);
        assertTrue(def instanceof JavascriptRendererDef);
        serializeAndGoldFile(def);
    }
}

