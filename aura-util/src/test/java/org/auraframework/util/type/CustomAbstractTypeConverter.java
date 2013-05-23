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
package org.auraframework.util.type;

import java.util.HashSet;
import java.util.Set;

public class CustomAbstractTypeConverter implements MultiConverter<CustomAbstractType> {

	private static Set<Class<?>> toSet;
	
	static {
		toSet = new HashSet<Class<?>>();
		toSet.add(CustomConcreteType1.class);
		toSet.add(CustomConcreteType2.class);
	}
	
	@Override
	public CustomAbstractType convert(Class<? extends CustomAbstractType> toClass, Object fromValue) {
		String fromStr = (String)fromValue;
		int splitIndex = fromStr.indexOf(":");
		String stringPart = fromStr.substring(0, splitIndex);
		Integer intPart = Integer.parseInt(fromStr.substring(splitIndex + 1));
		
		if (toClass == CustomConcreteType1.class) {
			return new CustomConcreteType1(stringPart, intPart);
		} else if (toClass == CustomConcreteType2.class) {
			return new CustomConcreteType2(stringPart, intPart);
		} else {
			throw new RuntimeException("This should never happen");
		}
	}

	@Override
	public Class<?> getFrom() {
		return String.class;
	}

	@Override
	public Set<Class<?>> getTo() {
		return toSet;
	}
}
