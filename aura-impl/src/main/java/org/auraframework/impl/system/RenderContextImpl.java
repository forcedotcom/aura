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
import org.auraframework.throwable.AuraRuntimeException;

import java.io.IOException;

public class RenderContextImpl implements RenderContext {
    private final Appendable script;
    private final Appendable standard;
    private final StringBuilder partialScript;
    private Appendable current;
    private int scriptCount;
    private String currentScript;

    public RenderContextImpl(Appendable standard, Appendable script) {
        this.script = script;
        this.partialScript = new StringBuilder();
        this.standard = standard;
        this.current = standard;
        this.scriptCount = 0;
    }

    @Override
    public void pushScript() {
        current = partialScript;
        scriptCount += 1;
    }

    @Override
    public boolean popScript() {
        if (--scriptCount == 0) {
            current = standard;
            try {
                currentScript = partialScript.toString();
                partialScript.setLength(0);
                script.append(currentScript);
            } catch (IOException e) {
                throw new AuraRuntimeException(e);
            }
            return false;
        } else {
            if (scriptCount < 0) {
                throw new RuntimeException("Script popped too many times");
            }
        }
        return true;
    }

    @Override
    public Appendable getCurrent() {
        return current;
    }

    @Override
    public String getScript() {
        StringBuilder scriptChunks = new StringBuilder();
        boolean hasScript = script != null;
        boolean hasPartialScript = partialScript.length() > 0;
        if (hasScript){
            scriptChunks.append(script.toString());
        }
        if (hasPartialScript){
            scriptChunks.append(partialScript.toString());
        }

        return hasScript || hasPartialScript ? scriptChunks.toString() : null;
    }

    @Override
    public String getCurrentScript() {
        //if we have appended to the current script use that. otherwise use the last completed script
        if (partialScript.length() > 0){
            return partialScript.toString();
        }
        return currentScript;
    }

    @Override
    public String getStandard() {
        if(standard == null) {
            return null;
        }
        return standard.toString();
    }
}
