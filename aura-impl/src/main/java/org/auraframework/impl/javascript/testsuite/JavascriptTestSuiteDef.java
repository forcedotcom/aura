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
package org.auraframework.impl.javascript.testsuite;

import java.io.IOException;
import java.util.List;

import org.auraframework.def.TestCaseDef;
import org.auraframework.def.TestSuiteDef;
import org.auraframework.impl.system.DefinitionImpl;
import org.auraframework.util.json.Json;

public class JavascriptTestSuiteDef extends DefinitionImpl<TestSuiteDef> implements TestSuiteDef {
    private static final long serialVersionUID = -6488304738447278299L;
    private final String code;
    private final List<TestCaseDef> caseDefs;

    protected JavascriptTestSuiteDef(Builder builder) {
        super(builder);
        this.code = builder.code;
        this.caseDefs = builder.caseDefs;
    }

    @Override
    public void serialize(Json json) throws IOException {
        json.writeMapBegin();
        json.writeMapEntry("descriptor", descriptor);
        json.writeMapEntry("cases", caseDefs);
        json.writeMapEntry("code", code);
        json.writeMapEnd();
    }

    @Override
    public List<TestCaseDef> getTestCaseDefs() {
        return caseDefs;
    }

    @Override
    public String getCode() {
        return code;
    }

    public static class Builder extends DefinitionImpl.BuilderImpl<TestSuiteDef> {

        public Builder() {
            super(TestSuiteDef.class);
        }

        public String code;
        public List<TestCaseDef> caseDefs;

        @Override
        public JavascriptTestSuiteDef build() {
            return new JavascriptTestSuiteDef(this);
        }
    }
}
