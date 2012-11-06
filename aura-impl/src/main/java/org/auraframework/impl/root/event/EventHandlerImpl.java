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

import java.io.IOException;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.EventHandlerDef;
import org.auraframework.expression.PropertyReference;
import org.auraframework.instance.EventHandler;
import org.auraframework.util.json.Json;

/**
 * Instance of an event handler attribute
 *
 *
 *
 */
public class EventHandlerImpl implements EventHandler {

    // TODO: this needs to have a defdescriptor!
    private final String name;
    private PropertyReference expr;

    public EventHandlerImpl(String name) {
        this.name = name;
    }

    @Override
    public String getName() {
        return name;
    }

    public void setActionExpression(PropertyReference e) {
        this.expr = e;
    }

    @Override
    public PropertyReference getActionExpression() {
        return expr;
    }

    @Override
    public void serialize(Json json) throws IOException {
        json.writeValue(expr);
    }

    @Override
    public DefDescriptor<EventHandlerDef> getDescriptor() {
        // TODO This still needs to have a defdescriptor.
        return null;
    }

}
