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

import java.util.HashMap;
import java.util.Map;

import org.auraframework.Aura;
import org.auraframework.def.ComponentDef;
import org.auraframework.service.DefinitionService;

public class AuraComponentServiceImplTest extends AuraImplTestCase {

    public AuraComponentServiceImplTest(String name) {
        super(name);
    }

    public void testAuraComponentService() {
        DefinitionService ds = Aura.getDefinitionService();
        assertTrue(ds instanceof DefinitionServiceImpl);
    }

    public void testGetComponent() throws Exception {
        Map<String, Object> attributes = new HashMap<String, Object>();
        attributes.put("attr", "yo");
        assertNotNull(Aura.getInstanceService().getInstance("test:child1", ComponentDef.class, attributes));
    }

}
