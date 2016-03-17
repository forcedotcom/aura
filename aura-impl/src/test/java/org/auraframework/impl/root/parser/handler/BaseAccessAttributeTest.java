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
package org.auraframework.impl.root.parser.handler;

import java.util.ArrayList;

import org.auraframework.Aura;
import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.def.EventDef;
import org.auraframework.def.InterfaceDef;
import org.auraframework.def.LibraryDef;
import org.auraframework.def.TokensDef;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.parser.ParserFactory;
import org.auraframework.system.AuraContext.Access;
import org.auraframework.system.AuraContext.Authentication;
import org.auraframework.system.Parser;
import org.auraframework.system.Parser.Format;
import org.auraframework.system.Source;
import org.auraframework.test.adapter.MockConfigAdapter;
import org.auraframework.test.source.StringSourceLoader;
import org.auraframework.throwable.quickfix.InvalidAccessValueException;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;

public abstract class BaseAccessAttributeTest extends AuraImplTestCase {

    public BaseAccessAttributeTest(String name) {
        super(name);
        ConfigAdapter adapter = Aura.getConfigAdapter();
        adapter.addPrivilegedNamespace(privilegedNamespace);
    }

    public void testDefaultAccess() throws Exception {
        testCase = TestCase.DEFAULT;
        testNamespace = TestNamespace.System;
        runTestCase();
    }

    public void testEmptyAccess() throws Exception {
        testCase = TestCase.EMPTY;
        testNamespace = TestNamespace.System;
        runTestCase();
    }

    public void testInvalidAccess() throws Exception {
        testCase = TestCase.INVALID;
        testNamespace = TestNamespace.System;
        runTestCase();
    }

    public void testInvalidAccessDynamic() throws Exception {
        testCase = TestCase.INVALID;
        testNamespace = TestNamespace.System;
        runTestCase();
    }

    public void testInvalidValidAccess() throws Exception {
        ArrayList<String> failures = new ArrayList<>();
        for (Access access : Access.values()) {
            testCase = getTestCase(access, "INVALID");
            testNamespace = TestNamespace.System;
            if(testCase != null){
                try{
                    runTestCase();
                }
                catch(Throwable e) {
                    failures.add(e.getMessage());
                }
            }
            else{
                failures.add("TestCase not found for Access: " + access.toString());
            }
        }

        if(!failures.isEmpty()){
            String message = "";
            for(int i = 0; i < failures.size(); i++){
                message += failures.get(i);
                if(i != failures.size() - 1){
                    message += ", ";
                }
            }
            fail("Test failed because: " + message);
        }
    }

    public void testInvalidValidAuthentication() throws Exception {
        ArrayList<String> failures = new ArrayList<>();
        for (Authentication authentication : Authentication.values()) {
            testCase = getTestCase(authentication, "INVALID");
            testNamespace = TestNamespace.System;
            if(testCase != null){
                try{
                    runTestCase();
                }
                catch(Throwable e) {
                    failures.add(e.getMessage());
                }
            }
            else{
                failures.add("TestCase not found for Access: " + authentication.toString());
            }
        }

        if(!failures.isEmpty()){
            String message = "";
            for(int i = 0; i < failures.size(); i++){
                message += failures.get(i);
                if(i != failures.size() - 1){
                    message += ", ";
                }
            }
            fail("Test failed because: " + message);
        }
    }

    public void testAccessValueAndStaticMethod() throws Exception {
        testCase = TestCase.VALUE_METHOD;
        testNamespace = TestNamespace.System;
        runTestCase();
    }

    public void testStaticMethodAndAuthentication() throws Exception {
        testCase = TestCase.METHOD_AUTHENTICATION;
        testNamespace = TestNamespace.System;
        runTestCase();
    }

    public void testSimpleAccessInSystemNamespace() throws Exception {
        verifySimpleAccess(TestNamespace.System, false);
    }

    public void testSimpleAccessDynamicInSystemNamespace() throws Exception {
        verifySimpleAccess(TestNamespace.System, true);
    }

    public void testCombinationAccessInSystemNamespace() throws Exception {
        verifyCombinationAccess(TestNamespace.System);
    }

