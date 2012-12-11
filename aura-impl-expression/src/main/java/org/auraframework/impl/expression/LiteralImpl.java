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
package org.auraframework.impl.expression;

import java.io.IOException;
import java.util.Set;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.TypeDef;
import org.auraframework.expression.*;
import org.auraframework.instance.ValueProvider;
import org.auraframework.system.Location;
import org.auraframework.util.json.Json;
import org.auraframework.util.json.JsonSerializer.NoneSerializer;

/**
 * a literal number, string, boolean, or null
 */
public class LiteralImpl implements Literal {

    /**
     */
    private static final long serialVersionUID = 2255827488061408651L;
    private final Object value;
    private final Location l;

    public LiteralImpl(Object value, Location l) {
        this.value = value;
        // TODO: get typedef from value
        this.l = l;
    }

    @Override
    public final Location getLocation() {
        return l;
    }

    @Override
    public Object evaluate(ValueProvider vp) {
        return getValue();
    }

    @Override
    public Object getValue() {
        return value;
    }

    @Override
    public ExpressionType getExpressionType() {
        return ExpressionType.LITERAL;
    }

    @Override
    public DefDescriptor<TypeDef> getReturnTypeDef() {
        return null;
    }

    @Override
    public void gatherPropertyReferences(Set<PropertyReference> propRefs) {
        // none here.
    }

    public static final Serializer SERIALIZER = new Serializer();

    private static class Serializer extends NoneSerializer<LiteralImpl> {
        @Override
        public void serialize(Json json, LiteralImpl value) throws IOException {
            json.writeValue(value.getValue());
        }
    }
}
