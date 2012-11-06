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
package org.auraframework.def;

import org.auraframework.Aura;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.impl.source.StringSourceLoader;
import org.auraframework.instance.Component;
import org.auraframework.throwable.MissingRequiredAttributeException;

/**
 */
public class ForEachDefTest extends DefinitionTest<ComponentDef> {

    static private final String COMP_WITH_REQUIRED_ATTRIBUTE = "hasRequiredAttribute";
    static private final String COMP_MISSING_REQUIRED_ATTRIBUTE = "missingRequiredAttribute";
    static private final String QUALIFIED_NAME_COMP_WITH_REQUIRED_ATTRIBUTE = StringSourceLoader.NAMESPACE + ":" + COMP_WITH_REQUIRED_ATTRIBUTE;
    static private final String QUALIFIED_NAME_COMP_MISSING_REQUIRED_ATTRIBUTE = StringSourceLoader.NAMESPACE + ":" + COMP_MISSING_REQUIRED_ATTRIBUTE;

    /**
     * @param name
     */
    public ForEachDefTest(String name) {
        super(name);
    }

    public void testInnerRequiredAttribute1() throws Exception {
        registerComponentMissingRequiredAttribute();
        try {
            Aura.getInstanceService().getInstance(QUALIFIED_NAME_COMP_MISSING_REQUIRED_ATTRIBUTE, ComponentDef.class);
            fail("Did not get expected exception: " + MissingRequiredAttributeException.class.getName());
        } catch (MissingRequiredAttributeException expected) {}
    }

    public void testInnerRequiredAttribute2() throws Exception {
        registerComponentMissingRequiredAttribute();
        try {
            Aura.getInstanceService().getInstance(QUALIFIED_NAME_COMP_MISSING_REQUIRED_ATTRIBUTE, DefType.COMPONENT);
            fail("Did not get expected exception: " + MissingRequiredAttributeException.class.getName());
        } catch (MissingRequiredAttributeException expected) {}
    }

    public void testInnerRequiredAttribute3() throws Exception {
        DefDescriptor<ComponentDef> cmpDesc = registerComponentMissingRequiredAttribute();
        try {
            Aura.getInstanceService().getInstance(cmpDesc);
            fail("Did not get expected exception: " + MissingRequiredAttributeException.class.getName());
        } catch (MissingRequiredAttributeException expected) {}
    }

    public void testInnerRequiredAttribute4() throws Exception {
        DefDescriptor<ComponentDef> cmpDesc = registerComponentMissingRequiredAttribute();
        try {
            Aura.getInstanceService().getInstance(cmpDesc.getDef());
            fail("Did not get expected exception: " + MissingRequiredAttributeException.class.getName());
        } catch (MissingRequiredAttributeException expected) {}
    }

    public void testInnerRequiredInheritedAttribute1() throws Exception {
        registerComponentMissingInheritedRequiredAttribute();
        try {
            Component cmp = Aura.getInstanceService().getInstance(QUALIFIED_NAME_COMP_MISSING_REQUIRED_ATTRIBUTE, ComponentDef.class);
            StringBuilder out = new StringBuilder();
            Aura.getRenderingService().render(cmp, out);
            fail("Did not get expected exception: " + MissingRequiredAttributeException.class.getName());
        } catch (MissingRequiredAttributeException expected) {}
    }

    public void testInnerRequiredInheritedAttribute2() throws Exception {
        registerComponentMissingInheritedRequiredAttribute();
        try {
            Aura.getInstanceService().getInstance(QUALIFIED_NAME_COMP_MISSING_REQUIRED_ATTRIBUTE, DefType.COMPONENT);
            fail("Did not get expected exception: " + MissingRequiredAttributeException.class.getName());
        } catch (MissingRequiredAttributeException expected) {}
    }

    public void testInnerRequiredInheritedAttribute3() throws Exception {
        DefDescriptor<ComponentDef> cmpDesc = registerComponentMissingInheritedRequiredAttribute();
        try {
            Aura.getInstanceService().getInstance(cmpDesc);
            fail("Did not get expected exception: " + MissingRequiredAttributeException.class.getName());
        } catch (MissingRequiredAttributeException expected) {}
    }

    public void testInnerRequiredInheritedAttribute4() throws Exception {
        DefDescriptor<ComponentDef> cmpDesc = registerComponentMissingInheritedRequiredAttribute();
        try {
            Aura.getInstanceService().getInstance(cmpDesc.getDef());
            fail("Did not get expected exception: " + MissingRequiredAttributeException.class.getName());
        } catch (MissingRequiredAttributeException expected) {}
    }