    public void testSimpleAuthenticationInSystemNamespace() throws Exception {
        verifySimpleAuthentication(TestNamespace.System, false);
    }

    public void testSimpleAuthenticationDynamicInSystemNamespace() throws Exception {
        verifySimpleAuthentication(TestNamespace.System, true);
    }

    public void testCombinationAuthenticationInSystemNamespace() throws Exception {
        verifyCombinationAuthentication(TestNamespace.System);
    }

    public void testAccessAuthenticationInSystemNamespace() throws Exception {
        verifyAccessAuthentication(TestNamespace.System);
    }

    public void testSimpleAccessInPrivilegedNamespace() throws Exception {
        verifySimpleAccess(TestNamespace.Privileged, false);
    }

    public void testSimpleAccessDynamicInPrivilegedNamespace() throws Exception {
        verifySimpleAccess(TestNamespace.Privileged, true);
    }

    public void testCombinationAccessInPrivilegedNamespace() throws Exception {
        verifyCombinationAccess(TestNamespace.Privileged);
    }

    public void testSimpleAuthenticationInPrivilegedNamespace() throws Exception {
        verifySimpleAuthentication(TestNamespace.Privileged, false);
    }

    public void testSimpleAuthenticationDynamicInPrivilegedNamespace() throws Exception {
        verifySimpleAuthentication(TestNamespace.Privileged, true);
    }

    public void testCombinationAuthenticationInPrivilegedNamespace() throws Exception {
        verifyCombinationAuthentication(TestNamespace.Privileged);
    }

    public void testAccessAuthenticationInPrivilegedNamespace() throws Exception {
        verifyAccessAuthentication(TestNamespace.Privileged);
    }

    public void testSimpleAccessInCustomNamespace() throws Exception {
        verifySimpleAccess(TestNamespace.Custom, false);
    }

    public void testSimpleAccessDynamicInCustomNamespace() throws Exception {
        verifySimpleAccess(TestNamespace.Custom, true);
    }

    public void testCombinationAccessInCustomNamespace() throws Exception {
        verifyCombinationAccess(TestNamespace.Custom);
    }

    public void testSimpleAuthenticationInCustomNamespace() throws Exception {
        verifySimpleAuthentication(TestNamespace.Custom, false);
    }

    public void testSimpleAuthenticationDynamicInCustomNamespace() throws Exception {
        verifySimpleAuthentication(TestNamespace.Custom, true);
    }

    public void testCombinationAuthenticationInCustomNamespace() throws Exception {
        verifyCombinationAuthentication(TestNamespace.Custom);
    }

    public void testAccessAuthenticationInCustomNamespace() throws Exception {
        verifyAccessAuthentication(TestNamespace.Custom);
    }

    private void verifySimpleAccess(TestNamespace namespace, boolean isDynamic) throws Exception {
        ArrayList<String> failures = new ArrayList<>();
        for (Access access : Access.values()) {
            if(!(isDynamic && access == Access.PRIVATE)){ // TODO W-2085835
                testCase = getTestCase(access, isDynamic);
                testNamespace = namespace;
                if(testCase != null){
                    try{
                        runTestCase();
                    }
                    catch(Throwable e) {
                        failures.add(e.getMessage());
                    }
                }
                else{
                    failures.add("TestCase not found for Access: " + access.toString());
                }
            }
        }

        if(!failures.isEmpty()){
            String message = "";
            for(int i = 0; i < failures.size(); i++){
                message += failures.get(i);
                if(i != failures.size() - 1){
                    message += ", ";
                }
            }
            fail("Test failed because: " + message);
        }
    }

    private void verifyCombinationAccess(TestNamespace namespace) throws Exception {
        ArrayList<String> failures = new ArrayList<>();
        Access[] accessValues = Access.values();
        for (int i = 0; i < accessValues.length-1; i++) {
            for (int j = i+1; j < accessValues.length; j++) {
                testCase = getTestCase(accessValues[i], accessValues[j]);
                testNamespace = namespace;
                if(testCase != null){
                    try{
                        runTestCase();
                    }
                    catch(Throwable e) {
                        failures.add(e.getMessage());
                    }
                }
                else{
                    failures.add("TestCase not found for Access: " + accessValues[i].toString() + "," + accessValues[j].toString());
                }
            }
        }

        if(!failures.isEmpty()){
            String message = "";
            for(int i = 0; i < failures.size(); i++){
                message += failures.get(i);
                if(i != failures.size() - 1){
                    message += ", ";
                }
            }
            fail("Test failed because: " + message);
        }
    }

