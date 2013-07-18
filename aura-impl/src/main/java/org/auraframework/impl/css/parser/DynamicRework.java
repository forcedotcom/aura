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
package org.auraframework.impl.css.parser;

import java.util.List;

import org.auraframework.def.ComponentDefRef;

import com.phloc.css.decl.CSSDeclaration;

/**
 * Rework some CSS through change, removal or addition. This represents rework that is dynamic, which means we can only
 * perform the replacement at runtime. It is context-dependent, in contrast to {@link DynamicRework}.
 * 
 * Generally static {@link Rework} should be used instead of this. Rarely will you need to utilize dynamic rendering
 * when generating CSS. In most cases the replacements can be during during parse time.
 * 
 * @param <T> The type of item to rework, e.g, {@link CSSDeclaration}.
 */
public interface DynamicRework<T> {
    /**
     * Performs the rework.
     * 
     * @param reworkable The item to rework.
     * @param errors Add any errors to this list.
     * @return The component to be used for rendering, or null if the given item is not applicable.
     */
    ComponentDefRef perform(T reworkable, List<Exception> errors);
}
