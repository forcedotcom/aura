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
import org.auraframework.def.ComponentDefRefArray;
import org.auraframework.def.ControllerDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.JavaModelDef;
import org.auraframework.def.ModelDef;
import org.auraframework.def.RendererDef;
import org.auraframework.def.RootDefinition;
import org.auraframework.def.TypeDef;
import org.auraframework.expression.PropertyReference;
import org.auraframework.impl.java.model.JavaModel;
import org.auraframework.impl.root.AttributeDefImpl;
import org.auraframework.impl.root.AttributeSetImpl;
import org.auraframework.impl.system.RenderContextImpl;
import org.auraframework.instance.Action;
import org.auraframework.instance.AttributeSet;
import org.auraframework.instance.AuraValueProviderType;
import org.auraframework.instance.BaseComponent;
import org.auraframework.instance.Component;
import org.auraframework.instance.Instance;
import org.auraframework.instance.InstanceStack;
import org.auraframework.instance.Model;
import org.auraframework.instance.RendererInstance;
import org.auraframework.instance.ValueProvider;
import org.auraframework.service.ContextService;
import org.auraframework.service.ConverterService;
import org.auraframework.service.DefinitionService;
import org.auraframework.service.InstanceService;
import org.auraframework.service.LoggingService;
import org.auraframework.system.AuraContext;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.MissingRequiredAttributeException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil;
import org.auraframework.util.json.Json;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

