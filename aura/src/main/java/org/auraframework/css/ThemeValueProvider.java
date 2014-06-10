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

import org.auraframework.def.ThemeDescriptorProvider;
import org.auraframework.expression.PropertyReference;
import org.auraframework.instance.ValueProvider;
import org.auraframework.system.Location;
import org.auraframework.throwable.quickfix.QuickFixException;

/**
 * Responsible for evaluating a theme expression to the string value. The expression may contain multiple references to
 * theme variables, as well as valid aura expression syntax.
 * <p>
 * This is <em>not</em> to be confused with theme providers! ({@link ThemeDescriptorProvider}).
 */
public interface ThemeValueProvider extends ValueProvider {
    /**
     * Use this to resolve an expression from a String.
     * 
     * @param expression The expression to evaluate.
     * @param location The location of the expression in the source.
     * 
     * @return The value, same as from {@link #getValue(PropertyReference)}
     * 
     * @throws QuickFixException
     */
    Object getValue(String expression, Location location) throws QuickFixException;
}
