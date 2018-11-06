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
package org.auraframework.modules.impl;

import java.util.ArrayList;
import java.util.List;

import javax.annotation.Nonnull;

import org.lwc.diagnostic.Diagnostic;

public class ModulesCompilerException extends RuntimeException {
    private List<Diagnostic> diagnostics;
    
    public ModulesCompilerException(String message) {
        this(message, null);
    }
    
    public ModulesCompilerException(String message, List<Diagnostic> diagnostics) {
        super(message);
        if (diagnostics == null) {
            diagnostics = new ArrayList<Diagnostic>();
        }
        this.diagnostics = diagnostics;
    }
    
    public void addDiagnostic(@Nonnull Diagnostic diagnostic) {
        this.diagnostics.add(diagnostic);
    }
    
    public List<Diagnostic> getDiagnostics() {
        return this.diagnostics;
    }
    
    @Override
    public String toString() {
        StringBuffer sb = new StringBuffer();
        sb.append(this.getMessage());
        // TODO: Revisit once Diagnostic implements a better toString() override;
        for (Diagnostic diagnostic : diagnostics) {
            sb.append('\n');
            sb.append(diagnostic.message);
        }
        return sb.toString();
    }
}
