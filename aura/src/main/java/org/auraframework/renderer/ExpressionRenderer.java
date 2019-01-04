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
package org.auraframework.renderer;

import java.io.IOException;
import java.util.List;

import org.auraframework.annotations.Annotations.ServiceComponentRenderer;
import org.auraframework.def.ComponentDefRef;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.DefinitionReference;
import org.auraframework.def.Renderer;
import org.auraframework.instance.BaseComponent;
import org.auraframework.instance.Wrapper;
import org.auraframework.service.DefinitionService;
import org.auraframework.service.InstanceService;
import org.auraframework.service.RenderingService;
import org.auraframework.system.RenderContext;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;

@Lazy
@ServiceComponentRenderer
public class ExpressionRenderer implements Renderer {

    private final RenderingService renderingService;
    private final InstanceService instanceService;
    private final DefinitionService definitionService;
    
    /**
     * @param renderingService The service for rendering the component
     * @param instanceService The service for getting an instance of a component
     * @param definitionService The service for looking up the definition for a component
     * @see #ExpressionRenderer()
     */
    @Lazy
    @Autowired
    public ExpressionRenderer(final RenderingService renderingService, final InstanceService instanceService, final DefinitionService definitionService) {
        this.renderingService = renderingService;
        this.instanceService  = instanceService;
        this.definitionService = definitionService;
    }
    
    /**
     * @see #ExpressionRenderer(RenderingService, InstanceService, DefinitionService)
     */
    public ExpressionRenderer() {
        this(null, null, null);
    }

    @Override
    public void render(final BaseComponent<?, ?> component, final RenderContext rc) throws IOException, QuickFixException {
        Object value = component.getAttributes().getValue("value");

        if (value instanceof Wrapper) {
            value = ((Wrapper) value).unwrap();
        }

        if (value instanceof String) {
            String escaped = (String) value;
            // This amounts to a convoluted test for "is the direct container
            // of this expression a template?"  We need that test because we use
            // "bad" characters like script tags in our own expressions, but want to
            // deny them from users.
            boolean inTemplate = definitionService.getDefinition(component.getAttributes().getValueProvider().getDescriptor()).isTemplate();

            if (!inTemplate) {
                // We don't escape all the HTML characters, because quotes in particular
                // would cause problems.
                escaped = escaped.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;");
            }
            rc.getCurrent().append(escaped);
        } else if (value instanceof List) {
            List<?> kids = (List<?>) value;
            for (Object kid : kids) {
                if (kid instanceof BaseComponent) {
                    this.renderingService.render((BaseComponent<?, ?>) kid, rc);
                } else if (kid instanceof DefinitionReference) {
                    DefinitionReference defRef = ((DefinitionReference) kid).get();
                    if (defRef.type() == DefType.COMPONENT) {
						BaseComponent<?, ?> cmp = (BaseComponent<?, ?>) this.instanceService.getInstance((ComponentDefRef) defRef, component);
                        this.renderingService.render(cmp, rc);
                    }
                }
            }
        } else if (value != null) {
            rc.getCurrent().append(value.toString());
        }
    }
}
