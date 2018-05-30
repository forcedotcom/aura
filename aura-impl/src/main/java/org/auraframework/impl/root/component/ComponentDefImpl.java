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
package org.auraframework.impl.root.component;

import java.io.IOException;
import java.util.List;

import org.auraframework.Aura;
import org.auraframework.builder.ComponentDefBuilder;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.system.AuraContext;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;
import org.auraframework.util.json.JsonSerializationContext;
import org.auraframework.util.json.Json.ApplicationKey;
import org.auraframework.validation.ReferenceValidationContext;

/**
 * The definition of a component. Holds all information about a given type of
 * component. ComponentDefs are immutable singletons per type of ComponentDef.
 * Once they are created, they can only be replaced, never changed.
 */
public class ComponentDefImpl extends BaseComponentDefImpl<ComponentDef> implements ComponentDef {

    private static final long serialVersionUID = -8833271874946123511L;
    
    private final boolean dynamicallyGenerated;

    protected ComponentDefImpl(Builder builder) {
        super(builder);
        dynamicallyGenerated = builder.dynamicallyGenerated;
    }

    /**
     * The Descriptor for the component that all non-root components eventually
     * must extend. Similar to java.lang.Object in java.
     */
    public static final DefDescriptor<ComponentDef> PROTOTYPE_COMPONENT = new DefDescriptorImpl<>("markup", "aura",
            "component", ComponentDef.class);

    public static class Builder extends BaseComponentDefImpl.Builder<ComponentDef> implements ComponentDefBuilder {
        
        public Builder() {
            super(ComponentDef.class);
        }

        @Override
        public ComponentDef build() {
            finish();
            return new ComponentDefImpl(this);
        }

        @Override
        public DefDescriptor<ComponentDef> getDefaultExtendsDescriptor() {
            return ComponentDefImpl.PROTOTYPE_COMPONENT;
        }
    }

    /**
     * @throws QuickFixException
     * @see org.auraframework.def.BaseXmlElement#validateReferences(ReferenceValidationContext)
     */
    @Override
    public void validateReferences(ReferenceValidationContext validationContext) throws QuickFixException {
        super.validateReferences(validationContext);

        // Only GLOBAL components can specify a minVersion
        if (this.getMinVersion() != null && !this.getAccess().isGlobal()) {
            throw new InvalidDefinitionException(
                    "Cannot specify minVersion if access is not GLOBAL", getLocation());
        }
    }
    
    /**
     * This adds a simple caching mechanism to the component serialization
     * We store the serialized JSON on the component, but we do reserialize
     * certain things (contextDependencies and styles)
     * 
     * Only the ComponentDef implements this behavior
     */
    @Override
    public void serialize(Json json) throws IOException {
        AuraContext context = Aura.getContextService().getCurrentContext();
        JsonSerializationContext serializationContext = context.getJsonSerializationContext();

        boolean preloaded = context.isPreloaded(getDescriptor());

        String indent = SERIALIZED_JSON_NO_FORMATTING_KEY;
        if (json.getSerializationContext().format()) {
            indent = json.getIndent();
        }
        if (serializedJSON != null && serializedJSON.containsKey(indent) && !preloaded && !serializationContext.isSerializing()) {
            serializationContext.setSerializing(true);
            
            json.writeMapBegin();
            json.writeValue(getAccess());
            json.writeMapEntry(ApplicationKey.DESCRIPTOR, descriptor);

            serializeStyles(json);

            String preSerializedJSON = serializedJSON.get(indent);
            if (preSerializedJSON != null) {
                json.getAppendable().append(preSerializedJSON);
            }
            
            serializeContextDependencies(context, json);
            json.writeMapEnd();
            serializationContext.setSerializing(false);
        }
        else {
            super.serialize(json);
        }
    }
    
    @Override
    public List<DefDescriptor<ComponentDef>> getTrackedDependencies() {
        return null;
    }

    @Override
    protected void serializeFields(Json json) throws IOException {
    }
    
    @Override
    public boolean isDynamicallyGenerated() {
        return dynamicallyGenerated;
    }
}
