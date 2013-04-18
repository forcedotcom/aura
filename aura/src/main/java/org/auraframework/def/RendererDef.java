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
package org.auraframework.def;

import java.io.IOException;

import org.auraframework.instance.BaseComponent;
import org.auraframework.throwable.quickfix.QuickFixException;

/**
 */
public interface RendererDef extends Definition {
    @Override
    DefDescriptor<RendererDef> getDescriptor();

    /**
     * Render the component.
     * 
     * @param component the component to render.
     * @param out the output stream.
     * @throws IOException if the output stream does.
     * @throws QuickFixException if there is an exception retrieving a
     *             component.
     */
    void render(BaseComponent<?, ?> component, Appendable out) throws IOException, QuickFixException;

    boolean isLocal();
}
