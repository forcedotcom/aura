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
package org.auraframework.impl.root.component;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.auraframework.def.AttributeDefRef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.ForEachDef;
import org.auraframework.expression.PropertyReference;
import org.auraframework.impl.root.AttributeDefRefImpl;
import org.auraframework.instance.BaseComponent;
import org.auraframework.instance.Component;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;

import com.google.common.collect.Lists;

/**
 * aura:forEach is a system tag that is handled by ForEachHandler however a
 * component is also created for this tag which is handled by ForEachDefImpl.
 * 
 * ForEachDef creates an inner component definition, subDefs on DefinitionImpl,
 * that represents its body, and then creates an instance of the body for each
 * var in the collection.
 */
public class ForEachDefImpl extends ComponentDefRefImpl implements ForEachDef {

    private static final long serialVersionUID = 6417129055887650404L;
    private final PropertyReference items;
    private final String var;
    private final boolean reverse;
    private final ComponentDef body;

    protected ForEachDefImpl(Builder builder) {
        super(builder);

        this.items = builder.items;
        this.var = builder.var;
        this.body = builder.body;
        this.reverse = builder.reverse;
    }

    @Override
    public List<Component> newInstance(BaseComponent<?, ?> valueProvider) throws QuickFixException {
        if (load == Load.LAZY) {
            return super.newInstance(valueProvider);
        }

        Object it = valueProvider.getValue(items);
        Iterable<?> iterable = (Iterable<?>) it;
        List<Component> ret = Lists.newArrayList();

        if (iterable != null) {
            if (reverse) {
                List<Object> rev = Lists.newArrayList();
                for (Object o : iterable) {
                    rev.add(0, o);
                }
                iterable = rev;
            }

            for (Object o : iterable) {
                AttributeDefRefImpl.Builder atBuilder = new AttributeDefRefImpl.Builder();
                atBuilder.setDescriptor(body.getAttributeDef(var).getDescriptor());
                atBuilder.setLocation(location);
                atBuilder.setValue(o);

                AttributeDefRef attribute = atBuilder.build();

                Map<String, Object> providers = new HashMap<String, Object>();
                providers.put(var, o);
                ret.add(new ComponentImpl(descriptor, Lists.newArrayList(attribute), valueProvider, providers,
                        valueProvider));
            }
        }
        return ret;
    }

    @Override
    public void appendDependencies(Set<DefDescriptor<?>> dependencies) throws QuickFixException {
        getComponentDef().appendDependencies(dependencies);
    }

    @Override
    public ComponentDef getComponentDef() {
        return body;
    }

    @Override
    public void serialize(Json json) throws IOException {
        json.writeMapBegin();
        json.writeMapEntry("componentDef", getComponentDef());
        json.writeMapEntry("items", items);
        json.writeMapEntry("var", var);
        json.writeMapEntry("reverse", reverse);
        if (!attributeValues.isEmpty()) {
            json.writeMapKey("attributes");
            json.writeMapBegin();
            json.writeMapEntry("values", attributeValues);
            json.writeMapEnd();
        }
        json.writeMapEnd();
    }

    /**
     * ForEach is a reference to N instances of a "private/inner" component that
     * represents the body of the forEach. This validateReferences is making
     * sure that the inner component has a chance to valides its references too.
     * Note that ForEachDef extends ComponentDefRef, which has similar behavior.
     */
    @Override
    public void validateReferences() throws QuickFixException {
        body.validateReferences();
    }

    public static class Builder extends ComponentDefRefImpl.Builder {
        public PropertyReference items;
        public String var;
        private boolean reverse;
        public ComponentDef body;

        @Override
        public ForEachDefImpl build() {
            return new ForEachDefImpl(this);
        }

        /**
         * Sets the items for this instance.
         * 
         * @param items The items.
         */
        public Builder setItems(PropertyReference items) {
            this.items = items;
            return this;
        }

        /**
         * Gets the var for this instance.
         */
        public String getVar() {
            return this.var;
        }

        /**
         * Sets the var for this instance.
         * 
         * @param var The var.
         */
        public Builder setVar(String var) {
            this.var = var;
            return this;
        }

        /**
         * Sets whether or not this instance is reverse.
         * 
         * @param reverse The reverse.
         */
        public Builder setReverse(boolean reverse) {
            this.reverse = reverse;
            return this;
        }

        /**
         * Gets the body for this instance.
         */
        public ComponentDef getBody() {
            return this.body;
        }

        /**
         * Sets the body for this instance.
         * 
         * @param body The body.
         */
        public Builder setBody(ComponentDef body) {
            this.body = body;
            return this;
        }
    }
}