    private void verifySimpleAuthentication(TestNamespace namespace, boolean isDynamic) throws Exception {
        ArrayList<String> failures = new ArrayList<>();
        for (Authentication authentication : Authentication.values()) {
            testCase = getTestCase(authentication, isDynamic);
            testNamespace = namespace;
            if(testCase != null){
                try{
                    runTestCase();
                }
                catch(Throwable e) {
                    failures.add(e.getMessage());
                }
            }
            else{
                failures.add("TestCase not found for Access: " + authentication.toString());
            }
        }
        if(!failures.isEmpty()){
            String message = "";
            for(int i = 0; i < failures.size(); i++){
                message += failures.get(i);
                if(i != failures.size() - 1){
                    message += ", ";
                }
            }
            fail("Test failed because: " + message);
        }
    }

    private void verifyCombinationAuthentication(TestNamespace namespace) throws Exception {
        testCase = TestCase.AUTHENTICATED_UNAUTHENTICATED;
        testNamespace = namespace;
        runTestCase();
    }

    private void verifyAccessAuthentication(TestNamespace namespace) throws Exception {
        ArrayList<String> failures = new ArrayList<>();
        Access[] accessValues = Access.values();
        Authentication[] authenticationValues = Authentication.values();

        for (int i = 0; i < accessValues.length; i++) {
            for (int j = 0; j < authenticationValues.length; j++) {
                testCase = getTestCase(accessValues[i], authenticationValues[j]);
                testNamespace = namespace;
                if(testCase != null){
                    try{
                        runTestCase();
                    }
                    catch(Throwable e) {
                        failures.add(e.getMessage());
                    }
                }
                else{
                    failures.add("TestCase not found for Access: " + accessValues[i].toString() + "," + authenticationValues[j].toString());
                }
            }
        }

        if(!failures.isEmpty()){
            String message = "";
            for(int i = 0; i < failures.size(); i++){
                message += failures.get(i);
                if(i != failures.size() - 1){
                    message += ", ";
                }
            }

            fail("Test failed because: " + message);
        }
    }

    protected <D extends Definition> void runTestCase() throws Exception{
        try{
            @SuppressWarnings("unchecked")
            DefDescriptor<D> descriptor = (DefDescriptor<D>)getAuraTestingUtil().addSourceAutoCleanup(getDefClass(),
                    getResourceSource(), getDefDescriptorName(),
                    (testNamespace == TestNamespace.System ? true: false));
            Source<D> source = StringSourceLoader.getInstance().getSource(descriptor);

            Parser<D> parser = ParserFactory.getParser(Format.XML, descriptor);
            Definition def = parser.parse(descriptor, source);
            def.validateDefinition();
            //def.validateReferences();
            //descriptor.getDef();

            if (!isValidTestCase()) {
                fail("Should have thrown Exception for access: " + getAccess()+", resource: "+testResource.name());
            }
        } catch (InvalidAccessValueException e) {
            if(isValidTestCase()){
                fail("Invalid Access Should not have thrown Exception for access: " + getAccess()+", resource: "+testResource.name());
            }
        } catch (InvalidDefinitionException e) {
            if(isValidTestCase()){
                fail("Invalid Definition should not have thrown Exception for access: " + getAccess()+", resource: "+testResource.name());
            }
        }
    }

    private String getDefDescriptorName() {
        String name = null;
        String namespace = StringSourceLoader.DEFAULT_NAMESPACE;

        if(testNamespace == TestNamespace.Custom){
            namespace = StringSourceLoader.DEFAULT_CUSTOM_NAMESPACE;
        }

        if(testNamespace == TestNamespace.Privileged){
            namespace=privilegedNamespace;
        }

        switch(testResource){
            case Application:
                name = namespace + ":testapplication";
                break;

            case Component:
                name = namespace + ":testcomponent";
                break;

            case Interface:
                name = namespace + ":testinterface";
                break;

            case Attribute:
                name = namespace + ":testcomponent";
                break;

            case Event:
            case RegisterEvent:
                name = namespace + ":testevent";
                break;

            case Tokens:
                name = namespace + ":testtokens";
                break;

            case Module:
                name = namespace + ":testmodule";
                break;
        }

        return name;
    }

