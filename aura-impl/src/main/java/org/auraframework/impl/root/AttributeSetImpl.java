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
package org.auraframework.impl.root;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import org.auraframework.Aura;
import org.auraframework.def.AttributeDef;
import org.auraframework.def.AttributeDefRef;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.def.EventHandlerDef;
import org.auraframework.def.RegisterEventDef;
import org.auraframework.def.RootDefinition;
import org.auraframework.def.TypeDef;
import org.auraframework.expression.Expression;
import org.auraframework.expression.FunctionCall;
import org.auraframework.expression.PropertyReference;
import org.auraframework.impl.expression.PropertyReferenceImpl;
import org.auraframework.impl.root.event.EventHandlerImpl;
import org.auraframework.impl.type.ComponentArrayTypeDef;
import org.auraframework.impl.type.ComponentTypeDef;
import org.auraframework.impl.util.AuraUtil;
import org.auraframework.instance.Attribute;
import org.auraframework.instance.AttributeSet;
import org.auraframework.instance.BaseComponent;
import org.auraframework.instance.EventHandler;
import org.auraframework.instance.Instance;
import org.auraframework.instance.InstanceStack;
import org.auraframework.instance.ValueProvider;
import org.auraframework.instance.Wrapper;
import org.auraframework.system.Location;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.AuraUnhandledException;
import org.auraframework.throwable.NoAccessException;
import org.auraframework.throwable.quickfix.AttributeNotFoundException;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.InvalidExpressionException;
import org.auraframework.throwable.quickfix.MissingRequiredAttributeException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;
import org.auraframework.util.json.Serialization;
import org.auraframework.util.json.Serialization.ReferenceType;

import java.io.IOException;
import java.util.Collection;
import java.util.Collections;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 */
@Serialization(referenceType = ReferenceType.IDENTITY)
public class AttributeSetImpl implements AttributeSet {
    private static final Location SUPER_PASSTHROUGH = AuraUtil.getExternalLocation("super component attribute passthrough");

    // Immutable? I think not.
    private DefDescriptor<? extends RootDefinition> rootDefDescriptor;
    private boolean trackDirty = false;
    
    private final Map<DefDescriptor<AttributeDef>, Attribute> attributes = Maps.newHashMap();
    private final Map<DefDescriptor<EventHandlerDef>, EventHandler> events = Maps.newHashMap();
    private final BaseComponent<?, ?> valueProvider;
    private final Instance<?> parent;

    public AttributeSetImpl(DefDescriptor<? extends RootDefinition> componentDefDescriptor,
            BaseComponent<?, ?> valueProvider, Instance<?> parent) throws QuickFixException {
        this.rootDefDescriptor = componentDefDescriptor;
        this.valueProvider = valueProvider;
        this.parent = parent;
    }

    @Override
    public void setRootDefDescriptor(DefDescriptor<? extends RootDefinition> descriptor) throws QuickFixException {
        rootDefDescriptor = descriptor;
        setDefaults();
    }

    @Override
    public DefDescriptor<? extends RootDefinition> getRootDefDescriptor() throws QuickFixException {
        return rootDefDescriptor;
    }

    @Override
    public void setDefaults() throws QuickFixException {
        final Map<DefDescriptor<AttributeDef>, AttributeDef> attrs = rootDefDescriptor.getDef().getAttributeDefs();
        
        // See if the parent is a ComponentDef. (Could also be an EventDev).
        BaseComponent<?, ?> facetValueProvider = null;
        if(parent instanceof BaseComponent<?, ?>) {
        	facetValueProvider = (BaseComponent<?, ?>)parent;
        }

        for (Map.Entry<DefDescriptor<AttributeDef>, AttributeDef> attr : attrs.entrySet()) {
            AttributeDefRef ref = attr.getValue().getDefaultValue();
            if (ref != null && !attributes.containsKey(attr.getKey())) {
                set(ref, facetValueProvider);
            }
        }
    }

    private void set(EventHandler eventHandler) {
        events.put(eventHandler.getDescriptor(), eventHandler);
    }

    private void set(Attribute attribute) throws QuickFixException {
        if (trackDirty) {
        	attribute.markDirty();
        }
        attributes.put(attribute.getDescriptor(), attribute);
    }

    @Override
    public void set(AttributeDefRef attributeDefRef) throws QuickFixException {
    	set(attributeDefRef, this.valueProvider);
    }
    
