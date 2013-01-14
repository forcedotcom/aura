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
package org.auraframework.def;

/**
 * All the different types of aura events
 */
public enum EventType {

    /**
     * Application level events can be handled anywhere in the app, they have no
     * source
     */
    APPLICATION,

    /**
     * Component level events can be handled in the scope in which the component
     * is used, this is the main method of communication between two components.
     * The source is part of the event and can be filtered on
     */
    COMPONENT,

    /**
     * Events fired from Values
     */
    VALUE;

    /**
     * only global and local events can be manually fired by the user
     */
    public boolean canBeFired() {
        return this == APPLICATION || this == COMPONENT;
    }

    /**
     * does this event have a source attribute
     */
    public boolean hasSource() {
        return this == COMPONENT;
    }

    public static EventType getEventType(String blah) {
        return valueOf(blah.toUpperCase());
    }
}
