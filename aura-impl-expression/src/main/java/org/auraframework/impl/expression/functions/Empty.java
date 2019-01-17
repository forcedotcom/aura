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
package org.auraframework.impl.expression.functions;

import org.springframework.util.ObjectUtils;

/**
 * Empty is meant to match {@code Aura.Utils.Util.prototype.isEmpty} in Util.js
 */
public class Empty extends BaseUnaryFunction {
    private static final long serialVersionUID = -8834318118368934926L;

    private static final Empty INSTANCE = new Empty();
    
    /**
     * @return An instance of {@link Empty}
     */
    public static final Empty getInstance() {
        return INSTANCE;
    }
    
    private Empty() {
        // Make sure there is only 1 instance
    }
    
    @Override
    public Object evaluate(final Object arg) {
        return Boolean.valueOf(ObjectUtils.isEmpty(arg));
    }

    @Override
    public String getJsFunction() {
        return "fn.empty";
    }

    @Override
    public String[] getKeys() {
        return new String[] { "empty" };
    }
}