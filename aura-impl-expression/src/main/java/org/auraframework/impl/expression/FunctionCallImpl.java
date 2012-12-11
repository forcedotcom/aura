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
import java.util.*;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.TypeDef;
import org.auraframework.expression.*;
import org.auraframework.impl.expression.functions.Function;
import org.auraframework.instance.ValueProvider;
import org.auraframework.system.Location;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;
import org.auraframework.util.json.JsonSerializer.NoneSerializer;

/**
 * function calling expression
 */
public class FunctionCallImpl implements FunctionCall {

    /**
     */
    private static final long serialVersionUID = -6285228439395661727L;
    private final List<Expression> args;
    private final Function f;
    private final Location l;

    public FunctionCallImpl(Function f, List<Expression> args, Location l) {
        this.args = args;
        this.f = f;
        this.l = l;
    }

    @Override
    public final Location getLocation() {
        return l;
    }

    @Override
    public ExpressionType getExpressionType() {
        return ExpressionType.FUNCTION;
    }

    @Override
    public Object evaluate(ValueProvider vp) throws QuickFixException {
        List<Object> list = new ArrayList<Object>(args.size());
        for (Expression e : args) {
            list.add(e.evaluate(vp));
        }
        return f.evaluate(list);
    }

    @Override
    public DefDescriptor<TypeDef> getReturnTypeDef() {
        return null;
    }

    @Override
    public List<DefDescriptor<TypeDef>> getArgumentTypeDefs() {
        return null;
    }

    @Override
    public void gatherPropertyReferences(Set<PropertyReference> propRefs) {
        for (Expression e : args) {
            e.gatherPropertyReferences(propRefs);
        }
    }

    public static final Serializer SERIALIZER = new Serializer();

    private static class Serializer extends NoneSerializer<FunctionCallImpl> {
        @Override
        public void serialize(Json json, FunctionCallImpl value) throws IOException {
            json.writeMapBegin();
            json.writeMapEntry("exprType", value.getExpressionType());
            json.writeMapEntry("key", value.f.getKeys()[0]);
            json.writeMapEntry("args", value.args);
            json.writeMapEnd();
        }
    }
}
