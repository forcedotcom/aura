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
package org.auraframework.impl.controller;

import org.apache.commons.lang3.StringUtils;
import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.adapter.ExceptionAdapter;
import org.auraframework.def.ActionDef;
import org.auraframework.impl.java.controller.JavaAction;
import org.auraframework.impl.javascript.controller.JavascriptPseudoAction;
import org.auraframework.instance.Action;
import org.auraframework.service.ContextService;
import org.auraframework.service.DefinitionService;
import org.auraframework.service.InstanceService;

/**
 * A Java exception representing a <em>Javascript</em> error condition, as
 * reported from client to server for forensic logging.
 */
public class AuraClientException extends Exception {
    private static final long serialVersionUID = -5884312216684971013L;

    public enum Level {
        ERROR, WARNING, INFO;
    }

    private final Action action;
    private final String jsStack;
    private String causeDescriptor;
    private String errorId;
    private String namespace;
    private String componentName;
    private String methodName;
    private String cmpStack;
    private String sourceCode;
    private final String stacktraceIdGen;
    private final Level level;

    public AuraClientException(
            String desc,
            String id,
            String message,
            String jsStack,
            String cmpStack,
            String stacktraceIdGen,
            Level level,
            InstanceService instanceService,
            ExceptionAdapter exceptionAdapter,
            ConfigAdapter configAdapter,
            ContextService contextService,
            DefinitionService definitionService) {
        super(message);
        Action action = null;
        this.causeDescriptor = null;
        this.errorId = id;
        this.level = level;
        if (!StringUtils.isEmpty(desc)) {
            try {
                action = instanceService.getInstance(desc, ActionDef.class);
                if (action instanceof JavascriptPseudoAction) {
                    JavascriptPseudoAction jpa = (JavascriptPseudoAction) action;
                    jpa.addError(this);
                } else if (action instanceof JavaAction) {
                    JavaAction ja = (JavaAction) action;
                    ja.addException(this, Action.State.ERROR, false, false, exceptionAdapter);
                }
            } catch (Exception e) {
                this.causeDescriptor = desc;
            }
        }

        // use cause to track failing component markup if action is not sent.
        if (this.causeDescriptor == null && desc != null) {
            this.causeDescriptor = desc;
        }

        if (this.causeDescriptor != null && !this.causeDescriptor.isEmpty()) {
            AuraClientExceptionUtil.parseCauseDescriptor(this);
        }

        if (jsStack != null && !jsStack.isEmpty()) {
            AuraClientExceptionUtil.parseStacktrace(this, jsStack, definitionService, configAdapter, contextService);
        }

        this.action = action;
        this.jsStack = jsStack;
        this.cmpStack = cmpStack;
        this.stacktraceIdGen = stacktraceIdGen;
    }

    public Action getOriginalAction() {
        return action;
    }

    public String getClientStack() {
        return jsStack;
    }

    public String getComponentStack() {
        return cmpStack;
    }

    void setCauseDescriptor(String causeDescriptor) {
        this.causeDescriptor = causeDescriptor;
    }

    public String getCauseDescriptor() {
        return causeDescriptor;
    }

    public String getClientErrorId() {
        return errorId;
    }

    void setFailedComponentNamespace(String namespace) {
        this.namespace = namespace;
    }

    public String getFailedComponentNamespace() {
        return this.namespace;
    }

    void setFailedComponent(String name) {
        this.componentName = name;
    }

    public String getFailedComponent() {
        return this.componentName;
    }

    void setFailedComponentMethod(String methodName) {
        this.methodName = methodName;
    }
    
    public String getFailedComponentMethod() {
        return this.methodName;
    }

    void setSourceCode(String sourceCode) {
        this.sourceCode = sourceCode;
    }

    public String getSourceCode() {
        return this.sourceCode;
    }

    public String getStackTraceIdGen() {
        return this.stacktraceIdGen;
    }

    public Level getLevel() {
        return this.level;
    }
}
