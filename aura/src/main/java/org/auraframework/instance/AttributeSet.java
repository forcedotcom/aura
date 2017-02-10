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
package org.auraframework.instance;

import java.util.Collection;
import java.util.Map;
import java.util.Set;

import org.auraframework.def.AttributeDef;
import org.auraframework.def.AttributeDefRef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.RootDefinition;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.JsonSerializable;

import javax.annotation.Nonnull;

/**
 * A set of attribute instances on a component, interface or event.
 */
public interface AttributeSet extends ValueProvider, JsonSerializable, Iterable<Attribute> {

    /**
     * Returns the expression or literal expression that is the current value of
     * the named attribute. This does not resolve expressions. Use
     * getValue(name) if you need to evaluate the expression.
     * 
     * @param name
     * @return This should only ever be used from tests
     */
    Object getExpression(@Nonnull String name);

    /**
     * gets the value of an attribute by name, no expressions allowed
     * 
     * @throws QuickFixException
     */
    Object getValue(@Nonnull String s) throws QuickFixException;

    /**
     * gets the raw value of an attribute by name, no expressions allowed
     *
     * @throws QuickFixException
     */
    Object getRawValue(@Nonnull String s) throws QuickFixException;

    /**
     * gets the typed value of an attribute by name, no expressions allowed
     * 
     * @throws QuickFixException
     * @throws QuickFixException if the type does not match.
     */
    <T> T  getValue(@Nonnull String s, @Nonnull Class<T> clazz) throws QuickFixException;

    /**
     * Link attributes from one component to another. Used in inheritance levels.
     * 
     * @param attributeDefRefs A set of attributes resolved in another component.
     * @throws QuickFixException
     */
    void set(Collection<AttributeDefRef> attributeDefRefs) throws QuickFixException;
    
    /**
     * Link an attribute to be referenced in another component.
     * @param attributeDefRef
     * @throws QuickFixException
     */
    void set(AttributeDefRef attributeDefRef) throws QuickFixException;
    
    /**
     * Set multiple values on the component via a key value map. 
     * 
     * @param attributeMap A key value mapping of values to apply to the component. 
     * @throws QuickFixException
     */
    void set(Map<String, Object> attributeMap) throws QuickFixException;
    
    /**
     * Set a single value of the component.
     * 
     * @param attribute The attribute name. Do not include the "v." portion.
     * @param value
     * @throws QuickFixException
     */
    void set(String attribute, Object value) throws QuickFixException;
    
    /**
     * Map the values of one attribute set into the current compnent. 
     * 
     * @param attributeSet One components attributeset
     * @throws QuickFixException
     */
    void set(AttributeSet attributeSet) throws QuickFixException;

    /**
     * Allows for components to change their descriptor after their creation. 
     * Happens usually after a provider call. 
     * @param descriptor
     * @throws QuickFixException
     */
    void setRootDefDescriptor(DefDescriptor<? extends RootDefinition> descriptor) throws QuickFixException;

    /**
     * Count of the amount of attributes in the set.
     * @return
     */
    int size();

    /**
     * What component do we resolve against for our attributes.
     * 
     * @return
     */
    BaseComponent<?, ?> getValueProvider();

    /**
     * Does the attribute set have any values set on it.
     * 
     * @return
     */
    boolean isEmpty();

    /**
     * We wouldn't necessarily want to track dirtiness during setup.
     */
    void startTrackingDirtyValues();

    void validate() throws QuickFixException;

    Set<AttributeDef> getMissingAttributes() throws QuickFixException;

    DefDescriptor<? extends RootDefinition> getRootDefDescriptor() throws QuickFixException;
}
