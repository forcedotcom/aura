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
import java.io.Serializable;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.auraframework.Aura;
import org.auraframework.adapter.ConfigAdapter;
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
import org.auraframework.def.DefinitionReference;
import org.auraframework.def.DependencyDef;
import org.auraframework.def.EventHandlerDef;
import org.auraframework.def.FlavoredStyleDef;
import org.auraframework.def.HelperDef;
import org.auraframework.def.InterfaceDef;
import org.auraframework.def.LibraryDefRef;
import org.auraframework.def.LocatorDef;
import org.auraframework.def.MethodDef;
import org.auraframework.def.ModelDef;
import org.auraframework.def.ProviderDef;
import org.auraframework.def.RegisterEventDef;
import org.auraframework.def.RendererDef;
import org.auraframework.def.RequiredVersionDef;
import org.auraframework.def.RootDefinition;
import org.auraframework.def.SVGDef;
import org.auraframework.def.StyleDef;
import org.auraframework.def.design.DesignDef;
import org.auraframework.expression.PropertyReference;
import org.auraframework.impl.DefinitionAccessImpl;
import org.auraframework.impl.root.AttributeDefRefImpl;
import org.auraframework.impl.root.RootDefinitionImpl;
import org.auraframework.impl.root.intf.InterfaceDefImpl;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.impl.util.AuraUtil;
import org.auraframework.instance.AuraValueProviderType;
import org.auraframework.instance.GlobalValueProvider;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.AuraContext;
import org.auraframework.throwable.AuraUnhandledException;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.throwable.quickfix.FlavorNameNotFoundException;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.InvalidExpressionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil;
import org.auraframework.util.json.Json;
import org.auraframework.util.json.Json.ApplicationKey;
import org.auraframework.util.json.JsonSerializationContext;

import com.google.common.base.Splitter;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.google.common.collect.Sets;

