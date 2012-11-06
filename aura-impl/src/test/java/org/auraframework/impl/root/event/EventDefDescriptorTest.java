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
package org.auraframework.impl.root.event;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.EventDef;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.system.DefDescriptorImpl;

/**
 */
public class EventDefDescriptorTest extends AuraImplTestCase {

    public EventDefDescriptorTest(String name) {
        super(name);
    }

    public void testGetDefType() throws Exception {
        DefDescriptor<EventDef> testDescriptor = DefDescriptorImpl.getInstance("aura:testevent", EventDef.class);
        assertEquals(testDescriptor.getDefType(), DefType.EVENT);
    }


}