public abstract class BaseComponentImpl<D extends BaseComponentDef, I extends BaseComponent<D, I>> implements
BaseComponent<D, I> {

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
    protected final Map<String, Object> valueProviders = new LinkedHashMap<>();
    protected boolean hasLocalDependencies = false;
    protected boolean hasProvidedAttributes;
    protected final LoggingService loggingService;
    protected final ContextService contextService;
    protected final DefinitionService definitionService;
    protected final ConverterService converterService;

    private final InstanceService instanceService;

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
        loggingService.startTimer(LoggingService.TIMER_COMPONENT_CREATION);
        try {
            this.attributeSet.set(attributes);
            finishInit();
        } finally {
            loggingService.stopTimer(LoggingService.TIMER_COMPONENT_CREATION);
        }
        contextService.getCurrentContext().getInstanceStack().popInstance(this);
    }

    @SuppressWarnings("unchecked")
    public <T extends D> BaseComponentImpl(T def, Map<String, Object> attributes) throws QuickFixException {
        this((DefDescriptor<D>) def.getDescriptor(), null, (Map<String, Object>) null, null, def);
        loggingService.startTimer(LoggingService.TIMER_COMPONENT_CREATION);
        try {
            this.attributeSet.set(attributes);
            finishInit();
        } finally {
            loggingService.stopTimer(LoggingService.TIMER_COMPONENT_CREATION);
        }
        contextService.getCurrentContext().getInstanceStack().popInstance(this);
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
        loggingService.startTimer(LoggingService.TIMER_COMPONENT_CREATION);
        try {
            this.attributeSet.set(attributeDefRefs);
            finishInit();
        } finally {
            loggingService.stopTimer(LoggingService.TIMER_COMPONENT_CREATION);
        }
        contextService.getCurrentContext().getInstanceStack().popInstance(this);
        this.localId = localId;
    }

    /**
     * For creating supers
     *
     * @throws QuickFixException
     */
    protected BaseComponentImpl(DefDescriptor<D> descriptor, I extender, BaseComponent<?, ?> attributeValueProvider, I concreteComponent) throws QuickFixException {
        this(descriptor, attributeValueProvider, null, extender, null);
        loggingService.startTimer(LoggingService.TIMER_COMPONENT_CREATION);
        try {
            this.concreteComponent = concreteComponent;
            attributeSet.set(extender.getDescriptor().getDef().getFacets(), extender.getAttributes());
            finishInit();
        } finally {
            loggingService.stopTimer(LoggingService.TIMER_COMPONENT_CREATION);
        }
        contextService.getCurrentContext().getInstanceStack().popInstance(this);
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

        this.contextService = Aura.getContextService();
        this.definitionService = Aura.getDefinitionService();
        this.converterService = Aura.getConverterService();
        this.loggingService = Aura.getLoggingService();
        this.instanceService = Aura.getInstanceService();

        AuraContext context = contextService.getCurrentContext();
        DefDescriptor<? extends RootDefinition> desc = null;

        InstanceStack instanceStack = context.getInstanceStack();
        Instance<?> accessParent = instanceStack.getAccess();

        this.descriptor = descriptor;
        this.originalDescriptor = descriptor;
        this.path = instanceStack.getPath();
        instanceStack.pushInstance(this, descriptor);

        if (def == null) {
            def = definitionService.getDefinition(descriptor);
        }
        desc = descriptor;
        if (extender == null && def.isAbstract() && def.getProviderDescriptor() == null) {
            throw new InvalidDefinitionException(String.format("%s cannot be instantiated directly.",
                    descriptor), def.getLocation());
        }
        if (extender == null && (def.isAbstract() || def.getLocalProviderDef() != null)) {
            this.intfDescriptor = def.getDescriptor();
        }

        if (accessParent != null) {
            // Insure that the access 'Parent' is allowed to create an instance of this component
            definitionService.assertAccess(accessParent.getDescriptor(), desc);
        }

        loggingService.startTimer(LoggingService.TIMER_COMPONENT_CREATION);
        try {
            this.globalId = getNextGlobalId();

            this.attributeSet = new AttributeSetImpl(desc, attributeValueProvider, this);

            if (valueProviders != null) {
                this.valueProviders.putAll(valueProviders);
            }

            this.valueProviders.put(AuraValueProviderType.VIEW.getPrefix(), attributeSet);

            // def can be null if a definition not found exception was thrown for that definition. Odd.
            if (def != null) {
                ControllerDef cd = def.getLocalControllerDef();
                if (cd != null) {
                    // Insure that this def is allowed to create an instance of the controller
                    definitionService.assertAccess(descriptor, cd);

                    this.valueProviders.put(AuraValueProviderType.CONTROLLER.getPrefix(), cd);
                }
            }

            loggingService.incrementNum(LoggingService.CMP_COUNT);
        } finally {
            loggingService.stopTimer(LoggingService.TIMER_COMPONENT_CREATION);
        }
    }

    @Override
    public BaseComponent<D, I> getConcreteComponent() {
        if (this.concreteComponent != null) {
            return this.concreteComponent;
        }
        return this;
    }

    @Override
    public boolean isConcreteComponent() {
        return this.concreteComponent == null || this.concreteComponent == this;
    }

    protected void finishInit() throws QuickFixException {
        AuraContext context = contextService.getCurrentContext();

        injectComponent();
        createModel();

        context.getInstanceStack().setAttributeName("$");
        createSuper();
        context.getInstanceStack().clearAttributeName("$");

        validateAttributes();

        BaseComponentDef def = getComponentDef();

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
                    DefDescriptor<?> desc = attributeSet.getRootDefDescriptor();
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

    @Override
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
        AuraContext context = contextService.getCurrentContext();
        BaseComponent<?, ?> oldComponent = context.setCurrentComponent(this);

        try {
            BaseComponentDef def = getComponentDef();

            json.writeMapBegin();
            //
            // Be very careful here. descriptor != def.getDescriptor().
            // This is 'case normalizing', as the client is actually case
            // sensitive for descriptors (ugh!).
            //
            json.writeMapKey("componentDef");
        	json.writeMapBegin();
        	json.writeMapEntry("descriptor", def.getDescriptor());
        	json.writeMapEnd();

            if (!descriptor.equals(originalDescriptor)) {
                json.writeMapEntry("original", originalDescriptor);
            }
            json.writeMapEntry("creationPath", getPath());

            if ((attributeSet.getValueProvider() == null || hasProvidedAttributes) && !attributeSet.isEmpty()) {
                json.writeMapEntry("attributes", attributeSet);
            }

            if (def.getAPIVersion() != null  &&
                Aura.getConfigAdapter().isInternalNamespace(def.getDescriptor().getNamespace()) &&
                context.getCurrentCallingDescriptor() == null) {
            	json.writeMapEntry("version", def.getAPIVersion());
            }

            if (def.getRendererDescriptor() != null) {
                RendererDef rendererDef = def.getRendererDescriptor().getDef();
                if (rendererDef.isLocal()) {
                    StringWriter sw = new StringWriter();
                    StringWriter garbage = new StringWriter();
                    RendererInstance renderer = Aura.getInstanceService().getInstance(rendererDef);
                    renderer.render(this, new RenderContextImpl(sw, garbage));
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
        AuraContext context = contextService.getCurrentContext();
        context.pushCallingDescriptor(descriptor);
        BaseComponent<?, ?> oldComponent = context.setCurrentComponent(this);
        try {
            ModelDef modelDef = getComponentDef().getModelDef();
            if (modelDef != null) {
                definitionService.assertAccess(descriptor, modelDef);

                if (modelDef instanceof JavaModelDef) {
                    model = instanceService.getInstance(modelDef);
                } else {
                model = modelDef.newInstance();
                }

                if (modelDef.hasMembers()) {
                    hasLocalDependencies = true;
                    valueProviders.put(AuraValueProviderType.MODEL.getPrefix(), model);
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
    private String getNextGlobalId() {
        AuraContext context = contextService.getCurrentContext();
        String num = context.getNum();
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
        AuraContext context = contextService.getCurrentContext();
        BaseComponent<?, ?> oldComponent = context.setCurrentComponent(this);
        try {
            String prefix = expr.getRoot();
            if ("c".equals(prefix)) {
                prefix.toString();
            }
            PropertyReference stem = expr.getStem();

            Object root = valueProviders.get(prefix);
            if (root == null) {
                root = context.getGlobalProviders().get(prefix);
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
    static private DefDescriptor<TypeDef> componentDefRefArrayType;

    @Override
    public void reinitializeModel() throws QuickFixException {
        //
        // This is a visitor pattern, implemented here with a hardwire.
        //
        BaseComponentDef def = descriptor.getDef();
        if (componentArrType == null) {
            componentArrType = definitionService.getDefDescriptor("aura://Aura.Component[]", TypeDef.class);
        }

        if(componentDefRefArrayType == null) {
            componentDefRefArrayType = definitionService.getDefDescriptor("aura://Aura.ComponentDefRef[]", TypeDef.class);
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
            else if (componentDefRefArrayType.equals(typeDesc)) {
                ComponentDefRefArray val = getAttributes().getValue(foo.getKey().getName(), ComponentDefRefArray.class);
                if (val != null) {
                    //@SuppressWarnings("unchecked")
                    //List<BaseComponent<?, ?>> facet = (List<BaseComponent<?, ?>>) val;
                    for (Object c : val.getList()) {
                        if(c instanceof BaseComponent) {
                            ((BaseComponent<?, ?>)c).reinitializeModel();
                        }
                    }
                }
            }

        }
    }

}
