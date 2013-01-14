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
package org.auraframework.impl;

import java.io.StringWriter;
import java.util.HashMap;
import java.util.Map;

import org.auraframework.Aura;
import org.auraframework.def.ComponentDef;
import org.auraframework.instance.Component;
import org.auraframework.service.InstanceService;
import org.auraframework.service.SerializationService;

public class AuraSerializationServiceImplTest extends AuraImplTestCase {

    public AuraSerializationServiceImplTest(String name) {
        super(name);
    }

    public void testAuraSerializationService() {
        SerializationService serializationService = Aura.getSerializationService();
        assertTrue(serializationService instanceof SerializationServiceImpl);
    }

    public void testWriteJson() throws Exception {
        InstanceService instanceService = Aura.getInstanceService();
        SerializationService serializationService = Aura.getSerializationService();

        StringWriter out = new StringWriter();
        Map<String, Object> attributes = new HashMap<String, Object>();
        attributes.put("attr", "yo");
        Component c = instanceService.getInstance("test:child1", ComponentDef.class, attributes);
        serializationService.write(c, null, Component.class, out);
        goldFileJson(out.toString());
        attributes.put("invalid", "joe");
        c = instanceService.getInstance("test:child1", ComponentDef.class, attributes);
        serializationService.write(c, null, Component.class, out);
        assertFalse(out.toString().contains("invalid"));
    }

}
