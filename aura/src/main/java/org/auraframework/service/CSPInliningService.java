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
import java.util.List;

/**
 * CSPInliningService controls how to annotate and process an script block with an inline body to apply CSP-2 security
 */
public interface CSPInliningService extends AuraService {
    /**
     * will return all directives to append to CSP header
     * @return the list of CSP directives
     */
    List<String> getCurrentScriptDirectives();

    /**
     * processScript is used to record a script body. for example script hashing
     * @param script the script body to process
     */
    void processScript(String script);

    /**
     * Append any security attributes to the current script block. for example applying nonces
     * @param out the appendable that has started the current script block
     * @throws IOException
     */
    void writeInlineScriptAttributes(Appendable out) throws IOException;

    /**
     * Append the script body to the appendable including processing the script body and attributing the script element
     * @param script the script body to process and embed
     * @param out the appendable where the script is embedded
     * @throws IOException
     */
    void writeInlineScript(String script, Appendable out) throws IOException;

    /**
     * check to determine if a script inlining is supported
     * @return true if inlining is supported
     */
    boolean isSupported();

    /**
     * prepend the script block with protection against injection.
     * @param out the appendable where we add our protection
     * @throws IOException
     */
    void preScriptAppend(Appendable out) throws IOException;
}
