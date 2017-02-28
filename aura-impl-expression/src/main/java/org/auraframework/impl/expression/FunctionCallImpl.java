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
package org.auraframework.impl.expression;

import com.google.common.collect.Sets;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.TypeDef;
import org.auraframework.expression.Expression;
import org.auraframework.expression.ExpressionType;
import org.auraframework.expression.FunctionCall;
import org.auraframework.expression.Literal;
import org.auraframework.expression.PropertyReference;
import org.auraframework.impl.expression.functions.Function;
import org.auraframework.instance.ValueProvider;
import org.auraframework.system.Location;
import org.auraframework.throwable.CircularReferenceException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil;
import org.auraframework.util.json.Json;
import org.auraframework.util.json.JsonSerializers.NoneSerializer;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

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
    private boolean byValue = false;
    private ValueProvider valueProvider = null;
    private Map<ValueProvider, Boolean> circularReferenceDetector = new HashMap<>();

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
        List<Object> list = new ArrayList<>(args.size());
        if (circularReferenceDetector.getOrDefault(vp, false)) {
            throw new CircularReferenceException("A circular reference was detected", null);
        }
        circularReferenceDetector.put(vp, true);
        for (Expression e : args) {
            if (valueProvider != null && !(e instanceof Literal)) {
                Object result = e.evaluate(valueProvider);
                if (result == null) {
                    result = e.evaluate(vp);
                }
                list.add(result);
            } else {
                list.add(e.evaluate(vp));
            }
        }
        circularReferenceDetector.put(vp, false);
        return f.evaluate(list);
    }

    @Override
    public void compile(Appendable out) throws IOException {
        f.compile(out, args);
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
    public void setByValue(boolean byValue) {
        this.byValue = byValue;
        for (Expression e : args) {
            e.setByValue(byValue);
        }
    }

    @Override
    public void gatherPropertyReferences(Set<PropertyReference> propRefs) {
        for (Expression e : args) {
            e.gatherPropertyReferences(propRefs);
        }
    }

    public void setValueProvider(ValueProvider valueProvider) {
        this.valueProvider = valueProvider;
    }

    public ValueProvider getValueProvider() {
        return valueProvider;
    }

    public static final Serializer SERIALIZER = new Serializer();

    private static class Serializer extends NoneSerializer<FunctionCallImpl> {

        @Override
        public void serialize(Json json, FunctionCallImpl value) throws IOException {

            StringBuilder out = new StringBuilder();
            out.append("function(cmp, fn) { return ");
            value.compile(out);
            out.append("; }");

            // Use a set to remove duplicate properties
            Set<PropertyReference> propRefs = Sets.newHashSetWithExpectedSize(2);
            value.gatherPropertyReferences(propRefs);

            json.writeMapBegin();
            json.writeMapEntry("exprType", value.getExpressionType());
            json.writeMapKey("code");
            json.writeLiteral(AuraTextUtil.escapeForJSONFunction(out.toString()));
            json.writeMapEntry("args", propRefs);
            json.writeMapEntry("byValue", value.byValue);

            json.writeMapEnd();
        }
    }
}
