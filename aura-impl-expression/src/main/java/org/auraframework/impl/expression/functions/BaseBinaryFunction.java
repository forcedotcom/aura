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

import java.io.IOException;
import java.util.List;

import org.auraframework.expression.Expression;

public abstract class BaseBinaryFunction implements Function {
	private static final long serialVersionUID = -8479474163967323116L;

    @Override
    public final Object evaluate(List<Object> args) {
        int size = args.size();
        if (size > 0) {
            if (size > 1) {
            	return evaluate(args.get(0), args.get(1));
            }
            return args.get(0);
        }
    	return null;
    }

    public abstract Object evaluate(Object arg1, Object arg2);

	@Override
	public final void compile(Appendable out, List<Expression> args) throws IOException {
        int size = args.size();

    	if (size == 0) {
        	out.append(JS_EMPTY);
        	return;
		}

    	out.append(getJsFunction());
    	out.append("(");

    	Expression a0 = args.get(0);
		if (a0 != null) {
	    	a0.compile(out);
		} else {
        	out.append(JS_EMPTY);
		}

    	if (size > 1) {
           	out.append(getJsOperator());

           	Expression a1 = args.get(1);
    		if (a1 != null) {
    	    	a1.compile(out);
    		} else {
            	out.append(JS_EMPTY);
    		}
    	}

    	out.append(")");
    }

	public String getJsFunction() {
		return "";
	}

	public String getJsOperator() {
		return ",";
	}
}
