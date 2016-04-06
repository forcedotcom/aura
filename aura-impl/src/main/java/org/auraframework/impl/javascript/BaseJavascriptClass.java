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

package org.auraframework.impl.javascript;

import java.io.IOException;
import java.io.Serializable;
import java.io.StringWriter;
import java.util.List;

import org.auraframework.system.Location;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.javascript.JavascriptProcessingError;
import org.auraframework.util.javascript.JavascriptWriter;

public abstract class BaseJavascriptClass implements Serializable {
	private static final long serialVersionUID = 7445974179103021929L;

	private final String code;
	private final String minifiedCode;

	public BaseJavascriptClass(Builder builder) {
		code = builder.code;
		minifiedCode = builder.minifiedCode;
	}
	
    public String getCode() {
    	return code;
    }

    public String getMinifiedCode() {
    	return minifiedCode;
    }

    public static abstract class Builder {

    	private String code;
    	private String minifiedCode;

	    /**
	     * Return true is the class has JS code.
	     * This is a minimization process to skip extra calls to the compiler.
	     * @return true if class needs to be compiled.
	     */
	    protected abstract boolean hasCode();
	
	    /**
	     * Get file location.
	     * @return the Location for referencing errors 
	     */
	    protected abstract Location getLocation();

	    /**
	     * Get filename.
	     * @return the Location for referencing errors 
	     */
	    protected abstract String getFilename();

	    /**
	     * Generates the JavaScript class.
	     * @return the JavaScript class. 
	     * @throws QuickFixException
	     */
	    protected abstract String generate() throws QuickFixException;
	
        protected void finish() throws QuickFixException {
        	code = generate();

        	if (hasCode()) {
			    try {
			    	StringWriter sw = new StringWriter();
			    	List<JavascriptProcessingError> codeErrors = JavascriptWriter.CLOSURE_SIMPLE.compress(code, sw, getFilename());
			    	validateCodeErrors(codeErrors);			    	
			    	minifiedCode = sw.toString();
			    } catch (IOException e) {
			    	// There is no IO in this scenario. The JavascriptWriter API requires
			    	// this catch, even if it's never called when reading from a string.
			    	throw new AuraRuntimeException(e.getMessage());
			    }
			}
	    }
                
        private void validateCodeErrors(List<JavascriptProcessingError> codeErrors) throws InvalidDefinitionException {
	    	if (codeErrors != null && !codeErrors.isEmpty()) {
	            StringBuilder sb = new StringBuilder();
	            boolean first = true;
	            for (JavascriptProcessingError error : codeErrors) {
	            	if (first) {
	            		first = false;
	            	} else {
	            		sb.append("\n");
	            	}
	            	sb.append(error.toString());
	            }
	            if (sb.length() > 0) {
	            	throw new InvalidDefinitionException(sb.toString(), getLocation());
	            }
	        }
         }
    }
 }