    /**
     * Defines a component with a ForEach loop that iterates over a list of Strings. Loads an instance of that
     * definition (uses the handlers, parser, factory, registry, impl, and instances) Walks the instance tree to confirm
     * that it was constructed properly.
     *
     * @throws Exception
     */
    // FIXME - there are no longer children.
    /*
     * public void testForEachDefStrings() throws Exception { StringWriter sw = new StringWriter(); XMLStreamWriter
     * writer = createXMLStreamWriter(sw); //Make Source writer.writeStartElement("aura:component");
     * writer.writeEmptyElement("aura:attribute"); writer.writeAttribute("name", "things");
     * writer.writeAttribute("type", "List<String>"); writer.writeStartElement("aura:forEach");
     * writer.writeAttribute("items", "{!v.things}"); writer.writeAttribute("var", "thing");
     * writer.writeCharacters("{!thing}"); writer.writeEndElement(); writer.writeEndElement(); writer.close();
     * sw.close(); //Add Source DefDescriptor<ComponentDef> desc = addSource(sw.toString(), ComponentDef.class);
     * //Request Instance of Component defined by source. Map<String, Object> attributes = Maps.newHashMap();
     * attributes.put("things", Lists.newArrayList("one", "two", "three")); Component cmp =
     * componentService.getComponent(desc.getQualifiedName(), attributes); //Check some stuff out on the instance
     * assertNotNull(cmp); goldFileJson(cmp); assertEquals(3, cmp.getChildren().size()); Component child =
     * cmp.getChildren().get(2); assertEquals(1, child.getChildren().size()); assertEquals("three",
     * child.getAttributes().getExpression("thing")); }
     */

    /**
     * Defines a component with a ForEach loop that iterates over a list of Dates (Objects with getters). Loads an
     * instance of that definition (uses the handlers, parser, factory, registry, impl, and instances) Walks the
     * instance tree to confirm that it was constructed properly.
     *
     * @throws Exception
     */
    // FIXME - there are no longer children.
    /*
     * public void testForEachDefObjects() throws Exception { StringWriter sw = new StringWriter(); XMLStreamWriter
     * writer = createXMLStreamWriter(sw); //Make Source writer.writeStartElement("aura:component");
     * writer.writeEmptyElement("aura:attribute"); writer.writeAttribute("name", "things");
     * writer.writeAttribute("type", "List<Date>"); writer.writeStartElement("aura:forEach");
     * writer.writeAttribute("items", "{!v.things}"); writer.writeAttribute("var", "thing");
     * writer.writeCharacters("{!thing.time}"); writer.writeEndElement(); writer.writeEndElement(); writer.close();
     * sw.close(); //Add Source DefDescriptor<ComponentDef> desc = addSource(sw.toString(), ComponentDef.class);
     * //Request Instance of Component defined by source. Date date = new Date(); Date date2 = new Date(100L);
     * List<Date> dates = Lists.newArrayList(date, date2); Map<String, Object> attributes = Maps.newHashMap();
     * attributes.put("things", dates); Component cmp = componentService.getComponent(desc.getQualifiedName(),
     * attributes); //Check it out. assertEquals(2, cmp.getChildren().size()); Component child =
     * cmp.getChildren().get(0); assertEquals(1, child.getChildren().size()); assertEquals(date,
     * child.getAttributes().getExpression("thing")); child = cmp.getChildren().get(1); assertEquals(1,
     * child.getChildren().size()); assertEquals(date2, child.getAttributes().getExpression("thing")); }
     */

