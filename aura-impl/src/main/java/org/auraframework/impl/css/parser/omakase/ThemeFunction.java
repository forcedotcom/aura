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
import java.util.List;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.Iterables;
import com.salesforce.omakase.ast.declaration.AbstractTerm;
import com.salesforce.omakase.ast.declaration.Term;
import com.salesforce.omakase.ast.declaration.TermListMember;
import com.salesforce.omakase.ast.declaration.TermView;
import com.salesforce.omakase.broadcast.Broadcaster;
import com.salesforce.omakase.broadcast.annotation.Subscribable;
import com.salesforce.omakase.writer.StyleAppendable;
import com.salesforce.omakase.writer.StyleWriter;

/**
 * Custom AST object representing a theme function.
 * 
 * <p>
 * Theme functions reference one or more variables from a .theme file.
 */
@Subscribable
public class ThemeFunction extends AbstractTerm implements TermView {
    private final String expression;
    private boolean evaluatedToEmpty;
    private List<TermListMember> members;

    public ThemeFunction(int line, int column, String expression) {
        super(line, column);
        this.expression = expression;
    }

    public String expression() {
        return expression;
    }

    public boolean evaluatedToEmpty() {
        return evaluatedToEmpty;
    }

    public void members(Iterable<TermListMember> members) {
        this.members = ImmutableList.copyOf(members);
        this.evaluatedToEmpty = this.members.isEmpty();
    }

    public List<TermListMember> members() {
        return ImmutableList.copyOf(members);
    }

    @Override
    public Iterable<Term> terms() {
        return members != null ? Iterables.filter(members, Term.class) : ImmutableList.<Term> of();
    }

    @Override
    public void propagateBroadcast(Broadcaster broadcaster) {
        if (members != null) {
            super.propagateBroadcast(broadcaster);
            for (TermListMember member : members) {
                member.propagateBroadcast(broadcaster);
            }
        }
    }

    @Override
    public boolean isWritable() {
        return members == null || !members.isEmpty();
    }

    @Override
    public void write(StyleWriter writer, StyleAppendable appendable) throws IOException {
        if (members != null) {
            for (TermListMember member : members) {
                writer.writeInner(member, appendable);
            }
        } else {
            appendable.append("theme(").append(expression).append(")");
        }
    }
}
