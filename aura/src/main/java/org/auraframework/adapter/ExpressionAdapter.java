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
package org.auraframework.adapter;

import org.auraframework.expression.Expression;
import org.auraframework.system.Location;
import org.auraframework.throwable.AuraValidationException;

/**
 * adapt a parser that takes in strings and returns {@link Expression} objects
 * default implementation is in the aura-impl-expression module
 */
public interface ExpressionAdapter extends AuraAdapter {

    /**
     * parses the given string from the given location into Expressions
     * @throws AuraValidationException when the expression is not valid
     */
    Expression buildExpression(String s, Location start) throws AuraValidationException;

}
