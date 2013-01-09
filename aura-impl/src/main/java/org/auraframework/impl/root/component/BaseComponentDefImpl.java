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

import static org.auraframework.instance.ValueProviderType.LABEL;

import java.io.IOException;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.auraframework.Aura;
import org.auraframework.builder.BaseComponentDefBuilder;
import org.auraframework.def.AttributeDef;
import org.auraframework.def.AttributeDefRef;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.ControllerDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.DependencyDef;
import org.auraframework.def.EventHandlerDef;
import org.auraframework.def.HelperDef;
import org.auraframework.def.InterfaceDef;
import org.auraframework.def.ModelDef;
import org.auraframework.def.ProviderDef;
import org.auraframework.def.RegisterEventDef;
import org.auraframework.def.RendererDef;
import org.auraframework.def.RootDefinition;
import org.auraframework.def.TestSuiteDef;
import org.auraframework.def.ThemeDef;
import org.auraframework.expression.PropertyReference;
import org.auraframework.impl.root.AttributeDefRefImpl;
import org.auraframework.impl.root.RootDefinitionImpl;
import org.auraframework.impl.root.intf.InterfaceDefImpl;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.impl.util.AuraUtil;
import org.auraframework.instance.GlobalValueProvider;
import org.auraframework.instance.ValueProviderType;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.throwable.AuraUnhandledException;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;

import com.google.common.collect.Lists;
import com.google.common.collect.Sets;

