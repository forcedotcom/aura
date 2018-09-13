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
package org.auraframework.throwable;

import org.apache.commons.lang3.StringEscapeUtils;
import org.apache.http.HttpStatus;

/**
 * This exception indicates that the input passed in from the client is not in a valid format or of a valid
 * type as required by the Aura code.
 * 
 * @author eperret (Eric Perret)
 */
public class AuraRequestInputException extends SystemErrorException {

    private static final long serialVersionUID = -5430629543069441191L;
    private final String invalidInput;

    /**
     * Create an exception with an invalid input and expected format.
     * 
     * @param invalidInput the invalid input passed from the client. This is not used, but useful when
     *        debugging the code.
     * @param expectedInputFormatText The expected format of the input, for example, "A JSON map of data".
     * @see #AuraClientInputException(Throwable, String, String)
     */
    public AuraRequestInputException(final String invalidInput, final String expectedInputFormatText) {
        super(generateMessage(expectedInputFormatText));
        this.invalidInput = invalidInput;
    }
    
    /**
     * Create an exception with an invalid input, expected format, and with a cause.
     * 
     * @param cause the cause of the error.
     * @param invalidInput the invalid input passed from the client. This is not used, but useful when
     *        debugging the code.
     * @param expectedInputFormatText The expected format of the input, for example, "A JSON map of data".
     * @see #AuraClientInputException(String, String)
     */
    public AuraRequestInputException(final Throwable cause, final String invalidInput, final String expectedInputFormatText) {
        super(generateMessage(expectedInputFormatText), cause);
        this.invalidInput = invalidInput;
    }
    
    private static String generateMessage(final String expectedInputFormat) {
        return "[AuraClientInputException from server] Unexpected request input. Expected input format: \"" + StringEscapeUtils.escapeEcmaScript(expectedInputFormat) + "\".";
    }
    
    @Override
    String getDefaultHandlerMessage() {
        return getMessage();
    }
    
    @Override
    public int getStatusCode() {
        return HttpStatus.SC_BAD_REQUEST;
    }
    
    /**
     * @return The invalidInput
     */
    public String getInvalidInput() {
        return invalidInput;
    }
}