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
package org.auraframework.impl.system;

import org.auraframework.system.RenderContext;

public class RenderContextImpl implements RenderContext {
    private final Appendable script;
    private final Appendable standard;
    private Appendable current;
    private int scriptCount;

    public RenderContextImpl(Appendable standard, Appendable script) {
        this.script = script;
        this.standard = standard;
        this.current = standard;
        this.scriptCount = 0;
    }

    @Override
    public void pushScript() {
        current = script;
        scriptCount += 1;
    }

    @Override
    public void popScript() {
        if (--scriptCount == 0) {
            current = standard;
        } else {
            if (scriptCount < 0) {
                throw new RuntimeException("Script popped too many times");
            }
        }
    }

    @Override
    public Appendable getCurrent() {
        return current;
    }

    @Override
    public String getScript() {
        return script.toString();
    }

    @Override
    public String getStandard() {
        return standard.toString();
    }
}
