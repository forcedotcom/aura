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
package org.auraframework.service;

import java.io.IOException;

import org.auraframework.instance.BaseComponent;
import org.auraframework.throwable.quickfix.QuickFixException;

/**
 * <p>
 * Service for rendering a {@link Component} or {@link Application} instances.
 * </p>
 * <p>
 * Instances of all AuraServices should be retrieved from {@link Aura}
 * </p>
 */
public interface RenderingService extends AuraService {

    /**
     * Renders a {@link Component} or {@link Application} server-side. Will fail
     * with a AuraRuntimeException if any components are encountered that do not
     * have a local (server-side) renderer.
     * 
     * @param component The Component or Application to render.
     * @param out The Appendable where the rendering should be written.
     * @throws QuickFixException
     * @throws IOException if the appendable throws one.
     */
    void render(BaseComponent<?, ?> component, Appendable out) throws QuickFixException, IOException;
}
