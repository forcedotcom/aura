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
package org.auraframework.css;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.TokenDescriptorProvider;
import org.auraframework.def.TokensDef;
import org.auraframework.system.AuraContext;
import org.auraframework.throwable.quickfix.QuickFixException;

/**
 * A mutable {@link TokenOptimizer}.
 * <p>
 * This interface should rarely be passed around instead of {@link TokenOptimizer}. While mutability is required due to
 * usage scenarios in {@link AuraContext}, the mutable methods of a {@link TokenOptimizer} should not be exposed outside
 * of the object that manages the {@link TokenOptimizer} instance.
 */
public interface MutableTokenOptimizer extends TokenOptimizer {
    /**
     * Prepends a descriptor to the list.
     * <p>
     * <b>Important</b>: The exact descriptor given might not be stored. If a def uses a {@link TokenDescriptorProvider}
     * , the result of {@link TokensDef#getConcreteDescriptor()} will be used instead. This minimizes the number of
     * times the provider method is invoked.
     *
     * @param descriptor Prepend this descriptor.
     * @return this, for chaining.
     */
    MutableTokenOptimizer prepend(DefDescriptor<TokensDef> descriptor) throws QuickFixException;

    /**
     * Prepends a collection of descriptors to the list.
     * <p>
     * <b>Important</b>: The given descriptors might not actually be stored. If a def uses a
     * {@link TokenDescriptorProvider}, the result of {@link TokensDef#getConcreteDescriptor()} will be used instead.
     * This minimizes the number of times the provider method is invoked.
     *
     * @param descriptors Prepend these descriptors.
     * @return this, for chaining.
     */
    MutableTokenOptimizer prependAll(Iterable<DefDescriptor<TokensDef>> descriptors) throws QuickFixException;

    /**
     * Appends a descriptor to the list.
     * <p>
     * <b>Important</b>: The given descriptor might not actually be stored. If a def uses a
     * {@link TokenDescriptorProvider}, the result of {@link TokensDef#getConcreteDescriptor()} will be used instead.
     * This minimizes the number of times the provider method is invoked.
     *
     * @param descriptor Prepend this descriptor.
     * @return this, for chaining.
     */
    MutableTokenOptimizer append(DefDescriptor<TokensDef> descriptor) throws QuickFixException;

    /**
     * Appends a collection of descriptors to the list.
     * <p>
     * <b>Important</b>: The given descriptors might not actually be stored. If a def uses a
     * {@link TokenDescriptorProvider}, the result of {@link TokensDef#getConcreteDescriptor()} will be used instead.
     * This minimizes the number of times the provider method is invoked.
     *
     * @param descriptors Prepend these descriptors.
     * @return this, for chaining.
     */
    MutableTokenOptimizer appendAll(Iterable<DefDescriptor<TokensDef>> descriptors) throws QuickFixException;
}
