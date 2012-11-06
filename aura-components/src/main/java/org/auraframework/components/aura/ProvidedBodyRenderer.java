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
package org.auraframework.components.aura;

import java.io.IOException;
import java.util.List;

import org.auraframework.Aura;
import org.auraframework.def.Renderer;
import org.auraframework.instance.BaseComponent;
import org.auraframework.throwable.quickfix.QuickFixException;

/**
 * server side renderer for components that have a templated body and provide their own dynamic body, e.g. iteration.cmp or if.cmp
 * 
 * @since 0.0.234
 */
public class ProvidedBodyRenderer implements Renderer {
    @SuppressWarnings("unchecked")
    @Override
    public void render(BaseComponent<?, ?> component, Appendable out) throws IOException, QuickFixException {
        List<BaseComponent<?, ?>> realbody = (List<BaseComponent<?, ?>>)component.getAttributes().getValue("realbody");
        if (realbody != null) {
            for (BaseComponent<?, ?> c : realbody) {
                Aura.getRenderingService().render(c, out);
            }
        }
    }
}
