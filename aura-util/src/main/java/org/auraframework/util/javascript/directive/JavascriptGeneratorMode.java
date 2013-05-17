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
package org.auraframework.util.javascript.directive;

import org.auraframework.util.javascript.JavascriptWriter;

/**
 * Modes are for generating copies of javascript files suited for specific purposes, the most basic being for
 * development and production. TODO: need a way to only allow production mode in production
 */
public enum JavascriptGeneratorMode {

    /**
     * the mode thats usually used in your local build. leaves comments intact so you can read your code
     */
    DEVELOPMENT("dev", true, JavascriptWriter.CLOSURE_AURA_DEBUG),

    /**
     * enable the tracking of additional runtime statistics
     */
    STATS("stats", true, JavascriptWriter.CLOSURE_AURA_DEBUG),

    /**
     * testing mode is for running ftests so you can expose private data or methods that need to be tested but are not
     * normally exposed by the code
     */
    TESTING("test", true, JavascriptWriter.CLOSURE_AURA_DEBUG),

    TESTINGDEBUG("testdebug", true, JavascriptWriter.CLOSURE_AURA_DEBUG),

    AUTOTESTING("auto", false, JavascriptWriter.CLOSURE_AURA_PROD),

    AUTOTESTINGDEBUG("autodebug", true, JavascriptWriter.CLOSURE_AURA_DEBUG),

    /**
     * in production everything is compressed to reduce file size
     */
    PRODUCTION("prod", false, JavascriptWriter.CLOSURE_AURA_PROD, true),
    /**
     * in ptest everything is compressed to reduce file size. This mode is used to conditionally include performance
     * testing code.
     */
    PTEST("ptest", false, JavascriptWriter.CLOSURE_AURA_PROD, true),

    PRODUCTIONDEBUG("proddebug", false, JavascriptWriter.CLOSURE_AURA_PROD, true),

    /**
     * mode used for documentation (jsdoc), but never served in any context
     */
    DOC("doc", true, null),

    /**
     * mock modes for testing the parser and generator itself. dunt use
     */
    MOCK1("mock1", false, null), MOCK2("mock2", false, null);

    private final String suffix;
    private final boolean comments;
    private final JavascriptWriter jsWriter;
    private final boolean prod;

    private JavascriptGeneratorMode(String suffix, boolean comments, JavascriptWriter compressionLevel) {
        this(suffix, comments, compressionLevel, false);
    }

    private JavascriptGeneratorMode(String suffix, boolean comments, JavascriptWriter compressionLevel, boolean prod) {
        this.suffix = suffix;
        this.comments = comments;
        this.jsWriter = compressionLevel;
        this.prod = prod;
    }

    /**
     * @return true if directives can add their own comments to the result
     */
    public boolean addComments() {
        return comments;
    }

    /**
     * @return true if the output should be compressed
     */
    public JavascriptWriter getJavascriptWriter() {
        return jsWriter == null ? JavascriptWriter.WITHOUT_CLOSURE : jsWriter;
    }

    /**
     * @return the suffix used for the file to be generated
     */
    public String getSuffix() {
        return suffix;
    }

    /**
     * There may be more than 1 mode used in production, this value should control whether the file is even generated in
     * production environment (but it doesn't yet)
     * 
     * @return true if the mode is used in production
     */
    public boolean allowedInProduction() {
        return prod;
    }
}