    private Class<? extends Definition> getDefClass(){
        Class<? extends Definition> classDef = null;
        switch(testResource){
            case Application:
                classDef =  ApplicationDef.class;
                break;
            case Component:
                classDef =  ComponentDef.class;
                break;
            case Interface:
                classDef =  InterfaceDef.class;
                break;
            case Attribute:
                classDef =  ComponentDef.class;
                break;
            case Event:
                classDef =  EventDef.class;
                break;
            case Module:
                classDef =  LibraryDef.class;
                break;
            case Tokens:
                classDef =  TokensDef.class;
                break;
            case RegisterEvent:
                classDef =  ComponentDef.class;
        }

        return classDef;
    }

    private String getResourceSource(){
        String resource = testResource.toString().toLowerCase();
        String access = getAccess();
        String source = null;

        if(testResource == TestResource.Application ||
           testResource == TestResource.Component ||
           testResource == TestResource.Interface){
            source = "<aura:"+resource+" " + (access!= null?"access='" +access+ "'" : "") + " /> ";
        }
        else if(testResource == TestResource.Attribute){
            source = "<aura:component>";
            source += "<aura:attribute name='testattribute' type='String' " + (access!= null?"access='" +access+ "'" : "") + " />";
            source += "</aura:component> ";
        }
        else if(testResource == TestResource.Event){
            source = "<aura:event type='COMPONENT' " + (access!= null?"access='" +access+ "'" : "") + " />";
        }
        else if(testResource == TestResource.Tokens){
            source = "<aura:tokens " + (access!= null?"access='" + access+ "'" : "") + " />";
        }
        else if(testResource == TestResource.RegisterEvent){
            source = "<aura:component>";
            source += "<aura:registerEvent name='testevent' type='ui:keydown' description='For QA' " + (access!= null?"access='" +access+ "'" : "") + " />";
            source += "</aura:component> ";
        }

        return source;
    }

    private String getAccess(){
        StringBuffer access = new StringBuffer();

        if(testCase == TestCase.DEFAULT){
            return null;
        }

        if(testCase == TestCase.EMPTY){
            return "";
        }

        if(testCase == TestCase.INVALID){
            return "BLAH";
        }

        if(testCase == TestCase.INVALID_DYNAMIC){
            return "org.auraframework.impl.test.util.TestAccessMethods.invalid";
        }

        if(testCase == TestCase.AUTHENTICATED_UNAUTHENTICATED){
            return "AUTHENTICATED,UNAUTHENTICATED";
        }

        if(testCase == TestCase.VALUE_METHOD){
            return "GLOBAL,org.auraframework.impl.test.util.TestAccessMethods.allowGlobal";
        }

        if(testCase == TestCase.METHOD_AUTHENTICATION){
            return "org.auraframework.impl.test.util.TestAccessMethods.allowGlobal,AUTHENTICATED";
        }

        if(testCase.toString().contains("INVALID")){
            access.append("BLAH,");
        }

        boolean isDynamic = false;
        if(testCase.toString().endsWith("DYNAMIC")){
            isDynamic = true;
        }

        if(testCase.toString().contains("GLOBAL")){
            if(!isDynamic){
                access.append("GLOBAL,");
            }
            else{
                return "org.auraframework.impl.test.util.TestAccessMethods.allowGlobal";
            }
        }

        if(testCase.toString().contains("PUBLIC")){
            if(!isDynamic){
                access.append("PUBLIC,");
            }
            else{
                return "org.auraframework.impl.test.util.TestAccessMethods.allowPublic";
            }
        }

        if(testCase.toString().contains("PRIVATE")){
            if(!isDynamic){
                access.append("PRIVATE,");
            }
            else{
                return "org.auraframework.impl.test.util.TestAccessMethods.allowPrivate";
            }
        }

        if(testCase.toString().contains("PRIVILEGED")){
            if(!isDynamic){
                access.append("PRIVILEGED,");
            }
            else{
                return "org.auraframework.impl.test.util.TestAccessMethods.allowPrivileged";
            }
        }

        if(testCase.toString().contains("INTERNAL")){
            if(!isDynamic){
                access.append("INTERNAL,");
            }
            else{
                return "org.auraframework.impl.test.util.TestAccessMethods.allowInternal";
            }
        }

        if(testCase.toString().contains("UNAUTHENTICATED")){
            if(!isDynamic){
                access.append("UNAUTHENTICATED,");
            }
            else{
                return "org.auraframework.impl.test.util.TestAccessMethods.allowUnAuthenticated";
            }
        }
        else{
            if(testCase.toString().contains("AUTHENTICATED")){
                if(!isDynamic){
                    access.append("AUTHENTICATED,");
                }
                else{
                    return "org.auraframework.impl.test.util.TestAccessMethods.allowAuthenticated";
                }
            }
        }

        int index = access.lastIndexOf(",");
        if(index == access.length()-1){
            access.deleteCharAt(index);
        }

        return access.toString();
    }

