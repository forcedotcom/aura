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
package org.auraframework.integration.test.service;

import java.io.StringWriter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.locks.Condition;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;

import javax.inject.Inject;

import org.auraframework.def.ApplicationDef;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.BaseStyleDef;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.SerializationServiceImpl;
import org.auraframework.instance.Component;
import org.auraframework.service.SerializationService;
import org.junit.Test;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.Lists;

public class AuraSerializationServiceImplTest extends AuraImplTestCase {
    @Inject
    private SerializationService serializationService;

    @Test
    public void testAuraSerializationService() {
        assertTrue(serializationService instanceof SerializationServiceImpl);
    }

    @Test
    public void testWriteJson() throws Exception {

        StringWriter out = new StringWriter();
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("attr", "yo");
        Component c = instanceService.getInstance("test:child1", ComponentDef.class, attributes);
        serializationService.write(c, null, Component.class, out);
        goldFileJson(out.toString());
        attributes.put("invalid", "joe");
        c = instanceService.getInstance("test:child1", ComponentDef.class, attributes);
        serializationService.write(c, null, Component.class, out);
        assertFalse(out.toString().contains("invalid"));
    }

    private static class Findable {
        public final String format;
        public final Class<?> clazz;

        public Findable(String format, Class<?> clazz) {
            this.format = format;
            this.clazz = clazz;
        }
    }

    private final List<Findable> findable = new ImmutableList.Builder<Findable>()
        .add(new Findable("JSON", BaseComponentDef.class))
        .add(new Findable("HTML", ApplicationDef.class))
        .add(new Findable("HTML", ComponentDef.class))
        .add(new Findable("CSS", BaseStyleDef.class))
        .build();

    @Test
    public void testGetFormatAdapter() throws Exception {
        for (Findable item : findable) {
            assertNotNull("Did not find format adapter for "+item.format+"://"+item.clazz,
                    serializationService.getFormatAdapter(item.format, item.clazz));
        }
    }

}
