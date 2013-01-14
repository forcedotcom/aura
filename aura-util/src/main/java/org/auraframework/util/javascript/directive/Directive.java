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
package org.auraframework.util.javascript.directive;

import java.io.IOException;
import java.util.List;

import org.auraframework.util.javascript.JavascriptProcessingError;
import org.auraframework.util.javascript.JavascriptValidator;

/**
 * Directive to the parser, matching lines beginning with //#. The rest of the
 * matching line will be passed for processing. Directives are removed from the
 * file and can be replaced with anything, and create more directives
 */
public interface Directive {

    /**
     * @return the index of where this directive was in the file
     */
    int getOffset();

    /**
     * the remainder of the line in the original file
     */
    String getLine();

    /**
     * called during the parsing phase, this allows the directive to pass
     * metadata back to the group
     */
    void processDirective(DirectiveBasedJavascriptGroup parser) throws IOException;

    /**
     * some directives have multiline content in between a start and end marker.
     * Note that multiline directives *cannot* be nested
     * 
     * @return true if this directive has a matching end directive
     */
    boolean isMultiline();

    /**
     * sets the content of a multiline directive
     * 
     * @param content between the directives line and the corresponding end
     *            directive
     */
    void setContent(String content);

    /**
     * might not even have output in some contexts
     * 
     * @return whether or not to call generate
     */
    boolean hasOutput(JavascriptGeneratorMode mode);

    /**
     * Do extra validation on the content generated, mainly only for include
     */
    List<JavascriptProcessingError> validate(JavascriptValidator validator);

    /**
     * generates the actual output that should go into the file
     */
    String generateOutput(JavascriptGeneratorMode mode);
}
