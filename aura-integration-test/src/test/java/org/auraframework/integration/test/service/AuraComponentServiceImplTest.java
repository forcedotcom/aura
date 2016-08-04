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

import org.auraframework.def.ComponentDef;
import org.auraframework.impl.AuraImplTestCase;
import org.junit.Test;

import java.util.HashMap;
import java.util.Map;

public class AuraComponentServiceImplTest extends AuraImplTestCase {

    @Test
    public void testGetComponent() throws Exception {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("attr", "yo");
        assertNotNull(instanceService.getInstance("test:child1", ComponentDef.class, attributes));
    }
}
