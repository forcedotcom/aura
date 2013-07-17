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
import org.auraframework.def.StyleDef;
import org.auraframework.def.ThemeDef;
import org.auraframework.system.Location;
import org.auraframework.system.SubDefDescriptor;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;

public final class TestComponent implements ComponentDef {

    private static final long serialVersionUID = -8566750149469848058L;

    @Override
    public final boolean isExtensible() {
        return false;
    }

    @Override
    public boolean isAbstract() {
        return false;
    }

    @Override
    public boolean isTemplate() {
        return false;
    }

    @Override
    public Collection<EventHandlerDef> getHandlerDefs() throws QuickFixException {
        return null;
    }

    @Override
    public DefDescriptor<ModelDef> getLocalModelDefDescriptor() {
        return null;
    }

    @Override
    public List<DefDescriptor<ModelDef>> getModelDefDescriptors() throws QuickFixException {
        return null;
    }

    @Override
    public List<DefDescriptor<ControllerDef>> getControllerDefDescriptors() throws QuickFixException {
        return null;
    }

    @Override
    public ModelDef getModelDef() throws QuickFixException {
        return null;
    }

    @Override
    public ControllerDef getControllerDef() throws QuickFixException {
        return null;
    }

    @Override
    public DefDescriptor<ComponentDef> getExtendsDescriptor() {
        return null;
    }

    @Override
    public DefDescriptor<RendererDef> getRendererDescriptor() throws QuickFixException {
        return null;
    }

    @Override
    public DefDescriptor<StyleDef> getStyleDescriptor() {
        return null;
    }

    @Override
    public List<AttributeDefRef> getFacets() {
        return null;
    }

    @Override
    public RendererDef getLocalRendererDef() throws QuickFixException {
        return null;
    }

    @Override
    public boolean isLocallyRenderable() throws QuickFixException {
        return false;
    }

    @Override
    public ComponentDef getTemplateDef() throws QuickFixException {
        return null;
    }

    @Override
    public DefDescriptor<ComponentDef> getTemplateDefDescriptor() {
        return null;
    }

    @Override
    public org.auraframework.def.BaseComponentDef.RenderType getRender() {
        return null;
    }

    @Override
    public org.auraframework.def.BaseComponentDef.WhitespaceBehavior getWhitespaceBehavior() {
        return null;
    }

    @Override
    public HelperDef getHelperDef() throws QuickFixException {
        return null;
    }

    @Override
    public Map<DefDescriptor<AttributeDef>, AttributeDef> getDeclaredAttributeDefs() {
        return null;
    }

    @Override
    public Map<DefDescriptor<AttributeDef>, AttributeDef> getAttributeDefs() throws QuickFixException {
        return null;
    }

    @Override
    public AttributeDef getAttributeDef(String name) throws QuickFixException {
        return null;
    }

    @Override
    public Map<String, RegisterEventDef> getRegisterEventDefs() throws QuickFixException {
        return null;
    }

    @Override
    public boolean isInstanceOf(DefDescriptor<? extends RootDefinition> other) throws QuickFixException {
        return false;
    }

    @Override
    public DefDescriptor<ProviderDef> getProviderDescriptor() throws QuickFixException {
        return null;
    }

    @Override
    public ProviderDef getProviderDef() throws QuickFixException {
        return null;
    }

    @Override
    public List<DefDescriptor<?>> getBundle() {
        return null;
    }

    @Override
    public ProviderDef getLocalProviderDef() throws QuickFixException {
        return null;
    }

    @Override
    public void validateDefinition() throws QuickFixException {

    }

    @Override
    public void validateReferences() throws QuickFixException {

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
    }

    @Override
    public String getName() {
        return null;
    }

    @Override
    public Location getLocation() {
        return null;
    }

    @Override
    public DefDescriptor<ComponentDef> getDescriptor() {
        return null;
    }

    @Override
    public <D extends Definition> D getSubDefinition(SubDefDescriptor<D, ?> descriptor) {
        return null;
    }

    @Override
    public void retrieveLabels() throws QuickFixException {

    }

    @Override
    public void serialize(Json json) throws IOException {
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
        return null;
    }

    @Override
    public String getOwnHash() {
        return null;
    }

    @Override
    public Visibility getVisibility() {
        return Visibility.PUBLIC;
    }

    @Override
    public void appendSupers(Set<DefDescriptor<?>> supers) throws QuickFixException {
    }

    @Override
    public StyleDef getStyleDef() throws QuickFixException {
        return null;
    }

	@Override
    public Map<String, DefDescriptor<ThemeDef>> getThemeAliases() {
        return null;
    }
}
