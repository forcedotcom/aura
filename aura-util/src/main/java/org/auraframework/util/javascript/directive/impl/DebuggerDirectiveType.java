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
package org.auraframework.util.javascript.directive.impl;

import org.auraframework.util.javascript.directive.DirectiveType;

/**
 * debugger;
 * without jslint complaining
 */
public class DebuggerDirectiveType implements DirectiveType<DebuggerDirective> {

    public DebuggerDirectiveType() {
    }

    @Override
    public String getLabel() {
        return "debugger";
    }

    @Override
    public DebuggerDirective constructDirective(int offset, String line) {
        return new DebuggerDirective(offset, line);
    }

}
