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
package org.auraframework.impl.root.locator;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import org.auraframework.Aura;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.LocatorContextDef;
import org.auraframework.def.LocatorDef;
import org.auraframework.def.RootDefinition;
import org.auraframework.impl.system.DefinitionImpl;
import org.auraframework.impl.util.AuraUtil;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.util.AuraTextUtil;
import org.auraframework.util.json.Json;

/**
 * Definition for aura:locator markup
 */
public class LocatorDefImpl extends DefinitionImpl<LocatorDef> implements LocatorDef {

    // target doesn't need to be serialized to the client
    private transient String target = null;
    private Map<String, Object> locatorContextDefs = null;
	private String alias = null;
	private Boolean isPrimitive = null;
	private DefDescriptor<? extends RootDefinition> parentDescriptor = null;

    private static final long serialVersionUID = -6148857447543915255L;

    protected LocatorDefImpl(Builder builder) {
        super(builder);
        this.target = builder.target;
        this.alias = builder.alias;
        this.locatorContextDefs = AuraUtil.immutableMap(builder.locatorContextDefs);
        this.isPrimitive = builder.isPrimitive;
        this.parentDescriptor = builder.parentDescriptor;
    }

    @Override
    public void serialize(Json json) throws IOException {
        Mode mode = Aura.getContextService().getCurrentContext().getMode();
        
        json.writeMapBegin();
        
        if (mode != Mode.PROD) {
            // only send down description in non-prod mode. This is useful when generating
            // meta data about locators on the client
            if (!AuraTextUtil.isNullEmptyOrWhitespace(description)) {
               json.writeMapEntry("description", description);
            }
        }
        
        Map<String, Object> locatorContextDefs = getLocatorContextMap();
        if (locatorContextDefs!= null && !locatorContextDefs.isEmpty()) {
            json.writeMapEntry("context", locatorContextDefs);
        }
        
        if (this.alias != null) {
            json.writeMapEntry("alias", this.alias);
        }
        
        if (this.isPrimitive != null) {
            json.writeMapEntry("isPrimitive", this.isPrimitive);
        }
        
        json.writeMapEnd();
    }

    @Override
    public DefDescriptor<? extends RootDefinition> getParentDescriptor() {
        return this.parentDescriptor;
    }

    @Override
    public String getTarget() {
        return target;
    }

    @Override
    public String getDescription() {
        return description;
    }
    
    @Override
    public String getAlias() {
        return this.alias;
    }
    
    @Override
    public Boolean getIsPrimitive() {
        return this.isPrimitive;
    }

    public static class Builder extends DefinitionImpl.BuilderImpl<LocatorDef> {

        private String target;
        private Map<String, Object> locatorContextDefs;
		private String alias = null;
		private Boolean isPrimitive = null;
		private DefDescriptor<? extends RootDefinition> parentDescriptor = null;

        public Builder() {
            super(LocatorDef.class);
        }

        @Override
        public LocatorDefImpl build() {
            return new LocatorDefImpl(this);
        }

        public Builder setTarget(String target) {
            this.target = target;
            return this;
        }

        public Builder addLocatorContext(LocatorContextDef locatorContext) {
            if (locatorContextDefs == null) {
                locatorContextDefs = new HashMap<>();
            }
            locatorContextDefs.put(locatorContext.getKey(), locatorContext.getValue());
            return this;
        }

        public Builder setAlias(String alias) {
            this.alias = alias;
            return this;
        }
        
        public Builder setIsPrimitive(Boolean isPrimitive) {
            this.isPrimitive = isPrimitive;
            return this;
        }
        
        public Boolean getIsPrimitive() {
            return this.isPrimitive;
        }
        
        public Builder setParentDescriptor(DefDescriptor<? extends RootDefinition> parentDescriptor) {
        	this.parentDescriptor = parentDescriptor;
        	return this;
        }
        
        public DefDescriptor<? extends RootDefinition> getParentDescriptor() {
        	return this.parentDescriptor;
        }

    }

    @Override
    public Map<String, Object> getLocatorContextMap() {
        return locatorContextDefs;
    }

}
