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
/**
 */
package org.auraframework.impl.expression;

import org.antlr.runtime.RecognitionException;

/**
 * Workaround for antlr's lexer not allowing a checked exception to be thrown
 * when reporting errors
 * 
 * 
 * @since 0.0.204
 */
public class AuraLexerException extends RuntimeException {

    private static final long serialVersionUID = 6067199284491857917L;

    final RecognitionException re;

    public AuraLexerException(RecognitionException re) {
        this.re = re;
    }

}
