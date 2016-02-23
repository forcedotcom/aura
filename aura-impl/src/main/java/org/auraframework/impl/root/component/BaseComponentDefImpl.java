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

import static org.auraframework.instance.AuraValueProviderType.LABEL;

import java.io.IOException;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.auraframework.Aura;
import org.auraframework.builder.BaseComponentDefBuilder;
import org.auraframework.def.ActionDef;
import org.auraframework.def.ActionDef.ActionType;
import org.auraframework.def.AttributeDef;
import org.auraframework.def.AttributeDefRef;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.ClientLibraryDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.ControllerDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.Definition;
import org.auraframework.def.DependencyDef;
import org.auraframework.def.EventHandlerDef;
import org.auraframework.def.FlavoredStyleDef;
import org.auraframework.def.FlavorsDef;
import org.auraframework.def.HelperDef;
import org.auraframework.def.ImportDef;
import org.auraframework.def.InterfaceDef;
import org.auraframework.def.MethodDef;
import org.auraframework.def.ModelDef;
import org.auraframework.def.ProviderDef;
import org.auraframework.def.RegisterEventDef;
import org.auraframework.def.RendererDef;
import org.auraframework.def.RequiredVersionDef;
import org.auraframework.def.ResourceDef;
import org.auraframework.def.RootDefinition;
import org.auraframework.def.SVGDef;
import org.auraframework.def.StyleDef;
import org.auraframework.def.TokensDef;
import org.auraframework.def.design.DesignDef;
import org.auraframework.expression.PropertyReference;
import org.auraframework.impl.root.AttributeDefRefImpl;
import org.auraframework.impl.root.RootDefinitionImpl;
import org.auraframework.impl.root.intf.InterfaceDefImpl;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.impl.util.AuraUtil;
import org.auraframework.instance.AuraValueProviderType;
import org.auraframework.instance.GlobalValueProvider;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.MasterDefRegistry;
import org.auraframework.throwable.AuraUnhandledException;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.throwable.quickfix.FlavorNameNotFoundException;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.InvalidExpressionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;

import com.google.common.base.Splitter;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.google.common.collect.Sets;

