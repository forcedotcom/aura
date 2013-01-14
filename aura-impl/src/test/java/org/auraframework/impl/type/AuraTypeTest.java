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
package org.auraframework.impl.type;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.auraframework.Aura;
import org.auraframework.def.AttributeDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.instance.BaseComponent;

/**
 * Test to check aura types
 * 
 * @hierarchy Aura.Mobile Web
 * @userStorySyncIdOrName a07B0000000EQgW
 */
public class AuraTypeTest extends AuraImplTestCase {

    public AuraTypeTest(String name) {
        super(name);
    }

    /**
     * Test Aura Data Types.
     * 
     * @throws Exception
     */
    public void testAuraConverter() throws Exception {
        ArrayList<String> typeNames = new ArrayList<String>();
        String[] types = { "Integer", "Long", "Double", "Decimal", "Boolean", "String", "Object", "Map", "List", "Set",
                "Aura.Component[]", "Aura.Component", "Aura.ComponentDefRef[]", "Aura.Action" };

        for (int i = 0; i < types.length; i++) {
            types[i] = "aura://" + types[i];
        }
        List<String> baseTypes = Arrays.asList(types);

        BaseComponent<ComponentDef, ?> cmp = null;
        Map<String, Object> attributes = new HashMap<String, Object>();
        attributes.put("intName", "3");
        attributes.put("longName", "1525125125");
        attributes.put("doubleName", "14.34");
        attributes.put("decimalName", "12.4");
        attributes.put("boolName", "True");
        attributes.put("stringName", "mobileweb");
        attributes.put("objectName", "objobj");
        attributes.put("mapName", "{'foo':'bar'}");
        attributes.put("listName", "listlist");
        attributes.put("setName", "setset");

        cmp = Aura.getInstanceService().getInstance("test:testAuraTypes", ComponentDef.class, attributes);
        DefDescriptor<ComponentDef> desc = cmp.getDescriptor();
        ComponentDef def = desc.getDef();
        Map<DefDescriptor<AttributeDef>, AttributeDef> attrMap = def.getAttributeDefs();
        Set<DefDescriptor<AttributeDef>> keys = attrMap.keySet();
        Object[] keyArray = keys.toArray();

        for (int j = 0; j < keys.size(); j++) {
            DefDescriptor<?> d = attrMap.get(keyArray[j]).getTypeDef().getDescriptor();
            typeNames.add(d.getQualifiedName());

            // Check that each data type is defaulted to aura data type
            if (baseTypes.contains(d.getQualifiedName())) {
                assertTrue("This type is not Aura type!", d.getPrefix().equals("aura"));
            }
        }

        // Check that all types that were supposed to change to aura data type
        // are tested
        assertTrue("Does not have all attribute data types listed in component!", typeNames.containsAll(baseTypes));
    }
}
