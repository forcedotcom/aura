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
import org.auraframework.instance.AbstractActionImpl;
import org.auraframework.instance.Action;
import org.auraframework.instance.BaseComponent;
import org.auraframework.system.LoggingContext.KeyValueLogger;
import org.auraframework.throwable.AuraExecutionException;
import org.auraframework.util.javascript.Literal;
import org.auraframework.util.json.Json;

import com.google.common.collect.Lists;

/**
 * A simple Action used when mocking Controller creations.
 */
public class MockAction extends AbstractActionImpl<ActionDef> {
    public MockAction(DefDescriptor<ActionDef> descriptor, State state, Object returnValue) {
        this(descriptor, state, returnValue, null, null, null);
    }

    public MockAction(DefDescriptor<ActionDef> descriptor, State state,
            Object returnValue, List<Action> actions,
            Map<String, BaseComponent<?, ?>> componentRegistry, List<Object> errors) {
        super(null, null, null);
        this.descriptor = descriptor;
        this.state = (state == null ? State.SUCCESS : state);
        this.returnValue = returnValue;
        if (actions != null) {
            add(actions);
        }
        this.errors = (errors == null) ? Lists.<Object> newLinkedList() : errors;
        if (componentRegistry != null) {
            for (BaseComponent<?,?> comp : componentRegistry.values()) {
                this.getInstanceStack().registerComponent(comp);
            }
        }
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
    public void run() throws AuraExecutionException {
    }

    @Override
    public List<Object> getErrors() {
        return errors;
    }

    @Override
    public void serialize(Json json) throws IOException {
        json.writeMapBegin();
        json.writeMapEntry("id", getId());
        json.writeMapEntry("state", state);
        json.writeMapEntry("returnValue", returnValue == null ? Literal.NULL : returnValue);
        json.writeMapEntry("error", getErrors());
        this.getInstanceStack().serializeAsPart(json);
        json.writeMapEnd();
    }
    
    @Override
    public void logParams(KeyValueLogger paramLogger) {
        // not implemented
    }

    private final DefDescriptor<ActionDef> descriptor;
    private final Object returnValue;
    private final List<Object> errors;
}
