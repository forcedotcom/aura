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
<aura:application>
	<aura:attribute name="testPanelType"    type="String"  default="modal"/>
	<aura:attribute name="testTitle"        type="String"  default="New Panel"/>
	<aura:attribute name="testDisplayTitle" type="Boolean" default="true"/>
	<aura:attribute name="testClass"        type="String" default="PanelModalClass"/>
    <aura:attribute name="testClassNames"   type="String"/>
	<aura:attribute name="testFlavor"       type="String"/>
	<aura:attribute name="testIsVisible"    type="Boolean" default="true"/>
	<aura:attribute name="testStartOfDialogLabel" type="String"  default="Start of Dialog"/>
	<aura:attribute name="testCloseOnClickOut"    type="Boolean" default="false"/>
	<aura:attribute name="testShowCloseButton"    type="Boolean" default="true"/>
	<aura:attribute name="testCloseDialogLabel"   type="String"  default="Close"/>
	<aura:attribute name="testUseTransition"      type="Boolean" default="true"/>
	<aura:attribute name="testAnimation"    type="String"  default="bottom"/>
	<aura:attribute name="testAutoFocus"    type="Boolean" default="true"/>
	<aura:attribute name="testDirection"    type="String"  default="north"/>
	<aura:attribute name="testShowPointer"  type="Boolean" default="false"/>
	<aura:attribute name="testUseReferenceElementSelector" type="Boolean" default="false"/>
	<aura:attribute name="testUseReferenceElement"      type="Boolean" default="false"/>
	<aura:attribute name="testReferenceElementSelector" type="String"/>
	<aura:attribute name="testUseHeader"    type="Boolean" default="false"/>
	<aura:attribute name="testUseFooter"    type="Boolean" default="false"/>
	<aura:attribute name="testPanelHeader"  type="Aura.Component[]"/>
	<aura:attribute name="testPanelFooter"  type="Aura.Component[]"/>
	<aura:attribute name="testMakeScrollable"	 type="Boolean" default="false"/>
	<aura:attribute name="nonScrollable"	type="Boolean" default="false"/>
	<aura:attribute name="testCustomizeCloseAction"     type="Boolean" default="false"/>
	<aura:attribute name="testTrapFocus"    type="Boolean" default="true"/>
	<aura:attribute name="testCloseOnLocationChange"    type="Boolean" default="false"/>
	<aura:attribute name="testReturnFocusElement" type="Object"/>
	<aura:attribute name="testShowFirstButton" type="Boolean" default="false"/>

	<aura:dependency resource="markup://ui:block" type="COMPONENT"/>
	
<div style="z-index:1; position:relative;">
	<ui:block aura:id="overflowHidden">
		 <aura:set attribute="right">
		 	<ui:inputText class="appInput" aura:id="appInput" value="TestingCloseOnClickOutFeature" maxlength="10"/> <br/>
		 	<ui:inputText class="appInput2" aura:id="appInput2" value="this opens a panel" click="{!c.createPanel}"/> <br/>
  		 </aura:set>
	 	<div id="bodyBlockDiv">This is a Test App to Test Panel</div>
	</ui:block>
</div>
	<ui:block aura:id="overflowVisible" overflow="true" tag="span">
		<div id="overflowVisibleBody">div in block body</div>
	</ui:block>
	
	<ui:button aura:id="inputFocusMe" label="Focus Me" class="inputFocusMeClass"/>
	<ui:button aura:id="inputDoNotFocusMe" label="Do Not Focus Me" class="inputDoNotFocusMeClass"/>
	
	<uitest:panel2_Tester aura:id="tester"
		panelType="{!v.testPanelType}"
		title="{!v.testTitle}"       
		titleDisplay="{!v.testDisplayTitle}"
		class="{!v.testClass}"     
		classNames="{!v.testClassNames}"     
        flavor="{!v.testFlavor}"    
		isVisible="{!v.testIsVisible}" 
		startOfDialogLabel="{!v.testStartOfDialogLabel}"
		closeOnCLickOut="{!v.testCloseOnClickOut}" 
		showCloseButton="{!v.testShowCloseButton}" 
		closeDialogLabel="{!v.testCloseDialogLabel}"
		useTransition="{!v.testUseTransition}"
		animation="{!v.testAnimation}"  
		autoFocus="{!v.testAutoFocus}"  
		direction="{!v.testDirection}"  
		showPointer="{!v.testShowPointer}"
		useReferenceElementSelector="{!v.testUseReferenceElementSelector}"
		useReferenceElement="{!v.testUseReferenceElement}"
		referenceElementSelector="{!v.testReferenceElementSelector}"
		useHeader="{!v.testUseHeader}"  
		useFooter="{!v.testUseFooter}"  
		panelHeader="{!v.testPanelHeader}"
		panelFooter="{!v.testPanelFooter}"
		makeScrollable="{!v.testMakeScrollable}"
		customizeCloseAction="{!v.testCustomizeCloseAction}"
		trapFocus="{!v.testTrapFocus}"
		closeOnLocationChange="{!v.testCloseOnLocationChange}"
		returnFocusElement="{!v.testReturnFocusElement}"
		showFirstButton="{!v.testShowFirstButton}" />
	
	 <section class="managerContainers">
    <div class="manager">
        <ui:panelManager2 aura:id="pm" useSharedContainer="true">
            <aura:set attribute="registeredPanels">
                    <ui:panel alias="panel"/>
                    <ui:modal alias="modal"/>
            </aura:set>
        </ui:panelManager2>
        <ui:containerManager/>
    </div>
     </section>
		
</aura:application>