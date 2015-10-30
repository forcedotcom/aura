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

import org.auraframework.throwable.AuraRuntimeException;

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
	private int answerIndex;

	public Stub(Invocation invocation, List<Answer<T>> answers) {
		if (answers.isEmpty()) {
			throw new IllegalArgumentException(
					"Must provide at least one answer for a stub");
		}
		reset();
		this.invocation = invocation;
		this.answers = Lists.newLinkedList(answers);
	}

	public void reset() {
        this.answerIndex = 0;
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
	 * @throws Throwable 
	 */
    public Answer<T> getNextAnswer() throws Throwable {
        if (answerIndex <= answers.size() - 1) {
        	Answer<T> ret = answers.get(answerIndex);
            answerIndex++;
            return ret;
        } else {
        	Answer<T> lastAnswer = answers.get(answers.size() - 1);
        	Object value = lastAnswer.answer();
        	String extraMessage = "";
        	if(value instanceof MockModel) {
        		value = (MockModel)value;
        		extraMessage = ((MockModel) value).getDescriptor().getQualifiedName();
        	} else if (value instanceof MockAction){
        		value = (MockAction)value;
        		extraMessage = ((MockAction) value).getDescriptor().getQualifiedName();
        	} else {
        		extraMessage = "**New mock type other than Action or Model, please update the type here**";
        	}
        	throw new AuraRuntimeException("You have "+answers.size()+" answers for mocking "+extraMessage
        			+", but they are all exhausted");
        }
    }
}
