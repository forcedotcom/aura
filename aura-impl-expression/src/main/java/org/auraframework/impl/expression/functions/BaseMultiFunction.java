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

public abstract class BaseMultiFunction implements Function {
	private static final long serialVersionUID = -6256411745359155749L;

	@Override
	public final void compile(Appendable out, List<Expression> args) throws IOException {
    	int size = args.size();

    	if (size == 0) {
        	out.append(JS_EMPTY);
        	return;
		} 
		
		out.append(getJsFunction());
    	out.append("(");
    	
		for (int index = 0; index < size; index++) {
			if (index > 0) {
	        	out.append(",");
			}
	    	Expression ai = args.get(index);
			if (ai != null) {
				ai.compile(out);
			} else {
	        	out.append(JS_EMPTY);
			}
		}
    	out.append(")");
    }

	public String getJsFunction() {
		return "";
	}
}
