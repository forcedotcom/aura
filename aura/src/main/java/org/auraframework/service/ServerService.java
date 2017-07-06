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
package org.auraframework.service;

import java.io.IOException;
import java.io.Writer;
import java.util.Map;
import java.util.Set;

import org.auraframework.Aura;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.SVGDef;
import org.auraframework.instance.Component;
import org.auraframework.system.AuraContext;
import org.auraframework.system.Message;
import org.auraframework.throwable.quickfix.QuickFixException;

/**
 * <p>
 * Service for responding to requests from a Aura Client.
 * </p>
 * Instances of all AuraServices should be retrieved from {@link Aura} </p> Note that this service is rather incomplete
 * and should be expanded to include more of the support routines from the servlets.
 */
public interface ServerService extends AuraService {
    /**
     * Run an set of actions and write out the results.
     * 
     * This is actually a mishmash with problematic provenance. We used to take in a message and return one, but that
     * means that we need to cache everything in memory as we run. With the immediate write-out here, we can re-use
     * components across repetative actions. We also have the capacity to free up resources from actions after running
     * them, and, in the event that the output stream is writing out immediately, we will chunk out data earlier rather
     * than later.
     * 
     * Unfortunately, this makes the serialization service a little less useful, but then it was being misused to the
     * point of stupidity anyway.
     * 
     * @param message non-null, The message containing the actions.
     * @param context non-null, the context to use.
     * @param out non-null, where to write the output.
     * @param extras (can be null) the extras to write.
     * @throws QuickFixException if there was a problem instantiating components.
     * @throws IOException if it is unable to write the output.
     */
    void run(Message message, AuraContext context, Writer out, Map<?, ?> extras)
            throws QuickFixException, IOException;

    /**
     * write out CSS.
     * 
     * This writes out CSS for the preloads + app to the response.
     * 
     * @param out the appendable
     * @throws IOException if unable to write to the response
     * @throws QuickFixException if the definitions could not be compiled.
     */
    void writeAppCss(Set<DefDescriptor<?>> dependencies, Writer out) throws IOException, QuickFixException;
    
    <T extends BaseComponentDef> Component writeTemplate(AuraContext context, T value, Map<String, Object> componentAttributes, Appendable out) throws IOException, QuickFixException;

    /**
     * write out SVG.
     * 
     * This writes out a single SVG for the requested app/component to the response.
     * 
     * @param out the appendable
     * @throws IOException if unable to write to the response
     * @throws QuickFixException if the definitions could not be compiled.
     */
    void writeAppSvg(DefDescriptor<SVGDef> svg, Writer out) throws IOException,
            QuickFixException;

    /**
     * write out the complete set of definitions in JS.
     * 
     * This generates a complete set of definitions for an app in JS+JSON.
     */
    void writeDefinitions(Set<DefDescriptor<?>> dependencies, Writer out, boolean hasParts, int partIndex) throws IOException, QuickFixException;

    /**
     * Write out a set of components in JSON.
     * 
     * This writes out the entire set of components from the namespaces in JSON.
     */
    void writeComponents(Set<DefDescriptor<?>> dependencies, Writer out) throws IOException, QuickFixException;
}