    @Override
    public void set(AttributeDefRef attributeDefRef, BaseComponent<?, ?> valueProvider) throws QuickFixException {
        RootDefinition def = rootDefDescriptor.getDef();
        Map<DefDescriptor<AttributeDef>, AttributeDef> attributeDefs = def.getAttributeDefs();

        AttributeDef attributeDef = attributeDefs.get(attributeDefRef.getDescriptor());
        // setAndValidateAttribute should be merged with creating the
        // AttributeImpl here
        AttributeImpl attribute;

        if (attributeDef == null) {
            Map<String, RegisterEventDef> events = def.getRegisterEventDefs();
            if (events.containsKey(attributeDefRef.getDescriptor().getName())) {
                EventHandlerImpl eh = new EventHandlerImpl(attributeDefRef.getDescriptor().getName());
                Object o = attributeDefRef.getValue();
                if (!(o instanceof PropertyReference)) {
                    // FIXME: where are we?
                    throw new InvalidDefinitionException(String.format("%s no can haz %s", eh.getName(), o),
                            SUPER_PASSTHROUGH);
                }
                eh.setActionExpression((PropertyReference) o);
                set(eh);
                return;
            } else {
                // FIXME: where are we?
                throw new AttributeNotFoundException(rootDefDescriptor, attributeDefRef.getName(), SUPER_PASSTHROUGH);
            }
        } else {
            attribute = new AttributeImpl(attributeDef.getDescriptor());
        }

        try {
            attributeDefRef.parseValue(attributeDef.getTypeDef());
        } catch(InvalidExpressionException exception) {
            // Kris:
            // This is going to fail a good handfull of things at the moment, I need to
            // Uncomment and test against the app before trying to check this in.
            // Mode mode = contextService.getCurrentContext().getMode();
            // if(mode.isDevMode() || mode.isTestMode()) {
            //  throw new InvalidValueSetTypeException(
            //                  String.format("Error setting the attribute '%s' of type %s to a value of type %s.", attributeDef.getName(), attributeDef.getTypeDef().getName(), attributeDefRef.getValue().getClass().getName()),
            //                  exception.getLocation());
            // }
        }
        Object value = attributeDefRef.getValue();
        InstanceStack iStack = Aura.getContextService().getCurrentContext().getInstanceStack();
        iStack.markParent(parent);
        iStack.setAttributeName(attributeDef.getDescriptor().toString());
        if (valueProvider != null) {
            iStack.pushAccess(valueProvider);
        }
        value = attributeDef.getTypeDef().initialize(value, valueProvider);
        if (valueProvider != null) {
            iStack.popAccess(valueProvider);
        }
        iStack.clearAttributeName(attributeDef.getDescriptor().toString());
        iStack.clearParent(parent);
        attribute.setValue(value);
        attribute.setValueProvider(valueProvider);

        set(attribute);
    }

    @Override
    public void set(Collection<AttributeDefRef> attributeDefRefs) throws QuickFixException {
        for (AttributeDefRef attributeDefRef : attributeDefRefs) {
            set(attributeDefRef);
        }
    }
    
    @Override
    public void set(final String descriptor, final Object attributeValue) throws QuickFixException {
        final RootDefinition rootDef = rootDefDescriptor.getDef();
        final Map<DefDescriptor<AttributeDef>, AttributeDef> attrs = rootDef.getAttributeDefs();
        final DefDescriptor<AttributeDef> desc = Aura.getInstanceService().getInstance(descriptor, AttributeDef.class);
        if (attrs.containsKey(desc)) {
            setExpression(desc, attributeValue);
        }
    }

    @Override
    public void set(AttributeSet attributeSet) throws QuickFixException {
        RootDefinition rootDef = rootDefDescriptor.getDef();
        Map<DefDescriptor<AttributeDef>, AttributeDef> attrs = rootDef.getAttributeDefs();
        Map<DefDescriptor<?>, Object> lookup = Maps.newHashMap();

        for (Attribute attribute : attributeSet) {
            lookup.put(Aura.getDefinitionService().getDefDescriptor(attribute.getName(), AttributeDef.class), attribute);
        }

        for (DefDescriptor<AttributeDef> desc : attrs.keySet()) {
            Object val = lookup.get(desc);
            if (val != null) {
                if (val instanceof Attribute) {
                    Attribute attribute = (Attribute) val;
                    setExpression(attribute.getDescriptor(), new PropertyReferenceImpl("v." + attribute.getName(),
                            SUPER_PASSTHROUGH));
                } else if (val instanceof AttributeDefRef) {
                    set((AttributeDefRef) val);
                }
            }
        }
    }

    @Override
    public void set(Map<String, Object> attributeMap) throws QuickFixException {
        if (attributeMap != null) {
            RootDefinition rootDef = rootDefDescriptor.getDef();
            Map<DefDescriptor<AttributeDef>, AttributeDef> attrs = rootDef.getAttributeDefs();
            for (Map.Entry<String, Object> entry : attributeMap.entrySet()) {
                DefDescriptor<AttributeDef> desc = Aura.getDefinitionService().getDefDescriptor(entry.getKey(), AttributeDef.class);
                if (attrs.containsKey(desc)) {
                    setExpression(desc, entry.getValue());
                }
            }
        }
    }

