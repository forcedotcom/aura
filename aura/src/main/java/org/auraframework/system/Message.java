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
package org.auraframework.system;

import java.util.List;

import org.auraframework.def.BaseComponentDef;
import org.auraframework.instance.Action;
import org.auraframework.instance.Event;

public class Message<T extends BaseComponentDef> {

    private final List<Action> actions;
    private final List<Event> clientEvents;

    public Message(List<Action> actions) {
        this(actions, null);
    }

    public Message(List<Action> actions, List<Event> events) {
        this.actions = actions;
        this.clientEvents = events;
    }

    public List<Action> getActions() {
        return actions;
    }

    public List<Event> getClientEvents() {
        return clientEvents;
    }
}