public abstract class BaseComponentDefImpl<T extends BaseComponentDef> extends RootDefinitionImpl<T> implements
        BaseComponentDef, Serializable {

    public static final DefDescriptor<InterfaceDef> ROOT_MARKER = DefDescriptorImpl.getInstance(
            "markup://aura:rootComponent", InterfaceDef.class);

    private static final long serialVersionUID = -2485193714215681494L;
    private final boolean isAbstract;
    private final boolean isExtensible;

    private final DefDescriptor<ModelDef> modelDefDescriptor;
    private final DefDescriptor<T> extendsDescriptor;
    private final DefDescriptor<ComponentDef> templateDefDescriptor;
    private final DefDescriptor<TestSuiteDef> testSuiteDefDescriptor;
    private final DefDescriptor<ThemeDef> themeDescriptor;
    private final List<DefDescriptor<RendererDef>> rendererDescriptors;
    private final List<DefDescriptor<HelperDef>> helperDescriptors;
    private final DefDescriptor<ControllerDef> compoundControllerDescriptor;

    private final Set<DefDescriptor<InterfaceDef>> interfaces;
    private final List<DefDescriptor<ControllerDef>> controllerDescriptors;

    private final Map<String, RegisterEventDef> events;
    private final List<EventHandlerDef> eventHandlers;
    private final List<AttributeDefRef> facets;
    private final Set<PropertyReference> expressionRefs;

    private final RenderType render;
    private final WhitespaceBehavior whitespaceBehavior;

    private final List<DependencyDef> dependencies;

    private final int hashCode;

    private transient Boolean localDeps = null;

    protected BaseComponentDefImpl(Builder<T> builder) {
        super(builder);
        this.modelDefDescriptor = builder.modelDefDescriptor;
        this.controllerDescriptors = AuraUtil.immutableList(builder.controllerDescriptors);
        this.interfaces = AuraUtil.immutableSet(builder.interfaces);

        if (builder.extendsDescriptor != null) {
            this.extendsDescriptor = builder.extendsDescriptor;
        } else {
            if (this.interfaces.contains(ROOT_MARKER)) {
                this.extendsDescriptor = null;
            } else {
                this.extendsDescriptor = getDefaultExtendsDescriptor();
            }
        }

        this.templateDefDescriptor = builder.templateDefDescriptor;
        this.events = AuraUtil.immutableMap(builder.events);
        this.eventHandlers = AuraUtil.immutableList(builder.eventHandlers);
        this.themeDescriptor = builder.themeDescriptor;
        this.rendererDescriptors = builder.rendererDescriptors;
        this.helperDescriptors = builder.helperDescriptors;
        this.isAbstract = builder.isAbstract;
        this.isExtensible = builder.isExtensible;
        this.testSuiteDefDescriptor = builder.testSuiteDefDescriptor;
        this.facets = AuraUtil.immutableList(builder.facets);
        this.dependencies = AuraUtil.immutableList(builder.dependencies);

        String renderName = builder.render;
        if (renderName == null) {
            this.render = RenderType.AUTO;
        } else {
            this.render = RenderType.valueOf(renderName.toUpperCase());
        }

        this.whitespaceBehavior = builder.whitespaceBehavior;

        this.expressionRefs = AuraUtil.immutableSet(builder.expressionRefs);
        this.compoundControllerDescriptor = DefDescriptorImpl.getAssociateDescriptor(getDescriptor(),
                ControllerDef.class, DefDescriptor.COMPOUND_PREFIX);
        this.hashCode = AuraUtil.hashCode(super.hashCode(), attributeDefs, events, controllerDescriptors,
                modelDefDescriptor, extendsDescriptor);

    }

    /**
     * @throws QuickFixException
     * @see Definition#validateDefinition()
     */
    @Override
    public void validateDefinition() throws QuickFixException {
        super.validateDefinition();

        for (DependencyDef def : dependencies) {
            def.validateDefinition();
        }
        for (AttributeDef att : this.attributeDefs.values()) {
            att.validateDefinition();
            if (events.containsKey(att.getName())) {
                throw new InvalidDefinitionException(String.format(
                        "Cannot define an attribute and register an event with the same name: %s", att.getName()),
                        getLocation());
            }
        }

        for (AttributeDefRef facet : this.facets) {
            facet.validateDefinition();
        }
        for (RegisterEventDef def : events.values()) {
            def.validateDefinition();
        }
        for (EventHandlerDef def : eventHandlers) {
            def.validateDefinition();
        }

        // an abstract component that you can't extend is pretty useless
        if (this.isAbstract() && !this.isExtensible()) {
            throw new InvalidDefinitionException(String.format("Abstract component %s must be extensible.",
                    getDescriptor()), getLocation());
        }

        if (this.interfaces.contains(ROOT_MARKER)) {
            // only aura has root access (this could be solved with namespace
            // only visiblity of the rootComponent interface someday)
            if (!"aura".equals(this.descriptor.getNamespace())) {
                throw new InvalidDefinitionException(
                        String.format(
                                "Component %s cannot implement the rootComponent interface because it is not in the aura namespace",
                                getDescriptor()), getLocation());
            }
            // cannot be a root and extend something
            if (this.extendsDescriptor != null) {
                throw new InvalidDefinitionException(
                        String.format("Component %s cannot be a rootComponent and extend %s", getDescriptor(),
                                this.extendsDescriptor), getLocation());
            }
        }
    }

    @Override
    public boolean hasLocalDependencies() throws QuickFixException {
        if (localDeps == null) {
            computeLocalDependencies();
        }
        return localDeps;
    }

    private synchronized void computeLocalDependencies() throws QuickFixException {
        if (localDeps != null) {
            return;
        }
        if (rendererDescriptors != null && !rendererDescriptors.isEmpty()) {
            boolean hasRemote = false;
            for (DefDescriptor<RendererDef> rendererDescriptor : rendererDescriptors) {
                if (!rendererDescriptor.getDef().isLocal()) {
                    hasRemote = true;
                    break;
                }
            }
            if (!hasRemote) {
                localDeps = true;
                return;
            }
        }
        if (modelDefDescriptor != null) {
            localDeps = true;
            return;
        }

        if (providerDescriptors != null) {
            boolean hasRemote = providerDescriptors.isEmpty();
            for (DefDescriptor<ProviderDef> providerDescriptor : providerDescriptors) {
                if (!providerDescriptor.getDef().isLocal()) {
                    hasRemote = true;
                    break;
                }
            }
            if (!hasRemote) {
                localDeps = true;
                return;
            }
        }
        T superDef = getSuperDef();
        if (superDef != null) {
            if (superDef.hasLocalDependencies()) {
                localDeps = true;
                return;
            }
        }
        localDeps = false;
        return;
    }

    @SuppressWarnings("unchecked")
    @Override
    public void validateReferences() throws QuickFixException {
        super.validateReferences();
        for (DependencyDef def : dependencies) {
            def.validateReferences();
        }
        for (AttributeDef att : this.attributeDefs.values()) {
            att.validateReferences();
        }

        for (AttributeDefRef facet : this.facets) {
            facet.validateReferences();
        }

        // TODO: lots more validation an stuff!!!!!!! #W-689596

        if (extendsDescriptor != null) {
            T parentDef = extendsDescriptor.getDef();

            if (parentDef == null) {
                throw new DefinitionNotFoundException(extendsDescriptor, getLocation());
            }

            if (parentDef.getDescriptor().equals(descriptor)) {
                throw new InvalidDefinitionException(String.format("%s cannot extend itself", getDescriptor()),
                        getLocation());
            }

            if (!parentDef.isExtensible()) {
                throw new InvalidDefinitionException(String.format("%s cannot extend non-extensible component %s",
                        getDescriptor(), extendsDescriptor), getLocation());
            }

            SupportLevel support = getSupport();
            DefDescriptor<T> extDesc = extendsDescriptor;
            while (extDesc != null) {
                T extDef = extDesc.getDef();
                if (support.ordinal() > extDef.getSupport().ordinal()) {
                    throw new InvalidDefinitionException(String.format(
                            "%s cannot widen the support level to %s from %s's level of %s", getDescriptor(), support,
                            extDesc, extDef.getSupport()), getLocation());
                }
                extDesc = (DefDescriptor<T>) extDef.getExtendsDescriptor();
            }
        }

        for (DefDescriptor<InterfaceDef> intf : interfaces) {
            InterfaceDef interfaze = intf.getDef();
            if (interfaze == null) {
                throw new DefinitionNotFoundException(intf, getLocation());
            }
        }
        for (RegisterEventDef def : events.values()) {
            def.validateReferences();
        }
        for (EventHandlerDef def : eventHandlers) {
            def.validateReferences();
        }

        // have to do all sorts of craaaazy checks here for dupes and matches
        // and bah

        validateExpressionRefs();
    }

    /**
     * does all the validation of the expressions defined in this component
     */
    private void validateExpressionRefs() throws QuickFixException {
        for (PropertyReference e : expressionRefs) {
            String root = e.getRoot();
            ValueProviderType vpt = ValueProviderType.getTypeByPrefix(root);
            if (vpt == null) {
                // validate that its a foreach
            } else if (vpt.isGlobal()) {
                AuraContext lc = Aura.getContextService().getCurrentContext();
                GlobalValueProvider gvp = lc.getGlobalProviders().get(vpt);
                if (gvp != null) {
                    gvp.validate(e.getStem());
                }
            } else {
                // validate against m v or c
            }
        }
    }

    @Override
    public void retrieveLabels() throws QuickFixException {
        GlobalValueProvider labelProvider = Aura.getContextService().getCurrentContext().getGlobalProviders()
                .get(LABEL);
        for (PropertyReference e : expressionRefs) {
            if (e.getRoot().equals(LABEL.getPrefix())) {
                labelProvider.getValue(e.getStem());
            }
        }

        if (controllerDescriptors != null) {
            for (DefDescriptor<ControllerDef> desc : controllerDescriptors) {
                desc.getDef().retrieveLabels();
            }
        }

        if (rendererDescriptors != null) {
            for (DefDescriptor<RendererDef> desc : rendererDescriptors) {
                desc.getDef().retrieveLabels();
            }
        }

        if (helperDescriptors != null) {
            for (DefDescriptor<HelperDef> desc : helperDescriptors) {
                desc.getDef().retrieveLabels();
            }
        }
    }

    @Override
    public List<DependencyDef> getDependencies() {
        return this.dependencies;
    }

    /**
     * Recursively adds the ComponentDescriptors of all components in this
     * ComponentDef's children to the provided set. The set may then be used to
     * analyze freshness of all of those types to see if any of them should be
     * recompiled from source.
     * 
     * @param dependencies A Set that this method will append RootDescriptors to
     *            for every RootDef that this ComponentDef requires
     * @throws QuickFixException
     */
    @Override
    public void appendDependencies(Set<DefDescriptor<?>> dependencies) throws QuickFixException {
        for (AttributeDefRef facet : this.facets) {
            facet.appendDependencies(dependencies);
        }

        if (extendsDescriptor != null) {
            dependencies.add(extendsDescriptor);
        }

        for (DefDescriptor<InterfaceDef> intf : interfaces) {
            dependencies.add(intf);
        }

        for (RegisterEventDef register : events.values()) {
            register.appendDependencies(dependencies);
        }

        for (EventHandlerDef handler : eventHandlers) {
            handler.appendDependencies(dependencies);
        }

        if (providerDescriptors != null) {
            dependencies.addAll(providerDescriptors);
        }

        if (controllerDescriptors != null) {
            dependencies.addAll(controllerDescriptors);
        }

        if (modelDefDescriptor != null) {
            dependencies.add(modelDefDescriptor);
        }

        if (rendererDescriptors != null) {
            dependencies.addAll(rendererDescriptors);
        }

        if (helperDescriptors != null) {
            dependencies.addAll(helperDescriptors);
        }

        if (themeDescriptor != null) {
            dependencies.add(themeDescriptor);
        }

        if (templateDefDescriptor != null) {
            dependencies.add(templateDefDescriptor);
        }
        for (DependencyDef dep : this.dependencies) {
            dep.appendDependencies(dependencies);
        }
    }

    /**
     * This is used to validate by the compiler to validate EventDefRefs.
     * 
     * @return all the events this component can fire, including those inherited
     * @throws QuickFixException
     */
    @Override
    public Map<String, RegisterEventDef> getRegisterEventDefs() throws QuickFixException {
        Map<String, RegisterEventDef> ret = new LinkedHashMap<String, RegisterEventDef>();
        if (extendsDescriptor != null) {
            ret.putAll(getSuperDef().getRegisterEventDefs());
        }

        for (DefDescriptor<InterfaceDef> intf : interfaces) {
            InterfaceDef intfDef = intf.getDef();
            ret.putAll(intfDef.getRegisterEventDefs());
        }

        if (ret.isEmpty()) {
            return events;
        } else {
            ret.putAll(events);
            return Collections.unmodifiableMap(ret);
        }
    }

    /**
     * @return all the handlers on this component, including those inherited
     * @throws QuickFixException
     */
    @Override
    public Collection<EventHandlerDef> getHandlerDefs() throws QuickFixException {
        return eventHandlers;
    }

    /**
     * @return all the attributes for this component, including those inherited
     *         from a super component
     * @throws QuickFixException
     */
    @Override
    public Map<DefDescriptor<AttributeDef>, AttributeDef> getAttributeDefs() throws QuickFixException {
        Map<DefDescriptor<AttributeDef>, AttributeDef> map = new LinkedHashMap<DefDescriptor<AttributeDef>, AttributeDef>();
        if (extendsDescriptor != null) {
            map.putAll(getSuperDef().getAttributeDefs());
        }

        for (DefDescriptor<InterfaceDef> intf : interfaces) {
            InterfaceDef intfDef = intf.getDef();
            for (Map.Entry<DefDescriptor<AttributeDef>, AttributeDef> entry : intfDef.getAttributeDefs().entrySet()) {
                DefDescriptor<AttributeDef> desc = entry.getKey();
                if (map.containsKey(desc)) {
                    // FIXMEDLP - do some validation #W-690040
                }
                map.put(desc, entry.getValue());
            }
        }

        if (map.isEmpty()) {
            return attributeDefs;
        } else {
            map.putAll(attributeDefs);
            return Collections.unmodifiableMap(map);
        }
    }

    @Override
    public List<DefDescriptor<ControllerDef>> getControllerDefDescriptors() throws QuickFixException {
        List<DefDescriptor<ControllerDef>> ret;
        if (extendsDescriptor != null) {
            ret = new ArrayList<DefDescriptor<ControllerDef>>();
            ret.addAll(this.controllerDescriptors);
            ret.addAll(getSuperDef().getControllerDefDescriptors());
        } else {
            ret = this.controllerDescriptors;
        }
        return ret;
    }

    @Override
    public ControllerDef getControllerDef() throws QuickFixException {
        if (this.controllerDescriptors.isEmpty()) {
            if (this.extendsDescriptor != null) {
                return getSuperDef().getControllerDef();
            } else {
                return null;
            }
        } else {
            return compoundControllerDescriptor.getDef();
        }
    }

    public ThemeDef getThemeDef() throws QuickFixException {
        return themeDescriptor == null ? null : themeDescriptor.getDef();
    }

    @Override
    public DefDescriptor<T> getExtendsDescriptor() {
        return extendsDescriptor;
    }

    @Override
    public DefDescriptor<ComponentDef> getTemplateDefDescriptor() {
        return templateDefDescriptor;
    }

    @Override
    public ComponentDef getTemplateDef() throws QuickFixException {
        if (templateDefDescriptor == null) {
            return getSuperDef().getTemplateDef();
        } else {
            return templateDefDescriptor.getDef();
        }
    }

    @Override
    public DefDescriptor<ThemeDef> getThemeDescriptor() {
        return themeDescriptor;
    }

    @Override
    public boolean isAbstract() {
        return isAbstract;
    }

    @Override
    public boolean isExtensible() {
        return isExtensible;
    }

    @Override
    public Set<DefDescriptor<InterfaceDef>> getInterfaces() {
        return interfaces;
    }

    private Set<DefDescriptor<InterfaceDef>> getAllInterfaces() throws QuickFixException {
        Set<DefDescriptor<InterfaceDef>> ret = Sets.newLinkedHashSet();
        for (DefDescriptor<InterfaceDef> intf : interfaces) {
            addAllInterfaces(intf, ret);
        }
        return ret;
    }

    private void addAllInterfaces(DefDescriptor<InterfaceDef> intf, Set<DefDescriptor<InterfaceDef>> set)
            throws QuickFixException {
        set.add(intf);
        for (DefDescriptor<InterfaceDef> zuper : intf.getDef().getExtendsDescriptors()) {
            set.add(zuper);
            addAllInterfaces(zuper, set);
        }
    }

    protected T getSuperDef() throws QuickFixException {
        T ret = null;
        if (extendsDescriptor != null) {
            ret = extendsDescriptor.getDef();
        }
        return ret;
    }

    /**
     * @see java.lang.Object#equals(java.lang.Object)
     */
    @Override
    public boolean equals(Object obj) {
        if (obj instanceof BaseComponentDefImpl) {
            BaseComponentDefImpl<?> other = (BaseComponentDefImpl<?>) obj;

            return getDescriptor().equals(other.getDescriptor())
                    && controllerDescriptors.equals(other.controllerDescriptors)
                    && (modelDefDescriptor == null ? other.modelDefDescriptor == null : modelDefDescriptor
                            .equals(other.modelDefDescriptor))
                    && (extendsDescriptor == null ? other.extendsDescriptor == null : extendsDescriptor
                            .equals(other.extendsDescriptor)) && events.equals(other.events)
                    && getLocation().equals(other.getLocation());
        }

        return false;
    }

    /**
     * @see RootDefinitionImpl#hashCode()
     */
    @Override
    public int hashCode() {
        return hashCode;
    }

    /**
     * Serialize this component to json. The output will include all of the
     * attributes, events, and handlers inherited. It doesn't yet include
     * inherited ComponentDefRefs, but maybe it should.
     */
    @Override
    public void serialize(Json json) throws IOException {
        try {
            AuraContext context = Aura.getContextService().getCurrentContext();
            Mode mode = context.getMode();
            boolean preloaded = context.isPreloaded(getDescriptor());

            json.writeMapBegin();
            json.writeMapEntry("descriptor", getDescriptor());
            if (!preloaded) {
                context.setCurrentNamespace(descriptor.getNamespace());
                RendererDef rendererDef = getRendererDef();
                if (rendererDef != null && !rendererDef.isLocal()) {
                    json.writeMapEntry("rendererDef", rendererDef);
                }
                HelperDef helperDef = getHelperDef();
                if (helperDef != null && !helperDef.isLocal()) {
                    json.writeMapEntry("helperDef", helperDef);
                }
                json.writeMapEntry("themeDef", getThemeDef());
                json.writeMapEntry("controllerDef", getControllerDef());
                json.writeMapEntry("modelDef", getModelDef());
                json.writeMapEntry("superDef", getSuperDef());
                Collection<AttributeDef> attrDefs = getAttributeDefs().values();
                if (!attrDefs.isEmpty()) {
                    json.writeMapEntry("attributeDefs", attrDefs);
                }
                Set<DefDescriptor<InterfaceDef>> allInterfaces = getAllInterfaces();
                if (allInterfaces != null && !allInterfaces.isEmpty()) {
                    json.writeMapEntry("interfaces", allInterfaces);
                }
                Collection<RegisterEventDef> regevents = getRegisterEventDefs().values();
                if (!regevents.isEmpty()) {
                    json.writeMapEntry("registerEventDefs", regevents);
                }
                Collection<EventHandlerDef> handlers = getHandlerDefs();
                if (!handlers.isEmpty()) {
                    json.writeMapEntry("handlerDefs", handlers);
                }
                if (!facets.isEmpty()) {
                    json.writeMapEntry("facets", facets);
                }
                boolean local = hasLocalDependencies();
                if (local) {
                    json.writeMapEntry("hasServerDeps", true);
                }
                if (isAbstract) {
                    json.writeMapEntry("isAbstract", isAbstract);
                }

                ProviderDef providerDef = getProviderDef();
                if (providerDef != null && !providerDef.isLocal()) {
                    json.writeMapEntry("providerDef", providerDef);
                }

                if (subDefs != null) {
                    json.writeMapEntry("subDefs", subDefs.values());
                }

                if (mode.equals(Mode.AUTOJSTEST)) {
                    json.writeMapEntry("testSuiteDef", getTestSuiteDef());
                }
                serializeFields(json);
            }

            json.writeMapEnd();
        } catch (QuickFixException e) {
            throw new AuraUnhandledException("unhandled exception", e);
        }
    }

    protected abstract void serializeFields(Json json) throws IOException, QuickFixException;

    /**
     * @see ComponentDef#getRendererDescriptor()
     */
    @Override
    public DefDescriptor<RendererDef> getRendererDescriptor() throws QuickFixException {
        if (rendererDescriptors != null && rendererDescriptors.size() == 1) {
            return rendererDescriptors.get(0);
        }

        RendererDef rendererDef = getRendererDef();
        if (rendererDef != null) {
            return rendererDef.getDescriptor();
        }
        return null;
    }

    @Override
    public RendererDef getLocalRendererDef() throws QuickFixException {
        RendererDef def = null;
        if (rendererDescriptors != null) {
            for (DefDescriptor<RendererDef> desc : rendererDescriptors) {
                def = desc.getDef();
                if (def.isLocal()) {
                    break;
                } else {
                    def = null;
                }
            }
        }
        return def;
    }

    /**
     * @return The primary renderer def. If multiple exist, this will be the
     *         remote one.
     * @throws QuickFixException
     */
    public RendererDef getRendererDef() throws QuickFixException {
        RendererDef def = null;
        if (rendererDescriptors != null) {
            for (DefDescriptor<RendererDef> desc : rendererDescriptors) {
                def = desc.getDef();
                if (!def.isLocal()) {
                    break;
                }
            }
        }
        return def;
    }

    /**
     * @return The primary helper def. If multiple exist, this will be the
     *         remote one.
     * @throws QuickFixException
     */
    @Override
    public HelperDef getHelperDef() throws QuickFixException {
        HelperDef def = null;
        if (helperDescriptors != null) {
            for (DefDescriptor<HelperDef> desc : helperDescriptors) {
                def = desc.getDef();
                if (!def.isLocal()) {
                    break;
                }
            }
        }
        return def;
    }

    public TestSuiteDef getTestSuiteDef() throws QuickFixException {
        return testSuiteDefDescriptor == null ? null : testSuiteDefDescriptor.getDef();
    }

    /**
     * @see ComponentDef#getLocalModelDefDescriptor()
     */
    @Override
    public DefDescriptor<ModelDef> getLocalModelDefDescriptor() {
        return modelDefDescriptor;
    }

    /**
     * @see ComponentDef#getModelDef()
     */
    @Override
    public ModelDef getModelDef() throws QuickFixException {
        AuraContext context = Aura.getContextService().getCurrentContext();
        context.setCurrentNamespace(descriptor.getNamespace());
        return modelDefDescriptor == null ? null : modelDefDescriptor.getDef();
    }

    /**
     * @see ComponentDef#getModelDefDescriptors()
     */
    @Override
    public List<DefDescriptor<ModelDef>> getModelDefDescriptors() throws QuickFixException {
        List<DefDescriptor<ModelDef>> ret = new ArrayList<DefDescriptor<ModelDef>>();

        if (modelDefDescriptor != null) {
            ret.add(modelDefDescriptor);
        }

        if (extendsDescriptor != null) {
            ret.addAll(getSuperDef().getModelDefDescriptors());
        }
        return ret;
    }

    public static abstract class Builder<T extends BaseComponentDef> extends RootDefinitionImpl.Builder<T> implements
            BaseComponentDefBuilder<T> {

        public Builder(Class<T> defClass) {
            super(defClass);
        }

        public boolean isAbstract;
        public boolean isExtensible;

        public DefDescriptor<ModelDef> modelDefDescriptor;
        public DefDescriptor<T> extendsDescriptor;
        public DefDescriptor<ComponentDef> templateDefDescriptor;
        public DefDescriptor<TestSuiteDef> testSuiteDefDescriptor;
        public DefDescriptor<ThemeDef> themeDescriptor;
        public List<DefDescriptor<RendererDef>> rendererDescriptors;
        public List<DefDescriptor<HelperDef>> helperDescriptors;
        public List<AttributeDefRef> facets;

        public Set<DefDescriptor<InterfaceDef>> interfaces;
        public List<DefDescriptor<ControllerDef>> controllerDescriptors;
        public Map<String, RegisterEventDef> events;
        public List<EventHandlerDef> eventHandlers;
        public Set<PropertyReference> expressionRefs;
        public String render;
        public WhitespaceBehavior whitespaceBehavior;
        private List<DependencyDef> dependencies;

        @Override
        public Builder<T> setFacet(String key, Object value) {
            if (facets == null) {
                facets = Lists.newArrayList();
            }

            AttributeDefRefImpl.Builder atBuilder = new AttributeDefRefImpl.Builder();
            atBuilder.setDescriptor(key);
            atBuilder.setLocation(getLocation());
            atBuilder.setValue(value);
            facets.add(atBuilder.build());
            return this;
        }

        public void addRenderer(String name) {
            if (this.rendererDescriptors == null) {
                this.rendererDescriptors = Lists.newArrayList();
            }
            this.rendererDescriptors.add(DefDescriptorImpl.getInstance(name, RendererDef.class));
        }

        public void addHelper(String name) {
            if (this.helperDescriptors == null) {
                this.helperDescriptors = Lists.newArrayList();
            }
            this.helperDescriptors.add(DefDescriptorImpl.getInstance(name, HelperDef.class));
        }

        @Override
        public Builder<T> addControllerDef(ControllerDef controllerDef) {
            if (controllerDescriptors == null) {
                controllerDescriptors = Lists.newArrayList();
            }
            controllerDescriptors.add(controllerDef.getDescriptor());
            return this;
        }

        @Override
        public Builder<T> addInterfaceDef(InterfaceDef interfaceDef) {
            if (interfaces == null) {
                interfaces = Sets.newLinkedHashSet();
            }
            interfaces.add(interfaceDef.getDescriptor());
            return this;
        }

        @Override
        public Builder<T> addRendererDef(RendererDef rendererDef) {
            if (rendererDescriptors == null) {
                rendererDescriptors = Lists.newArrayList();
            }
            rendererDescriptors.add(rendererDef.getDescriptor());
            return this;
        }

        @Override
        public Builder<T> setAbstract(boolean abs) {
            this.isAbstract = abs;
            return this;
        }

        @Override
        public Builder<T> setExtensible(boolean extensible) {
            this.isExtensible = extensible;
            return this;
        }

        @Override
        public Builder<T> setModelDef(ModelDef modelDef) {
            this.modelDefDescriptor = modelDef.getDescriptor();
            return this;
        }

        @Override
        public Builder<T> setRenderType(RenderType renderType) {
            this.render = renderType.name();
            return this;
        }

        @Override
        public Builder<T> setWhitespaceBehavior(WhitespaceBehavior whitespaceBehavior) {
            this.whitespaceBehavior = whitespaceBehavior;
            return this;
        }

        @Override
        public Builder<T> setTemplateDef(ComponentDef templateDef) {
            this.templateDefDescriptor = templateDef.getDescriptor();
            return this;
        }

        @Override
        public Builder<T> setTemplate(String templateName) {
            this.templateDefDescriptor = Aura.getDefinitionService().getDefDescriptor(templateName, ComponentDef.class);
            return this;
        }

        public Builder<T> addDependency(DependencyDef dependency) {
            if (this.dependencies == null) {
                this.dependencies = Lists.newArrayList();
            }
            this.dependencies.add(dependency);
            return this;
        }

        @Override
        public Builder<T> setThemeDef(ThemeDef themeDef) {
            this.themeDescriptor = themeDef.getDescriptor();
            return this;
        }
    }

    /**
     * @see RootDefinition#isInstanceOf(DefDescriptor)
     */
    @Override
    public boolean isInstanceOf(DefDescriptor<? extends RootDefinition> other) throws QuickFixException {
        switch (other.getDefType()) {
        case INTERFACE:
            for (DefDescriptor<InterfaceDef> intf : interfaces) {
                if (intf.equals(other) || intf.getDef().isInstanceOf(other)) {
                    return true;
                }
            }
            return (extendsDescriptor != null && getSuperDef().isInstanceOf(other));
        case COMPONENT:
        case APPLICATION:
            return descriptor.equals(other) || (extendsDescriptor != null && getSuperDef().isInstanceOf(other));
        default:
            return false;
        }
    }

    /**
     * @see ComponentDef#getFacets()
     */
    @Override
    public List<AttributeDefRef> getFacets() {
        return facets;
    }

    @Override
    public List<DefDescriptor<?>> getBundle() {
        List<DefDescriptor<?>> ret = Lists.newArrayList();
        if (controllerDescriptors != null) {
            ret.addAll(controllerDescriptors);
        }
        if (rendererDescriptors != null) {
            ret.addAll(rendererDescriptors);
        }
        if (modelDefDescriptor != null) {
            ret.add(modelDefDescriptor);
        }
        if (providerDescriptors != null) {
            ret.addAll(providerDescriptors);
        }

        if (themeDescriptor != null) {
            ret.add(themeDescriptor);
        }

        if (helperDescriptors != null) {
            ret.addAll(helperDescriptors);
        }
        return ret;
    }

    @Override
    public boolean isLocallyRenderable() throws QuickFixException {
        return isLocallyRenderable(Sets.<DefDescriptor<?>> newLinkedHashSet());
    }

    private boolean isLocallyRenderable(Set<DefDescriptor<?>> already) throws QuickFixException {
        if (render == RenderType.CLIENT) {
            return false;
        } else if (render == RenderType.SERVER) {
            return true;
        }

        RendererDef rendererDef = getLocalRendererDef();
        boolean ret = false;
        // have a local renderer?
        if (rendererDef == null) {
            // no?
            rendererDef = getRendererDef();
            // ok, is there a remote one?
            ret = rendererDef == null;
        } else {
            // cool.
            ret = true;
        }

        // If we've gotten this far, let's check for remote providers
        if (ret) {
            ret = ret && isInConcreteAndHasLocalProvider();
        }

        // If we've gotten this far, let's check for controllers.
        if (ret) {
            ret = ret && getControllerDefDescriptors().isEmpty();
        }

        // If we've gotten this far, let's check for Themes (server rendering
        // doesn't work with themes) W-922563
        if (ret) {
            ret = ret && getThemeDescriptor() == null;
        }

        // If we've gotten this far, let's spider dependencies.
        if (ret) {
            Set<DefDescriptor<?>> deps = Sets.newLinkedHashSet();

            appendDependencies(deps);
            for (DefDescriptor<?> dep : deps) {
                if (!already.contains(dep)) {
                    already.add(dep);
                    if (dep.getDefType() == DefType.COMPONENT || dep.getDefType() == DefType.APPLICATION) {
                        BaseComponentDefImpl<?> depDef = (BaseComponentDefImpl<?>) dep.getDef();
                        if (depDef != this) {
                            ret = ret && depDef.isLocallyRenderable(already);
                            if (!ret) {
                                return false;
                            }
                        }
                    } else if (dep.getDefType() == DefType.INTERFACE) {
                        InterfaceDefImpl depDef = (InterfaceDefImpl) dep.getDef();
                        ret = ret && depDef.isInConcreteAndHasLocalProvider();
                    } else if (dep.getDefType() == DefType.LAYOUTS) {
                        return false;
                    }
                }
            }
        }

        return ret;
    }

    @Override
    public RenderType getRender() {
        return render;
    }

    @Override
    public WhitespaceBehavior getWhitespaceBehavior() {
        return whitespaceBehavior;
    }

    protected abstract DefDescriptor<T> getDefaultExtendsDescriptor();

}
