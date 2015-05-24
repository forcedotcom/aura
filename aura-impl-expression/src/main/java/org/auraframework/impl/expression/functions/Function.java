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

import java.io.IOException;
import java.io.Serializable;
import java.util.List;

import org.auraframework.expression.Expression;

/**
 * the thing that actually executes some function in the formula engine
 */
public interface Function extends Serializable {

    static final String JS_FN_EQUAL = "fn.eq";
    static final String JS_FN_NOT_EQUAL = "fn.ne";
    static final String JS_FN_ADD = "fn.add";
    static final String JS_FN_EMPTY = "fn.empty";
    static final String JS_FN_FORMAT = "fn.format";

    static final String JS_EMPTY = "\"\"";

    String[] getKeys();

    // void validate(List<TypeDef> types);

    Object evaluate(List<Object> args);

	void compile(Appendable out, List<Expression> args) throws IOException;
}
