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
package org.auraframework.service;

import org.auraframework.builder.ApplicationDefBuilder;
import org.auraframework.builder.ComponentDefBuilder;
import org.auraframework.builder.ComponentDefRefBuilder;
import org.auraframework.builder.ThemeDefBuilder;
import org.auraframework.throwable.quickfix.QuickFixException;

/**
 * <p>
 * Service for constructing your own {@link Definition}.
 * </p>
 * <p>
 * Instances of all AuraServices should be retrieved from {@link Aura}
 * </p>
 */
public interface BuilderService extends AuraService {

    /**
     * Retrieves a Builder suitable for defining an {@link ApplicationDef}
     * 
     * @throws QuickFixException
     */
    ApplicationDefBuilder getApplicationDefBuilder() throws QuickFixException;

    /**
     * Retrieves a Builder for defining a {@link ComponentDef}
     * 
     * @throws QuickFixException
     */
    ComponentDefBuilder getComponentDefBuilder() throws QuickFixException;

    /**
     * Retrieves a Builder for defining a {@link ThemeDef}
     * 
     * @throws QuickFixException
     */
    ThemeDefBuilder getThemeDefBuilder() throws QuickFixException;

    /**
     * Retrieves a Builder suitable for defining a {@link ComponentDefRef}
     * 
     * @throws QuickFixException
     */
    ComponentDefRefBuilder getComponentDefRefBuilder() throws QuickFixException;

}
