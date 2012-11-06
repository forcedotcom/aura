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
package org.auraframework.instance;

import java.util.Collection;
import java.util.Map;
import java.util.Set;

import org.auraframework.def.*;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.JsonSerializable;

/**
 * A set of attribute instances on a component, interface or event.
 *
 *
 *
 */
public interface AttributeSet extends ValueProvider, JsonSerializable, Iterable<Attribute> {

    /**
     * Returns the expression or literal expression that is the current value of
     * the named attribute.  This does not resolve expressions.  Use getValue(name)
     * if you need to evaluate the expression.
     * @param name
     * @return
     * This should only ever be used from tests
     */
    Object getExpression(String name);

    /**
     * gets the value of an attribute by name, no expressions allowed
     * @throws QuickFixException
     */
    Object getValue(String s) throws QuickFixException;

    void set(Collection<AttributeDefRef> attributeDefRefs) throws QuickFixException;

    void set(Collection<AttributeDefRef> facetDefRefs, AttributeSet attributeSet) throws QuickFixException;

    void set(Map<String, Object> attributeMap) throws QuickFixException;

    void setRootDefDescriptor(DefDescriptor<? extends RootDefinition> descriptor) throws QuickFixException;

    int size();

    BaseComponent<?,?> getValueProvider();

    boolean isEmpty();

    void startTrackingDirtyValues();

    void validate() throws QuickFixException;

    Set<AttributeDef> getMissingAttributes() throws QuickFixException;

    DefDescriptor<? extends RootDefinition> getRootDefDescriptor() throws QuickFixException;

}
