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
package org.auraframework.renderer;

import java.io.IOException;

import java.util.List;

import org.auraframework.Aura;
import org.auraframework.def.ComponentDefRef;
import org.auraframework.def.Renderer;
import org.auraframework.instance.BaseComponent;
import org.auraframework.instance.Component;
import org.auraframework.instance.Wrapper;
import org.auraframework.service.RenderingService;

import org.auraframework.throwable.quickfix.QuickFixException;

/**
 */
public class ExpressionRenderer implements Renderer {
    @Override
    public void render(BaseComponent<?,?> component, Appendable out) throws IOException, QuickFixException {

        RenderingService renderingService = Aura.getRenderingService();

        Object value = component.getAttributes().getValue("value");

        if(value instanceof Wrapper){
            value = ((Wrapper)value).unwrap();
        }

        if(value instanceof String){
            out.append((String)value);
        } else if(value instanceof List){
            List<?> kids = (List<?>)value;
            for(Object kid : kids){
                if(kid instanceof BaseComponent){
                    renderingService.render((BaseComponent<?, ?>)kid, out);
                }else if(kid instanceof ComponentDefRef){
                    List<Component> cmps = ((ComponentDefRef)kid).newInstance(component);
                    for(Component cmp : cmps){
                        renderingService.render(cmp, out);
                    }
                }
            }
        }else if(value != null){
            out.append(value.toString());
        }
    }
}
