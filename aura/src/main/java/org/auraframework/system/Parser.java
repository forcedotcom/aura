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
package org.auraframework.system;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.throwable.quickfix.QuickFixException;

/**
 * Creates Definitions from Source of a particular format.
 */
public interface Parser {

    /**
     * Supported Source Formats
     * 
     * 
     * 
     */
    public enum Format {
        XML, JS, CSS, JAVA, TEMPLATE_CSS, APEX
    }

    <D extends Definition> D parse(DefDescriptor<D> descriptor, Source<?> source) throws QuickFixException;
}