public abstract class BaseComponentDefImpl<T extends BaseComponentDef> extends
        RootDefinitionImpl<T> implements BaseComponentDef, Serializable {

    public static final DefDescriptor<InterfaceDef> ROOT_MARKER = new DefDescriptorImpl<>(
            "markup", "aura", "rootComponent", InterfaceDef.class);

    private static final long serialVersionUID = -2485193714215681494L;
    private final boolean isAbstract;
    private final boolean isExtensible;
    private final boolean isTemplate;
    private final Double minVersion;

    private final DefDescriptor<T> extendsDescriptor;
    private final DefDescriptor<ComponentDef> templateDefDescriptor;
    private final DefDescriptor<ControllerDef> compoundControllerDescriptor;
    private final Set<DefDescriptor<InterfaceDef>> interfaces;

    private final DefDescriptor<RendererDef> rendererDescriptor;
    private final DefDescriptor<HelperDef> helperDescriptor;
    private final DefDescriptor<ControllerDef> controllerDescriptor;
    private final DefDescriptor<ProviderDef> providerDescriptor;
    private final DefDescriptor<ModelDef> modelDescriptor;

    private final FlavoredStyleDef flavoredStyle;
    private final DefDescriptor<StyleDef> styleDefDescriptor;
    private StyleDef styleDef;
    private final DesignDef designDef;
    private final SVGDef svgDef;
    private final Map<String, RegisterEventDef> events;
    private final List<EventHandlerDef> eventHandlers;
    private final Map<DefDescriptor<MethodDef>,MethodDef> methodDefs;
    private final List<LibraryDefRef> imports;
    private final List<AttributeDefRef> facets;
    private final Set<PropertyReference> expressionRefs;

    private ModelDef clientModelDef;
    private RendererDef clientRendererDef;
    private ControllerDef clientControllerDef;
    private HelperDef clientHelperDef;
    private ProviderDef clientProviderDef;

    private final DefDescriptor<ModelDef> externalModelDescriptor;
    private final DefDescriptor<RendererDef> externalRendererDescriptor;
    private final DefDescriptor<ControllerDef> externalControllerDescriptor;
    private final DefDescriptor<HelperDef> externalHelperDescriptor;
    private final DefDescriptor<ProviderDef> externalProviderDescriptor;

    private final RenderType render;

    private final List<DependencyDef> dependencies;
    private final List<ClientLibraryDef> clientLibraries;
    private final Map<String, LocatorDef> locatorDefs;

    private final String defaultFlavor;
    private final boolean hasFlavorableChild;
    private final boolean dynamicallyFlavorable;
    private String classCode;
    private String minifiedClassCode;

    private final int hashCode;
    private final boolean minifyEnabled;

    private transient Boolean localDeps = null;
    private transient QuickFixException componentBuildError;

    private static <X extends Definition> DefDescriptor<X> getFirst(List<DefDescriptor<X>> list) {
        return (list != null && list.size() > 0) ? list.get(0) : null;
    }

    protected BaseComponentDefImpl(Builder<T> builder) {
        super(builder);
        this.controllerDescriptor = getFirst(builder.controllerDescriptors);
        this.rendererDescriptor = getFirst(builder.rendererDescriptors);
        this.helperDescriptor = getFirst(builder.helperDescriptors);
        this.providerDescriptor = getFirst(builder.providerDescriptors);

        this.minifyEnabled = builder.minifyEnabled;
        this.modelDescriptor = builder.modelDefDescriptor;

        this.clientModelDef = builder.clientModelDef;
        this.clientProviderDef = builder.clientProviderDef;
        this.clientControllerDef = builder.clientControllerDef;
        this.clientRendererDef = builder.clientRendererDef;
        this.clientHelperDef = builder.clientHelperDef;

        this.externalModelDescriptor = builder.externalModelDef;
        this.externalProviderDescriptor = builder.externalProviderDef;
        this.externalControllerDescriptor = builder.externalControllerDef;
        this.externalRendererDescriptor = builder.externalRendererDef;
        this.externalHelperDescriptor = builder.externalHelperDef;

        this.interfaces = AuraUtil.immutableSet(builder.interfaces);
        this.methodDefs = AuraUtil.immutableMap(builder.methodDefs);
        this.extendsDescriptor = builder.extendsDescriptor;
        this.templateDefDescriptor = builder.templateDefDescriptor;
        this.events = AuraUtil.immutableMap(builder.events);
        this.eventHandlers = AuraUtil.immutableList(builder.eventHandlers);
        this.imports = AuraUtil.immutableList(builder.imports);
        this.styleDefDescriptor = builder.styleDefDescriptor;
        this.styleDef = builder.styleDef;
        this.flavoredStyle = builder.flavoredStyle;
        this.isAbstract = builder.isAbstract;
        this.isExtensible = builder.isExtensible;
        this.isTemplate = builder.isTemplate;
        this.facets = AuraUtil.immutableList(builder.facets);
        this.dependencies = AuraUtil.immutableList(builder.dependencies);
        this.clientLibraries = AuraUtil.immutableList(builder.clientLibraries);
        this.locatorDefs = AuraUtil.immutableMap(builder.locatorDefs);
        this.render = builder.renderType;
        this.designDef = builder.designDef;
        this.svgDef = builder.svgDef;
        this.defaultFlavor = builder.defaultFlavor;
        this.hasFlavorableChild = builder.hasFlavorableChild;
        this.dynamicallyFlavorable = builder.dynamicallyFlavorable;
        this.expressionRefs = AuraUtil.immutableSet(builder.expressionRefs);
        this.classCode = builder.classCode;
        this.minifiedClassCode = builder.minifiedClassCode;
        this.minVersion = builder.minVersion;

        if (getDescriptor() != null) {
            this.compoundControllerDescriptor = DefDescriptorImpl.getAssociateDescriptor(getDescriptor(),
                    ControllerDef.class, DefDescriptor.COMPOUND_PREFIX);
        } else {
            this.compoundControllerDescriptor = null;
        }
        this.hashCode = AuraUtil.hashCode(super.hashCode(), events, controllerDescriptor, modelDescriptor,
                        extendsDescriptor, interfaces, methodDefs, providerDescriptor, rendererDescriptor, helperDescriptor,
                        imports, externalModelDescriptor, externalRendererDescriptor, externalControllerDescriptor,
                        externalHelperDescriptor, externalProviderDescriptor);
        if (externalRendererDescriptor == null && externalHelperDescriptor == null
                && externalProviderDescriptor == null && externalControllerDescriptor == null
                && externalModelDescriptor == null) {
            try {
                buildClass();
            } catch (QuickFixException qfe) {
                this.componentBuildError = qfe;
            }
        }
    }

    private void buildClass() throws QuickFixException {
        JavascriptComponentClass classBuilder;

        classBuilder = (JavascriptComponentClass)new JavascriptComponentClass.Builder()
            .setDescriptor(descriptor)
            .setExtendsDescriptor(extendsDescriptor)
            .setImports(imports)
            .setControllerCode(clientControllerDef == null ? null : clientControllerDef.getCode())
            .setHelperCode(clientHelperDef == null ? null : clientHelperDef.getCode())
            .setRendererCode(clientRendererDef == null ? null : clientRendererDef.getCode())
            .setProviderCode(clientProviderDef == null ? null : clientProviderDef.getCode())
            .setMinify(minifyEnabled)
            .build();
        minifiedClassCode = classBuilder.getMinifiedCode();
        classCode = classBuilder.getCode();
    }

    /**
     * @throws QuickFixException
     * @see Definition#validateDefinition()
     */
    @Override
    public void validateDefinition() throws QuickFixException {
        super.validateDefinition();
        if (this.componentBuildError != null) {
            throw this.componentBuildError;
        }

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

        for (LibraryDefRef def : imports) {
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
    }

    @Override
    public boolean hasLocalDependencies() throws QuickFixException {
        if (localDeps == null) {
            computeLocalDependencies();
        }

        return localDeps == Boolean.TRUE;
    }

    // JBUCH: TODO: This is sub-optimal and the entire concern needs to be revisited. Note the impl cast.
    public boolean hasFacetLocalDependencies() throws QuickFixException {
        if (!facets.isEmpty()) {
            for (AttributeDefRef facet : facets) {
                Object v = facet.getValue();
                if (v instanceof ArrayList) {
                    for (Object fl : ((ArrayList<?>) v)) {
                        if (fl instanceof DefinitionReference) {
                            DefinitionReference cdr = (DefinitionReference) fl;
                            DefType defType = cdr.getDescriptor().getDefType();
                            if (defType == DefType.APPLICATION || defType == DefType.COMPONENT) {
                                BaseComponentDefImpl<?> def = (BaseComponentDefImpl<?>) cdr.getDescriptor().getDef();
                                if (def.hasLocalDependencies() || def.hasFacetLocalDependencies()) {
                                    return true;
                                }
                            }
                        }
                    }
                }
            }
        }
        return false;
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

        if (modelDescriptor != null || clientModelDef != null) {
            localDeps = Boolean.TRUE;
            return;
        }

        if (clientRendererDef == null && rendererDescriptor != null) {
            localDeps = Boolean.TRUE;
            return;
        }


        if (clientProviderDef == null && providerDescriptors != null && providerDescriptors.size() > 0) {
            localDeps = Boolean.TRUE;
            return;
        }

        // Walk the super component tree applying slightly different dependency rules.
        // For super defs, we only check for renderer or model dependencies.
        // This should die, somehow.
        @SuppressWarnings("unchecked")
        BaseComponentDefImpl<T> superDef = (BaseComponentDefImpl<T>)getSuperDef();
        while (superDef != null) {
            if (superDef.modelDescriptor != null || superDef.clientModelDef != null
                    || (superDef.clientRendererDef == null && superDef.rendererDescriptor != null)) {
                localDeps = Boolean.TRUE;
                return;
            }
            superDef = (BaseComponentDefImpl<T>)superDef.getSuperDef();
        }

        if (localDeps == null) {
            localDeps = Boolean.FALSE;
        }
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
                    //           throw new InvalidValueSetTypeException(
                    //                   String.format("Error setting the attribute '%s' of type %s to a value of type %s.", facetAttributeDef.getName(), facetAttributeDef.getTypeDef().getName(), facet.getValue().getClass().getName()),
                    //                   exception.getLocation());
                    // }
                }
            }
            facet.validateReferences();
        }

        DefinitionService definitionService = Aura.getDefinitionService();
        if (templateDefDescriptor != null) {
            BaseComponentDef template = definitionService.getDefinition(templateDefDescriptor);
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
            T parentDef = definitionService.getDefinition(extendsDescriptor);

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

            SupportLevel support = getSupport();
            DefDescriptor<T> extDesc = extendsDescriptor;
            while (extDesc != null) {
                T extDef = definitionService.getDefinition(extDesc);
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

        for (LibraryDefRef def : imports) {
            def.validateReferences();
        }

        // have to do all sorts of craaaazy checks here for dupes and matches
        // and bah
        validateExpressionRefs();

        for (ClientLibraryDef def : this.clientLibraries) {
            def.validateReferences();
        }


        if (defaultFlavor != null) {
            // component must be flavorable
            if (!hasFlavorableChild() && !inheritsFlavorableChild() && !isDynamicallyFlavorable()) {
                throw new InvalidDefinitionException("The defaultFlavor attribute cannot be "
                        + "specified on a component with no flavorable children", location);
            }

            Set<String> allFlavorNames = getAllFlavorNames();

            // check that each flavor name exists on this component or a parent
            for (String f : Splitter.on(",").trimResults().split(defaultFlavor)) {
                if (!allFlavorNames.contains(f)) {
                    throw FlavorNameNotFoundException.forComponentDef(f, getDescriptor());
                }
            }
        }
        if (styleDefDescriptor != null) {
            styleDef = styleDefDescriptor.getDef();
        }
        if (classCode == null) {
            if (externalModelDescriptor != null) {
                clientModelDef = externalModelDescriptor.getDef();
            }
            if (externalRendererDescriptor != null) {
                clientRendererDef = externalRendererDescriptor.getDef();
            }
            if (externalControllerDescriptor != null) {
                clientControllerDef = externalControllerDescriptor.getDef();
            }
            if (externalHelperDescriptor != null) {
                clientHelperDef = externalHelperDescriptor.getDef();
            }
            if (externalProviderDescriptor != null) {
                clientProviderDef = externalProviderDescriptor.getDef();
            }
            buildClass();
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
        super.retrieveLabels();
        retrieveLabels(expressionRefs);
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

        // This is a hack. we should do this differently.
        if (styleDef != null) {
            dependencies.add(styleDef.getDescriptor());
        }
        if (styleDefDescriptor != null) {
            dependencies.add(styleDefDescriptor);
        }
        
        if (flavoredStyle != null) {
            dependencies.add(flavoredStyle.getDescriptor());
        }
        
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

        if (controllerDescriptor != null) {
            dependencies.add(controllerDescriptor);
        }

        if (modelDescriptor != null) {
            dependencies.add(modelDescriptor);
        }

        if (rendererDescriptor != null) {
            dependencies.add(rendererDescriptor);
        }

        if (helperDescriptor != null) {
            dependencies.add(helperDescriptor);
        }

        if (templateDefDescriptor != null) {
            dependencies.add(templateDefDescriptor);
        }

        if (imports != null && !imports.isEmpty()) {
            for (LibraryDefRef imported : imports) {
                imported.appendDependencies(dependencies);
            }
        }

        for (DependencyDef dep : this.dependencies) {
            dep.appendDependencies(dependencies, this);
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
     * @return All the locators defined in this component def
     */
    @Override
    public Map<String, LocatorDef> getLocators() {
        return this.locatorDefs;
    };

    /**
     * @return all the library imports from this component, including those inherited
     * @throws QuickFixException
     */
    @Override
    public List<LibraryDefRef> getImports() throws QuickFixException {
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
        List<DefDescriptor<ControllerDef>> ret = Lists.newArrayList();
        if (controllerDescriptor != null) {
            ret.add(controllerDescriptor);
        }
        if (clientControllerDef != null) {
            ret.add(clientControllerDef.getDescriptor());
        }
        if (extendsDescriptor != null) {
            ret.addAll(getSuperDef().getControllerDefDescriptors());
        }
        return ret;
    }

    @Override
    public ProviderDef getLocalProviderDef() throws QuickFixException {
        return providerDescriptor != null ? providerDescriptor.getDef() : null;
    }

    @Override
    public ProviderDef getProviderDef() throws QuickFixException {
        if (clientProviderDef != null) {
            return clientProviderDef;
        }
        return providerDescriptor != null ? providerDescriptor.getDef() : null;
    }

    @Override
    public ControllerDef getControllerDef() throws QuickFixException {
        if (controllerDescriptor == null && clientControllerDef == null) {
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
        return (controllerDescriptor != null) ? controllerDescriptor.getDef() : null;
    }

    @Override
    public StyleDef getStyleDef() {
        return styleDef;
    }

    @Override
    public FlavoredStyleDef getFlavoredStyleDef() throws QuickFixException {
        return flavoredStyle;
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
        if (extendsDescriptor == null) {
            return null;
        }
        @SuppressWarnings({"deprecation"})
        T ret = extendsDescriptor.getDef();
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
                    && (controllerDescriptor == null ? other.controllerDescriptor == null
                            : controllerDescriptor.equals(other.controllerDescriptor))
                    && (modelDescriptor == null ? other.modelDescriptor == null
                            : modelDescriptor.equals(other.modelDescriptor))
                    && (extendsDescriptor == null ? other.extendsDescriptor == null
                            : extendsDescriptor.equals(other.extendsDescriptor))
                    && events.equals(other.events) && getLocation().equals(other.getLocation());
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
            JsonSerializationContext serializationContext = context.getJsonSerializationContext();
            boolean preloaded = context.isPreloaded(getDescriptor());
            if (preloaded || serializationContext.isSerializing()) {
                json.writeMapBegin();
                json.writeMapEntry(ApplicationKey.DESCRIPTOR, descriptor);
                json.writeMapEnd();
            } else {
                serializationContext.setSerializing(true);
                json.writeMapBegin();
                json.writeValue(getAccess());
                json.writeMapEntry(ApplicationKey.DESCRIPTOR, descriptor);

                json.writeMapEntry(ApplicationKey.STYLEDEF, getStyleDef());
                if (flavoredStyle != null) {
                    json.writeMapEntry(ApplicationKey.FLAVOREDSTYLEDEF, flavoredStyle);
                }

                ControllerDef controllerDef = getControllerDef();
                if (controllerDef != null && hasServerAction(controllerDef)) {
                    json.writeMapEntry(ApplicationKey.CONTROLLERDEF, controllerDef);
                }

                json.writeMapEntry(ApplicationKey.MODELDEF, getModelDef());

                if (getSuperDef() != null && !getSuperDef().getDescriptor().getQualifiedName().equals("markup://aura:component")) {
                    json.writeMapEntry(ApplicationKey.SUPERDEF, getSuperDef().getDescriptor());
                }

                boolean preloading = context.isPreloading();
                if (preloading) {
                    json.writeMapEntry(ApplicationKey.CSSPRELOADED, preloading);
                }

                Collection<AttributeDef> attributeDefs = getAttributeDefs().values();
                if (!attributeDefs.isEmpty()) {
                    json.writeMapEntry(ApplicationKey.ATTRIBUTEDEFS, attributeDefs);
                }

                Collection<MethodDef> methodDefs = getMethodDefs().values();
                if (!methodDefs.isEmpty()) {
                    json.writeMapEntry(ApplicationKey.METHODDEFS, methodDefs);
                }

                Collection<RequiredVersionDef> requiredVersionDefs = getRequiredVersionDefs().values();
                if (requiredVersionDefs != null && !requiredVersionDefs.isEmpty()) {
                    json.writeMapEntry(ApplicationKey.REQUIREDVERSIONDEFS, requiredVersionDefs);
                }

                Set<DefDescriptor<InterfaceDef>> allInterfaces = getAllInterfaces();
                if (allInterfaces != null && !allInterfaces.isEmpty()) {
                    json.writeMapEntry(ApplicationKey.INTERFACES, allInterfaces);
                }

                Collection<RegisterEventDef> regevents = getRegisterEventDefs().values();
                if (!regevents.isEmpty()) {
                    json.writeMapEntry(ApplicationKey.REGISTEREVENTDEFS, regevents);
                }

                Collection<EventHandlerDef> handlers = getHandlerDefs();
                if (!handlers.isEmpty()) {
                    json.writeMapEntry(ApplicationKey.HANDLERDEFS, handlers);
                }

                Map<String, LocatorDef> locatorDefs = getLocators();
                if (locatorDefs!=null && !locatorDefs.isEmpty()) {
                    json.writeMapEntry(ApplicationKey.LOCATORDEFS, locatorDefs);
                }

                if (!facets.isEmpty()) {
                    json.writeMapEntry(ApplicationKey.FACETS, facets);
                }

                boolean local = hasLocalDependencies();
                // For the client, hasRemoteDeps is true if the current definition or
                // a definition in any of its facets has a local dependency.
                if (!local) {
                    local = hasFacetLocalDependencies();
                }

                if (local) {
                    json.writeMapEntry(ApplicationKey.HASSERVERDEPENDENCIES, true);
                }

                if (isAbstract) {
                    json.writeMapEntry(ApplicationKey.ABSTRACT, isAbstract);
                }

                if (subDefs != null) {
                    json.writeMapEntry(ApplicationKey.SUBDEFS, subDefs.values());
                }

                String defaultFlavorToSerialize = getDefaultFlavorOrImplicit();
                if (defaultFlavorToSerialize != null) {
                    json.writeMapEntry(ApplicationKey.DEFAULTFLAVOR, defaultFlavorToSerialize);
                }

                if (hasFlavorableChild) {
                    json.writeMapEntry(ApplicationKey.FLAVORABLECHILD, true);
                }

                if (dynamicallyFlavorable) {
                    json.writeMapEntry(ApplicationKey.DYNAMICALLYFLAVORABLE, dynamicallyFlavorable);
                }

                if(!context.getClientClassLoaded(descriptor)) {
                    boolean minify = context.getMode().minify();
                    String code = getCode(minify);
                    if (!AuraTextUtil.isNullEmptyOrWhitespace(code)) {
                        json.writeMapEntry(ApplicationKey.COMPONENTCLASS, code);
                    }
                }

                if(minVersion != null) {
                    json.writeMapEntry(ApplicationKey.MINVERSION, minVersion);
                }

                serializeFields(json);
                json.writeMapEnd();

                serializationContext.setSerializing(false);
            }
        } catch (QuickFixException e) {
            throw new AuraUnhandledException("unhandled exception", e);
        }
    }


    protected abstract void serializeFields(Json json) throws IOException, QuickFixException;

    @Override
    public String getCode(boolean minify) {
        String js = null;
        if (minify) {
            js = minifiedClassCode;
        }

        if (js == null) {
            js = classCode;
        }

        if (isLockerRequired()) {
            js = convertToLocker(js);
        }

        return js;
    }
    
    /**
     * Return true if the definition is a component that needs to be locked.
     */
    private boolean isLockerRequired() {
        boolean requireLocker = false;

        ConfigAdapter configAdapter = Aura.getConfigAdapter();
        if (configAdapter.isLockerServiceEnabled()) {
            requireLocker = configAdapter.requireLocker(this);
        }

        return requireLocker;
    }

    private static final Pattern COMPONENT_CLASS_PATTERN = Pattern.compile("^\\$A\\.componentService\\.addComponentClass\\(\"([^\"]*)\",\\s*function\\s*\\(\\s*\\)\\s*\\{\\n*(.*)\\}\\);\\s*$",
            Pattern.DOTALL | Pattern.CASE_INSENSITIVE | Pattern.MULTILINE);

    public static String convertToLocker(String code) {

        if (AuraTextUtil.isNullEmptyOrWhitespace(code)) {
            return code;
        }

        Matcher matcher = COMPONENT_CLASS_PATTERN.matcher(code);

        if (!matcher.matches()) {
            return null;
        }

        String clientDescriptor = matcher.group(1);
        String objectVariable = matcher.group(2);

        return makeLockerizedClass(clientDescriptor, objectVariable);
    }

    private static String makeLockerizedClass(String clientDescriptor, String objectVariable) {

        StringBuilder out = new StringBuilder();

        out.append("$A.componentService.addComponentClass(");
        out.append('"').append(clientDescriptor).append('"');
        out.append(',');

        // Key the def so we can transfer the key to component instances
        // and escape the class objects for JavaScript strings
        out.append("function() {\n");

        out.append("  var def = $A.componentService.getDef(");
        out.append('"').append(clientDescriptor).append('"');
        out.append(");");

        out.append("  var locker = $A.lockerService.createForDef(\n\"");
        out.append(AuraTextUtil.escapeForJavascriptString(objectVariable));
        out.append("\", def);\n");

        out.append("  return locker.returnValue;\n");
        out.append("});\n");

        return out.toString();
    }
    /**
     * @see ComponentDef#getRendererDescriptor()
     */
    @Override
    public DefDescriptor<RendererDef> getRendererDescriptor() throws QuickFixException {
        if (clientRendererDef != null) {
            return clientRendererDef.getDescriptor();
        }
        // Why is it possible to return a server renderer here?
        if (rendererDescriptor != null) {
            return rendererDescriptor;
        }
        return null;
    }

    @Override
    public RendererDef getLocalRendererDef() throws QuickFixException {
        if (rendererDescriptor != null) {
            return rendererDescriptor.getDef();
        }
        return null;
    }

    /**
     * @return The primary helper def. If multiple exist, this will be the remote one.
     * @throws QuickFixException
     */
    @Override
    public HelperDef getHelperDef() throws QuickFixException {
        if (clientHelperDef != null) {
            return clientHelperDef;
        }
        if (helperDescriptor != null) {
            return helperDescriptor.getDef();
        }
        return null;
    }

    /**
     * @see ComponentDef#getModelDef()
     */
    @Override
    public ModelDef getModelDef() throws QuickFixException {
        if (modelDescriptor == null) {
            if (clientModelDef != null) {
                return clientModelDef;
            } else {
                return null;
            }
        }
        AuraContext context = Aura.getContextService().getCurrentContext();
        context.pushCallingDescriptor(descriptor);
        try {
            return modelDescriptor.getDef();
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

        if (modelDescriptor != null) {
            ret.add(modelDescriptor);
        }

        if (clientModelDef != null) {
        	ret.add(clientModelDef.getDescriptor());
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
    public String getDefaultFlavorOrImplicit() throws QuickFixException {
        if (defaultFlavor == null
                && flavoredStyle != null
                && flavoredStyle.getFlavorNames().contains("default")
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
        if (flavoredStyle != null) {
            allFlavorNames.addAll(flavoredStyle.getFlavorNames());
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
        public Double minVersion;

        public DefDescriptor<ModelDef> modelDefDescriptor;
        public DefDescriptor<T> extendsDescriptor;
        public DefDescriptor<ComponentDef> templateDefDescriptor;
        private FlavoredStyleDef flavoredStyle;
        private DefDescriptor<StyleDef> styleDefDescriptor;
        private StyleDef styleDef;
        private DesignDef designDef;
        private SVGDef svgDef;
        private ModelDef clientModelDef;
        private RendererDef clientRendererDef;
        private HelperDef clientHelperDef;
        private ControllerDef clientControllerDef;
        private ProviderDef clientProviderDef;
        public List<DefDescriptor<RendererDef>> rendererDescriptors;
        public List<DefDescriptor<HelperDef>> helperDescriptors;
        public List<AttributeDefRef> facets = Lists.newArrayList();

        public Set<DefDescriptor<InterfaceDef>> interfaces;
        public List<DefDescriptor<ControllerDef>> controllerDescriptors;
        private Map<DefDescriptor<MethodDef>, MethodDef> methodDefs;
        public Map<String, RegisterEventDef> events = Maps.newHashMap();
        public List<EventHandlerDef> eventHandlers = Lists.newArrayList();
        private List<LibraryDefRef> imports;
        public Map<String, LocatorDef> locatorDefs;

        private DefDescriptor<ModelDef> externalModelDef;
        private DefDescriptor<RendererDef> externalRendererDef;
        private DefDescriptor<ControllerDef> externalControllerDef;
        private DefDescriptor<HelperDef> externalHelperDef;
        private DefDescriptor<ProviderDef> externalProviderDef;

        public Set<PropertyReference> expressionRefs;

        public String render;
        public List<DependencyDef> dependencies;
        public List<ClientLibraryDef> clientLibraries;
        private RenderType renderType;

        private String defaultFlavor;
        private boolean hasFlavorableChild;
        private boolean dynamicallyFlavorable;
        private String classCode;
        private String minifiedClassCode;
        private boolean minifyEnabled;
        
        @Override
        public Builder<T> setFacet(String key, Object value) {
            if (facets == null) {
                facets = Lists.newArrayList();
            }
            AttributeDefRefImpl.Builder atBuilder = new AttributeDefRefImpl.Builder();
            atBuilder.setDescriptor(key);
            atBuilder.setLocation(getLocation());
            atBuilder.setValue(value);
            atBuilder.setAccess(new DefinitionAccessImpl(AuraContext.Access.PUBLIC));
            facets.add(atBuilder.build());
            return this;
        }

        @Override
        public Builder<T> addRendererDescriptor(DefDescriptor<RendererDef> descriptor) {
            if (this.rendererDescriptors == null) {
                this.rendererDescriptors = Lists.newArrayList();
            }
            this.rendererDescriptors.add(descriptor);
            return this;
        }

        @Override
        public Builder<T> addHelperDescriptor(DefDescriptor<HelperDef> helperDesc) {
            if (this.helperDescriptors == null) {
                this.helperDescriptors = Lists.newArrayList();
            }
            this.helperDescriptors.add(helperDesc);
            return this;
        }

        @Override
        public Builder<T> addControllerDescriptor(DefDescriptor<ControllerDef> controllerDesc) {
            if (this.controllerDescriptors == null) {
                this.controllerDescriptors = Lists.newArrayList();
            }
            this.controllerDescriptors.add(controllerDesc);
            return this;
        }

        @Override
        public Builder<T> addInterfaceDescriptor(DefDescriptor<InterfaceDef> interfaceDesc) {
            if (this.interfaces == null) {
                this.interfaces = Sets.newHashSet();
            }
            this.interfaces.add(interfaceDesc);
            return this;
        }

        @Override
        public Builder<T> setFlavoredStyle(FlavoredStyleDef flavoredStyle) {
            this.flavoredStyle = flavoredStyle;
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
        public Builder<T> setTemplateDef(ComponentDef templateDef) {
            this.templateDefDescriptor = templateDef.getDescriptor();
            return this;
        }

        @Override
        public Builder<T> setDesignDef(DesignDef designDef) {
            this.designDef = designDef;
            return this;
        }

        @Override
        public Builder<T> setSVGDef(SVGDef svgDef) {
            this.svgDef = svgDef;
            return this;
        }

        @Override
        public Builder<T> setTemplate(String templateName) {
            this.templateDefDescriptor = Aura.getDefinitionService().getDefDescriptor(templateName, ComponentDef.class);
            return this;
        }

        @Override
        public Builder<T> addDependency(DependencyDef dependency) {
            if (this.dependencies == null) {
                this.dependencies = new ArrayList<>();
            }
            this.dependencies.add(dependency);
            return this;
        }

        public Builder<T> addAllExpressionRefs(Collection<PropertyReference> refs) {
            if (expressionRefs == null) {
                this.expressionRefs = new HashSet<>();
            }
            expressionRefs.addAll(refs);
            return this;
        }

        @Override
        public Builder<T> setStyleDefExternal(DefDescriptor<StyleDef> styleDefDescriptor) {
            this.styleDefDescriptor = styleDefDescriptor;
            return this;
        }

        @Override
        public Builder<T> setStyleDef(StyleDef styleDef) {
            this.styleDef = styleDef;
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
        public Builder<T> addLibraryImport(LibraryDefRef library) {
            if (this.imports == null) {
                this.imports = Lists.newArrayList();
            }
            this.imports.add(library);
            return this;
        }

        @Override
        public Collection<LibraryDefRef> getLibraryImports() {
            return this.imports;
        }

        @Override
        public Builder<T> addLocatorDef(LocatorDef locator) {
            if (this.locatorDefs == null) {
                this.locatorDefs = new HashMap<>();
            }
            this.locatorDefs.put(locator.getTarget(), locator);
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

        @Override
        public Builder<T> setExtendsDescriptor(DefDescriptor<T> extendsDescriptor) {
            this.extendsDescriptor = extendsDescriptor;
            return this;
        }

        @Override
        public DefDescriptor<T> getExtendsDescriptor() {
            return this.extendsDescriptor;
        }

        @Override
        public ModelDef getClientModelDef() {
            return clientModelDef;
        }

        @Override
        public RendererDef getClientRendererDef() {
            return clientRendererDef;
        }

        @Override
        public HelperDef getClientHelperDef() {
            return clientHelperDef;
        }

        @Override
        public ControllerDef getClientControllerDef() {
            return clientControllerDef;
        }

        @Override
        public ProviderDef getClientProviderDef() {
            return clientProviderDef;
        }

        /**
         * @param clientModelDef the clientModelDef to set
         */
        @Override
        public Builder<T> setClientModelDef(ModelDef clientModelDef) {
            this.clientModelDef = clientModelDef;
            return this;
        }

        /**
         * @param clientRendererDef the clientRendererDef to set
         */
        @Override
        public Builder<T> setClientRendererDef(RendererDef clientRendererDef) {
            this.clientRendererDef = clientRendererDef;
            return this;
        }

        /**
         * @param clientHelperDef the clientHelperDef to set
         */
        @Override
        public Builder<T> setClientHelperDef(HelperDef clientHelperDef) {
            this.clientHelperDef = clientHelperDef;
            return this;
        }

        /**
         * @param clientControllerDef the clientControllerDef to set
         */
        @Override
        public Builder<T> setClientControllerDef(ControllerDef clientControllerDef) {
            this.clientControllerDef = clientControllerDef;
            return this;
        }

        /**
         * @param clientProviderDef the clientProviderDef to set
         */
        @Override
        public Builder<T> setClientProviderDef(ProviderDef clientProviderDef) {
            this.clientProviderDef = clientProviderDef;
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

        @Override
        public Builder<T> setMinifyEnabled(boolean minify) {
            minifyEnabled = minify;
            return this;
        }

        private <X extends Definition> DefDescriptor<X> checkForExternalJs(List<DefDescriptor<X>> list,
                DefDescriptor<X> clientDesc) {
            DefDescriptor<X> found = null;
            if (list == null) {
                return null;
            }
            Iterator<DefDescriptor<X>> iter = list.iterator();
            while (iter.hasNext()) {
                DefDescriptor<X> tmp = iter.next();
                if (tmp.equals(clientDesc)) {
                    iter.remove();
                } else if (tmp.getPrefix() != null && tmp.getPrefix().equals(DefDescriptor.JAVASCRIPT_PREFIX)) {
                    found = tmp;
                    iter.remove();
                }
            }
            return found;
        }

        @Override
        public void finish() {
            if (render == null) {
                this.renderType = RenderType.AUTO;
            } else {
                try {
                    this.renderType = RenderType.valueOf(render.toUpperCase());
                } catch (Exception e) {
                    setParseError(e);
                }
            }

            if (extendsDescriptor == null) {
                if (interfaces == null || !interfaces.contains(ROOT_MARKER)) {
                    extendsDescriptor = getDefaultExtendsDescriptor();
                }
            }
            if (styleDefDescriptor != null && styleDef != null) {
                if (styleDef.getDescriptor().equals(styleDefDescriptor)) {
                    styleDefDescriptor = null;
                } else {
                    styleDef = null;
                }
            }
            externalHelperDef = checkForExternalJs(helperDescriptors,
                    (clientHelperDef != null ? clientHelperDef.getDescriptor() : null));
            externalProviderDef = checkForExternalJs(providerDescriptors,
                (DefDescriptor<ProviderDef>)(clientProviderDef != null ? clientProviderDef.getDescriptor() : null));
            externalControllerDef = checkForExternalJs(controllerDescriptors,
                    (clientControllerDef != null ? clientControllerDef.getDescriptor() : null));
            //
            // Bizarre code.
            //
            if (clientRendererDef != null && rendererDescriptors != null && rendererDescriptors.size() > 0
                    && !rendererDescriptors.contains(clientRendererDef.getDescriptor())) {
                clientRendererDef = null;
            }
            externalRendererDef = checkForExternalJs(rendererDescriptors,
                    (clientRendererDef != null ? clientRendererDef.getDescriptor() : null));
            if (modelDefDescriptor != null 
                    && (clientModelDef == null || !modelDefDescriptor.equals(clientModelDef.getDescriptor()))
                    && modelDefDescriptor.getPrefix() != null
                    && modelDefDescriptor.getPrefix().equals(DefDescriptor.JAVASCRIPT_PREFIX)) {
                externalModelDef = modelDefDescriptor;
                modelDefDescriptor = null;
            }
        }

        public abstract DefDescriptor<T> getDefaultExtendsDescriptor();
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
        if (controllerDescriptor != null) {
            ret.add(controllerDescriptor);
        }
        if (externalControllerDescriptor != null) {
            ret.add(externalControllerDescriptor);
        } else if (clientControllerDef != null) {
            ret.add(clientControllerDef.getDescriptor());
        }
        if (rendererDescriptor != null) {
            ret.add(rendererDescriptor);
        }
        if (externalRendererDescriptor != null) {
            ret.add(externalRendererDescriptor);
        } else if (clientRendererDef != null) {
            ret.add(clientRendererDef.getDescriptor());
        }
        if (modelDescriptor != null) {
            ret.add(modelDescriptor);
        }
        if (externalModelDescriptor != null) {
            ret.add(externalModelDescriptor);
        } else if (clientModelDef != null) {
            ret.add(clientModelDef.getDescriptor());
        }
        if (providerDescriptor != null) {
            ret.add(providerDescriptor);
        }
        if (externalProviderDescriptor != null) {
            ret.add(externalProviderDescriptor);
        } else if(clientProviderDef != null) {
            ret.add(clientProviderDef.getDescriptor());
        }
        if (helperDescriptor != null) {
            ret.add(helperDescriptor);
        }
        if (externalHelperDescriptor != null) {
            ret.add(externalHelperDescriptor);
        } else if(clientHelperDef != null) {
            ret.add(clientHelperDef.getDescriptor());
        }
        if (styleDef != null) {
            ret.add(styleDef.getDescriptor());
        }
        if (flavoredStyle != null) {
            ret.add(flavoredStyle.getDescriptor());
        }
        if (documentationDef != null) {
            ret.add(documentationDef.getDescriptor());
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

        boolean ret = false;
        
        ret |= (clientRendererDef == null || (rendererDescriptor != null));

        // If we've gotten this far, let's check for remote providers
        if (ret) {
            ret = ret && isInConcreteAndHasLocalProvider();
        }

        // If we've gotten this far, let's check for controllers.
        if (ret) {
            ret = ret && getControllerDefDescriptors().isEmpty();
        }

        // If we've gotten this far, let's check for Styles (server rendering
        // doesn't work with styles) W-922563
        if (ret) {
            ret = ret && getStyleDef() == null;
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
                    } else if (dep.getDefType() == DefType.MODULE) {
                        // modules must be client rendered
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

    // TODO: Separate Java/JS in distinct class fields. The current system is too ambiguous.

    @Override
    public ControllerDef getRemoteControllerDef() {
        return clientControllerDef;
    }

    @Override
    public HelperDef getRemoteHelperDef() {
        return clientHelperDef;
    }

    @Override
    public RendererDef getRemoteRendererDef() {
        return clientRendererDef;
    }

    @Override
    public ProviderDef getRemoteProviderDef() {
        return clientProviderDef;
    }

    @Override
    public DefDescriptor<DesignDef> getDesignDefDescriptor() {
        return designDef != null ? designDef.getDescriptor() : null;
    }

    @Override
    public DesignDef getDesignDef() {
        return designDef;
    }

    @Override
    public SVGDef getSVGDef() {
        return svgDef;
    }

    @Override
    public DefDescriptor<SVGDef> getSVGDefDescriptor() {
        return svgDef != null ? svgDef.getDescriptor() : null;
    }

    /**
     * Define the minimum API version that a component should be at to use the current component.
     * @return Double value if set, null otherwise
     */
    @Override
    public Double getMinVersion() { return minVersion; };
}
