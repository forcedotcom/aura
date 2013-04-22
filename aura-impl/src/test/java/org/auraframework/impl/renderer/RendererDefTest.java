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
package org.auraframework.impl.renderer;

import java.util.Map;

import org.auraframework.Aura;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.renderer.sampleJavaRenderers.TestSimpleRenderer;
import org.auraframework.instance.Component;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.util.json.Json;
import org.auraframework.util.json.JsonReader;

/**
 * This class has automation to verify implementation of rendering for
 * components. There are two types of renderers: Javascript Renderers(client
 * side) and Java Renderers(server side). Javascript Renderers: Are treated as
 * non local to the app server. They have a definition(JavascriptRendererDef)
 * which is written out as part of the Component definition (ComponentDefImpl).
 * Java Renderers: Are treated as local to app server. They do not have a
 * definition and not written as part of the component def. Each instance of the
 * component has a section called "rendering" which has pure HTML markup which
 * is sent to the client as part of the component instance(ComponentImpl).
 */
public class RendererDefTest extends AuraImplTestCase {
    public RendererDefTest(String name) {
        super(name);
    }

    /**
     * Verify the structure of a ComponentDef when a component uses Java
     * Renderer.
     * 
     * @expectedResults No rendererDef section found in componentDef
     */
    public void testComponentDefWhenRedererIsJava() throws Exception {
        DefDescriptor<ComponentDef> d = Aura.getDefinitionService().getDefDescriptor("test:test_SimpleJavaRenderer",
                ComponentDef.class);
        ComponentDef def = d.getDef();
        // Convert the definition to a format that is used by the client
        String defInJson = Json.serialize(def, false, true);
        // Convert back to the object, just like the client does in javascript
        Object defObj = new JsonReader().read(defInJson);
        assertTrue(defObj instanceof Map);
        assertNull("Component definitions of components which use java renderers should not have a renderer def",
                ((Map<?, ?>) defObj).get("rendererDef"));
    }

    /**
     * Verify the serialized form of Component instance when java renderers are
     * used.
     * 
     * @expectedResults Rendering section found in component instance.
     * @throws Exception
     */
    public void testComponentInstanceDefWhenRendererIsJava() throws Exception {
        Component component = Aura.getInstanceService().getInstance("test:test_SimpleJavaRenderer", ComponentDef.class,
                null);
        // Convert the instance to a format that is used by the client
        String defInJson = Json.serialize(component, false, true);
        // Convert back to the object, just like the client does in javascript
        Object defObj = new JsonReader().read(defInJson);
        assertTrue(defObj instanceof Map);
        assertNotNull("Component Instance of components which use java renderers should have a rendering section",
                ((Map<?, ?>) ((Map<?, ?>) defObj).get("value")).get("rendering"));
        assertEquals("Component markup seen in Component instance does not match the markup in Java Renderer",
                TestSimpleRenderer.htmlOutput, ((Map<?, ?>) ((Map<?, ?>) defObj).get("value")).get("rendering"));
    }

    /**
     * Verify the Creating component instance when a non existing java renderer
     * is specified.
     * 
     * @expectedResults AuraRuntimeException
     * @throws Exception
     */
    public void testComponentInstanceDefWhenInvalidJavaRendererSpecified() throws Exception {
        try {
            Aura.getInstanceService().getInstance("test:test_NonExistingJavaRenderer", ComponentDef.class, null);
            fail("Creating a component which has specified a non-existent java renderer should have thrown a runtime exception.");
        } catch (DefinitionNotFoundException expected) {
            assertEquals("java://NonExistingRenderer", expected.getDescriptor().getQualifiedName());
        }
    }
}
