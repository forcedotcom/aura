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

import java.util.List;

import com.google.common.base.Joiner;

/**
 * Join is meant to concatenate an iterable with a separator
 */
public class Join extends BaseMultiFunction {
    private static final long serialVersionUID = -8834318318368762326L;
    
    private static final Join INSTANCE = new Join();
    
    /**
     * @return An instance of {@link Join}
     */
    public static final Join getInstance() {
        return INSTANCE;
    }
    
    private Join() {
        // Make sure there is only 1 instance
    }

    @Override
    public Object evaluate(List<Object> args) {
        int size = args.size();
        if (size < 2) {
            return "";
        }
        if (size == 2){
            return JavascriptHelpers.stringify(args.get(1));
        }
        Object a0 = args.get(0);
        String separator = JavascriptHelpers.stringify(a0 != null ? a0 : "");
        Object[] formatArguments = new Object[size - 1];
        for (int index = 1; index < size; index++) {
            formatArguments[index - 1] = JavascriptHelpers.stringify(args.get(index));
        }

        return Joiner.on(separator).skipNulls().join(formatArguments);
    }

    @Override
    public String getJsFunction() {
        return "fn.join";
    }

    @Override
    public String[] getKeys() {
        return new String[] { "join" };
    }
}