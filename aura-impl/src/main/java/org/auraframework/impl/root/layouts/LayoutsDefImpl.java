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
package org.auraframework.impl.root.layouts;

import static org.auraframework.instance.ValueProviderType.LABEL;

import java.io.IOException;
import java.util.*;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

import org.auraframework.Aura;
import org.auraframework.def.*;
import org.auraframework.expression.PropertyReference;
import org.auraframework.impl.root.RootDefinitionImpl;
import org.auraframework.impl.util.AuraUtil;
import org.auraframework.instance.GlobalValueProvider;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil;
import org.auraframework.util.json.Json;

/**
 */
public class LayoutsDefImpl extends RootDefinitionImpl<LayoutsDef> implements LayoutsDef{

    private static final long serialVersionUID = 309255009681421736L;
    private final List<LayoutDef> layoutDefs;
    private final Map<String, LayoutDef> layoutDefsByName;
    private final String catchall;
    private final String defaultLayout;
    private final Set<PropertyReference> expressionRefs;

    protected LayoutsDefImpl(Builder builder) {
        super(builder);
        layoutDefs = AuraUtil.immutableList(builder.layoutDefs);
        catchall = builder.catchall;
        defaultLayout = builder.defaultLayout;
        this.expressionRefs = AuraUtil.immutableSet(builder.expressionRefs);

        Map<String, LayoutDef> byName = Maps.newHashMap();
        for(LayoutDef layout : layoutDefs){
            byName.put(layout.getName(), layout);
        }
        layoutDefsByName = AuraUtil.immutableMap(byName);
    }

    public static class Builder extends RootDefinitionImpl.Builder<LayoutsDef> {

        public Builder(){
            super(LayoutsDef.class);
        }

        public List<LayoutDef> layoutDefs;
        public String catchall;
        public String defaultLayout;
        public Set<PropertyReference> expressionRefs;

        @Override
        public LayoutsDefImpl build() {
            return new LayoutsDefImpl(this);
        }

        public void addLayoutDef(LayoutDef layoutDef){
            if(this.layoutDefs == null){
                this.layoutDefs = Lists.newArrayList();
            }
            this.layoutDefs.add(layoutDef);
        }
    }

    @Override
    public Map<DefDescriptor<AttributeDef>, AttributeDef> getAttributeDefs() {
        return null;
    }

    @Override
    public List<DefDescriptor<?>> getBundle() {
        return null;
    }

    @Override
    public Collection<LayoutDef> getLayoutDefs() {
        return this.layoutDefs;
    }

    @Override
    public Map<String, RegisterEventDef> getRegisterEventDefs() {
        return null;
    }

    @Override
    public boolean isInstanceOf(DefDescriptor<? extends RootDefinition> other) {
        return false;
    }

    public Set<PropertyReference> getExpressionRefs() {
        return this.expressionRefs;
    }

    @Override
    public void serialize(Json json) throws IOException {
        json.writeMapBegin();
        json.writeMapEntry("layoutDefs",layoutDefs);
        json.writeMapEntry("defaultLayout",defaultLayout);
        json.writeMapEntry("catchall", catchall);
        json.writeMapEnd();
    }

    @Override
    public LayoutDef getLayoutDef(String name) {
        return layoutDefsByName.get(name);
    }

    @Override
    public void retrieveLabels() throws QuickFixException {
        GlobalValueProvider labelProvider = Aura.getContextService().getCurrentContext().getGlobalProviders().get(LABEL);
        for (PropertyReference e : expressionRefs) {
            if (e.getRoot().equals(LABEL.getPrefix())) {
                labelProvider.getValue(e.getStem());
            }
        }
    }

    @Override
    public void validateDefinition() throws QuickFixException {
        super.validateDefinition();
        if (AuraTextUtil.isNullEmptyOrWhitespace(defaultLayout)) { // default is required attribute
            throw new InvalidDefinitionException("The \"default\" attribute is required for layouts", getLocation());
        }
        if (getLayoutDef(defaultLayout) == null) { // the default layout must exist
            throw new InvalidDefinitionException(String.format("The default layout \"%s\" doesn't exist", defaultLayout), getLocation());
        }
        // if catchall is specified, it must exist
        if (catchall != null && (AuraTextUtil.isEmptyOrWhitespace(catchall) || getLayoutDef(catchall) == null)) {
                throw new InvalidDefinitionException(String.format("The catchall layout \"%s\" doesn't exist", catchall), getLocation());
        }
        for(LayoutDef layout : getLayoutDefs()){
            layout.validateDefinition();
        }
    }

}
