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
package org.auraframework.impl.css.parser;

import com.salesforce.omakase.ast.declaration.GenericFunctionValue;
import com.salesforce.omakase.broadcast.annotation.Subscribable;

/**
 * Custom AST object representing a theme function, e.g. <code>t(color)</code>, inside of a declaration.
 */
@Subscribable
public class ThemeFunction extends GenericFunctionValue {
    public ThemeFunction(int line, int column, String name, String args) {
        super(line, column, name, args);
    }

    public ThemeFunction(String name, String args) {
        super(name, args);
    }
}
