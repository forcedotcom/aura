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
package org.auraframework.test;

import org.auraframework.system.AuraContext.Access;
import org.auraframework.system.AuraContext.Authentication;

/**
 * Static Methods for testing access attribute 
 */
public class TestAccessMethods {

    public TestAccessMethods(){
        TestAccessMethods.privateMethod();
    }
	public static String invalid() {
	    return "BLAH";
	}
	
	public static Access allowGlobal() {
		return Access.GLOBAL;
	}
	
	public static Access allowPublic() {
		return Access.PUBLIC;
	}
	
	public static Access allowPrivate() {
		return Access.PRIVATE;
	}
	
	public static Access allowInternal() {
		return Access.INTERNAL;
	}
	
	public static Authentication allowAuthenticated() {
		return Authentication.AUTHENTICATED;
	}
	
	public static Authentication allowUnAuthenticated() {
		return Authentication.UNAUTHENTICATED;
	}
	
	private static Access privateMethod(){
	    return Access.GLOBAL;
	}
	
	public Access nonStaticMethod(){
	    return Access.GLOBAL;
	}
	
	public static Access throwsException()throws Exception{
	    throw new Exception();
	}
}
