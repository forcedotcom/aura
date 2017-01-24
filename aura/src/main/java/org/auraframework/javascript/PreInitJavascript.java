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
package org.auraframework.javascript;

import org.auraframework.def.BaseComponentDef;
import org.auraframework.system.AuraContext.Mode;

/**
 * Allow javascript insertion into pre init block of inline.js
 */
public interface PreInitJavascript {

    /**
     * Whether to insert javascript based on current def and mode
     *
     * @param currentDef current application/component definition
     * @param mode Aura mode
     * @return whether to insert javascript based on current def and mode
     */
    boolean shouldInsert(BaseComponentDef currentDef, Mode mode);

    /**
     * Returns javascript code based on current def and mode
     *
     * @param currentDef current application/component definition
     * @param mode Aura mode
     * @return javascript code based on current def and mode
     */
    String getJavascriptCode(BaseComponentDef currentDef, Mode mode);
}
