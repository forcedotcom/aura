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

import org.auraframework.expression.Expression;

import java.io.IOException;
import java.text.MessageFormat;
import java.util.List;

/**
 * An implementation of utility functions to mimic Util.js.
 */
public class UtilFunctions {

	public static final Function EMPTY = new Empty();
	public static final Function FORMAT = new Format();

	/**
	 * Checks if the object is empty. An empty object"s value is undefined (only
	 * in JS), null, an empty array, or empty string. An object with no native
	 * properties is not considered empty at this time.
	 */
	public static boolean isEmpty(Object obj) {
		if (obj == null) {
			return true;
		}
		if (obj instanceof String) {
			return "".equals(obj);
		}
		if (obj instanceof List) {
			return ((List<?>) obj).isEmpty();
		}
		return false;
	}

	/**
	 * Empty is meant to match isEmpty() in Util.js
	 */
	public static class Empty implements Function {
		private static final long serialVersionUID = -8834318118368934926L;

		@Override
		public Object evaluate(List<Object> args) {
			return Boolean.valueOf(isEmpty(args.get(0)));
		}

        @Override
    	public void compile(Appendable out, List<Expression> args) throws IOException {
        	out.append(JS_FN_EMPTY);
        	out.append("(");
        	args.get(0).compile(out);
        	out.append(")");
        }

		@Override
		public String[] getKeys() {
			return new String[] { "empty" };
		}
	}

	/**
	 * Format is meant to match format() in Util.js, except
	 * that we safeguard against missing, undefined, or null
	 * format string.
     *
     * Since expressions are exposed to the UI, we try to do
     * the most sensible thing, and prevent the display of nulls
     * and undefined like we do with the ADD function.
	 */
	public static class Format implements Function {

		private static final long serialVersionUID = -7261120970634674388L;

		@Override
		public Object evaluate(List<Object> args) {
			int size = args.size();
			if (size == 0) {
				return "";
			}

			Object a0 = args.get(0);
			if (a0 == null) {
				return "";
			}

            String formatString = JavascriptHelpers.stringify(a0);
			if (size == 1) {
				return formatString;
			}

			Object[] formatArguments = new Object[size - 1];
			for (int index = 1; index < size; index++) {
				Object ai = args.get(index);
				formatArguments[index - 1] = (ai == null) ? "" : JavascriptHelpers.stringify(ai);
			}

			return MessageFormat.format(formatString, formatArguments);
		}

        @Override
    	public void compile(Appendable out, List<Expression> args) throws IOException {

        	int size = args.size();
			if (size == 0) {
	        	out.append(JS_EMPTY);
	        	return;
			} 

			Object a0 = args.get(0);
			if (a0 == null) {
	        	out.append(JS_EMPTY);
	        	return;
			} 
			
			out.append(JS_FN_FORMAT);
        	out.append("(");
			for (int index = 0; index < size; index++) {
				if (index > 0) {
		        	out.append(",");
				}
				args.get(index).compile(out);
			}
        	out.append(")");
        }

		@Override
		public String[] getKeys() {
			return new String[] { "format" };
		}
	}
}
