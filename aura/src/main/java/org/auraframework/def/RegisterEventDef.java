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
package org.auraframework.def;

/**
 * An event registration.
 *
 * This class represents a registered event on a root definition. It has a name (the attribute name),
 * and an event.
 */
public interface RegisterEventDef extends Definition, ParentedDef {
    /**
     * Return the descriptor for this 'def'.
     *
     * This descriptor is an 'attribute' descriptor, with only a name.
     */
    @Override
    DefDescriptor<RegisterEventDef> getDescriptor();

    /**
     * Return the descriptor of the event being registered.
     */
    DefDescriptor<EventDef> getReference();

    /**
     * is this event def global?.
     *
     * FIXME: this is probably not worth having here, you can always get the access and check global.
     */
    boolean isGlobal();

    /**
     * Get the attribute name.
     *
     * @deprecated use #getDescriptor().getName()
     */
    @Deprecated
    String getAttributeName();
}
