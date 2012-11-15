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

import org.auraframework.Aura;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.impl.AuraImplTestCase;

/**
 * This class has unit tests to verify rendering of components server side. Components/applications can be renderer
 * server side or client side. A detection logic checks if a component can be rendered serverside. This detection logic
 * can be forces by including a "render = 'server'" attribute on the top level component tag. By default the detection
 * logic is auto on. This 'render' specification overrides the detection logic. If render = 'server', the aura servlet
 * assumes the component can be rendered serverside and tries to render it. If render = 'client', the aura servlet
 * assumes the component should be rendered clientside
 * 
 * @priority high
 * @userStory a07B0000000EWWg
 */
public class ServersideRenderedComponentsTest extends AuraImplTestCase {
    public ServersideRenderedComponentsTest(String name) {
        super(name);
    }

    /**
     * Verify that text, expressions and HTML can be rendered serverside. Text, Expression and Html are the basic
     * building blocks of aura. These can be rendered server side. This test verifies that.
     */

    // Disabling this test, as currently any component that has a theme is not server-renderable.
    // Since this includes aura:html, not much renders server-side at the moment.
    // W-922563
    public void testBasicAuraComponentsAreLocallyRenderable() throws Exception {
        /*
         * ComponentDef def = null; String basicCmps[] = {"aura:text","aura:expression", "aura:component",
         * "aura:html"}; for(String cmp :basicCmps){ def = Aura.getDefinitionService().getDefinition(cmp,
         * ComponentDef.class); assertTrue(def.isLocallyRenderable()); }
         */
    }

    /**
     * W-859397: Verify that HTML components that have attributes consisting of expressions work while rendering a
     * component serverside. Components which use HTML components as facets can construct the HTML tags with attributes.
     * These attributes can be assigned to expressions involving the component's attributes and models.
     */
    public void _testAttributesWithExpressionsWorkInHTMLTags() throws Exception {
        String markup = "<aura:component render='SERVER' template='auradev:blankTemplate' > "
                + "<aura:attribute name='style' type='String' default='teststyle'/>"
                + "<aura:attribute name='class' type='String' default='testClass'/>"
                + "<a class='{!v.style} {!v.class} osMedia' href='javascript:void(0)' />" + "</aura:component>";
        DefDescriptor<ComponentDef> testCmpDef = addSourceAutoCleanup(markup, ComponentDef.class);
        assertTrue(testCmpDef.getDef().isLocallyRenderable());
        StringWriter sw = new StringWriter();
        Aura.getSerializationService().write(testCmpDef.getDef(), null, ComponentDef.class, sw, "HTML");
        // Verify that the class attribute of the anchor tag was evaluated as a String concatenation
        // expression
        assertEquals("Expected the anchor tag's class to be evaluated as an expression.",
                "<a class='teststyle testClass osMedia' href='javascript:void(0)'/>", sw.toString().trim());
    }
}
