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
package org.auraframework.impl.root.event;

import org.auraframework.def.EventType;
import org.auraframework.test.UnitTestCase;

/**
*/
public class EventTypeTest extends UnitTestCase {

    public void testCanBeFired() {
        assertTrue(EventType.APPLICATION.canBeFired());
        assertTrue(EventType.COMPONENT.canBeFired());
    }

    public void testHasSource() {
        assertTrue(EventType.COMPONENT.hasSource());
        assertFalse(EventType.APPLICATION.hasSource());
    }

    public void testGetEventType() {
        assertEquals(EventType.APPLICATION, EventType.getEventType("APPLICATION"));
        assertEquals(EventType.COMPONENT, EventType.getEventType("COMPONENT"));
        assertNotSame(EventType.APPLICATION, EventType.getEventType("COMPONENT"));
    }

}