    @Override
    public Object getValue(String name) throws QuickFixException {
        PropertyReference expr = getPropertyReferenceByName(name);
        return getValue(expr);
    }

    /**
     * Returns raw object instead of evaluated value of attribute
     *
     * @param name
     * @return Raw Object from attributes map
     * @throws QuickFixException
     */
    @Override
    public Object getRawValue(String name) throws QuickFixException {
        PropertyReference expr = getPropertyReferenceByName(name);
        return getExpression(expr.getRoot());
    }

    @Override
    public <T> T getValue(String name, Class<T> clazz) throws QuickFixException {
        Object val = getValue(name);
        if (val == null) {
            return null;
        }
        try {
            return clazz.cast(val);
        } catch (ClassCastException cce) {
            throw new AuraRuntimeException("attribute <" + name + "> is of the wrong type: expected "
                    + clazz.getName() + " but got " + val.getClass().getName());
        }
    }

    @Override
    public Object getExpression(String name) {
        DefDescriptor<AttributeDef> desc = Aura.getDefinitionService().getDefDescriptor(name, AttributeDef.class);

        Attribute at = attributes.get(desc);
        if (at != null) {
            return at.getValue();
        }
        return null;
    }

    private ValueProvider getAttributesValueProvider(String name) {
        DefDescriptor<AttributeDef> desc = Aura.getDefinitionService().getDefDescriptor(name, AttributeDef.class);

        Attribute at = attributes.get(desc);
        if (at != null) {
            return at.getValueProvider();
        }
        return null;
    }

    private void setExpression(DefDescriptor<AttributeDef> desc, Object value) throws QuickFixException {
        RootDefinition rd = rootDefDescriptor.getDef();
        AttributeDef ad = rd.getAttributeDefs().get(desc);
        if (ad == null) {
            // this location isn't even close to right...
            throw new InvalidDefinitionException(String.format("Attribute %s not defined on %s", desc.getName(),
                    rootDefDescriptor.getName()), rd.getLocation());
        }

        AttributeImpl att = new AttributeImpl(desc);
        if (value instanceof Expression) {
            att.setValue(value);
        } else {
            InstanceStack iStack = Aura.getContextService().getCurrentContext().getInstanceStack();

            iStack.markParent(parent);
            iStack.setAttributeName(desc.toString());
            if (valueProvider != null) {
                iStack.pushAccess(valueProvider);
            }
            att.setValue(rootDefDescriptor.getDef().getAttributeDef(att.getName()).getTypeDef().initialize(value, null));
            if (valueProvider != null) {
                iStack.popAccess(valueProvider);
            }
            iStack.clearAttributeName(desc.toString());
            iStack.clearParent(parent);
        }
        set(att);
    }

    @Override
    public Object getValue(PropertyReference expr) throws QuickFixException {
        Object value = getExpression(expr.getRoot());
        PropertyReference stem = expr.getStem();

        if (value instanceof Expression) {
            ValueProvider valuesValueProvider = getAttributesValueProvider(expr.getRoot());
            if (valuesValueProvider == null) {
                valuesValueProvider = valueProvider;
            }
            value = ((Expression) value).evaluate(valuesValueProvider);
        }
        if (value instanceof ValueProvider && stem != null) {
            value = ((ValueProvider) value).getValue(stem);
        } else if (stem != null) {
            AttributeDef attributeDef = rootDefDescriptor.getDef().getAttributeDef(expr.getRoot());
            if (attributeDef == null) {
                // no such attribute.
                throw new NoAccessException("No attribute "+expr.getRoot()+" in "+rootDefDescriptor);
            }
            if(value == null) {
            	return null;
            }
            value = attributeDef.getTypeDef().wrap(value);
            if (value instanceof ValueProvider) {
                value = ((ValueProvider) value).getValue(stem);
            }
        }
        if (value instanceof Wrapper) {
            value = ((Wrapper) value).unwrap();
        }
        return value;
    }

