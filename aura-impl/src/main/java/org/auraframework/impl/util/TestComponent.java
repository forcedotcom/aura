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
package org.auraframework.impl.util;

import java.io.IOException;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.auraframework.def.AttributeDef;
import org.auraframework.def.AttributeDefRef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.ControllerDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.def.DependencyDef;
import org.auraframework.def.EventHandlerDef;
import org.auraframework.def.HelperDef;
import org.auraframework.def.InterfaceDef;
import org.auraframework.def.ModelDef;
import org.auraframework.def.ProviderDef;
import org.auraframework.def.RegisterEventDef;
import org.auraframework.def.RendererDef;
import org.auraframework.def.RootDefinition;
import org.auraframework.def.ThemeDef;
import org.auraframework.system.Location;
import org.auraframework.system.SubDefDescriptor;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;

public final class TestComponent implements ComponentDef {

    private static final long serialVersionUID = -8566750149469848058L;

    @Override
    public final boolean isExtensible() {
        // TODO Auto-generated method stub
        return false;
    }

    @Override
    public boolean isAbstract() {
        // TODO Auto-generated method stub
        return false;
    }

    @Override
    public Collection<EventHandlerDef> getHandlerDefs() throws QuickFixException {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public DefDescriptor<ModelDef> getLocalModelDefDescriptor() {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public List<DefDescriptor<ModelDef>> getModelDefDescriptors() throws QuickFixException {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public List<DefDescriptor<ControllerDef>> getControllerDefDescriptors() throws QuickFixException {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public ModelDef getModelDef() throws QuickFixException {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public ControllerDef getControllerDef() throws QuickFixException {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public DefDescriptor<ComponentDef> getExtendsDescriptor() {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public DefDescriptor<RendererDef> getRendererDescriptor() throws QuickFixException {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public DefDescriptor<ThemeDef> getThemeDescriptor() {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public List<AttributeDefRef> getFacets() {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public RendererDef getLocalRendererDef() throws QuickFixException {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public boolean isLocallyRenderable() throws QuickFixException {
        // TODO Auto-generated method stub
        return false;
    }

    @Override
    public ComponentDef getTemplateDef() throws QuickFixException {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public DefDescriptor<ComponentDef> getTemplateDefDescriptor() {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public org.auraframework.def.BaseComponentDef.RenderType getRender() {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public org.auraframework.def.BaseComponentDef.WhitespaceBehavior getWhitespaceBehavior() {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public HelperDef getHelperDef() throws QuickFixException {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public Map<DefDescriptor<AttributeDef>, AttributeDef> getDeclaredAttributeDefs() {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public Map<DefDescriptor<AttributeDef>, AttributeDef> getAttributeDefs() throws QuickFixException {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public AttributeDef getAttributeDef(String name) throws QuickFixException {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public Map<String, RegisterEventDef> getRegisterEventDefs() throws QuickFixException {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public boolean isInstanceOf(DefDescriptor<? extends RootDefinition> other) throws QuickFixException {
        // TODO Auto-generated method stub
        return false;
    }

    @Override
    public DefDescriptor<ProviderDef> getProviderDescriptor() throws QuickFixException {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public ProviderDef getProviderDef() throws QuickFixException {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public List<DefDescriptor<?>> getBundle() {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public ProviderDef getLocalProviderDef() throws QuickFixException {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public void validateDefinition() throws QuickFixException {
        // TODO Auto-generated method stub

    }

    @Override
    public void validateReferences() throws QuickFixException {
        // TODO Auto-generated method stub

    }

    @Override
    public void markValid() {
    }

    @Override
    public boolean isValid() {
        return true;
    }

    @Override
    public void appendDependencies(Set<DefDescriptor<?>> dependencies) throws QuickFixException {
        // TODO Auto-generated method stub

    }

    @Override
    public String getName() {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public Location getLocation() {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public DefDescriptor<ComponentDef> getDescriptor() {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public <D extends Definition> D getSubDefinition(SubDefDescriptor<D, ?> descriptor) {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public void retrieveLabels() throws QuickFixException {
        // TODO Auto-generated method stub

    }

    @Override
    public void serialize(Json json) throws IOException {
        // TODO Auto-generated method stub

    }

    @Override
    public org.auraframework.def.RootDefinition.SupportLevel getSupport() {
        return SupportLevel.PROTO;
    }

    @Override
    public String getDescription() {
        return null;
    }

    @Override
    public Set<DefDescriptor<InterfaceDef>> getInterfaces() {
        return null;
    }

    @Override
    public boolean hasLocalDependencies() throws QuickFixException {
        return false;
    }

    @Override
    public List<DependencyDef> getDependencies() {
        // TODO Auto-generated method stub
        return null;
    }

}
