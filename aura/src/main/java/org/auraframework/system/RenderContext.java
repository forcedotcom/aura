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
package org.auraframework.system;

/**
 * RenderContext public interface
 */
public interface RenderContext {

    /**
     * Push into script mode.
     *
     * This must be matched by a popScript on exit, preferably with a try/finally block. This should be
     * used at the start of a script block, followed by a popScript at the end.
     */
    public void pushScript();

    /**
     * Pop out of script mode.
     * @return true if there are more scripts to pop
     */
    public boolean popScript();


    /**
     * Get the current appendable.
     *
     * This function should be used by renderers to decide where to render. In general they
     * should never render specifically to the 'script' or 'standard' appendables, but rather
     * use push, pop, and getCurrent().
     *
     * @return the current appendable for writing.
     */
    public Appendable getCurrent();

    /**
     * Get the script output of the render.
     *
     * This function should be used by the original caller to get the rendered script.
     *
     * @return the 'script'.
     */
    public String getScript();

    /**
     * Get only the current script output of the render.
     *
     * This function should be used by the original caller to get the rendered script.
     *
     * @return the 'script'.
     */
    public String getCurrentScript();

    /**
     * Get the standard output.
     *
     * This is the rendered output for everything other than scripts.
     *
     * @return the 'standard' appendable.
     */
    public String getStandard();
}