    /**
     * Defines a component with 3 nested ForEach loops with html components interspersed Loads an instance of that
     * definition (uses the handlers, parser, factory, registry, impl, and instances) Walks the instance tree to confirm
     * that it was constructed properly.
     *
     * @throws Exception
     */
    // FIXME - there are no longer children.
    /*
     * @SuppressWarnings("unchecked") public void testNestedForEachDef() throws Exception { StringWriter sw = new
     * StringWriter(); XMLStreamWriter writer = createXMLStreamWriter(sw); //Make Source with 3 nested loops
     * writer.writeStartElement("aura:component"); writer.writeEmptyElement("aura:attribute");
     * writer.writeAttribute("name", "things"); writer.writeAttribute("type", "List<List<List<String>>>");
     * writer.writeAttribute("var", "thing"); writer.writeStartElement("div");
     * writer.writeStartElement("aura:forEach"); writer.writeAttribute("items", "{!v.things}");
     * writer.writeAttribute("var", "thing"); writer.writeStartElement("span");
     * writer.writeStartElement("aura:forEach"); writer.writeAttribute("items", "{!thing}");
     * writer.writeAttribute("var", "thing"); writer.writeStartElement("button");
     * writer.writeStartElement("aura:forEach"); writer.writeAttribute("items", "{!thing}");
     * writer.writeAttribute("var", "thing"); writer.writeCharacters("{!thing}"); writer.writeEndElement();//button
     * writer.writeEndElement();//span writer.writeEndElement();//div writer.writeEndElement();//c:foreach
     * writer.writeEndElement();//c:foreach writer.writeEndElement();//c:foreach
     * writer.writeEndElement();//aura:component writer.close(); sw.close(); //Add Source DefDescriptor<ComponentDef>
     * desc = addSource(sw.toString(), ComponentDef.class); //Request Instance of Component defined by source.
     * Map<String, Object> attributes = Maps.newHashMap(); List<String> strings = Lists.newArrayList("one", "two",
     * "three"); List<List<String>> listOfStrings = new ArrayList<List<String>>(); listOfStrings.add(strings);
     * List<List<List<String>>> listOfListOfStrings = new ArrayList<List<List<String>>>();
     * listOfListOfStrings.add(listOfStrings); attributes.put("things", listOfListOfStrings); Component cmp =
     * componentService.getComponent(desc.getQualifiedName(), attributes); //Check some stuff out on the instance
     * assertNotNull(cmp); goldFileJson(cmp); assertEquals(1, cmp.getChildren().size()); //div Component child =
     * cmp.getChildren().get(0); assertEquals("div", child.getAttributes().getExpression("tag")); //expression, child =
     * child.getChildren().get(1); //foreach #1 child =
     * ((List<Component>)child.getAttributes().getValue("value")).get(0); assertEquals(1, child.getChildren().size());
     * assertEquals(listOfStrings, child.getAttributes().getExpression("thing")); //span child =
     * child.getChildren().get(0); assertEquals(3, child.getChildren().size()); assertEquals("span",
     * child.getAttributes().getExpression("tag")); //expression child = child.getChildren().get(1); //foreach #2 child
     * = ((List<Component>)child.getAttributes().getValue("value")).get(0); //button child = child.getChildren().get(0);
     * assertEquals(3, child.getChildren().size()); assertEquals("button", child.getAttributes().getExpression("tag"));
     * //expression child = child.getChildren().get(1); //foreach #3 - component instances child =
     * ((List<Component>)child.getAttributes().getValue("value")).get(2); assertEquals(1, child.getChildren().size());
     * assertEquals("three", child.getAttributes().getExpression("thing")); }
     */

    private DefDescriptor<ComponentDef> registerComponentMissingRequiredAttribute() {
        DefDescriptor<ComponentDef> cmpDesc;
        addSource(COMP_WITH_REQUIRED_ATTRIBUTE,
                "<aura:component><aura:attribute name='req' type='String' required='true'/></aura:component>",
                ComponentDef.class);
        cmpDesc = addSource(
                COMP_MISSING_REQUIRED_ATTRIBUTE,
                "<aura:component model=\"java://org.auraframework.impl.java.model.TestJavaModel\"><aura:foreach items='{!m.stringList}' var='i'><" + QUALIFIED_NAME_COMP_WITH_REQUIRED_ATTRIBUTE + "/></aura:foreach></aura:component>",
                ComponentDef.class);
        return cmpDesc;
    }

    private DefDescriptor<ComponentDef> registerComponentMissingInheritedRequiredAttribute() {
        addSource(
                "parent",
                "<aura:component extensible='true'><aura:attribute name='req' type='String' required='true'/></aura:component>",
                ComponentDef.class);
        addSource(COMP_WITH_REQUIRED_ATTRIBUTE, "<aura:component extends='string:parent'/>", ComponentDef.class);
        DefDescriptor<ComponentDef> cmpDesc = addSource(
                COMP_MISSING_REQUIRED_ATTRIBUTE,
                "<aura:component model=\"java://org.auraframework.impl.java.model.TestJavaModel\"><aura:foreach items='{!m.stringList}' var='i'><" + QUALIFIED_NAME_COMP_WITH_REQUIRED_ATTRIBUTE + "/></aura:foreach></aura:component>",
                ComponentDef.class);
        return cmpDesc;
    }
}
