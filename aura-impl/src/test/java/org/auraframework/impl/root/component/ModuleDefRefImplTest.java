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

import java.util.HashMap;
import java.util.Map;

import org.auraframework.def.AttributeDef;
import org.auraframework.def.AttributeDefRef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.def.module.ModuleDef;
import org.auraframework.def.module.ModuleDefRef;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.root.component.ModuleDefRefImpl.Builder;
import org.auraframework.impl.validation.ReferenceValidationContextImpl;
import org.auraframework.system.Location;
import org.auraframework.validation.ReferenceValidationContext;
import org.junit.Test;
import org.mockito.Mockito;

import com.google.common.collect.Maps;
import com.google.gson.Gson;

/**
 * ModuleDefRefImpl tests
 */
public class ModuleDefRefImplTest extends AuraImplTestCase {

    @SuppressWarnings("unchecked")
    @Test
    public void testModuleDefRefSerialization() throws Exception {
        Map<DefDescriptor<AttributeDef>, AttributeDefRef> attributes = new HashMap<>();
        String attributeName = "testAttribute";
        String attributeValue = "WoW";
        attributes.put(definitionService.getDefDescriptor(attributeName, AttributeDef.class),
                vendor.makeAttributeDefRef(attributeName, attributeValue, null));
        DefDescriptor<ModuleDef> reference = definitionService.getDefDescriptor("test:Module", ModuleDef.class);
        DefDescriptor<ModuleDef> properRef = definitionService.getDefDescriptor("test:module", ModuleDef.class);
        ModuleDef refDef = Mockito.mock(ModuleDef.class);
        Mockito.doReturn(properRef).when(refDef).getDescriptor();
        ModuleDefRef moduleDefRef = createModuleDefRef(reference, attributes, null);
        Map<DefDescriptor<?>, Definition> map = Maps.newHashMap();
        map.put(reference, refDef);
        ReferenceValidationContext context = new ReferenceValidationContextImpl(map);

        moduleDefRef.validateReferences(context);

        String json = toJson(moduleDefRef);

        Map<String, Object> result = new Gson().fromJson(json, Map.class);
        Map<String, Object> componentDef = (Map<String, Object>) result.get("componentDef");
        assertEquals("Incorrect descriptor", "markup://test:module", componentDef.get("descriptor"));
        assertEquals("Incorrect type", "module", componentDef.get("type"));

        Map<String, Object> attributesResult = (Map<String, Object>) result.get("attributes");
        Map<String, Object> values = (Map<String, Object>) attributesResult.get("values");
        Map<String, Object> testAttribute = (Map<String, Object>) values.get(attributeName);
        assertEquals("Incorrect attribute descriptor", attributeName, testAttribute.get("descriptor"));
        assertEquals("Incorrect attribute value", attributeValue, testAttribute.get("value"));
    }

    private ModuleDefRef createModuleDefRef(DefDescriptor<ModuleDef> moduleDefDescriptor, Map<DefDescriptor<AttributeDef>, AttributeDefRef> attributes,
                                            Location location) {
        Builder builder = new Builder();
        builder.setDescriptor(moduleDefDescriptor);
        builder.setLocation(location);

        if (attributes != null && !attributes.isEmpty()) {
            for (Map.Entry<DefDescriptor<AttributeDef>, AttributeDefRef> entry : attributes.entrySet()) {
                builder.setAttribute(entry.getKey(), entry.getValue());
            }
        }

        return builder.build();
    }

}
