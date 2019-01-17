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
package org.auraframework.impl.expression;

import static org.auraframework.impl.expression.functions.BooleanFunctions.AND;
import static org.auraframework.impl.expression.functions.BooleanFunctions.NOT;
import static org.auraframework.impl.expression.functions.BooleanFunctions.OR;
import static org.auraframework.impl.expression.functions.BooleanFunctions.TERNARY;
import static org.auraframework.impl.expression.functions.MathFunctions.ABSOLUTE;
import static org.auraframework.impl.expression.functions.MathFunctions.DIVIDE;
import static org.auraframework.impl.expression.functions.MathFunctions.MODULUS;
import static org.auraframework.impl.expression.functions.MathFunctions.MULTIPLY;
import static org.auraframework.impl.expression.functions.MathFunctions.NEGATE;
import static org.auraframework.impl.expression.functions.MathFunctions.SUBTRACT;
import static org.auraframework.impl.expression.functions.MultiFunctions.ADD;
import static org.auraframework.impl.expression.functions.MultiFunctions.EQUALS;
import static org.auraframework.impl.expression.functions.MultiFunctions.GREATER_THAN;
import static org.auraframework.impl.expression.functions.MultiFunctions.GREATER_THAN_OR_EQUAL;
import static org.auraframework.impl.expression.functions.MultiFunctions.LESS_THAN;
import static org.auraframework.impl.expression.functions.MultiFunctions.LESS_THAN_OR_EQUAL;
import static org.auraframework.impl.expression.functions.MultiFunctions.NOTEQUALS;

import java.util.Map;

import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.impl.expression.functions.Empty;
import org.auraframework.impl.expression.functions.Format;
import org.auraframework.impl.expression.functions.Function;
import org.auraframework.impl.expression.functions.Join;
import org.auraframework.impl.expression.functions.Token;
import org.auraframework.service.ContextService;
import org.auraframework.service.DefinitionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;

import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableMap.Builder;

/**
 * Service used to lookup {@link Function}s by name
 */
@Lazy
@ServiceComponent("expressionFunctions")
public class ExpressionFunctions {

    private final Map<String, Function> functionsByName;

    /**
     * @param contextService The service for interacting with the context
     * @param definitionService The service for looking up components.
     */
    @Lazy
    @Autowired
    public ExpressionFunctions(final ContextService contextService, final DefinitionService definitionService) {
        final Function[] l = new Function[]{
            ADD,
            SUBTRACT,
            MULTIPLY,
            DIVIDE,
            MODULUS,
            GREATER_THAN,
            GREATER_THAN_OR_EQUAL,
            LESS_THAN,
            LESS_THAN_OR_EQUAL,
            AND,
            OR,
            NOT,
            NEGATE,
            ABSOLUTE,
            EQUALS,
            NOTEQUALS,
            TERNARY,
            Empty.getInstance(),
            Format.getInstance(),
            Token.getInstance(contextService, definitionService),
            Join.getInstance()
        };
        final Builder<String, Function> b = ImmutableMap.builder();
        for (final Function f : l) {
            for (final String k : f.getKeys()) {
                b.put(k, f);
            }
        }
        functionsByName = b.build();
    }

    /**
     * @param name The name of the function to lookup.
     * @return The matching {@link Function}.
     */
    public Function lookup(final String name) {
        return functionsByName.get(name);
    }
}
