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
package org.auraframework.util.css;

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.Map;

import javax.script.Invocable;

import org.auraframework.util.IOUtil;
import org.auraframework.util.validation.RhinoBasedValidator;
import org.auraframework.util.validation.ValidationError;

import com.google.common.collect.Lists;

/**
 * Validates .css using csslint
 */
public final class CSSLintValidator extends RhinoBasedValidator {

    public CSSLintValidator() throws IOException {
        super("csslint");

        // jdk < 1.7 doesn't run csslint.js well
        String javaVersion = System.getProperty("java.version");
        int sep = javaVersion.indexOf('.', javaVersion.indexOf('.') + 1);
        float majorMinor = Float.parseFloat(javaVersion.substring(0, sep));
        if (majorMinor < 1.7) {
            throw new UnsupportedOperationException(
                    "CSSLintValidator requires JDK 1.7 or greater, current is: " + javaVersion);
        }
    }

    /**
     * @param filename filename to use in the Validation errors generated
     * @param source .css source to validate
     * @param disableRulesForAura disables csslint rules that generate bogus for aura .css files (see
     *            app/main/core/build/.csslintrc)
     */
    public List<ValidationError> validate(String filename, String source, boolean disableRulesForAura) {
        List<ValidationError> errors = Lists.newArrayList();
        try {
            @SuppressWarnings("unchecked")
            List<Map<String, ?>> lintErrors = (List<Map<String, ?>>) ((Invocable) engine).invokeFunction(tool
                    + "Helper",
                    source, disableRulesForAura);

            for (int i = 0; i < lintErrors.size(); i++) {
                Map<String, ?> error = lintErrors.get(i);
                errors.add(new ValidationError(tool, filename, error));
            }
        } catch (Exception e) {
            // TODO: should be reported as a validation error
            throw new RuntimeException(e);
        }
        return errors;
    }

    //

    public static void main(String[] args) throws Exception {
        String filename = args[0];
        String source = IOUtil.readTextFile(new File(filename));
        List<ValidationError> ret = new CSSLintValidator().validate(filename, source, true);
        for (ValidationError error : ret) {
            System.out.println(error);
        }
    }
}