public abstract class BaseComponentDefImpl<T extends BaseComponentDef> extends
RootDefinitionImpl<T> implements BaseComponentDef, Serializable {

    public static final DefDescriptor<InterfaceDef> ROOT_MARKER = DefDescriptorImpl.getInstance(
            "markup://aura:rootComponent", InterfaceDef.class);

    private static final long serialVersionUID = -2485193714215681494L;
    private final boolean isAbstract;
    private final boolean isExtensible;
    private final boolean isTemplate;

    private final DefDescriptor<ModelDef> modelDefDescriptor;
    private final DefDescriptor<T> extendsDescriptor;
    private final DefDescriptor<ComponentDef> templateDefDescriptor;
    private final DefDescriptor<StyleDef> styleDescriptor;
    private final DefDescriptor<FlavoredStyleDef> flavoredStyleDescriptor;
    private final List<DefDescriptor<RendererDef>> rendererDescriptors;
    private final List<DefDescriptor<HelperDef>> helperDescriptors;
    private final List<DefDescriptor<ResourceDef>> resourceDescriptors;
    private final DefDescriptor<ControllerDef> compoundControllerDescriptor;
    private final DefDescriptor<DesignDef> designDefDescriptor;
    private final DefDescriptor<SVGDef> svgDefDescriptor;

    private final Set<DefDescriptor<InterfaceDef>> interfaces;
    private final List<DefDescriptor<ControllerDef>> controllerDescriptors;

    private final Map<String, RegisterEventDef> events;
    private final List<EventHandlerDef> eventHandlers;
    private final Map<DefDescriptor<MethodDef>,MethodDef> methodDefs;
    private final List<ImportDef> imports;
    private final List<AttributeDefRef> facets;
    private final Set<PropertyReference> expressionRefs;

    private final RenderType render;
    private final WhitespaceBehavior whitespaceBehavior;

    private final List<DependencyDef> dependencies;
    private final List<ClientLibraryDef> clientLibraries;

    private final List<DefDescriptor<TokensDef>> tokenOverrides;
    private final DefDescriptor<FlavorsDef> flavorOverrides;
    private final String defaultFlavor;
    private final boolean hasFlavorableChild;
    private final boolean dynamicallyFlavorable;

    private String clientComponentClass;

    private final int hashCode;

    private transient Boolean localDeps = null;

    protected BaseComponentDefImpl(Builder<T> builder) {
        super(builder);
        this.modelDefDescriptor = builder.modelDefDescriptor;
        this.controllerDescriptors = AuraUtil.immutableList(builder.controllerDescriptors);
        this.interfaces = AuraUtil.immutableSet(builder.interfaces);
        this.methodDefs = AuraUtil.immutableMap(builder.methodDefs);

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
        this.imports = AuraUtil.immutableList(builder.imports);
        this.styleDescriptor = builder.styleDescriptor;
        this.flavoredStyleDescriptor = builder.flavoredStyleDescriptor;
        this.rendererDescriptors = builder.rendererDescriptors;
        this.helperDescriptors = builder.helperDescriptors;
        this.resourceDescriptors = builder.resourceDescriptors;
        this.isAbstract = builder.isAbstract;
        this.isExtensible = builder.isExtensible;
        this.isTemplate = builder.isTemplate;
        this.facets = AuraUtil.immutableList(builder.facets);
        this.dependencies = AuraUtil.immutableList(builder.dependencies);
        this.clientLibraries = AuraUtil.immutableList(builder.clientLibraries);
        this.render = builder.renderType;
        this.whitespaceBehavior = builder.whitespaceBehavior;
        this.designDefDescriptor = builder.designDefDescriptor;
        this.svgDefDescriptor = builder.svgDefDescriptor;
        this.tokenOverrides = AuraUtil.immutableList(builder.tokenOverrides);
        this.flavorOverrides = builder.flavorOverrides;
        this.defaultFlavor = builder.defaultFlavor;
        this.hasFlavorableChild = builder.hasFlavorableChild;
        this.dynamicallyFlavorable = builder.dynamicallyFlavorable;

        this.expressionRefs = AuraUtil.immutableSet(builder.expressionRefs);
        if (getDescriptor() != null) {
            this.compoundControllerDescriptor = DefDescriptorImpl.getAssociateDescriptor(getDescriptor(),
                    ControllerDef.class, DefDescriptor.COMPOUND_PREFIX);
        } else {
            this.compoundControllerDescriptor = null;
        }
        this.hashCode = AuraUtil.hashCode(super.hashCode(), events, controllerDescriptors, modelDefDescriptor,
                extendsDescriptor, interfaces, methodDefs, rendererDescriptors, helperDescriptors, resourceDescriptors,
                imports);
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

        for (ImportDef def : imports) {
            def.validateDefinition();
        }

        for(MethodDef def : this.methodDefs.values()) {
            def.validateDefinition();
        }

        // an abstract component that you can't extend is pretty useless
        if (this.isAbstract() && !this.isExtensible()) {
            throw new InvalidDefinitionException(String.format(
                    "Abstract component %s must be extensible.", getDescriptor()), getLocation());
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
                        String.format(
                                "Component %s cannot be a rootComponent and extend %s", getDescriptor(),
                                this.extendsDescriptor),
                                getLocation());
            }
        }

        // validate all client libraries
        for (ClientLibraryDef def : this.clientLibraries) {
            def.validateDefinition();
        }

        if (defaultFlavor != null) {
            // component must be flavorable
            if (!hasFlavorableChild() && !inheritsFlavorableChild() && !isDynamicallyFlavorable()) {
                throw new InvalidDefinitionException("The defaultFlavor attribute cannot be "
                        + "specified on a component with no flavorable children", location);
            }
        }
    }

    @Override
    public boolean hasLocalDependencies() throws QuickFixException {
        if (localDeps == null) {
            computeLocalDependencies();
        }

        return localDeps == Boolean.TRUE;
    }

    /**
     * Computes the local (server) dependencies.
     *
     * Terminology: "remote" - a JavaScript provider or renderer "local" - a Java/Apex/server provider, renderer, or
     * model
     */
    private synchronized void computeLocalDependencies() throws QuickFixException {
        if (localDeps != null) {
            return;
        }

        if (modelDefDescriptor != null) {
            localDeps = Boolean.TRUE;
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
                localDeps = Boolean.TRUE;
                return;
            }
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
                localDeps = Boolean.TRUE;
                return;
            }
        }

        // Walk the super component tree applying slightly different dependency rules.
        T superDef = getSuperDef();

        if (superDef != null && superDef.hasLocalDependencies() &&
                // super has model
                (superDef.getModelDef() != null ||
                // or has renderer that's local
                (superDef.getRendererDescriptor() != null && superDef.getRendererDescriptor().getDef().isLocal()))) {
            // Only local/server models and renderers on the super/parent are considered local dependencies for the
            // child.
            localDeps = Boolean.TRUE;
            return;
        }

        if (localDeps == null) {
            localDeps = Boolean.FALSE;
        }
    }

    private <X extends Definition> void checkAccess(DefDescriptor<X> descToCheck, MasterDefRegistry mdr)
            throws QuickFixException {
        // We should be able to do this, but tests are dependent on overrides here.
        //X definition = mdr.getDef(descToCheck);
        X definition = descToCheck.getDef();
        if (definition == null) {
            throw new DefinitionNotFoundException(descToCheck, getLocation());
        }
        mdr.assertAccess(descriptor, definition);
    }

    @SuppressWarnings("unchecked")
    @Override
    public void validateReferences() throws QuickFixException {
        DefinitionService definitionService = Aura.getDefinitionService();
        MasterDefRegistry mdr = definitionService.getDefRegistry();

        super.validateReferences();
        for (DependencyDef def : dependencies) {
            def.validateReferences();
        }

        for (DefDescriptor<InterfaceDef> intf : interfaces) {
            checkAccess(intf, mdr);
        }

        if (modelDefDescriptor != null) {
            checkAccess(modelDefDescriptor, mdr);
        }

        for (DefDescriptor<ControllerDef> d : controllerDescriptors) {
            checkAccess(d, mdr);
        }

        for (AttributeDef att : this.attributeDefs.values()) {
            att.validateReferences();
        }

        AttributeDef facetAttributeDef;
        for (AttributeDefRef facet : this.facets) {
            facetAttributeDef = this.getAttributeDef(facet.getDescriptor().getName());
            if(facetAttributeDef != null) {
                try {
                    facet.parseValue(facetAttributeDef.getTypeDef());
                } catch(InvalidExpressionException exception) {
                    // Kris:
                    // This is going to fail a good handfull of things at the moment, I need to
                    // Uncomment and test against the app before trying to check this in.
                    // Mode mode = Aura.getContextService().getCurrentContext().getMode();
                    // if(mode.isDevMode() || mode.isTestMode()) {
                    //       	throw new InvalidValueSetTypeException(
                    //       			String.format("Error setting the attribute '%s' of type %s to a value of type %s.", facetAttributeDef.getName(), facetAttributeDef.getTypeDef().getName(), facet.getValue().getClass().getName()),
                    //       			exception.getLocation());
                    // }
                }
            }
            facet.validateReferences();
        }

        if (templateDefDescriptor != null) {
            // FIXME: this should be mdr.getDef(templateDefDescriptor);
            BaseComponentDef template = templateDefDescriptor.getDef();
            if (!template.isTemplate()) {
                throw new InvalidDefinitionException(String.format(
                        "Template %s must be marked as a template", templateDefDescriptor), getLocation());
            }
            if (template.isAbstract()) {
                throw new InvalidDefinitionException(String.format(
                        "Template %s must not be abstract", templateDefDescriptor), getLocation());
            }
        }

        if (extendsDescriptor != null) {
            T parentDef = extendsDescriptor.getDef();

            // This should never happen.
            if (parentDef == null) {
                throw new DefinitionNotFoundException(extendsDescriptor, getLocation());
            }

            if (parentDef.getDescriptor().equals(descriptor)) {
                throw new InvalidDefinitionException(String.format(
                        "%s cannot extend itself", getDescriptor()), getLocation());
            }

            if (!parentDef.isExtensible()) {
                throw new InvalidDefinitionException(String.format(
                        "%s cannot extend non-extensible component %s", getDescriptor(), extendsDescriptor),
                        getLocation());
            }

            //
            // GO - This is a bit of a hack. We should probably have a better way of telling.
            //
            if (isTemplate() && !parentDef.isTemplate()
                    && !extendsDescriptor.getQualifiedName().equals("markup://aura:component")) {
                throw new InvalidDefinitionException(String.format(
                        "Template %s cannot extend non-template %s", getDescriptor(),
                        extendsDescriptor), getLocation());
            }

            if (!isTemplate() && parentDef.isTemplate()) {
                throw new InvalidDefinitionException(String.format(
                        "Non-template %s cannot extend template %s", getDescriptor(),
                        extendsDescriptor), getLocation());
            }

            mdr.assertAccess(descriptor, parentDef);

            SupportLevel support = getSupport();
            DefDescriptor<T> extDesc = extendsDescriptor;
            while (extDesc != null) {
                T extDef = extDesc.getDef();
                if (support.ordinal() > extDef.getSupport().ordinal()) {
                    throw new InvalidDefinitionException(
                            String.format("%s cannot widen the support level to %s from %s's level of %s",
                                    getDescriptor(),
                                    support, extDesc, extDef.getSupport()), getLocation());
                }

                extDesc = (DefDescriptor<T>) extDef.getExtendsDescriptor();
            }
        }

        for (RegisterEventDef def : events.values()) {
            def.validateReferences();
        }

        for (EventHandlerDef def : eventHandlers) {
            def.validateReferences();
        }

        for (ImportDef def : imports) {
            def.validateReferences();
        }

        // have to do all sorts of craaaazy checks here for dupes and matches
        // and bah
        validateExpressionRefs();

        for (ClientLibraryDef def : this.clientLibraries) {
            def.validateReferences();
            mdr.assertAccess(descriptor, def);
        }

        if (defaultFlavor != null) {
            Set<String> allFlavorNames = getAllFlavorNames();

            // check that each flavor name exists on this component or a parent
            for (String f : Splitter.on(",").trimResults().split(defaultFlavor)) {
                if (!allFlavorNames.contains(f)) {
                    throw FlavorNameNotFoundException.forComponentDef(f, getDescriptor());
                }
            }
        }
    }

    /**
     * Does all the validation of the expressions defined in this component
     */
    private void validateExpressionRefs() throws QuickFixException {
        for (PropertyReference e : expressionRefs) {
            String root = e.getRoot();

            AuraValueProviderType vpt = AuraValueProviderType.getTypeByPrefix(root);
            if (vpt == null) {
                // validate that its a foreachs
            } else if (vpt == AuraValueProviderType.VIEW) {
                if (e.getStem() != null) { // checks for private attributes used in expressions ..
                    //String stem = e.getStem().toString();
                    //AttributeDef attr = getAttributeDef(stem);
                    // FIXME?(GPO) can we check access for attributes here?
                }
            } else {
                AuraContext lc = Aura.getContextService().getCurrentContext();
                GlobalValueProvider gvp = lc.getGlobalProviders().get(root);
                if (gvp != null && gvp.getValueProviderKey().isGlobal()) {
                    PropertyReference stem = e.getStem();
                    if (stem == null) {
                        throw new InvalidExpressionException("Expression didn't have enough terms: " + e,
                                e.getLocation());
                    }
                    gvp.validate(stem);
                }
            }
        }
    }

    @Override
    public void retrieveLabels() throws QuickFixException {
        // only get our direct labels, all others are handled by dependencies.
        GlobalValueProvider labelProvider = Aura.getContextService().getCurrentContext().getGlobalProviders()
                .get(LABEL.getPrefix());
        for (PropertyReference e : expressionRefs) {
            if (e.getRoot().equals(LABEL.getPrefix())) {
                labelProvider.getValue(e.getStem());
            }
        }
    }

    @Override
    public List<DependencyDef> getDependencies() {
        return this.dependencies;
    }

    /**
     * Recursively adds the ComponentDescriptors of all components in this ComponentDef's children to the provided set.
     * The set may then be used to analyze freshness of all of those types to see if any of them should be recompiled
     * from source.
     *
     * @param dependencies A Set that this method will append RootDescriptors to for every RootDef that this
     *            ComponentDef imports
     */
    @Override
    public void appendDependencies(Set<DefDescriptor<?>> dependencies) {
        super.appendDependencies(dependencies);

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

        if (resourceDescriptors != null) {
            dependencies.addAll(resourceDescriptors);
        }

        if (styleDescriptor != null) {
            dependencies.add(styleDescriptor);
        }

        if (flavoredStyleDescriptor != null) {
            dependencies.add(flavoredStyleDescriptor);
        }

        if (templateDefDescriptor != null) {
            dependencies.add(templateDefDescriptor);
        }

        if (designDefDescriptor != null) {
            dependencies.add(designDefDescriptor);
        }

        if (svgDefDescriptor != null) {
            dependencies.add(svgDefDescriptor);
        }

        if (imports != null && !imports.isEmpty()) {
            for (ImportDef imported : imports) {
                dependencies.add(imported.getDescriptor());
            }
        }

        if (tokenOverrides != null) {
            dependencies.addAll(tokenOverrides);
        }

        if (flavorOverrides != null) {
            dependencies.add(flavorOverrides);
        }

        for (DependencyDef dep : this.dependencies) {
            dep.appendDependencies(dependencies);
        }
    }

    @Override
    public void appendSupers(Set<DefDescriptor<?>> supers) throws QuickFixException {
        if (getExtendsDescriptor() != null) {
            supers.add(getExtendsDescriptor());
        }

        for (DefDescriptor<InterfaceDef> superInterface : interfaces) {
            supers.add(superInterface);
        }
    }

    @Override
    public void addClientLibs(List<ClientLibraryDef> clientLibs) {
        clientLibs.addAll(this.clientLibraries);
    }

    @Override
    public Set<ResourceDef> getResourceDefs() throws QuickFixException {
        Set<ResourceDef> resourceDefs = Sets.newHashSet();
        for (DefDescriptor<ResourceDef> resourceDesc : this.resourceDescriptors) {
            if (resourceDesc.getDef() != null) {
                resourceDefs.add(resourceDesc.getDef());
            }
        }

        return resourceDefs;
    }

    /**
     * This is used to validate by the compiler to validate EventDefRefs.
     *
     * @return all the events this component can fire, including those inherited
     * @throws QuickFixException
     */
    @Override
    public Map<String, RegisterEventDef> getRegisterEventDefs() throws QuickFixException {
        Map<String, RegisterEventDef> ret = new LinkedHashMap<>();
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
     * @return all the library imports from this component, including those inherited
     * @throws QuickFixException
     */
    @Override
    public List<ImportDef> getImportDefs() throws QuickFixException {
        return imports;
    }

    /**
     * @return all the attributes for this component, including those inherited from a super component
     * @throws QuickFixException
     */
    @Override
    public Map<DefDescriptor<AttributeDef>, AttributeDef> getAttributeDefs() throws QuickFixException {
        Map<DefDescriptor<AttributeDef>, AttributeDef> map = new LinkedHashMap<>();
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

    /**
     * @return all the required versions for this component
     */
    @Override
    public Map<DefDescriptor<RequiredVersionDef>, RequiredVersionDef> getRequiredVersionDefs() {
        return requiredVersionDefs;
    }

    /**
     * @return all the methods for this component, including those inherited from a super component
     * @throws org.auraframework.throwable.quickfix.QuickFixException
     */
    @Override
    public Map<DefDescriptor<MethodDef>, MethodDef> getMethodDefs() throws QuickFixException {
        Map<DefDescriptor<MethodDef>, MethodDef> methodDefs = new LinkedHashMap<>();
        if (extendsDescriptor != null) {
            methodDefs.putAll(getSuperDef().getMethodDefs());
        }

        for (DefDescriptor<InterfaceDef> interfaceDescriptor : interfaces) {
            for (Map.Entry<DefDescriptor<MethodDef>, MethodDef> entry : interfaceDescriptor.getDef().getMethodDefs().entrySet()) {
                DefDescriptor<MethodDef> desc = entry.getKey();
                if (methodDefs.containsKey(desc)) {
                    // JBUCH: HALO: TODO: SEE COMMENT FROM ABOVE "FIXMEDLP - do some validation #W-690040"
                }
                methodDefs.put(desc, entry.getValue());
            }
        }

        if (methodDefs.isEmpty()) {
            return this.methodDefs;
        } else {
            methodDefs.putAll(this.methodDefs);
            return Collections.unmodifiableMap(methodDefs);
        }
    }

    @Override
    public List<DefDescriptor<ControllerDef>> getControllerDefDescriptors() throws QuickFixException {
        List<DefDescriptor<ControllerDef>> ret;
        if (extendsDescriptor != null) {
	        ret = new ArrayList<>();
	        ret.addAll(this.controllerDescriptors);
	        ret.addAll(getSuperDef().getControllerDefDescriptors());
	    } else {
	        ret = this.controllerDescriptors;
        }
        return ret;
	}

    @Override
    public ControllerDef getControllerDef() throws QuickFixException {
        if (controllerDescriptors.isEmpty()) {
            if (extendsDescriptor != null) {
                return getSuperDef().getControllerDef();
            } else {
                return null;
            }
        } else {
            return compoundControllerDescriptor.getDef();
        }
    }


    @Override
    public ControllerDef getLocalControllerDef() throws QuickFixException {
        for (DefDescriptor<ControllerDef> desc : controllerDescriptors) {
        	ControllerDef def = desc.getDef();
            if (def.isLocal()) {
                return def;
            }
        }
        return null;
    }

    @Override
    public ControllerDef getRemoteControllerDef() throws QuickFixException {
        for (DefDescriptor<ControllerDef> desc : controllerDescriptors) {
        	ControllerDef def = desc.getDef();
            if (!def.isLocal()) {
                return def;
            }
        }
        return null;
    }

    @Override
    public StyleDef getStyleDef() throws QuickFixException {
        return styleDescriptor == null ? null : styleDescriptor.getDef();
    }

    @Override
    public FlavoredStyleDef getFlavoredStyleDef() throws QuickFixException {
        return flavoredStyleDescriptor == null ? null : flavoredStyleDescriptor.getDef();
    }

    @Override
    public DefDescriptor<T> getExtendsDescriptor() {
        return extendsDescriptor;
    }

    @Override
    public DefDescriptor<DesignDef> getDesignDefDescriptor() {
        return designDefDescriptor;
    }

    @Override
    public DefDescriptor<SVGDef> getSVGDefDescriptor() {
        return svgDefDescriptor;
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
    public DefDescriptor<StyleDef> getStyleDescriptor() {
        return styleDescriptor;
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
    public boolean isTemplate() {
        return isTemplate;
    }

    @Override
    public Set<DefDescriptor<InterfaceDef>> getInterfaces() {
        return interfaces;
    }

    private Set<DefDescriptor<InterfaceDef>> getAllInterfaces() throws QuickFixException {
        Set<DefDescriptor<InterfaceDef>> interfaceDefs = Sets.newLinkedHashSet();
        for (DefDescriptor<InterfaceDef> interfaceDef : interfaces) {
            addAllInterfaces(interfaceDef, interfaceDefs);
        }
        return interfaceDefs;
    }

    private void addAllInterfaces(DefDescriptor<InterfaceDef> interfaceDef, Set<DefDescriptor<InterfaceDef>> set)
            throws QuickFixException {
        set.add(interfaceDef);
        for (DefDescriptor<InterfaceDef> superInterface : interfaceDef.getDef().getExtendsDescriptors()) {
            set.add(superInterface);
            addAllInterfaces(superInterface, set);
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
                    && (modelDefDescriptor == null ? other.modelDefDescriptor == null
                    : modelDefDescriptor.equals(other.modelDefDescriptor))
                    && (extendsDescriptor == null ? other.extendsDescriptor == null
                    : extendsDescriptor.equals(other.extendsDescriptor))
                    && events.equals(other.events)
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
     * Gets all the component class definitions for this component definition.
     * Returns a string of all the client component classes wrapped in a closure for later execution.
     */
    @Override
    public String getComponentClass() throws QuickFixException, IOException {

        if(this.clientComponentClass == null) {
            final StringBuilder sb = new StringBuilder();
            BaseComponentDef descriptor = this;
            String name = null;
            ClientComponentClass clientClass;

            sb.append("function(){");
            while(!"markup://aura:component".equals(name)) {
                clientClass = new ClientComponentClass(descriptor);
                clientClass.writeComponentClass(sb);

                if(descriptor.getExtendsDescriptor() == null) {
                    break;
                }

                descriptor = descriptor.getExtendsDescriptor().getDef();
                name = descriptor.getDescriptor().getQualifiedName();
            }
            sb.append('}');

            this.clientComponentClass = sb.toString();
        }

        return this.clientComponentClass;
    }

    public boolean hasServerAction(ControllerDef controllerDef) {
    	Map<String, ? extends ActionDef> actionDefs = controllerDef.getActionDefs();
        for (ActionDef actionDef : actionDefs.values()) {
            if (actionDef.getActionType() == ActionType.SERVER) {
                return true;
            }
        }
        return false;
    }

    /**
     * Serialize this component to json. The output will include all of the attributes, events, and handlers inherited.
     * It doesn't yet include inherited ComponentDefRefs, but maybe it should.
     */
    @Override
    public void serialize(Json json) throws IOException {
        try {
            AuraContext context = Aura.getContextService().getCurrentContext();
            boolean preloaded = context.isPreloaded(getDescriptor());
            boolean preloading = context.isPreloading();
            if (preloaded) {
            	json.writeMapBegin();
                json.writeMapEntry("descriptor", descriptor);
                json.writeMapEnd();
            } else {
                json.writeMapBegin();
                json.writeValue(getAccess());
                json.writeMapEntry("descriptor", descriptor);

                json.writeMapEntry("styleDef", getStyleDef());
                if (flavoredStyleDescriptor != null) {
                    json.writeMapEntry("flavoredStyleDef", getFlavoredStyleDef());
                }

                ControllerDef controllerDef = getControllerDef();
                if (controllerDef != null && hasServerAction(controllerDef)) {
                    json.writeMapEntry("controllerDef", controllerDef);
                }

                json.writeMapEntry("modelDef", getModelDef());
                json.writeMapEntry("superDef", getSuperDef());
                if (preloading) {
                    json.writeMapEntry("isCSSPreloaded", preloading);
                }

                Collection<AttributeDef> attributeDefs = getAttributeDefs().values();
                if (!attributeDefs.isEmpty()) {
                    json.writeMapEntry("attributeDefs", attributeDefs);
                }

                Collection<MethodDef> methodDefs = getMethodDefs().values();
                if (!methodDefs.isEmpty()) {
                    json.writeMapEntry("methodDefs", methodDefs);
                }

                Collection<RequiredVersionDef> requiredVersionDefs = getRequiredVersionDefs().values();
                if (requiredVersionDefs != null && !requiredVersionDefs.isEmpty()) {
                    json.writeMapEntry("requiredVersionDefs", requiredVersionDefs);
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

                Collection<ImportDef> imports = getImportDefs();
                if (!imports.isEmpty()) {
                    json.writeMapEntry("imports", imports);
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

                if (subDefs != null) {
                    json.writeMapEntry("subDefs", subDefs.values());
                }

                if (flavorOverrides != null) {
                    json.writeMapEntry("flavorOverrides", flavorOverrides.getDef());
                }

                String defaultFlavorToSerialize = getDefaultFlavorOrImplicit();
                if (defaultFlavorToSerialize != null) {
                    json.writeMapEntry("defaultFlavor", defaultFlavorToSerialize);
                }

                if (hasFlavorableChild) {
                    json.writeMapEntry("hasFlavorableChild", true);
                }

                if (dynamicallyFlavorable) {
                    json.writeMapEntry("dynamicallyFlavorable", dynamicallyFlavorable);
                }

                if(!context.getDefRegistry().getComponentClassLoaded(descriptor)) {
                    // KRIS:
                    // This needs to be conditional. We can't just return the component class each time.
                    // We do still return this componentdef object even if we already have the component class.
                    // This is because this still has a lot of logic not genereated as part of the component class.
                    // I see no reason we can't do that, but we just haven't yet.

                    // we don't want componentClass component def returned ever.
                    // stash the current context containing mdr without componentClass component def
                    Aura.getContextService().pushSystemContext();
                    try {
                        // this will add componentClass def to temp context
                        json.writeMapEntry("componentClass", getComponentClass());
                    } finally {
                        // retrieve our original context without componentClass
                        Aura.getContextService().popSystemContext();
                    }
                }

                serializeFields(json);
                json.writeMapEnd();
            }
        } catch (QuickFixException e) {
            throw new AuraUnhandledException("unhandled exception", e);
        }
    }

	protected abstract void serializeFields(Json json) throws IOException,
    QuickFixException;

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
     * @return The primary renderer def. If multiple exist, this will be the remote one.
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
     * @return The primary helper def. If multiple exist, this will be the remote one.
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
        context.pushCallingDescriptor(descriptor);
        try {
            return modelDefDescriptor == null ? null : modelDefDescriptor.getDef();
        } finally {
            context.popCallingDescriptor();
        }
    }

    /**
     * @see ComponentDef#getModelDefDescriptors()
     */
    @Override
    public List<DefDescriptor<ModelDef>> getModelDefDescriptors() throws QuickFixException {
        List<DefDescriptor<ModelDef>> ret = new ArrayList<>();

        if (modelDefDescriptor != null) {
            ret.add(modelDefDescriptor);
        }

        if (extendsDescriptor != null) {
            ret.addAll(getSuperDef().getModelDefDescriptors());
        }
        return ret;
    }

    @Override
    public List<ClientLibraryDef> getClientLibraries() {
        return clientLibraries;
    }

    @Override
    public List<DefDescriptor<TokensDef>> getTokenOverrides() throws QuickFixException{
        List<DefDescriptor<TokensDef>> tokens=new ArrayList<>();
        if(extendsDescriptor!=null){
            tokens.addAll(extendsDescriptor.getDef().getTokenOverrides());
        }
        tokens.addAll(tokenOverrides);
        return tokens;
    }

    @Override
    public DefDescriptor<FlavorsDef> getFlavorOverrides() {
        return flavorOverrides;
    }

    @Override
    public String getDefaultFlavorOrImplicit() throws QuickFixException {
        if (defaultFlavor == null
                && flavoredStyleDescriptor != null
                && flavoredStyleDescriptor.getDef().getFlavorNames().contains("default")
                && (hasFlavorableChild() || isDynamicallyFlavorable())) {
            return "default";
        }

        return defaultFlavor;
    }

    @Override
    public boolean hasFlavorableChild() {
        return hasFlavorableChild;
    }

    @Override
    public boolean inheritsFlavorableChild() throws QuickFixException {
        DefDescriptor<? extends BaseComponentDef> parent = this.extendsDescriptor;
        while (parent != null) {
            BaseComponentDef parentDef = parent.getDef();
            if (parentDef.hasFlavorableChild()) {
                return true;
            }
            parent = parentDef.getExtendsDescriptor();
        }
        return false;
    }

    @Override
    public boolean isDynamicallyFlavorable() throws QuickFixException {
        if (dynamicallyFlavorable) {
            return true;
        }
        if (extendsDescriptor != null) {
            return extendsDescriptor.getDef().isDynamicallyFlavorable();
        }
        return false;
    }

    @Override
    public Set<String> getAllFlavorNames() throws QuickFixException {
        Set<String> allFlavorNames = new HashSet<>();
        if (flavoredStyleDescriptor != null) {
            allFlavorNames.addAll(flavoredStyleDescriptor.getDef().getFlavorNames());
        }
        if (extendsDescriptor != null) {
            allFlavorNames.addAll(extendsDescriptor.getDef().getAllFlavorNames());
        }
        return allFlavorNames;
    }

    public static abstract class Builder<T extends BaseComponentDef> extends
    RootDefinitionImpl.Builder<T> implements BaseComponentDefBuilder<T> {

        public Builder(Class<T> defClass) {
            super(defClass);
            methodDefs=Maps.newLinkedHashMap();
        }

        public boolean isAbstract;
        public boolean isExtensible;
        public boolean isTemplate;

        public DefDescriptor<ModelDef> modelDefDescriptor;
        public DefDescriptor<T> extendsDescriptor;
        public DefDescriptor<ComponentDef> templateDefDescriptor;
        public DefDescriptor<StyleDef> styleDescriptor;
        public DefDescriptor<FlavoredStyleDef> flavoredStyleDescriptor;
        public DefDescriptor<DesignDef> designDefDescriptor;
        public DefDescriptor<SVGDef> svgDefDescriptor;
        public List<DefDescriptor<RendererDef>> rendererDescriptors;
        public List<DefDescriptor<HelperDef>> helperDescriptors;
        public List<DefDescriptor<ResourceDef>> resourceDescriptors;
        public List<AttributeDefRef> facets;

        public Set<DefDescriptor<InterfaceDef>> interfaces;
        public List<DefDescriptor<ControllerDef>> controllerDescriptors;
        public Map<DefDescriptor<MethodDef>, MethodDef> methodDefs;
        public Map<String, RegisterEventDef> events;
        public List<EventHandlerDef> eventHandlers;
        public List<ImportDef> imports;
        public Set<PropertyReference> expressionRefs;
        public String render;
        public WhitespaceBehavior whitespaceBehavior;
        List<DependencyDef> dependencies;
        public List<ClientLibraryDef> clientLibraries;
        private RenderType renderType;
        private List<DefDescriptor<TokensDef>> tokenOverrides;
        private DefDescriptor<FlavorsDef> flavorOverrides;
        private String defaultFlavor;
        private boolean hasFlavorableChild;
        private boolean dynamicallyFlavorable;

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

        public void addResource(String name) {
            if (this.resourceDescriptors == null) {
                this.resourceDescriptors = Lists.newArrayList();
            }
            this.resourceDescriptors.add(DefDescriptorImpl.getInstance(name, ResourceDef.class));
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
        public Builder<T> setDesignDef(DesignDef designDef) {
            this.designDefDescriptor = designDef.getDescriptor();
            return this;
        }

        @Override
        public Builder<T> setSVGDef(SVGDef svgDef) {
            this.svgDefDescriptor = svgDef.getDescriptor();
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
        public Builder<T> setStyleDef(StyleDef styleDef) {
            this.styleDescriptor = styleDef.getDescriptor();
            return this;
        }

        @Override
        public Builder<T> addClientLibrary(ClientLibraryDef clientLibrary) {
            if (this.clientLibraries == null) {
                this.clientLibraries = Lists.newArrayList();
            }
            this.clientLibraries.add(clientLibrary);
            return this;
        }

        @Override
        public BaseComponentDefBuilder<T> setTokenOverrides(String tokenOverrides) {
            if (this.tokenOverrides == null) {
                this.tokenOverrides = new ArrayList<>();
            }
            for (String name : Splitter.on(',').trimResults().omitEmptyStrings().split(tokenOverrides)) {
                this.tokenOverrides.add(DefDescriptorImpl.getInstance(name, TokensDef.class));
            }
            return this;
        }

        @Override
        public BaseComponentDefBuilder<T> setTokenOverride(DefDescriptor<TokensDef> tokenOverride) {
            if (this.tokenOverrides == null) {
                this.tokenOverrides = new ArrayList<>();
            }
            this.tokenOverrides.add(tokenOverride);
            return this;
        }

        @Override
        public BaseComponentDefBuilder<T> setFlavorOverrides(DefDescriptor<FlavorsDef> flavorOverrides) {
            this.flavorOverrides = flavorOverrides;
            return this;
        }

        @Override
        public Builder<T> setDefaultFlavor(String defaultFlavor) {
            this.defaultFlavor = defaultFlavor;
            return this;
        }

        @Override
        public Builder<T> setHasFlavorableChild(boolean hasFlavorableChild) {
            this.hasFlavorableChild = hasFlavorableChild;
            return this;
        }

        @Override
        public Builder<T> setDynamicallyFlavorable(boolean dynamicallyFlavorable) {
            this.dynamicallyFlavorable = dynamicallyFlavorable;
            return this;
        }

        /**
         * Gets the methodDefs for this instance.
         *
         * @return The methodDefs.
         */
        public Map<DefDescriptor<MethodDef>, MethodDef> getMethodDefs() {
            return this.methodDefs;
        }


        protected void finish() {
            if (render == null) {
                this.renderType = RenderType.AUTO;
            } else {
                try {
                    this.renderType = RenderType.valueOf(render.toUpperCase());
                } catch (Exception e) {
                    setParseError(e);
                }
            }
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
            return descriptor.equals(other)
                    || (extendsDescriptor != null && getSuperDef()
                    .isInstanceOf(other));
        default:
            return false;
        }
    }

    @Override
    public Set<PropertyReference> getExpressionRefs() {
        return expressionRefs;
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
        if (styleDescriptor != null) {
            ret.add(styleDescriptor);
        }
        if (helperDescriptors != null) {
            ret.addAll(helperDescriptors);
        }
        if (documentationDescriptor != null) {
            ret.add(documentationDescriptor);
        }
        if (flavorOverrides != null) {
            ret.add(flavorOverrides);
        }
        return ret;
    }

    /**
     * This should not be here it should be a call off of MDR.
     */
    @Override
    public boolean isLocallyRenderable() throws QuickFixException {
        return isLocallyRenderable(Sets.<DefDescriptor<?>> newLinkedHashSet());
    }

    /**
     * Helper routine for public call. DIE! please?
     *
     * @param already the set of processed descriptors.
     */
    private boolean isLocallyRenderable(Set<DefDescriptor<?>> already) throws QuickFixException {
        if (render == RenderType.CLIENT) {
            return false;
        } else if (render == RenderType.SERVER) {
            return true;
        }
        //
        // FIXME: OMG W-1501702 really?!?!?!
        //
        // We desperately need to make this go away. It is heinousness
        // incarnate, but the entirety of server side rendering is blocking
        // this.
        //
        // Currently, the server side throws an UnsupportedOperationException,
        // so the styles (which is one part that currently breaks) never get
        // rendered.
        //
        // also see W-922563
        //
        // This will probably stay here til we fix server side rendering (or at
        // least the style part). Also, we need to allow dual renderers.
        //
        if (this.getDescriptor().getQualifiedName().equals("markup://aura:placeholder")) {
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
            ret = ret && getLocalControllerDef() == null;
        }
        if (ret) {
            ret = ret && getRemoteControllerDef() == null;
        }

        // If we've gotten this far, let's check for Styles (server rendering
        // doesn't work with styles) W-922563
        if (ret) {
            ret = ret && getStyleDescriptor() == null;
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

    @Override
    public abstract DefDescriptor<T> getDefaultExtendsDescriptor();

}