    private boolean isValidTestCase(){
        String access = getAccess();
        if(access == null){
            return true;
        }

        if(access == "" || access.equals("BLAH")
           || access.equals("AUTHENTICATED,UNAUTHENTICATED")
           || access.equals("org.auraframework.impl.test.util.TestAccessMethods.invalid")
           || access.equals("org.auraframework.impl.test.util.TestAccessMethods.allowAuthenticated")
           || access.equals("org.auraframework.impl.test.util.TestAccessMethods.allowUnAuthenticated")
           || access.equals("GLOBAL,org.auraframework.impl.test.util.TestAccessMethods.allowGlobal")){
            return false;
        }

        String[] accessValues;

        if(access.startsWith("org.auraframework.impl.test.util.TestAccessMethods.")){
            if(testNamespace == TestNamespace.Privileged){
                return false;
            }
            String[] vals =  access.split("\\.");
            String val = vals[vals.length-1];

            accessValues = new String[]{val.toUpperCase()};
        }
        else{
            accessValues = access.split(",");
        }

        for(int i = 0; i < accessValues.length; i++){
            switch (testResource) {
            case Application:
                if(testNamespace == TestNamespace.System || testNamespace == TestNamespace.Privileged){
                    if(accessValues[i].contains("PRIVATE") || accessValues[i].contains("BLAH")){
                        return false;
                    }
                    if(testNamespace == TestNamespace.Privileged && (accessValues[i].contains("AUTHENTICATED") || accessValues[i].contains("INTERNAL"))){
                        return false;
                    }
                }
                else{
                    if(!accessValues[i].equals("GLOBAL") && !accessValues[i].equals("PUBLIC")){
                        return false;
                    }
                }
                break;

            case Component:
            case Interface:
                if(testNamespace == TestNamespace.System || testNamespace == TestNamespace.Privileged){
                    if(accessValues[i].contains("PRIVATE") || accessValues[i].contains("AUTHENTICATED") || accessValues[i].contains("BLAH")){
                        return false;
                    }
                    if(testNamespace == TestNamespace.Privileged && accessValues[i].contains("INTERNAL")){
                        return false;
                    }
                }
                else{
                    if(!accessValues[i].equals("GLOBAL") && !accessValues[i].equals("PUBLIC")){
                        return false;
                    }
                }
                break;

            default:
                if(testNamespace == TestNamespace.System || testNamespace == TestNamespace.Privileged){
                    if(accessValues[i].contains("AUTHENTICATED") || accessValues[i].contains("BLAH")){
                        return false;
                    }
                    if(testNamespace == TestNamespace.Privileged && accessValues[i].contains("INTERNAL")){
                        return false;
                    }
                }
                else{
                    if(!accessValues[i].equals("GLOBAL") && !accessValues[i].equals("PUBLIC") && !accessValues[i].equals("PRIVATE")){
                        return false;
                    }
                }
            }
        }

        if(accessValues.length == 2){
            if(access.contains("GLOBAL")){
                if(access.contains("PUBLIC") || access.contains("PRIVATE") || access.contains("INTERNAL") || access.contains("PRIVILEGED")){
                    return false;
                }
            }

            if(access.contains("PUBLIC")){
                if(access.contains("PRIVATE") || access.contains("INTERNAL") || access.contains("PRIVILEGED")){
                    return false;
                }
            }

            if(access.contains("INTERNAL") && (access.contains("PRIVATE") || access.contains("PRIVILEGED"))){
                return false;
            }

            if(access.contains("PRIVATE") && access.contains("PRIVILEGED")){
                return false;
            }

        }
        return true;
    }