    @Override
    public void serialize(Json json) throws IOException {
        try {
            json.writeMapBegin();
            
            if(this.valueProvider != null && !this.valueProvider.isConcreteComponent()) {
            	json.writeMapEntry("valueProvider", valueProvider);
            }
            
            if (!attributes.isEmpty()) {
                RootDefinition def = rootDefDescriptor.getDef();
                json.writeMapKey("values");
                json.writeMapBegin();

                for (Attribute attribute : attributes.values()) {
                    String name = attribute.getName();
                    AttributeDef attributeDef = def.getAttributeDef(name);
                    if (attributeDef == null) {
                        throw new AttributeNotFoundException(rootDefDescriptor, name, def.getLocation());
                    }

                    if (attributeDef.getSerializeTo() == AttributeDef.SerializeToType.BOTH) {
                        TypeDef typeDef = attributeDef.getTypeDef();
                        // Actions have null valueProviders. In that case, we still want to output their values.
                        boolean validValueProvider = valueProvider == null || valueProvider.isConcreteComponent();
                        if (validValueProvider && !(typeDef instanceof ComponentArrayTypeDef || typeDef instanceof ComponentTypeDef) || attribute.isDirty()) {
                    	    if(!isAttributeValueEqualToDefinitionValue(attribute)) {
                    	    	json.writeMapEntry(name, attribute.getValue());
                    	    }
                        }
                    }
                }

                json.writeMapEnd();
            }

            if (!events.isEmpty()) {
                json.writeMapEntry("events", events);
            }

            json.writeMapEnd();
        } catch (QuickFixException e) {
            throw new AuraUnhandledException("unhandled exception", e);
        }
    }

    /**
     * If the value of an attribute on the instance is the same as it's definition value, do not serialize it to the client. 
     * When we re-create the component on the client, we'll use the value from the definition.
     *  
     * Does it have a facet?
	 * Does it equal the facet?
	 * Does it have a default value but not a facet value?
   	 * Does it equal the defaultValue?
   	 * 
     * @param attribute
     * @return true if the value is equal and should not be serialized.
     * @throws QuickFixException
     */
    private boolean isAttributeValueEqualToDefinitionValue(Attribute attribute) throws QuickFixException {
    	
    	RootDefinition def = rootDefDescriptor.getDef();
        String name = attribute.getName();
    	

		AttributeDefRef definitionValueRef;
    	Object attributeValue = attribute.getValue();
    	Object facetValue = null;
    	

    	// Empty, let the serializer decide what to do with it. Doesn't usually serialize nulls.
    	if(attributeValue == null) {
    		return false;
    	}
        
		// Check for Facet equality
    	if(def instanceof BaseComponentDef) {
    		BaseComponentDef baseComponentDef = (BaseComponentDef) def;
    		
    		definitionValueRef = baseComponentDef.getFacet(name);
    		// Is the attributeValue the same as the aura:set value?
    		if(definitionValueRef != null) {
    			facetValue = definitionValueRef.getValue();
    			if(attributeValue.equals(facetValue)) {
    				return true;
    			}
    		}
    		// We have an aura:set, and the value does not currently equal it. So send it down.
    		if(facetValue != null) {
    			return false;
    		}
    	}
    	
    	definitionValueRef = def.getAttributeDef(name).getDefaultValue();
    	// hasDefaultValue && value is the same as that defaultValue
    	if(definitionValueRef != null && attributeValue.equals(definitionValueRef.getValue())) {
    		return true;
    	}
    	
    	return false;
    }

    @Override
    public int size() {
        return attributes.size();
    }

    /**
     * @return Returns the valueProvider.
     */
    @Override
    public BaseComponent<?, ?> getValueProvider() {
        return valueProvider;
    }

    @Override
    public Iterator<Attribute> iterator() {
        return attributes.values().iterator();
    }

    @Override
    public boolean isEmpty() {
        return attributes.isEmpty() && events.isEmpty();
    }

    @Override
    public void startTrackingDirtyValues() {
        trackDirty = true;
    }

    @Override
    public void validate() throws QuickFixException {
        Set<AttributeDef> missingAttributes = this.getMissingAttributes();
        if (missingAttributes != null && !missingAttributes.isEmpty()) {
            throw new MissingRequiredAttributeException(rootDefDescriptor, missingAttributes.iterator().next()
                    .getName());
        }
    }

    @Override
    public Set<AttributeDef> getMissingAttributes() throws QuickFixException {
        Map<DefDescriptor<AttributeDef>, AttributeDef> attrs = rootDefDescriptor.getDef().getAttributeDefs();
        Set<AttributeDef> missingAttributes = null;
        for (Map.Entry<DefDescriptor<AttributeDef>, AttributeDef> attr : attrs.entrySet()) {
            if (attr.getValue().isRequired() && !attributes.containsKey(attr.getKey())) {
                if (missingAttributes == null) {
                    missingAttributes = new HashSet<>(attrs.entrySet().size());
                }

                missingAttributes.add(attr.getValue());
            }
        }

        return missingAttributes;
    }

    private PropertyReference getPropertyReferenceByName(String name) throws InvalidDefinitionException {
        PropertyReference expr = new PropertyReferenceImpl(name,
                AuraUtil.getExternalLocation("direct attributeset access"));
        if (expr.size() != 1) {
            throw new InvalidDefinitionException("No dots allowed", expr.getLocation());
        }
        return expr;
    }
}
