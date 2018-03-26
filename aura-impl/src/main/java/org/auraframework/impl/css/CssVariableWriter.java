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
package org.auraframework.impl.css;

import com.google.common.base.Optional;

import org.auraframework.css.TokenCache;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.TokensDef;
import org.auraframework.service.ContextService;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.AuraContext;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.springframework.util.StringUtils;

import java.io.IOException;
import java.util.List;
import java.util.Set;
import java.util.regex.Pattern;

/**
 * Transpose Aura Tokens into CSS Variables in the root selector
 */
public class CssVariableWriter {
    private DefinitionService definitionService;
    private ContextService contextService;
    private static Pattern validName = Pattern.compile("^([a-z_]|-[a-z_-])[a-z\\d_-]*", Pattern.CASE_INSENSITIVE);
    private static Pattern invalidValue = Pattern.compile("[\\{\\}]|\\/\\/|\\/\\*");
    private static String variableDeclaration = "--lwc-%s: %s;\n";

    public CssVariableWriter(DefinitionService definitionService, ContextService contextService){
        this.definitionService = definitionService;
        this.contextService = contextService;
    }

    public void write(Appendable out) throws QuickFixException, IOException {
        StringBuilder cssVariables = new StringBuilder();
        AuraContext context = contextService.getCurrentContext();
        List<DefDescriptor<TokensDef>> tokenOverrides = getTokenDefs(context);

        if (tokenOverrides != null && tokenOverrides.size() > 0) {

            TokenCache tokens = context.getStyleContext().getTokens();
            Set<String> names = tokens != null && !tokens.isEmpty() ? tokens.getNames(tokenOverrides) : null;

            if (names != null && names.size() > 0) {
                for (String name : names) {

                    if (isValidName(name)) {
                        Optional<Object> value = tokens.getToken(name);

                        if (isValidValue(value)) {
                            cssVariables.append(String.format(variableDeclaration, name, value.get()));
                        }
                    }
                }
            }
        }
        if (cssVariables.length() > 0){
            out.append(":root{ \n");
            out.append(cssVariables.toString());
            out.append(" } \n");
        }
    }

    private boolean isValidValue(Optional<Object> optionalValue) {
        return optionalValue.isPresent() && !invalidValue.matcher(optionalValue.get().toString()).find();
    }

    private boolean isValidName(String name) {
        return StringUtils.hasText(name) && validName.matcher(name).matches();
    }

    private List<DefDescriptor<TokensDef>> getTokenDefs(AuraContext context) throws QuickFixException {
        DefDescriptor<? extends BaseComponentDef> applicationDescriptor = context.getApplicationDescriptor();
        ApplicationDef def = null;

        if (applicationDescriptor.getDefType() == DefDescriptor.DefType.APPLICATION) {
            def = (ApplicationDef) definitionService.getDefinition(applicationDescriptor);
        }

        return def != null ? def.getTokenOverrides() : null;
    }
}
