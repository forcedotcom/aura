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

import java.io.IOException;
import java.util.List;
import java.util.Set;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.auraframework.Aura;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.Definition;
import org.auraframework.system.Source;
import org.auraframework.throwable.quickfix.AuraValidationException;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.throwable.quickfix.StyleParserException;
import org.auraframework.util.css.CSSLintValidator;
import org.auraframework.util.javascript.JavascriptProcessingError;
import org.auraframework.util.javascript.JavascriptProcessingError.Level;
import org.auraframework.util.javascript.JavascriptValidator;
import org.auraframework.util.json.JsonConstant;
import org.auraframework.util.json.JsonStreamReader;
import org.auraframework.util.validation.ValidationError;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.Lists;

/**
 * Engine for Aura validations
 */
public final class ValidationEngine {

    private static final Log LOG = LogFactory.getLog(ValidationEngine.class);

    private static final List<ValidationError> NO_ERRORS = ImmutableList.of();

    /**
     * Validates definition denoted by descriptor
     */
    public List<ValidationError> validate(DefDescriptor<? extends Definition> descriptor) {
        Source<?> source = Aura.getContextService().getCurrentContext().getDefRegistry().getSource(descriptor);

        if (source == null) {
            LOG.warn("cannot find source for " + descriptor);
            // TODO: report analysis error
            return NO_ERRORS;
        }

        try {
            List<? extends ValidationError> errors = validate0(descriptor, source);
            return (errors != null) ? Lists.newArrayList(errors) : NO_ERRORS;
        } catch (Exception ex) {
            LOG.warn(descriptor + " (" + source.getUrl() + ')', ex);
            // TODO: report analysis error
            return NO_ERRORS;
        }
    }

    /**
     * Validates all know descriptors.
     * 
     * @param prefix language prefix to validate, or null to validate all prefixes
     */
    public List<ValidationError> validateAllKnown(String prefix) throws QuickFixException {
        List<ValidationError> allErrors = Lists.newArrayList();

        Set<DefDescriptor<?>> descriptors = ValidationUtil.getAllKnownDescriptors();
        for (DefDescriptor<?> descriptor : descriptors) {
            if (prefix == null || prefix.equals(descriptor.getPrefix())) {
                allErrors.addAll(validate(descriptor));
            }
        }

        return allErrors;
    }

    // private:

    private List<ValidationError> validate0(DefDescriptor<? extends Definition> descriptor, Source<?> source)
            throws Exception {
        List<ValidationError> errors = Lists.newArrayList();
        String prefix = descriptor.getPrefix();
        try {
            // getDef() invokes the validate methods
            descriptor.getDef();
        } catch (StyleParserException e) {
            if (prefix.equals(DefDescriptor.CSS_PREFIX)) {
                // report css parser errors only when directly validating a .css def
                errors.add(AuraValidationError.make(source.getUrl().toString(), e));
            }
        } catch (DefinitionNotFoundException e) {
            // can happen if not analyzing all source and for .java not in classpath
            LOG.warn("exception loading definition for " + descriptor + ": " + e);
        } catch (AuraValidationException e) {
            errors.add(AuraValidationError.make(source.getUrl().toString(), e));
        } catch (Exception e) {
            LOG.warn("exception loading definition for " + descriptor + ": " + e);
        }

        // perform language specific checking
        if (prefix.equals(DefDescriptor.JAVASCRIPT_PREFIX)) {
            errors.addAll(validateJavascript(source, descriptor.getDefType()));
        } else if (prefix.equals(DefDescriptor.CSS_PREFIX)) {
            errors.addAll(validateCSS(source, descriptor.getDefType()));
        }
        // TODO: all other prefixes

        return ValidationUtil.patchErrors(errors);
    }

    private List<ValidationError> validateJavascript(Source<?> source, DefType defType) throws IOException {
        String sourceUrl = source.getUrl().toString();
        String sourceCode = source.getContents() + ';';

        // check if needs to add "var actions=" line before '{' to prevent jslint parser errors
        JsonStreamReader jreader = new JsonStreamReader(sourceCode);
        jreader.setRecursiveReadEnabled(false);
        // skip comment and whitespace
        JsonConstant token = jreader.next();
        int lineOffset = 0;
        JavascriptProcessingError customError = null;
        if (token == JsonConstant.OBJECT_START) {
            // fix, but report a ValidationError also
            int charNum = jreader.getCharNum();
            sourceCode = "var actions=\n" + sourceCode.substring(charNum - 1);
            //
            // We do some fancy footwork here to get the line number right.
            // (1) we take off 1 to remove the (first line = 1) from the reader.
            // (2) we take off 1 for the '\n' just above in the fixup.
            // (3) we add back two when creating the error to make the line correct
            //     here while having the line offset adjusted correctly.
            // A little confusing, but it does do the right thing.
            //
            lineOffset = jreader.getLineNum() - 2;
            customError = new JavascriptProcessingError("Starting '(' missing", lineOffset + 2, 1,
                    sourceUrl,
                    null, Level.Error);
        }

        // TODO: reuse validators for optimization?
        List<ValidationError> errors = Lists.newArrayList();
        List<JavascriptProcessingError> jsErrors = new JavascriptValidator()
                .validate(sourceUrl, sourceCode, false, false);
        errors.addAll(ValidationUtil.patchErrorLines(jsErrors, lineOffset));
        if (customError != null)
            errors.add(0, customError);
        return errors;
    }

    private List<ValidationError> validateCSS(Source<?> source, DefType defType) throws IOException {
        String sourceUrl = source.getUrl().toString();
        String sourceCode = source.getContents();

        return new CSSLintValidator().validate(sourceUrl, sourceCode, true);
    }
}
