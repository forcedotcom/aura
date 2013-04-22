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
package org.auraframework.test.mock;

import java.util.List;

import com.google.common.collect.Lists;

/**
 * A stubbed method invocation that provides a sequence of Answers for a
 * sequence of matching method invocations.
 * 
 * @param <T> the type of the return value for the stubbed method
 */
public class Stub<T> {
	private final Invocation invocation;
	private final List<Answer<T>> answers;

	public Stub(Invocation invocation, List<Answer<T>> answers) {
		if (answers.isEmpty()) {
			throw new IllegalArgumentException(
					"Must provide at least one answer for a stub");
		}
		this.invocation = invocation;
		this.answers = Lists.newLinkedList(answers);
	}

	/**
	 * Get the invocation that this stub applies to.
	 * @return
	 */
	public Invocation getInvocation() {
		return invocation;
	}

	/**
	 * Get the answer for the current method invocation. This Stub will provide
	 * each Answer in the initial list of Answers sequentially until the last
	 * answer is reached. Thereafter, the last answer will be provided for every
	 * subsequent call.
	 * 
	 * @return the Answer for the current method invocation
	 */
	public Answer<T> getNextAnswer() {
		if (answers.size() == 1) {
			return answers.get(0);
		} else {
			return answers.remove(0);
		}
	}
}
