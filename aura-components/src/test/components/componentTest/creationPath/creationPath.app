<!--

    Copyright (C) 2013 salesforce.com, inc.

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

            http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.

-->
<aura:application controller="java://org.auraframework.component.test.java.controller.JavaTestController">

    <componentTest:hasBody aura:id="topbody">
        topbody
    </componentTest:hasBody>
    <componentTest:hasModel aura:id="topmodel">
        <aura:set attribute="headerComponents">
		    <componentTest:hasBody aura:id="headerbody">
		        headerbody
		    </componentTest:hasBody>
            <componentTest:hasModel aura:id="headermodel">
                headermodel
            </componentTest:hasModel>
        </aura:set>
        
        <aura:set attribute="innerComponents">
            <componentTest:hasModel aura:id="innermodel">
                innermodel
            </componentTest:hasModel>
            <componentTest:hasModel aura:id="innermodel2">
                innermodel2
            </componentTest:hasModel>
        </aura:set>
        
        topmodel
	    <componentTest:hasModel aura:id="nestingmodel">
	        nestingmodel
	        <componentTest:hasModel aura:id="nestedmodel">
	            nestedmodel
                <componentTest:hasBody aura:id="nestestbody">
                   nestestbody
                </componentTest:hasBody>
	            <componentTest:hasModel aura:id="nestestmodel">
	               nestestmodel
	            </componentTest:hasModel>
	        </componentTest:hasModel>
		    <componentTest:hasBody aura:id="nestedbody">
		        nestedbody
		    </componentTest:hasBody>
	    </componentTest:hasModel>
    </componentTest:hasModel>

    <aura:attribute name="iftrue" type="boolean" default="true"/>
    <aura:attribute name="ifserver" type="boolean" default="false"/>
    <aura:if isTrue="{!v.iftrue}">
        <componentTest:hasBody aura:id="truebody">
            truebody
        </componentTest:hasBody>
        <aura:if isTrue="{!v.ifserver}">
	        <componentTest:hasModel aura:id="truemodel">
	            truemodel
	        </componentTest:hasModel>
        </aura:if>

        <aura:set attribute="else">
		    <componentTest:hasBody aura:id="falsebody">
		        falsebody
		    </componentTest:hasBody>
            <aura:if isTrue="{!v.ifserver}">
		        <componentTest:hasModel aura:id="falsemodel">
		            falsemodel
		        </componentTest:hasModel>
            </aura:if>
        </aura:set>
    </aura:if>

    <aura:attribute name="list" type="List" default="x"/>
    <aura:attribute name="descriptor" type="String" default="aura:text"/>
    <aura:attribute name="value" type="String" default="hi"/>
    <aura:iteration aura:id="iteration" items="{!v.list}" var="x" indexVar="idx">
        <componentTest:appendComponent aura:id="iterinst" descriptor="{!v.descriptor}" value="{!v.value}">
            {!idx} - 
        </componentTest:appendComponent>
    </aura:iteration>
    
    <aura:handler event="aura:layoutChange" action="{!c.layoutChange}"/>
    <div>
	    <ui:outputUrl aura:id="defaultlink" label="default layout" value="#default"/><br/>
	    <ui:outputUrl aura:id="actionlink" label="action layout" value="#action"/><br/>
	    <div aura:id="layoutTarget"/>
	</div>
</aura:application>
