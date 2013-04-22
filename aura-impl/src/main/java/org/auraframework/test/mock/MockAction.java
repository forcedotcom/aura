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
package org.auraframework.test.mock;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import org.auraframework.def.ActionDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.instance.Action;
import org.auraframework.instance.BaseComponent;
import org.auraframework.throwable.AuraExecutionException;
import org.auraframework.util.javascript.Literal;
import org.auraframework.util.json.Json;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

/**
 * A simple Action used when mocking Controller creations.
 */
public class MockAction implements Action {
    public MockAction(DefDescriptor<ActionDef> descriptor, State state,
            Object returnValue) {
        this(descriptor, state, returnValue, null, null, null);
    }

    public MockAction(DefDescriptor<ActionDef> descriptor, State state,
            Object returnValue, List<Action> actions,
            Map<String, BaseComponent<?, ?>> components, List<Object> errors) {
        this.descriptor = descriptor;
        this.id = null;
        this.state = (state == null ? State.SUCCESS : state);
        this.returnValue = returnValue;
        this.actions = (actions == null) ? Lists.<Action> newLinkedList()
                : actions;
        this.components = (components == null) ? Maps
                .<String, BaseComponent<?, ?>> newHashMap() : components;
        this.errors = (errors == null) ? Lists.<Object> newLinkedList()
                : errors;
    }

    @Override
    public DefDescriptor<ActionDef> getDescriptor() {
        return descriptor;
    }

    @Override
    public Object getReturnValue() {
        return returnValue;
    }

    @Override
    public String getId() {
        return id;
    }

    @Override
    public void setId(String id) {
        this.id = id;
    }

    @Override
    public void run() throws AuraExecutionException {

    }

    @Override
    public State getState() {
        return state;
    }

    @Override
    public List<Object> getErrors() {
        return errors;
    }

    @Override
    public void add(List<Action> actions) {
        actions.addAll(actions);
    }

    @Override
    public List<Action> getActions() {
        return actions;
    }

    @Override
    public void registerComponent(BaseComponent<?, ?> component) {
        components.put(component.getGlobalId(), component);
    }

    @Override
    public Map<String, BaseComponent<?, ?>> getComponents() {
        return components;
    }

    @Override
    public int getNextId() {
        return 0;
    }

    @Override
    public void serialize(Json json) throws IOException {
        json.writeMapBegin();
        json.writeMapEntry("id", id);
        json.writeMapEntry("state", state);
        json.writeMapEntry("returnValue", returnValue == null ? Literal.NULL : returnValue);
        json.writeMapEntry("error", getErrors());
        if (!components.isEmpty()) {
            json.writeMapKey("components");
            json.writeMapBegin();
            for (BaseComponent<?, ?> component : components.values()) {
                if (component.hasLocalDependencies()) {
                    json.writeMapEntry(component.getGlobalId(), component);
                }
            }
            json.writeMapEnd();
        }
        json.writeMapEnd();
    }

    private final DefDescriptor<ActionDef> descriptor;
    private String id;
    private final State state;
    private final Object returnValue;
    private final List<Action> actions;
    private final Map<String, BaseComponent<?, ?>> components;
    private final List<Object> errors;
}
