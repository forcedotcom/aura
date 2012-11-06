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
package org.auraframework.def;

import org.auraframework.Aura;
import org.auraframework.builder.ComponentDefRefBuilder;
import org.auraframework.instance.BaseComponent;
import org.auraframework.throwable.quickfix.QuickFixException;

public interface AttributeValueProvider {

    Object getValue(String key) throws QuickFixException;

    Object getExpression(String valueAttributeName) throws QuickFixException;

    DefDescriptor<?> getDescriptor();

    BaseComponent<?, ?> getValueProvider();

    public static class ComponentAttributeValueProvider implements AttributeValueProvider {
        public ComponentAttributeValueProvider(BaseComponent<?, ?> component) {
            this.component = component;
        }

        @Override
        public Object getValue(String key) throws QuickFixException {
            return component.getAttributes().getValue(key);
        }

        @Override
        public DefDescriptor<?> getDescriptor() {
            return component.getDescriptor();
        }

        @Override
        public Object getExpression(String key) {
            return component.getAttributes().getExpression(key);
        }

        @Override
        public BaseComponent<?, ?> getValueProvider() {
            return component.getAttributes().getValueProvider();
        }

        private final BaseComponent<?, ?> component;
    }

    public static class ComponentDefRefBuilderAttributeValueProvider implements AttributeValueProvider {
        public ComponentDefRefBuilderAttributeValueProvider(ComponentDefRefBuilder ref) {
            this.ref = ref;
        }

        @Override
        public Object getValue(String key) throws QuickFixException {
            DefDescriptor<AttributeDef> attribute = Aura.getDefinitionService().getDefDescriptor(key, AttributeDef.class);
            AttributeDefRef value = ref.getAttributeValue(attribute);
            return value != null ? value.getValue() : null;
        }

        @Override
        public DefDescriptor<ComponentDef> getDescriptor() {
            return ref.getDescriptor();
        }

        @Override
        public Object getExpression(String key) throws QuickFixException {
            return getValue(key);
        }

        @Override
        public BaseComponent<?, ?> getValueProvider() {
            return Aura.getContextService().getCurrentContext().getCurrentComponent();
        }


        private final ComponentDefRefBuilder ref;
    }
}
