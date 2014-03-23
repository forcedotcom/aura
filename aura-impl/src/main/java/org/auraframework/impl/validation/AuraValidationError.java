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
package org.auraframework.impl.validation;

import org.auraframework.system.Location;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.AuraValidationException;
import org.auraframework.throwable.quickfix.StyleParserException;
import org.auraframework.util.javascript.JavascriptProcessingError.Level;
import org.auraframework.util.validation.ValidationError;

/**
 * A ValidationError from Aura's builtin validation.
 */
public final class AuraValidationError extends ValidationError {

    static ValidationError make(String filename, AuraValidationException e) {
        if (e instanceof StyleParserException) {
            return parseCSSParserError(filename, e);
        }

        Location location = e.getLocation();
        String suffix = filename.substring(filename.lastIndexOf('.') + 1);
        int line = location.getLine();
        if (line == 0) {
            line = 1;
        }
        String message = e.getMessage();
        if (message == null || message.length() == 0)
            message = e.toString();
        // TODO: location may have be for a different filename than the one we are checkin
        return new AuraValidationError(suffix + "/custom", filename, line, location.getColumn(),
                message);
    }

    private static ValidationError parseCSSParserError(String filename, AuraValidationException ave) {
        String m = ave.getMessage().trim();
        int line;
        int startColumn;
        String message;
        try {
            int start = m.indexOf('\n', m.indexOf('\n') + 1) + 1;
            if (m.endsWith(")")) {
                // the CSS parser puts the info in the exception message as:
                // Issue(s) found by CSS Parser (css://externalTest.external2):
                //
                // CSS selector must begin with '.externalTestExternal2' or '.THIS' (line 1, col 1)
                int lp = m.lastIndexOf('(');
                int comma = m.indexOf(',', lp);
                int rp = m.lastIndexOf(')');
                message = m.substring(start, lp).trim();
                line = Integer.parseInt(m.substring(lp + 6, comma));
                startColumn = Integer.parseInt(m.substring(comma + 6, rp));
            } else {
                // Unable to parse remaining declaration value ':
                // z-index:1' (did you forget a semicolon?):
                // at line 2, column 22 near
                // 'absolute»:
                // z-index:1'
                int at = m.indexOf("at line");
                int lineStart = at + 8;
                int comma = m.indexOf(',', lineStart);
                int columnStart = comma + 9;
                int columnEnd = m.indexOf(' ', columnStart);
                message = m.substring(start, at).trim();
                line = Integer.parseInt(m.substring(lineStart, comma));
                startColumn = Integer.parseInt(m.substring(columnStart, columnEnd));
            }
        } catch (Exception e) {
            throw new AuraRuntimeException("cannot parse " + m, e);
        }

        return new AuraValidationError("cssparser", filename, line, startColumn, message);
    }

    //

    private AuraValidationError(String tool, String filename, int line, int startColumn, String message) {
        super(tool, filename, line, startColumn, message, null, Level.Error, null);
    }
}
