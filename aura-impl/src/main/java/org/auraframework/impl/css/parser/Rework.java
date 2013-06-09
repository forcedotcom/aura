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

import com.phloc.css.decl.CSSDeclaration;

/**
 * Rework some CSS through change, removal or addition. This represents rework that is static, which means we can
 * perform the replacement at parse time. It is not context-dependent, in contrast to {@link DynamicRework}.
 * 
 * @param <T> The type of item to rework, e.g, {@link CSSDeclaration}.
 */
public interface Rework<T> {
    /**
     * Performs the rework.
     * 
     * @param reworkable The item to rework.
     * @param reworked Add reworked items to this list. Note that you can add as many items as you like. Anything that
     *            is not added to this will be effectively removed. Even if you do not change anything you must still
     *            add the original item to this list to keep it.
     * @param errors Add any errors to this list.
     */
    public void perform(T reworkable, List<T> reworked, List<Exception> errors);
}
