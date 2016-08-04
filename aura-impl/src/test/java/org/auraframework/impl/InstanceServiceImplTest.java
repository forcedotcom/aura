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
package org.auraframework.impl;

import com.google.common.collect.Maps;
import org.auraframework.def.ComponentDef;
import org.auraframework.throwable.quickfix.AttributeNotFoundException;
import org.junit.Ignore;
import org.junit.Test;

import java.util.Map;

public class InstanceServiceImplTest extends AuraImplTestCase {
    /**
     * Verify that calling InstanceService with an undefined attributes throws
     * an exception.
     */
    @Ignore("W-1483429")
    @Test
    public void testInstanceCreationWithNonExistingArrtibutes() throws Exception {
        Map<String, Object> attrMap = Maps.newHashMap();
        attrMap.put("iDontExist", "bar");
        try {
            instanceService.getInstance("ui:inputText", ComponentDef.class, attrMap);
            fail("Instantiating a component with undefined attributes should have thrown an exception");
        } catch (AttributeNotFoundException e) {
            // Expected
        }
    }
}