    protected TestCase getTestCase(Access access, boolean isDynamic) {
        try{
            String accessVal = access.toString();

            if(isDynamic){
                accessVal += "_DYNAMIC";
            }

            return TestCase.valueOf(accessVal);
        }
        catch(Exception e){
            return null;
        }
    }

    private TestCase getTestCase(Access access, String prefix) {
        try{
            String accessVal = prefix + "_" + access.toString();
            return TestCase.valueOf(accessVal);
        }
        catch(Exception e){
            return null;
        }
    }

    private TestCase getTestCase(Access access1, Access access2) {
        try{
            return TestCase.valueOf(access1.toString() + "_" + access2.toString());
        }
        catch(Exception e1){
            try{
                return TestCase.valueOf(access2.toString() + "_" + access1.toString());
            }
            catch(Exception e2){
                return null;
            }
        }
    }

    private TestCase getTestCase(Authentication authentication, boolean isDynamic) {
        try{
            String accessVal = authentication.toString();

            if(isDynamic){
                accessVal += "_DYNAMIC";
            }

            return TestCase.valueOf(accessVal);
        }
        catch(Exception e){
            return null;
        }
    }

    private TestCase getTestCase(Authentication authentication, String prefix) {
        try{
            String accessVal = prefix + "_" + authentication.toString();
            return TestCase.valueOf(accessVal);
        }
        catch(Exception e){
            return null;
        }
    }

    private TestCase getTestCase(Access access, Authentication authentication) {
        try{
            return TestCase.valueOf(access.toString() + "_" + authentication.toString());
        }
        catch(Exception e1){
            return null;
        }
    }

    protected TestCase testCase;
    protected TestResource testResource;
    protected TestNamespace testNamespace;
    private final String privilegedNamespace="privilegedNS";

    protected enum TestResource {Application, Component, Interface, Attribute, Event, Tokens, RegisterEvent, Module};

    protected enum TestNamespace {System, Custom, Privileged};

    private enum TestCase {EMPTY, DEFAULT, INVALID, GLOBAL, PUBLIC, PRIVATE, PRIVILEGED, INTERNAL, AUTHENTICATED, UNAUTHENTICATED,
                             INVALID_DYNAMIC, GLOBAL_DYNAMIC, PUBLIC_DYNAMIC, PRIVATE_DYNAMIC, PRIVILEGED_DYNAMIC, INTERNAL_DYNAMIC, AUTHENTICATED_DYNAMIC, UNAUTHENTICATED_DYNAMIC,
                             GLOBAL_AUTHENTICATED, GLOBAL_UNAUTHENTICATED,
                             PUBLIC_AUTHENTICATED, PUBLIC_UNAUTHENTICATED,
                             PRIVATE_AUTHENTICATED, PRIVATE_UNAUTHENTICATED,
                             PRIVILEGED_AUTHENTICATED, PRIVILEGED_UNAUTHENTICATED,
                             INTERNAL_AUTHENTICATED, INTERNAL_UNAUTHENTICATED, INTERNAL_PRIVILEGED,
                             GLOBAL_PUBLIC, GLOBAL_PRIVATE, GLOBAL_PRIVILEGED, GLOBAL_INTERNAL,
                             PUBLIC_PRIVATE, PUBLIC_INTERNAL, PUBLIC_PRIVILEGED,
                             PRIVATE_INTERNAL, PRIVATE_PRIVILEGED,
                             AUTHENTICATED_UNAUTHENTICATED,
                             VALUE_METHOD, METHOD_AUTHENTICATION,
                             INVALID_GLOBAL, INVALID_PUBLIC, INVALID_PRIVATE, INVALID_PRIVILEGED, INVALID_INTERNAL, INVALID_AUTHENTICATED, INVALID_UNAUTHENTICATED};

}
