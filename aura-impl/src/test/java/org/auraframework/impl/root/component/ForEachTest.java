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
package org.auraframework.impl.root.component;

import java.util.ArrayList;
import java.util.Collection;

import junit.framework.Assert;

import org.auraframework.Aura;
import org.auraframework.def.ComponentDef;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.expression.PropertyReferenceImpl;
import org.auraframework.instance.Component;

/**
 * .touch.3
 * 
 * @since 0.0.85
 */
public class ForEachTest extends AuraImplTestCase {
    final String forEachDescriptor = "markup://%s:%s/COMPONENT$aura:foreach";

    public ForEachTest(String name) {
        super(name);
    }

    /**
     * Verify iteration of a list of String, Number and Boolean values using
     * aura:forEach
     * 
     * @throws Exception
     */
    public void testIteratingListOfBasicDataType() throws Exception {
        String namespace = "forEachDefTest";
        String cmpName = "basicDataType";
        Component cmp = (Component) Aura.getInstanceService().getInstance(String.format("%s:%s", namespace, cmpName),
                ComponentDef.class);
        assertNotNull("Failed to create an instance of the forEach test component.", cmp);
        // Obtain a list of all components enclosed in forEach blocks
        Collection<Component> innerComponentList = getInnerComponents(cmp);
        ArrayList<Component> componentList = new ArrayList<Component>();
        // Trim the list to only consider test components
        for (Component b : innerComponentList) {
            if (b.getLocalId().equals("stringValue") || b.getLocalId().equals("numberValue")
                    || b.getLocalId().equals("booleanValue")) {
                assertEquals("markup://forEachDefTest:forEachDefDisplay", b.getDescriptor().getQualifiedName());
                componentList.add(b);
            }
        }
        assertEquals(9, componentList.size());
        // Assert the string values
        assertValuesInForEachBlock(cmp, "m.stringList", componentList, 0, "stringValue", "v.string");
        // Assert Integer Values
        assertValuesInForEachBlock(cmp, "m.integerList", componentList, 3, "numberValue", "v.number");
        // Assert boolean values
        assertValuesInForEachBlock(cmp, "m.booleanList", componentList, 6, "booleanValue", "v.bool");
    }

    /**
     * Verify iteration of a list of String, Number and Boolean values passed
     * from a top level component.
     * 
     * @throws Exception
     */
    public void testIteratingListOfBasicDataType_valueByReference() throws Exception {
        String namespace = "forEachDefTest";
        String cmpName = "forEachDefParent";
        Component topLevelCmp = (Component) Aura.getInstanceService().getInstance(
                String.format("%s:%s", namespace, cmpName), ComponentDef.class);
        assertNotNull("Failed to create an instance of the forEach test component.", topLevelCmp);

        Component facet1 = null;
        Object body = topLevelCmp.getSuper().getAttributes().getValue("body");
        Assert.assertNotNull(body);
        @SuppressWarnings("unchecked")
        Collection<Component> bodyList = (Collection<Component>) body;
        for (Component c : bodyList) {
            if (c.getLocalId().equals("basicDataType")) {
                facet1 = c;
            }
        }
        // Obtain a list of all components enclosed in forEach blocks in facet
        Collection<Component> innerComponentList = getInnerComponents(facet1);
        ArrayList<Component> componentList = new ArrayList<Component>();
        // Trim the list to only consider test components
        for (Component b : innerComponentList) {
            if (b.getLocalId().equals("stringValueByRef") || b.getLocalId().equals("numberValueByRef")
                    || b.getLocalId().equals("booleanValueByRef")) {
                assertEquals("markup://forEachDefTest:forEachDefDisplay", b.getDescriptor().getQualifiedName());
                componentList.add(b);
            }
        }
        assertEquals(9, componentList.size());
        // Assert the string values
        assertValuesInForEachBlock(topLevelCmp, "m.stringList", componentList, 0, "stringValueByRef", "v.string");
        // Assert Integer Values
        assertValuesInForEachBlock(topLevelCmp, "m.integerList", componentList, 3, "numberValueByRef", "v.number");
        // Assert boolean values
        assertValuesInForEachBlock(topLevelCmp, "m.booleanList", componentList, 6, "booleanValueByRef", "v.bool");
    }

    /**
     * Verify iteration of a list of list, objects using aura:forEach
     * 
     * @throws Exception
     */
    public void testIteratingListofCollections() throws Exception {
        String namespace = "forEachDefTest";
        String cmpName = "collectionDataType";
        Component cmp = (Component) Aura.getInstanceService().getInstance(String.format("%s:%s", namespace, cmpName),
                ComponentDef.class);
        assertNotNull("Failed to create an instance of the forEach test component.", cmp);

        // Obtain a list of all components enclosed in forEach blocks
        Collection<Component> innerComponentList = getInnerComponents(cmp);
        ArrayList<Component> componentList = new ArrayList<Component>();
        // Trim the list to only consider test components
        for (Component b : innerComponentList) {
            if (b.getLocalId().equals("listValue") || b.getLocalId().equals("objectValue")) {
                assertEquals("markup://forEachDefTest:forEachDefDisplay", b.getDescriptor().getQualifiedName());
                componentList.add(b);
            }
        }
        assertEquals(6, componentList.size());
        // Assert the list values
        assertValuesInForEachBlock(cmp, "m.listOfList", componentList, 0, "listValue", "v.list");
        // Assert the Object list
        assertValuesInForEachBlock(cmp, "m.integerList", componentList, 3, "objectValue", "v.obj");

    }

    /**
     * Assert that value provided by top level component is the same as the
     * Value seen by component in forEach block.
     * 
     * @throws Exception
     */
    private void assertValuesInForEachBlock(Component topCmp, String propertyOntopCmp,
            ArrayList<Component> componentList, int startIndex, String localId, String propertyOnlocalCmp)
            throws Exception {

        Object values = topCmp.getValue(new PropertyReferenceImpl(propertyOntopCmp, null));
        assertNotNull("Failed to extract value from top level component:" + propertyOntopCmp, values);
        assertTrue(values instanceof ArrayList);

        for (int i = 0; i < 3; i++) {
            Component innerCmp = componentList.get(i + startIndex);
            assertEquals("Expected to see component with ID " + localId + " but saw " + innerCmp.getLocalId(), localId,
                    innerCmp.getLocalId());
            assertEquals("Value mismatch between top component and inner component in forEach",
                    ((ArrayList<?>) values).get(i),
                    innerCmp.getValue(new PropertyReferenceImpl(propertyOnlocalCmp, null)));
        }
    }

    /**
     * @param cmp Component which has forEach blocks, can have multiple blocks
     *            but not nested forEach blocks.
     * @return List of components which are enclosed in
     * @throws Exception
     */
    @SuppressWarnings("unchecked")
    private Collection<Component> getInnerComponents(Component cmp) throws Exception {
        ArrayList<Component> innerComponentList = new ArrayList<Component>();
        Object body = cmp.getSuper().getAttributes().getValue("body");
        Assert.assertNotNull(body);
        Collection<Component> bodyList = (Collection<Component>) body;
        for (Component c : bodyList) {
            if (c.getDescriptor()
                    .getQualifiedName()
                    .startsWith(
                            String.format(forEachDescriptor, cmp.getDescriptor().getNamespace(), cmp.getDescriptor()
                                    .getName()))) {
                Object itemBody = c.getSuper().getAttributes().getValue("body");
                Assert.assertNotNull(itemBody);
                innerComponentList.addAll((Collection<Component>) itemBody);
            }
        }
        return innerComponentList;
    }
}
