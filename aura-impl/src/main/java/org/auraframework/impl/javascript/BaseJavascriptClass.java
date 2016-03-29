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
import java.io.StringWriter;
import java.util.List;

import org.auraframework.builder.DefBuilder;
import org.auraframework.def.CodeDefinition;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.JavascriptCodeBuilder;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil;
import org.auraframework.util.javascript.JavascriptProcessingError;
import org.auraframework.util.javascript.JavascriptWriter;

/**
 * This class acts a decorator to augment the definition builder with processed JavaScript code,
 * and by extension the associated definition, without adding more code to the handler or to the
 * builder itself. It should be called from Builder.build().
 */
public abstract class BaseJavascriptClass {

	private final DefBuilder<?, ?> defBuilder;

	private String code;
	private String minifiedCode;
	private List<JavascriptProcessingError> codeErrors;

    public BaseJavascriptClass(DefBuilder<?, ?> defBuilder) {
    	this.defBuilder = defBuilder;
    }

    /**
     * This method creates the component class from the source builder
     * passed to the construction and outputs it to the builder passed
     * as a parameter here.
     * @param codeBuilder The builder to modify.
     */
    public void construct(JavascriptCodeBuilder codeBuilder) {
    	if (defBuilder.getDescriptor() != null) {
			try {
				initialize();
				code = buildClass();
				if (hasCode()) {
					minimize(getFilename(defBuilder.getDescriptor()));
				}
				exportAttibutes(codeBuilder);
			} catch (QuickFixException qfe) {
				defBuilder.setParseError(qfe);
			}
    	}
    }

    /**
     * Extracts all attributes from the definition that will be used
     * during the assembly of the JavaScript class.
     * @throws QuickFixException
     */
    protected abstract void initialize() throws QuickFixException;

    /**
     * Inspect the dependencies to decide whether or not compile the class.
     * @return true if class needs to be compiled.
     */
    protected abstract boolean hasCode();

    /**
     * Sets the filename for the compiler, so errors are marked against the
     * right resource.
     * @param descriptor
     * @return the filename to pass to the compiler
     */
    protected abstract String getFilename(DefDescriptor<?> descriptor);

    /**
     * Creates the JavaScript class.
     * @throws QuickFixException
     */
    protected abstract String buildClass();

    /**
     * Checks if a definition has any JavaScript code.
     * @param descriptor
     * @return true if no JavaScript code is present.
     */
    protected boolean isCodeEmpty(CodeDefinition descriptor) {
    	return descriptor == null || AuraTextUtil.isNullEmptyOrWhitespace(descriptor.getCode());
    }

    private void minimize(String filename) {
	    try {
	    	StringWriter sw = new StringWriter();
	    	codeErrors = JavascriptWriter.CLOSURE_SIMPLE.compress(code, sw, filename);
		    minifiedCode = sw.toString();
	    } catch (IOException e) {
	    	// There is no IO in this scenario. The JavascriptWriter API requires
	    	// this catch even if never called when reading from a string.
	    	throw new AuraRuntimeException(e.getMessage());
	    }
	}

    private void exportAttibutes(JavascriptCodeBuilder codeBuilder) {
    	codeBuilder.setCode(code);
    	codeBuilder.setMinifiedCode(minifiedCode);
    	codeBuilder.setCodeErrors(codeErrors);
    }
 }

