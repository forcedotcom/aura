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
import java.io.StringWriter;
import java.util.*;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

import org.auraframework.Aura;
import org.auraframework.def.*;
import org.auraframework.expression.PropertyReference;
import org.auraframework.impl.java.model.JavaModel;
import org.auraframework.impl.root.AttributeSetImpl;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.instance.*;
import org.auraframework.service.LoggingService;
import org.auraframework.system.AuraContext;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.MissingRequiredAttributeException;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil;
import org.auraframework.util.json.Json;

public abstract class BaseComponentImpl<D extends BaseComponentDef, I extends BaseComponent<D, I>> implements
        BaseComponent<D, I> {
    /**
     * Top level component instance with attributes passed in. Builds out the tree recursively, but only after the
     * attribute values are all set.
     *
     * @param descriptor
     * @param attributes
     * @throws QuickFixException
     */
    public BaseComponentImpl(DefDescriptor<D> descriptor, Map<String, Object> attributes) throws QuickFixException {
        this(descriptor, null, (Map<String, Object>)null, null, null);
        LoggingService loggingService = Aura.getLoggingService();
        loggingService.startTimer(LoggingService.TIMER_COMPONENT_CREATION);
        try {
            this.attributeSet.set(attributes);
            finishInit();
        } finally {
            loggingService.stopTimer(LoggingService.TIMER_COMPONENT_CREATION);
        }
    }

    @SuppressWarnings("unchecked")
    public <T extends D> BaseComponentImpl(T def, Map<String, Object> attributes) throws QuickFixException {
        this((DefDescriptor<D>)def.getDescriptor(), null, (Map<String, Object>)null, null, def);
        LoggingService loggingService = Aura.getLoggingService();
        loggingService.startTimer(LoggingService.TIMER_COMPONENT_CREATION);
        try {
            this.attributeSet.set(attributes);
            finishInit();
        } finally {
            loggingService.stopTimer(LoggingService.TIMER_COMPONENT_CREATION);
        }
    }

    /**
     * Constructor used to create instances for all ComponentDefRefs, which come from both the children and the facets
     * (attributes). Builds out the tree recursively, but only after all the attribute values, including facets are set.
     *
     * @throws QuickFixException
     */
    public BaseComponentImpl(DefDescriptor<D> descriptor, Collection<AttributeDefRef> attributeDefRefs,
            BaseComponent<?, ?> attributeValueProvider, String localId) throws QuickFixException {
        this(descriptor, attributeDefRefs, attributeValueProvider, null, null);
        this.localId = localId;
    }

    public BaseComponentImpl(DefDescriptor<D> descriptor, Collection<AttributeDefRef> attributeDefRefs,
            BaseComponent<?, ?> attributeValueProvider, Map<String, Object> valueProviders,
            ValueProvider delegateValueProvider) throws QuickFixException {
        this(descriptor, attributeValueProvider, valueProviders, null, null);
        LoggingService loggingService = Aura.getLoggingService();
        loggingService.startTimer(LoggingService.TIMER_COMPONENT_CREATION);
        try {
            this.attributeSet.set(attributeDefRefs);
            this.delegateValueProvider = delegateValueProvider;
            if (delegateValueProvider != null) {
                this.valueProviders.remove(ValueProviderType.VIEW.getPrefix());
            }
            finishInit();
        } finally {
            loggingService.stopTimer(LoggingService.TIMER_COMPONENT_CREATION);
        }
    }

    /**
     * For creating supers
     *
     * @throws QuickFixException
     */
    protected BaseComponentImpl(DefDescriptor<D> descriptor, I extender, BaseComponent<?, ?> attributeValueProvider,
            I concreteComponent) throws QuickFixException {
        this(descriptor, attributeValueProvider, null, extender, null);
        LoggingService loggingService = Aura.getLoggingService();
        loggingService.startTimer(LoggingService.TIMER_COMPONENT_CREATION);
        try {
            this.concreteComponent = concreteComponent;
            attributeSet.set(extender.getDescriptor().getDef().getFacets(), extender.getAttributes());
            finishInit();
        } finally {
            loggingService.stopTimer(LoggingService.TIMER_COMPONENT_CREATION);
        }
    }

    /**
     * The base constructor that the other 2 use to initialize the object, but not he attributes. Sets all defaults for
     * attributes. Does not build out the tree recursively.
     *
     * @param descriptor
     *            The descriptor for this component's definition
     * @param def
     *            TODO
     * @throws QuickFixException
     */
    private BaseComponentImpl(DefDescriptor<D> descriptor, BaseComponent<?, ?> attributeValueProvider,
            Map<String, Object> valueProviders, I extender, D def) throws QuickFixException {

        DefDescriptor<? extends RootDefinition> desc = null;
        this.descriptor = descriptor;

        if (def == null) {
            try {
                def = descriptor.getDef();
                if (extender == null && (def.isAbstract() || def.getLocalProviderDef() != null)) {
                    this.intfDescriptor = def.getDescriptor();
                }
                desc = descriptor;
            } catch (DefinitionNotFoundException e) {
                if (!e.getDescriptor().equals(descriptor)) { throw e; }
                DefDescriptor<InterfaceDef> intfDescriptor = DefDescriptorImpl.getInstance(
                        descriptor.getQualifiedName(), InterfaceDef.class);
                InterfaceDef intfDef = intfDescriptor.getDef();
                if (intfDef != null) {
                    this.intfDescriptor = intfDescriptor;
                    desc = intfDescriptor;
                } else {
                    // def not found
                    throw new DefinitionNotFoundException(descriptor);
                }
            }
        } else {
            desc = descriptor;
        }

        LoggingService loggingService = Aura.getLoggingService();
        loggingService.startTimer(LoggingService.TIMER_COMPONENT_CREATION);
        try {
            this.globalId = getNextGlobalId();

            this.attributeSet = new AttributeSetImpl(desc, attributeValueProvider);

            if (valueProviders != null) {
                this.valueProviders.putAll(valueProviders);
            }
            this.valueProviders.put(ValueProviderType.VIEW.getPrefix(), attributeSet);

            loggingService.incrementNum(LoggingService.CMP_COUNT);
        } finally {
            loggingService.stopTimer(LoggingService.TIMER_COMPONENT_CREATION);
        }
    }

    protected void finishInit() throws QuickFixException {
        injectComponent();
        createModel();
        createSuper();
        validateAttributes();
        getComponentDef().retrieveLabels();
        AuraContext context = Aura.getContextService().getCurrentContext();

        DefDescriptor<RendererDef> rendererDesc = getComponentDef().getRendererDescriptor();
        if ((rendererDesc != null && rendererDesc.getDef().isLocal())
            || !context.isPreloaded(getDescriptor())) {
            hasLocalDependencies = true;
        }

        context.registerComponent(this);
    }

    private Object findValue(String name) throws QuickFixException {
        BaseComponent<?, ?> zuper = this.getSuper();
        while (zuper != null) {
            Object val = zuper.getAttributes().getValue(name);
            if (val != null) { return val; }
            zuper = zuper.getSuper();
        }
        return null;
    }

    private void validateAttributes() throws QuickFixException {
        Set<AttributeDef> missingAttributes = attributeSet.getMissingAttributes();
        if (missingAttributes != null && !missingAttributes.isEmpty()) {
            for (AttributeDef attr : missingAttributes) {
                if (this.findValue(attr.getName()) == null) {
                    DefDescriptor<? extends RootDefinition> desc = attributeSet.getRootDefDescriptor();
                    if (attributeSet.getValueProvider() != null) {
                        desc = attributeSet.getValueProvider().getDescriptor();
                    }
                    throw new MissingRequiredAttributeException(desc, attr.getName(), attr.getLocation());
                }
            }
        }
    }

    protected abstract void createSuper() throws DefinitionNotFoundException, QuickFixException;

    protected abstract void injectComponent() throws QuickFixException;

    public D getComponentDef() throws QuickFixException {
        return descriptor.getDef();
    }

    @Override
    public DefDescriptor<D> getDescriptor() {
        return descriptor;
    }

    @Override
    public String getGlobalId() {
        return globalId;
    }

    @Override
    public String getLocalId() {
        return localId;
    }

    /**
     * @return All of the Attributes for this Component
     */
    @Override
    public AttributeSet getAttributes() {
        return attributeSet;
    }

    /**
     * this is only to serialize the general shape and ids, to ensure that we generate the same stuff in the client
     */
    @Override
    public void serialize(Json json) throws IOException {
        AuraContext context = Aura.getContextService().getCurrentContext();
        BaseComponent<?, ?> oldComponent = context.setCurrentComponent(this);
        try {
            json.writeMapBegin();
            json.writeMapEntry("componentDef", getComponentDef());
            json.writeMapEntry("globalId", getGlobalId());

            if ((attributeSet.getValueProvider() == null || hasProvidedAttributes) && !attributeSet.isEmpty()) {
                json.writeMapEntry("attributes", attributeSet);
            }

            if (getComponentDef().getRendererDescriptor() != null) {
                RendererDef rendererDef = getComponentDef().getRendererDescriptor().getDef();
                if (rendererDef.isLocal()) {
                    StringWriter sw = new StringWriter();
                    rendererDef.render(this, sw);
                    // Not writing directly to json.appendable because then it wouldn't get escaped.
                    // ideally Json would have a FilterWriter that escapes that we could use here.
                    json.writeMapEntry("rendering", sw.toString());
                }
            }

            if (model != null && model.getDescriptor().getDef().hasMembers()) {
                json.writeMapEntry("model", model);
            }

            json.writeMapEnd();
        } catch (QuickFixException e) {
            throw new AuraRuntimeException(e);
        } finally {
            context.setCurrentComponent(oldComponent);
        }
    }

    /**
     * @see java.lang.Object#toString()
     */
    @Override
    public String toString() {
        return String.format("%s {%s}", descriptor.toString(), getGlobalId());
    }

    /**
     * instantiates the model
     *
     * @throws QuickFixException
     */
    private void createModel() throws QuickFixException {
        AuraContext context = Aura.getContextService().getCurrentContext();
        context.setCurrentNamespace(descriptor.getNamespace());
        BaseComponent<?, ?> oldComponent = context.setCurrentComponent(this);
        try {
            ModelDef modelDef = getComponentDef().getModelDef();
            if (modelDef != null) {
                model = modelDef.newInstance();
                if (modelDef.hasMembers()) {
                    hasLocalDependencies = true;
                    valueProviders.put(ValueProviderType.MODEL.getPrefix(), model);
                }
            }
        } finally {
            context.setCurrentComponent(oldComponent);
        }
    }

    /**
     * @return the next id to use, the ordering must match exactly what is generated client side
     */
    private static String getNextGlobalId() {
        AuraContext context = Aura.getContextService().getCurrentContext();
        Integer i = context.getNextId();
        String num = Aura.getContextService().getCurrentContext().getNum();
        String suffix = num == null ? "" : ":" + num;
        return i.toString() + suffix;
    }

    @Override
    public boolean hasLocalDependencies() {
        return hasLocalDependencies;
    }

    @Override
    public Object getValue(PropertyReference expr) throws QuickFixException {
        AuraContext context = Aura.getContextService().getCurrentContext();
        BaseComponent<?, ?> oldComponent = context.setCurrentComponent(this);
        try {
            String prefix = expr.getRoot();
            PropertyReference stem = expr.getStem();

            Object root = valueProviders.get(prefix);
            if (root == null) {
                ValueProviderType vpt = ValueProviderType.getTypeByPrefix(prefix);
                if (vpt != null) {
                    root = context.getGlobalProviders().get(vpt);
                }
            }
            if (root != null) {
                if (stem != null) {
                    if (root instanceof ValueProvider) {
                        return ((ValueProvider)root).getValue(stem);
                    } else {
                        return JavaModel.getValue(root, stem, null);
                        // no throw error at runtime even though expression reference nothing
                        // return null;
                    }
                } else {
                    // they asked for just the root.
                    // TODO: this should only work for foreach, shouldn't be able to {!m}
                    return root;
                }
            }
            // try the delegate
            if (delegateValueProvider != null) { return delegateValueProvider.getValue(expr); }
            return null;
        } finally {
            context.setCurrentComponent(oldComponent);
        }
    }

    @Override
    public void index(Component component) {
        String id = component.getLocalId();
        if (!AuraTextUtil.isNullEmptyOrWhitespace(id)) {
            List<String> globalIds = index.get(id);
            if (globalIds == null) {
                globalIds = Lists.newArrayList();
                index.put(id, globalIds);
            }
            globalIds.add(component.getGlobalId());
        }
    }

    @Override
    public I getSuper() {
        return superComponent;
    }

    @Override
    public Model getModel() {
        return model;
    }

    protected DefDescriptor<D> descriptor;
    protected DefDescriptor<? extends RootDefinition> intfDescriptor;
    private final String globalId;
    protected String localId;
    protected final AttributeSet attributeSet;
    private Model model;
    private ValueProvider delegateValueProvider;
    protected I superComponent;
    protected I concreteComponent;
    protected boolean remoteProvider = false;
    private final Map<String, List<String>> index = Maps.newLinkedHashMap();
    private final Map<String, Object> valueProviders = new LinkedHashMap<String, Object>(); // FIXME - the keys should
                                                                                            // be ValueProviders, but
                                                                                            // first we need to wrap
                                                                                            // non-m/v/c providers.
    protected boolean hasLocalDependencies = false;
    protected boolean hasProvidedAttributes;
}
