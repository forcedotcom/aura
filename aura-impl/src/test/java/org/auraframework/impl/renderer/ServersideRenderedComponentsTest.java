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

import java.io.StringWriter;
import java.util.HashMap;
import java.util.Map;

import org.auraframework.Aura;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.instance.BaseComponent;
import org.junit.Ignore;

/**
 * This class has unit tests to verify rendering of components server side.
 * Components/applications can be renderer server side or client side. A
 * detection logic checks if a component can be rendered serverside. This
 * detection logic can be forces by including a "render = 'server'" attribute on
 * the top level component tag. By default the detection logic is auto on.
 * <ul>
 * <li>This 'render' specification overrides the detection logic.
 * <li>If render = 'server', the aura servlet assumes the component can be
 * rendered serverside and tries to render it.</li>
 * <li>If render = 'client', the aura servlet assumes the component should be
 * rendered clientside.</li>
 * </ul>
 */
public class ServersideRenderedComponentsTest extends AuraImplTestCase {
    public ServersideRenderedComponentsTest(String name) {
        super(name);
    }

    private final String ATTR_COMPONENT_ARRAY = "<aura:attribute name='componentArray' type='Aura.Component[]'><div>am a div</div>just text<span>am a span</span></aura:attribute>";
    private final String ATTR_STRING_ARRAY = "<aura:attribute name='stringArray' type='String[]' default='first,second,third'/>";
    private final String ATTR_STRING_ARRAY_WITHOUTDEFAULT = "<aura:attribute name='isNotSet' type='String[]'/>";

    private String getRenderedHTML(String markup, Class<? extends BaseComponentDef> defType,
            Map<String, Object> attributes) throws Exception {
        DefDescriptor<? extends BaseComponentDef> testCmpDef = addSourceAutoCleanup(defType, markup);
        assertTrue(testCmpDef.getDef().isLocallyRenderable());
        BaseComponent<?, ?> instance = (BaseComponent<?, ?>) Aura.getInstanceService().getInstance(testCmpDef,
                attributes);
        StringWriter sw = new StringWriter();
        Aura.getRenderingService().render(instance, sw);
        return sw.toString().trim();
    }

    private void assertRenderedHTML(String markup, Class<? extends BaseComponentDef> defType,
            Map<String, Object> attributes, String expected) throws Exception {
        String render = getRenderedHTML(markup, ComponentDef.class, attributes);
        assertEquals(expected, render);
    }

    public void testComponentArray() throws Exception {
        assertRenderedHTML(String.format(baseComponentTag, "", ATTR_COMPONENT_ARRAY + "{!v.componentArray}"),
                ComponentDef.class, null, "<div>am a div</div>just text<span>am a span</span>");
    }

    public void testArrayLength() throws Exception {
        assertRenderedHTML(String.format(baseComponentTag, "", ATTR_COMPONENT_ARRAY + "{!v.componentArray.length}"),
                ComponentDef.class, null, "3");
    }

    @Ignore("W-1428200")
    public void testComponentArrayIndex() throws Exception {
        assertRenderedHTML(String.format(baseComponentTag, "", ATTR_COMPONENT_ARRAY + "{!v.componentArray[2]}"),
                ComponentDef.class, null, "<span>am a span</span>");
    }

    public void testForEachStringArray() throws Exception {
        assertRenderedHTML(
                String.format(baseComponentTag, "", ATTR_STRING_ARRAY
                        + "<aura:foreach items='{!v.stringArray}' var='x'>[{!x}]</aura:foreach>"), ComponentDef.class,
                null, "[first][second][third]");
    }

    public void testForEachStringList() throws Exception {
        assertRenderedHTML(String.format(baseComponentTag,
                "model='java://org.auraframework.impl.java.model.TestJavaModel'",
                "<aura:foreach items='{!m.stringList}' var='x'>{!'[' + x + ']'}</aura:foreach>"), ComponentDef.class,
                null, "[one][two][three]");
    }

    public void testForEachUnsetArray() throws Exception {
        assertRenderedHTML(
                String.format(baseComponentTag, "", ATTR_STRING_ARRAY_WITHOUTDEFAULT
                        + "<aura:foreach items='{!v.isNotSet}' var='x'>[{!x}]</aura:foreach>"), ComponentDef.class,
                null, "");
    }

    public void testUnsetArrayLength() throws Exception {
        assertRenderedHTML(
                String.format(baseComponentTag, "", ATTR_STRING_ARRAY_WITHOUTDEFAULT + "{!v.isNotSet.length}"),
                ComponentDef.class, new HashMap<String, Object>(), "");

    }

    public void testForEachEmptyList() throws Exception {
        assertRenderedHTML(String.format(baseComponentTag,
                "model='java://org.auraframework.impl.java.model.TestJavaModel'",
                "<aura:foreach items='{!m.emptyList}' var='x'>[{!x}]</aura:foreach>"), ComponentDef.class, null, "");
    }

    public void testEmptyListLength() throws Exception {
        assertRenderedHTML(String.format(baseComponentTag,
                "model='java://org.auraframework.impl.java.model.TestJavaModel'", "{!m.emptyList.length}"),
                ComponentDef.class, null, "0");
    }

    public void testMultidimListLength() throws Exception {
        assertRenderedHTML(String.format(baseComponentTag,
                "model='java://org.auraframework.impl.java.model.TestJavaModel'", "{!m.listOfList.length}"),
                ComponentDef.class, null, "3");
    }

    public void testForEachMultidimList() throws Exception {
        assertRenderedHTML(
                String.format(
                        baseComponentTag,
                        "model='java://org.auraframework.impl.java.model.TestJavaModel'",
                        "<aura:foreach items='{!m.listOfList}' var='x'>{!x.length}:<aura:foreach items='{!x}' var='y'>[{!y}]</aura:foreach></aura:foreach>"),
                ComponentDef.class, null, "3:[one][two][three]3:[un][do][tres]3:[ek][do][theen]");
    }

    public void testForEachMultidimListIndex() throws Exception {
        assertRenderedHTML(String.format(baseComponentTag,
                "model='java://org.auraframework.impl.java.model.TestJavaModel'",
                "{!m.listOfList[2].length}:<aura:foreach items='{!m.listOfList[2]}' var='x'>[{!x}]</aura:foreach>"),
                ComponentDef.class, null, "3:[ek][do][theen]");
    }
}
