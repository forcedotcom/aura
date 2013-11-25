<aura:application render="client" model="java://org.auraframework.impl.java.model.TestIterationModel" 
                                  controller="java://org.auraframework.impl.java.controller.TestController"
                                  securityProvider="java://org.auraframework.java.securityProvider.TestingSecurityProvider">
    <aura:attribute name="color" default="white" type="String"/>
    <ui:button class="{! 'bkgColor ' + v.color}" label="Change color by setting attribute value" press="{!c.changeBkgColor}" />
    
    <!-- Html markup-->
    <aura:attribute name="start" type="Integer"/>
    <aura:attribute name="end" type="Integer"/>
    <performanceTest:htmlMarkup color="{!v.color}"/>
    <br/>
    <aura:attribute name="count" type="List" default="1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20"/>
    
    <!-- Iteration-->
    <ui:button label="Cut the team by half" press="{!c.by2}" class="changeIteratonIndex"/>
	    <table >
		    <tr>
			    <performanceTest:iterateComponents color="{!v.color}" start="{!v.start}" end="{!v.end}">
			            <aura:set attribute="cmps">
			                <td width="100px">Player Number</td>
			                <td width="200px"><aura:text value="Name"/></td>
			                <td width="200px"><div>Age</div></td>
			                <td width="200px"><span>Position</span></td>
			                <td width="200px"><span>Championships</span></td>
			            </aura:set>
			    </performanceTest:iterateComponents>    
		    </tr>
		    </table>
		    <table>
		    <tr>
			    <td>
			    <performanceTest:iterateBasicData color="{!v.color}" rowNumber="{!v.count}" start="{!v.start}" end="{!v.end}"/>
			    </td>
			    <td >
			    <performanceTest:deepIteration color="{!v.color}" players="{!m.playerData}" start="{!v.start}" end="{!v.end}"/>
			    </td>
		    </tr>
	    </table>
	    
	<!--Server Actions -->
	<ui:button label="Simple Server action" press="{!c.simpleServerAction}" class="simpleServerAction"/>
	<ui:button label="Server action to get Component and resolve configs" press="{!c.getComponent}" class="fetchComponentFromServer"/>
	<div aura:id='new'/>
	
	<!--Inheritance and nesting of components -->
	<performanceTest:inheritance color="{!v.color}"/>
	
	<!--Layouts and Browser History Management -->
	<br/><br/>
	<ui:button label="Change to Basketball layout" press="{!c.changeLayout}" class="switchLayout"/>
	<ui:button label="Change Back to Baseball layout" press="{!c.revertLayout}" class="revertLayout"/>
	<table>
	<tr><td>Game:</td><td><div aura:id="game"></div></td></tr>
    <tr><td>Divisions:</td><td><div aura:id="divisions"></div></td></tr>
    <tr><td>Teams:</td><td><div aura:id="teams"></div></td></tr>
    </table>
    
    <!-- Garbage collection of DOM elements and Components-->
    <br/>
    <ui:button label="Push component to page" press="{!c.pushComponent}" class="pushCmp"/>
    <ui:button label="Measure time to destroy component (Component.destroy())" press="{!c.destroyComponent}"/>
    
    <!-- TODO W-1557952 re-enable when we figure out why the mark/measure in Util.removeElement() was causing issues -->
    <!-- <ui:button label="Measure time to destroy dom elements (Util.removeElement())" press="{!c.removeElement}"/> -->
    
    <div class="placeholder" aura:id="placeHolder"/>
    
</aura:application>