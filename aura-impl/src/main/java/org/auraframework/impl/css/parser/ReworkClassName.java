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

import java.util.HashSet;
import java.util.List;

import org.auraframework.system.Location;
import org.auraframework.throwable.quickfix.StyleParserException;

import com.google.common.collect.Lists;
import com.google.common.collect.Sets;
import com.phloc.css.ECSSVersion;
import com.phloc.css.ICSSWriterSettings;
import com.phloc.css.decl.CSSSelector;
import com.phloc.css.decl.CSSSelectorSimpleMember;
import com.phloc.css.decl.ICSSSelectorMember;
import com.phloc.css.writer.CSSWriterSettings;

/**
 * Change .THIS to the actual class name. This also does validation if enabled.
 */
public class ReworkClassName implements Rework<CSSSelector> {
    private static final String THIS_NAMESPACE = ".THIS";
    private static final HashSet<String> NON_REFINERS = Sets.newHashSet(" ", ":", ">", "+", "|");
    private static final ICSSWriterSettings SETTINGS = new CSSWriterSettings(ECSSVersion.LATEST);

    private final String componentClass;
    private final boolean validate;

    public ReworkClassName(String componentClass, boolean validate) {
        this.componentClass = "." + componentClass;
        this.validate = validate;
    }

    @Override
    public void perform(CSSSelector selector, List<CSSSelector> reworked, List<Exception> errors) {
        boolean found = false;
        boolean replacement = false;
        boolean illegal = false;
        List<ICSSSelectorMember> replacementMembers = Lists.newArrayList();

        for (int i = 0; i < selector.getMemberCount(); i++) {
            ICSSSelectorMember member = selector.getMemberAtIndex(i);
            String name = member.getAsCSSString(SETTINGS, 0);
            if (!found && NON_REFINERS.contains(name)) {
                illegal = true;
            }
            if (name.equals(THIS_NAMESPACE)) {
                replacement = true;
                found = true;
                replacementMembers.add(new CSSSelectorSimpleMember(componentClass));
            } else {
                if (name.equals(componentClass)) {
                    found = true;
                }
                replacementMembers.add(member);
            }

        }
        if (validate && (!found || illegal)) {
            Location l = new Location(componentClass, selector.getSourceLocation().getFirstTokenBeginLineNumber(),
                    selector.getSourceLocation().getFirstTokenBeginColumnNumber(), -1);
            errors.add(new StyleParserException("CSS selectors must include component class: \"" + componentClass
                    + "\"", l));
        }
        if (replacement) {
            while (selector.getMemberCount() > 0) {
                selector.removeMember(0);
            }

            for (int i = 0; i < replacementMembers.size(); i++) {
                selector.addMember(replacementMembers.get(i));
            }
        }

        reworked.add(selector);
    }
}
