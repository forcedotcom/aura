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
package org.auraframework.impl.javascript.parser.handler.mock;

import java.lang.reflect.Array;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.auraframework.Aura;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.def.TestSuiteDef;
import org.auraframework.impl.javascript.parser.handler.JavascriptHandler;
import org.auraframework.system.Source;
import org.auraframework.test.mock.Answer;
import org.auraframework.test.mock.Invocation;
import org.auraframework.test.mock.Stub;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;

import com.google.common.collect.ImmutableMap;
import com.google.common.collect.Lists;
import com.google.common.collect.ImmutableMap.Builder;

/**
 * Parse JSTEST mock definitions into mocks to be applied when running tests.
 * 
 * @param <D>
 *            the type of Definition being modified in the registry
 */
public abstract class JavascriptMockHandler<D extends Definition> extends
		JavascriptHandler<DefDescriptor<TestSuiteDef>, D> {
	private final Map<String, Object> sourceMap;
	private final DefDescriptor<? extends BaseComponentDef> compDesc;

	protected JavascriptMockHandler(DefDescriptor<TestSuiteDef> descriptor,
			Source<?> source,
			DefDescriptor<? extends BaseComponentDef> targetDescriptor,
			Map<String, Object> map) {
		super(descriptor, source);
		this.sourceMap = map;
		this.compDesc = targetDescriptor;
	}

	protected DefDescriptor<? extends BaseComponentDef> getTargetDescriptor() {
		return compDesc;
	}

	@Override
	public D getDefinition() throws QuickFixException {
		return createDefinition(sourceMap);
	}

	/**
	 * Mocks will have handlers to parse their respective mock objects.
	 */
	@Override
	protected abstract D createDefinition(Map<String, Object> map)
			throws QuickFixException;

	/**
	 * 
	 * @param descStr
	 * @param defClass
	 * @return
	 * @throws DefinitionNotFoundException
	 * @throws QuickFixException
	 */
	protected D getBaseDefinition(String descStr, Class<D> defClass)
			throws DefinitionNotFoundException, QuickFixException {
		if (descStr != null) {
			return Aura.getDefinitionService().getDefinition(descStr, defClass);
		}
		return getDefaultBaseDefinition();
	}

	protected abstract D getDefaultBaseDefinition() throws QuickFixException;

	protected <T extends Definition> DefDescriptor<T> getDescriptor(
			String descStr, Class<T> defClass) {
		if (descStr != null) {
			return Aura.getDefinitionService().getDefDescriptor(descStr,
					defClass);
		}
		return null;
	}

	/**
	 * Read a single or list of Stubs
	 * 
	 * @param object
	 *            the parsed json representation
	 * @return a list of Stubs
	 * @throws QuickFixException
	 */
	protected List<Stub<?>> getStubs(Object object) throws QuickFixException {
		List<Stub<?>> stubs = Lists.newLinkedList();
		if (!(object instanceof List)) {
			object = Lists.newArrayList(object);
		}
		for (Object item : (List<?>) object) {
			Stub<?> answer = getStub(item);
			if (answer != null) {
				stubs.add(answer);
			}
		}
		return stubs;
	}

	/**
	 * Read a Stub that has an optional Invocation definition, "method"; and a list
	 * of Answers, "answers".
	 * @param <T>
	 * 
	 * @param object
	 *            the parsed json representation
	 * @return a Stub object
	 * @throws QuickFixException
	 */
	protected Stub<?> getStub(Object object) throws QuickFixException {
		if (object instanceof Map) {
			Invocation invocation = getInvocation(((Map<?, ?>) object)
					.get("method"));
			@SuppressWarnings("rawtypes")
			Class retType = invocation.getReturnType();
			@SuppressWarnings("unchecked")
			List<Answer<Object>> answers = getAnswers(((Map<?, ?>) object)
					.get("answers"), retType);
			return new Stub<Object>(invocation, answers);
		}
		return null;
	}

	protected abstract Invocation getDefaultInvocation()
			throws QuickFixException;

	/**
	 * Read an Invocation, which must have a "name" and, optionally,
	 * a "params" list of the input parameters to the method.
	 * 
	 * @param object
	 *            the parsed json representation
	 * @return an Invocation object
	 * @throws QuickFixException
	 */
	protected Invocation getInvocation(Object object) throws QuickFixException {
		if (object == null) {
			return getDefaultInvocation();
		} else if (object instanceof Map) {
			Map<?, ?> methodMap = (Map<?, ?>) object;
			String name = (String) methodMap.get("name");
			if (name == null) {
				throw new InvalidDefinitionException(
						"A mock's stubbed method must specify 'name'",
						getLocation());
			}
			List<?> params = (List<?>) methodMap.get("params");
			String typeStr = (String) methodMap.get("type");
			Class<?> type = Object.class;
			if (typeStr != null) {
				try {
					type = classForSimpleName(typeStr);
				} catch (ClassNotFoundException e) {
				}
			}
			return new Invocation(name, params, type);
		}
		return null;
	}

	/**
	 * Read a single or list of answers
	 * 
	 * @param object
	 *            the parsed json representation
	 * @param retClass
	 * 			  the expected type from the Answers
	 * @return a list of Answers
	 * @throws QuickFixException
	 */
	protected <T> List<Answer<T>> getAnswers(Object object, Class<T> retClass)
			throws QuickFixException {
		List<Answer<T>> answers = Lists.newLinkedList();
		if (!(object instanceof List)) {
			object = Lists.newArrayList(object);
		}
		for (Object item : (List<?>) object) {
			Answer<T> answer = getAnswer(item, retClass);
			if (answer != null) {
				answers.add(answer);
			}
		}
		return answers;
	}

	/**
	 * Read an Answer, which must have either a 'value' or 'error',
	 * corresponding to Returns or ThrowsExceptionClass instances.
	 * 
	 * @param object
	 *            the parsed json representation
	 * @param retClass
	 * 			  the expected type from the Answer
	 * @return an Answer object
	 * @throws QuickFixException
	 */
	protected <T> Answer<T> getAnswer(Object object, Class<T> retClass) throws QuickFixException {
		if (object instanceof Map) {
			Map<?, ?> map = (Map<?, ?>) object;
			T value = getValue(map.get("value"), retClass);
			String error = (String) map.get("error");
			if (value != null) {
				if (error == null) {
					return new Returns<T>(value);
				}
			} else {
				if (error != null) {
					return new ThrowsExceptionClass<T>(error);
				}
			}
		}
		throw new InvalidDefinitionException(
				"Mock answer must specify either 'value' or 'error'",
				getLocation());
	}

	
	/**
	 * Read a value. Usually, this will be returned by an Answer and/or may
	 * contain nested Answers.
	 * 
	 * @param object
	 *            the parsed json representation
	 * @param retClass
	 *            the expected type of the value
	 * @return the value
	 * @throws QuickFixException
	 */
	@SuppressWarnings("unchecked")
	protected <T> T getValue(Object object, Class<T> retClass) throws QuickFixException {
		return (T) object;
	}

    /**
     * Gets the Class from a simple name representation. Classes from the java.lang package may omit the package name.
     * For example, "java.lang.String[][]" and "String[][]" will return the same Class object.
     * 
     * @param simpleName
     * @return the Class, if found
     * @throws ClassNotFoundException
     */
    public Class<?> classForSimpleName(String simpleName) throws ClassNotFoundException {
        Matcher matcher = arrayPattern.matcher(simpleName);
        if (matcher.matches()) {
            int dims = (simpleName.length() - matcher.end(1)) / 2;
            String className = matcher.group(1);
            Class<?> clazz = primitiveMap.get(className);
            if (clazz == null) {
                try {
                    // allow convenience of shorter Object alternatives
                    clazz = Class.forName("java.lang." + className);
                } catch (ClassNotFoundException e) {
                    clazz = Class.forName(className);
                }
            }
            return (dims == 0) ? clazz : Array.newInstance(clazz, new int[dims]).getClass();
        }
        throw new ClassNotFoundException("Unknown type: " + simpleName);
    }

    private static final Pattern arrayPattern = Pattern.compile("^([\\w\\.]+?)(\\[\\])*\\z");
    private static final Map<String, Class<?>> primitiveMap;
    static {
        Builder<String, Class<?>> builder = ImmutableMap.builder();
        for (Class<?> c : new Class[] { boolean.class, byte.class, char.class, int.class, long.class, double.class,
                float.class, short.class, void.class }) {
            builder.put(c.getCanonicalName(), c);
        }
        primitiveMap = builder.build();
    }
	
	/**
	 * An Answer that just returns a value.
	 */
	public class Returns<T> implements Answer<T> {
		private T value;

		public Returns(T value) {
			this.value = value;
		}

		@Override
		public T answer() throws Throwable {
			return value;
		}
	}

	/**
	 * An Answer that throws a Throwable.
	 */
	public class ThrowsExceptionClass<T> implements Answer<T> {
		private Class<? extends Throwable> toThrow;

		public ThrowsExceptionClass(String className) {
			try {
				this.toThrow = Class.forName(className).asSubclass(
						Throwable.class);
			} catch (ClassNotFoundException e) {
				throw new AuraRuntimeException(e);
			}
		}

		@Override
		public T answer() throws Throwable {
			// try to instantiate the class with no args, or with a string
			Throwable t;
			try {
				t = toThrow.newInstance();
			} catch (Exception e) {
				t = toThrow.getConstructor(String.class).newInstance("MOCKED");
			}
			throw t;
		}
	}
}
