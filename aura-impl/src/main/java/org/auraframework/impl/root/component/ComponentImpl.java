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

import java.util.Collection;
import java.util.Map;

import org.auraframework.Aura;
import org.auraframework.def.AttributeDefRef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.ControllerDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.ProviderDef;
import org.auraframework.def.RootDefinition;
import org.auraframework.instance.BaseComponent;
import org.auraframework.instance.Component;
import org.auraframework.instance.ComponentConfig;
import org.auraframework.instance.ValueProviderType;
import org.auraframework.system.AuraContext;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json.Serialization;
import org.auraframework.util.json.Json.Serialization.ReferenceType;

/**
 * The real runtime component thing that sits in the tree. The Component
 * interface is just what is exposed to models
 */
@Serialization(referenceType = ReferenceType.IDENTITY)
public final class ComponentImpl extends BaseComponentImpl<ComponentDef, Component> implements Component {

    public ComponentImpl(DefDescriptor<ComponentDef> descriptor, Map<String, Object> attributes)
            throws QuickFixException {
        super(descriptor, attributes);
    }

    public ComponentImpl(DefDescriptor<ComponentDef> descriptor, Collection<AttributeDefRef> attributeDefRefs,
            BaseComponent<?, ?> attributeValueProvider, String localId) throws QuickFixException {
        super(descriptor, attributeDefRefs, attributeValueProvider, localId);
    }

    @Override
    protected void createSuper() throws QuickFixException {
        ComponentDef def = getComponentDef();
        if (!remoteProvider) {
            DefDescriptor<ComponentDef> superDefDescriptor = def.getExtendsDescriptor();
            if (superDefDescriptor != null) {
            	Aura.getDefinitionService().getDefRegistry().assertAccess(descriptor, superDefDescriptor.getDef());
            	
                Component concrete = concreteComponent == null ? this : concreteComponent;
                superComponent = new ComponentImpl(superDefDescriptor, this, this, concrete);
            }
        }
    }

    // FIXME - move to builder
    @Override
    protected void injectComponent() throws QuickFixException {
        if (this.intfDescriptor != null) {
            AuraContext context = Aura.getContextService().getCurrentContext();
            context.pushCallingDescriptor(descriptor);
            BaseComponent<?, ?> oldComponent = context.setCurrentComponent(new ProtoComponentImpl(descriptor,
                    getGlobalId(), attributeSet));
            try {
                RootDefinition root = intfDescriptor.getDef();
                ProviderDef providerDef = root.getLocalProviderDef();
                if (providerDef == null) {
                    providerDef = root.getProviderDef();
                    if (providerDef != null) {
                        // In this case, we have a 'remote' provider (i.e. client side) and we simply
                        // continue on as if nothing happened.
                    } else {
                    	throw new InvalidDefinitionException(String.format("%s cannot be instantiated directly.",
                            descriptor), root.getLocation());
                    }
                } 

                if (providerDef.isLocal()) {
                    ComponentConfig config = providerDef.provide(intfDescriptor);
                    if (config != null) {
                        ProviderDef remoteProviderDef = root.getProviderDef();
                        if (remoteProviderDef == null || remoteProviderDef.isLocal()) {
                            hasLocalDependencies = true;
                        }

                        DefDescriptor<ComponentDef> d = config.getDescriptor();
                        if (d != null) {
                            descriptor = d;
                        }

                        try {
                            if (descriptor.getDefType() != DefType.COMPONENT) {
                                throw new AuraRuntimeException(String.format("%s is not a component", descriptor));
                            }

                            ComponentDef c = descriptor.getDef();
                            if (c.isAbstract()) {
                                throw new AuraRuntimeException(String.format("%s cannot be instantiated directly.",
                                        descriptor));
                            }
                            
                            // new component may have its own controllerdef so add that one
                            ControllerDef cd = c.getControllerDef();
                            if (cd != null) {
                                this.valueProviders.put(ValueProviderType.CONTROLLER.getPrefix(), cd);
                            }
                        } catch (DefinitionNotFoundException dnfe) {
                            throw new AuraRuntimeException(String.format("%s did not provide a valid component",
                                    providerDef.getDescriptor()), dnfe);
                        }

                        attributeSet.setRootDefDescriptor(descriptor);

                        Map<String, Object> providedAttributes = config.getAttributes();
                        if (providedAttributes != null) {
                            // if there is a remote provider and attributes were
                            // set, we assume/pray the remote provider does too
                            hasProvidedAttributes = true;
                            attributeSet.startTrackingDirtyValues();
                            attributeSet.set(providedAttributes);
                        }
                    }

                } else {
                    remoteProvider = true;
                }

            } finally {
                context.popCallingDescriptor();
                context.setCurrentComponent(oldComponent);
            }
        }
    }

    @Override
    protected void finishInit() throws QuickFixException {

        if (concreteComponent == null) {
            BaseComponent<?, ?> attributeValueProvider = attributeSet.getValueProvider();
            if (attributeValueProvider != null) {
                attributeValueProvider.index(this);
            }
        }

        super.finishInit();
    }

    private ComponentImpl(DefDescriptor<ComponentDef> descriptor, Component extender,
            BaseComponent<?, ?> attributeValueProvider, Component concreteComponent) throws QuickFixException {
        super(descriptor, extender, attributeValueProvider, concreteComponent);
    }
}
