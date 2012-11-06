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
package org.auraframework.system;

import java.util.List;

import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.instance.Action;
import org.auraframework.instance.Event;

public class Message<T extends BaseComponentDef> {

    private final List<Action> actions;
    private final List<Event> clientEvents;

    // These two fields are for requesting component/app defs on a GET request.
    // TODO: They should go away when we have a standard component controller--everything will be an action
    private final DefDescriptor<T> defDescriptor;
    private final T def;

    public Message(List<Action> actions, DefDescriptor<T> defDescriptor, T def){
    	this(actions, null, defDescriptor, def);
    }    
    
    public Message(List<Action> actions, List<Event> events, DefDescriptor<T> defDescriptor, T def){
        this.actions = actions;
        this.clientEvents = events;
        this.defDescriptor = defDescriptor;
        this.def = def;
    }

    public List<Action> getActions(){
        return actions;
    }

    public List<Event> getClientEvents(){
        return clientEvents;
    }    
    
    public DefDescriptor<T> getDefDescriptor() {
        return defDescriptor;
    }

    public T getDef() {
        return def;
    }
}
