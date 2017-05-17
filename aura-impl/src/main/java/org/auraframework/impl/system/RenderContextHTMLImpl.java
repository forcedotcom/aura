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

import java.io.IOException;

import org.auraframework.system.RenderContext;


public class RenderContextHTMLImpl implements RenderContext {
    private Appendable out;
    private int scriptCount = 0;
        
    public RenderContextHTMLImpl(Appendable out) {
        this.out = out;
    }
    
    @Override
    public void pushScript() {
        if (scriptCount++ == 0) {
            try {
                out.append("<script>");
            } catch (IOException ioe) {
                // ignore
            }
        }
    }

    @Override
    public boolean popScript() {
        if (--scriptCount == 0) {
            try {
                out.append("</script>");
                return false;
            } catch (IOException ioe) {
                // ignore
            }
        }
        return true;
    }

    @Override
    public Appendable getCurrent() {
        return out;
    }

    @Override
    public String getScript() {
        return "";
    }

    @Override
    public String getCurrentScript() {
        return "";
    }

    @Override
    public String getStandard() {
        return out.toString();
    }
}

