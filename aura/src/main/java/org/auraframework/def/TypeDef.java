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
package org.auraframework.def;

import java.util.Set;

import org.auraframework.instance.BaseComponent;
import org.auraframework.throwable.quickfix.QuickFixException;



/**
 * A TypeDef is a wrapper around an implementation of a supported type.
 * It generally wraps and delegates to a Class definition from another language.
 */
public interface TypeDef extends Definition {
    @Override
    DefDescriptor<TypeDef> getDescriptor();

    /**
     * Attempts to parse the stringRep and return the implementation-specific
     * value of the Type represented by this TypeDef.  If parsing fails, or
     * if the delegate type does not support coersion from Strings, returns null.
     *
     * @param stringRep
     * @return The parsed value, or null if the String value cannot be parsed.
     */
    Object valueOf(Object stringRep);

    /**
     * Wraps the given object, if it needs to be, in a Wrapper
     */
    Object wrap(Object o);

    /**
     * @return The delegate type for the language specified by the passed in prefix.
     * In java, for example, this would be a java.lang.Class, but for a custom java
     * type where Apex is passed in as the prefix, Basic.ANYTYPE might be returned.
     * @throws QuickFixException
     */
    Object getExternalType(String prefix) throws QuickFixException;

    Object initialize(Object config, BaseComponent<?,?> valueProvider) throws QuickFixException;

    void appendDependencies(Object instance, Set<DefDescriptor<?>> deps) throws QuickFixException;
}
