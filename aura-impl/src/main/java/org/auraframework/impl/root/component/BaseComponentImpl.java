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
import java.io.StringWriter;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.auraframework.Aura;
import org.auraframework.def.AttributeDef;
import org.auraframework.def.AttributeDefRef;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.ControllerDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.InterfaceDef;
import org.auraframework.def.ModelDef;
import org.auraframework.def.RendererDef;
import org.auraframework.def.RootDefinition;
import org.auraframework.def.TypeDef;
import org.auraframework.expression.PropertyReference;
import org.auraframework.impl.java.model.JavaModel;
import org.auraframework.impl.root.AttributeDefImpl;
import org.auraframework.impl.root.AttributeSetImpl;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.instance.Action;
import org.auraframework.instance.AttributeSet;
import org.auraframework.instance.BaseComponent;
import org.auraframework.instance.Component;
import org.auraframework.instance.Instance;
import org.auraframework.instance.InstanceStack;
import org.auraframework.instance.Model;
import org.auraframework.instance.ValueProvider;
import org.auraframework.instance.ValueProviderType;
import org.auraframework.service.LoggingService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.MasterDefRegistry;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.throwable.quickfix.MissingRequiredAttributeException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil;
import org.auraframework.util.json.Json;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

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
        this(descriptor, null, (Map<String, Object>) null, null, null);
        LoggingService loggingService = Aura.getLoggingService();
        loggingService.startTimer(LoggingService.TIMER_COMPONENT_CREATION);
        try {
            this.attributeSet.set(attributes);
            finishInit();
        } finally {
            loggingService.stopTimer(LoggingService.TIMER_COMPONENT_CREATION);
        }
        Aura.getContextService().getCurrentContext().getInstanceStack().popInstance(this);
    }

    @SuppressWarnings("unchecked")
    public <T extends D> BaseComponentImpl(T def, Map<String, Object> attributes) throws QuickFixException {
        this((DefDescriptor<D>) def.getDescriptor(), null, (Map<String, Object>) null, null, def);
        LoggingService loggingService = Aura.getLoggingService();
        loggingService.startTimer(LoggingService.TIMER_COMPONENT_CREATION);
        try {
            this.attributeSet.set(attributes);
            finishInit();
        } finally {
            loggingService.stopTimer(LoggingService.TIMER_COMPONENT_CREATION);
        }
        Aura.getContextService().getCurrentContext().getInstanceStack().popInstance(this);
    }

    /**
     * Constructor used to create instances for all ComponentDefRefs, which come from both the children and the facets
     * (attributes). Builds out the tree recursively, but only after all the attribute values, including facets are set.
     * 
     * @throws QuickFixException
     */
    public BaseComponentImpl(DefDescriptor<D> descriptor, Collection<AttributeDefRef> attributeDefRefs,
            BaseComponent<?, ?> attributeValueProvider, String localId) throws QuickFixException {
        this(descriptor, attributeValueProvider, null, null, null);
        LoggingService loggingService = Aura.getLoggingService();
        loggingService.startTimer(LoggingService.TIMER_COMPONENT_CREATION);
        try {
            this.attributeSet.set(attributeDefRefs);
            finishInit();
        } finally {
            loggingService.stopTimer(LoggingService.TIMER_COMPONENT_CREATION);
        }
        Aura.getContextService().getCurrentContext().getInstanceStack().popInstance(this);
        this.localId = localId;
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
        Aura.getContextService().getCurrentContext().getInstanceStack().popInstance(this);
    }

    /**
     * The base constructor that the other 2 use to initialize the object, but not he attributes. Sets all defaults for
     * attributes. Does not build out the tree recursively.
     * 
     * @param descriptor The descriptor for this component's definition
     * @param def TODO
     * @throws QuickFixException
     */
    private BaseComponentImpl(DefDescriptor<D> descriptor, BaseComponent<?, ?> attributeValueProvider,
            Map<String, Object> valueProviders, I extender, D def) throws QuickFixException {
        AuraContext context = Aura.getContextService().getCurrentContext();
        DefDescriptor<? extends RootDefinition> desc = null;

        InstanceStack instanceStack = context.getInstanceStack();
        Instance<?> parent = instanceStack.peek();

        this.descriptor = descriptor;
        this.originalDescriptor = descriptor;
        this.path = instanceStack.getPath();
        instanceStack.pushInstance(this, descriptor);

        if (def == null) {
            try {
                def = descriptor.getDef();
                if (extender == null && (def.isAbstract() || def.getLocalProviderDef() != null)) {
                    this.intfDescriptor = def.getDescriptor();
                }

                desc = descriptor;
            } catch (DefinitionNotFoundException e) {
                if (!e.getDescriptor().equals(descriptor)) {
                    throw e;
                }

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

        MasterDefRegistry defRegistry = Aura.getDefinitionService().getDefRegistry();
        if (parent != null) {
            // Insure that the parent is allowed to create an instance of this component
            defRegistry.assertAccess(parent.getDescriptor(), desc.getDef());
        }

        LoggingService loggingService = Aura.getLoggingService();
        loggingService.startTimer(LoggingService.TIMER_COMPONENT_CREATION);
        try {
            this.globalId = getNextGlobalId();

            this.attributeSet = new AttributeSetImpl(desc, attributeValueProvider, this);

            if (valueProviders != null) {
                this.valueProviders.putAll(valueProviders);
            }

            this.valueProviders.put(ValueProviderType.VIEW.getPrefix(), attributeSet);

            // def can be null if a definition not found exception was thrown for that definition. Odd.
            if (def != null) {
                ControllerDef cd = def.getControllerDef();
                if (cd != null) {
                    // Insure that this def is allowed to create an instance of the controller
                    defRegistry.assertAccess(descriptor, cd);

                    this.valueProviders.put(ValueProviderType.CONTROLLER.getPrefix(), cd);
                }
            }

            loggingService.incrementNum(LoggingService.CMP_COUNT);
        } finally {
            loggingService.stopTimer(LoggingService.TIMER_COMPONENT_CREATION);
        }
    }

    protected void finishInit() throws QuickFixException {
        AuraContext context = Aura.getContextService().getCurrentContext();

        injectComponent();
        createModel();

        context.getInstanceStack().setAttributeName("$");
        createSuper();
        context.getInstanceStack().clearAttributeName("$");

        validateAttributes();

        BaseComponentDef def = getComponentDef();

        def.retrieveLabels();

        DefDescriptor<RendererDef> rendererDesc = def.getRendererDescriptor();
        if ((rendererDesc != null && rendererDesc.getDef().isLocal())) {
            hasLocalDependencies = true;
        }
        context.registerComponent(this);
    }

    private Object findValue(String name) throws QuickFixException {
        BaseComponent<?, ?> zuper = this.getSuper();
        while (zuper != null) {
            Object val = zuper.getAttributes().getValue(name);
            if (val != null) {
                return val;
            }
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
            BaseComponentDef def = getComponentDef();

            json.writeMapBegin();
            //
            // Be very careful here. descriptor != def.getDescriptor().
            // This is 'case normalizing', as the client is actually case
            // sensitive for descriptors (ugh!).
            //
            json.writeMapEntry("componentDef", def.getDescriptor());
            if (!descriptor.equals(originalDescriptor)) {
                json.writeMapEntry("original", originalDescriptor);
            }
            json.writeMapEntry("creationPath", getPath());

            if ((attributeSet.getValueProvider() == null || hasProvidedAttributes) && !attributeSet.isEmpty()) {
                json.writeMapEntry("attributes", attributeSet);
            }

            if (def.getRendererDescriptor() != null) {
                RendererDef rendererDef = def.getRendererDescriptor().getDef();
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
        context.pushCallingDescriptor(descriptor);
        BaseComponent<?, ?> oldComponent = context.setCurrentComponent(this);
        try {
            ModelDef modelDef = getComponentDef().getModelDef();
            if (modelDef != null) {
                Aura.getDefinitionService().getDefRegistry().assertAccess(descriptor, modelDef);

                model = modelDef.newInstance();
                if (modelDef.hasMembers()) {
                    hasLocalDependencies = true;
                    valueProviders.put(ValueProviderType.MODEL.getPrefix(), model);
                }
            }
        } finally {
            context.setCurrentComponent(oldComponent);
            context.popCallingDescriptor();
        }
    }

    /**
     * @return the next id to use, the ordering must match exactly what is generated client side
     */
    private static String getNextGlobalId() {
        AuraContext context = Aura.getContextService().getCurrentContext();
        String num = Aura.getContextService().getCurrentContext().getNum();
        Action action = context.getCurrentAction();
        int id;
        String suffix;
        if (action != null) {
            id = action.getInstanceStack().getNextId();
            suffix = action.getId();
        } else {
            id = context.getNextId();
            suffix = num;
        }

        String globalId = String.valueOf(id);
        if (suffix != null) {
            globalId = String.format("%s:%s", globalId, suffix);
        }

        return globalId;
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
            if ("c".equals(prefix)) {
                prefix.toString();
            }
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
                        return ((ValueProvider) root).getValue(stem);
                    } else {
                        return JavaModel.getValue(root, stem, null);
                        // no throw error at runtime even though expression
                        // reference nothing
                        // return null;
                    }
                } else {
                    // they asked for just the root.
                    // TODO: this should only work for foreach, shouldn't be
                    // able to {!m}
                    return root;
                }
            }
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

    @Override
    public String getPath() {
        return path;
    }

    static private DefDescriptor<TypeDef> componentArrType;

    @Override
    public void reinitializeModel() throws QuickFixException {
        //
        // This is a visitor pattern, implemented here with a hardwire.
        //
        BaseComponentDef def = descriptor.getDef();
        if (componentArrType == null) {
            componentArrType = Aura.getDefinitionService().getDefDescriptor("aura://Aura.Component[]", TypeDef.class);
        }

        createModel();

        I zuper = getSuper();
        if (zuper != null) {
            zuper.reinitializeModel();
        }
        //
        // Walk all attributes, pushing the reinitialize model in to those as well.
        //
        for (Map.Entry<DefDescriptor<AttributeDef>, AttributeDef> foo : def.getAttributeDefs().entrySet()) {
            AttributeDef attr = foo.getValue();
            DefDescriptor<?> typeDesc;
            if (attr instanceof AttributeDefImpl) {
                AttributeDefImpl attri = (AttributeDefImpl) attr;
                typeDesc = attri.getTypeDesc();
            } else {
                // bad.
                typeDesc = attr.getTypeDef().getDescriptor();
            }
            if (componentArrType.equals(typeDesc)) {
                Object val = getAttributes().getValue(foo.getKey().getName());
                if (val instanceof List) {
                    @SuppressWarnings("unchecked")
                    List<BaseComponent<?, ?>> facet = (List<BaseComponent<?, ?>>) val;
                    for (BaseComponent<?, ?> c : facet) {
                        c.reinitializeModel();
                    }
                }
            }
        }
    }

    protected final DefDescriptor<D> originalDescriptor;
    protected DefDescriptor<D> descriptor;
    protected DefDescriptor<? extends RootDefinition> intfDescriptor;
    private final String globalId;
    private final String path;
    protected String localId;
    protected final AttributeSet attributeSet;
    private Model model;
    protected I superComponent;
    protected I concreteComponent;
    protected boolean remoteProvider = false;
    private final Map<String, List<String>> index = Maps.newLinkedHashMap();
    // FIXME - the values should be ValueProviders, but first we need to wrap non-m/v/c providers.
    protected final Map<String, Object> valueProviders = new LinkedHashMap<String, Object>();
    protected boolean hasLocalDependencies = false;
    protected boolean hasProvidedAttributes;
}
