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
package org.auraframework.impl.expression.functions;

import java.util.Map;

import org.auraframework.def.ApplicationDef;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.service.ContextService;
import org.auraframework.service.DefinitionService;
import org.auraframework.throwable.quickfix.QuickFixException;

/**
 * Token is meant for application level configuration injection
 */
public class Token extends BaseUnaryFunction {

    private static final long serialVersionUID = -8236585894014286683L;
    
    private transient final ContextService contextService;
    private transient final DefinitionService definitionService;

    /**
     * @param contextService The service for getting the context
     * @param definitionService The service for getting definitions
     * @return An instance of {@link Token}
     */
    public static final Token getInstance(final ContextService contextService, final DefinitionService definitionService) {
        return new Token(contextService, definitionService);
    }
    
    /**
     * @param contextService The service for getting the current context
     * @param definitionService The service for retrieving definitions
     */
    private Token(final ContextService contextService, final DefinitionService definitionService) {
        this.contextService = contextService;
        this.definitionService = definitionService;
    }

    @Override
    public Object evaluate(Object arg) {
        try {
            if(arg != null) {
                final DefDescriptor<? extends BaseComponentDef> applicationDescriptor = contextService.getCurrentContext().getApplicationDescriptor();
                final Map<String,String> tokens = ((ApplicationDef)definitionService.getDefinition(applicationDescriptor)).getTokens();
                if ((tokens != null) && tokens.containsKey(arg)) {
                    return tokens.get(arg);
                }
            }
        } catch (ClassCastException exception) {
            //??
            return "AURA: INVALID APPLICATION";
        } catch (QuickFixException exception) {
            //??
        }
        return "";
    }

    @Override
    public String getJsFunction() {
        return "fn.token";
    }

    @Override
    public String[] getKeys() {
        return new String[] {"token", "t"};
    }
}