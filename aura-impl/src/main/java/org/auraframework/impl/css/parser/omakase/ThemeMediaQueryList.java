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
package org.auraframework.impl.css.parser.omakase;

import java.io.IOException;

import com.google.common.base.Optional;
import com.salesforce.omakase.ast.AbstractSyntax;
import com.salesforce.omakase.ast.atrule.AtRuleExpression;
import com.salesforce.omakase.ast.atrule.MediaQueryList;
import com.salesforce.omakase.broadcast.Broadcaster;
import com.salesforce.omakase.writer.StyleAppendable;
import com.salesforce.omakase.writer.StyleWriter;

/**
 * Custom AST object representing a theme function media query.
 * 
 * <p>
 * Theme functions reference one or more variables from a .theme file.
 */
public class ThemeMediaQueryList extends AbstractSyntax implements AtRuleExpression {
    private final String expression;
    private MediaQueryList queryList;

    public ThemeMediaQueryList(int line, int column, String expression) {
        super(line, column);
        this.expression = expression;
    }

    public String expression() {
        return expression;
    }

    public ThemeMediaQueryList queryList(MediaQueryList queryList) {
        this.queryList = queryList;
        return this;
    }

    public Optional<MediaQueryList> queryList() {
        return Optional.fromNullable(queryList);
    }

    @Override
    public void propagateBroadcast(Broadcaster broadcaster) {
        if (queryList != null) {
            super.propagateBroadcast(broadcaster);
            queryList.propagateBroadcast(broadcaster);
        }
    }

    @Override
    public boolean isWritable() {
        return queryList == null || queryList.isWritable();
    }

    @Override
    public void write(StyleWriter writer, StyleAppendable appendable) throws IOException {
        if (queryList != null) {
            writer.writeInner(queryList, appendable);
        } else {
            appendable.append("theme(").append(expression).append(")");
        }
    }
}
