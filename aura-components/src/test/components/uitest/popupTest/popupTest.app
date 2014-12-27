<aura:application>
    <ol class="popups">
    	<li class="popup">
		    <ui:popup>
		        <ui:popupTrigger aura:id="triggerExtendedTarget" label="extended target"/>
		        <uiTest:popupTestExtendedTarget aura:id="targetExtendedTarget" attachToBody="true" closeOnClickInside="true">
		            <div style="width:150px;height:200px;">
    	              extended target <ui:button press="{!c.alert}" label="Alert + close" />
		            </div>
	            </uiTest:popupTestExtendedTarget>
		    </ui:popup>
        </li>
        <li class="popup">
		    <ui:popup>
		        <ui:popupTrigger aura:id="triggerExtendedTarget" label="!attachToBody"/>
		        <uiTest:popupTestExtendedTarget aura:id="targetNotAttached">
		            <div style="width:150px;height:200px;">
    	              !attachToBody
		            </div>
	            </uiTest:popupTestExtendedTarget>
		    </ui:popup>
        </li>
    	<li class="popup">
		    <ui:popup aura:id="popup1">
		        <ui:popupTrigger aura:id="triggerLabel" label="trigger via label"/>
		        <ui:popupTarget aura:id="targetLabel" attachToBody="true">
		        	Target via Label
		        </ui:popupTarget>
		    </ui:popup>
        </li>
        <li class="popup">
		    <ui:popup>
		        <ui:popupTrigger aura:id="triggerLabel" label="!closeOnClickOutside"/>
		        <ui:popupTarget aura:id="targetLabel" attachToBody="true" closeOnClickOutside="false">
		        	<div style="width:150px;height:200px;">
		        		!closeOnClickOutside
		        	</div>
		        </ui:popupTarget>
		    </ui:popup>
        </li>
        <li class="popup">
		    <ui:popup>
		        <ui:popupTrigger class="customTrigger">
		        	<aura:set attribute="trigger">
		        		<uiTest:popupTestTriggerElement aura:id="triggerTriggerElement" />
		        	</aura:set>
		        </ui:popupTrigger>
		        <ui:popupTarget class="customTriggerTargetContainer" aura:id="targetTriggerElement" attachToBody="true">
		            <div style="width:150px;height:200px;">
    	              label target
		            </div>
	            </ui:popupTarget>
		    </ui:popup>
        </li>
		<li class="popup">
		    <uiTest:popupTestExtendedPopup>
		        <ui:popupTrigger aura:id="triggerPopupExtended">
                    <span>extended popup</span>
		        </ui:popupTrigger>
		        <ui:popupTarget aura:id="targetPopupExtended">
		            <div style="width:150px;height:200px;">
                      target inside extended popup
		            </div>
		        </ui:popupTarget>
		    </uiTest:popupTestExtendedPopup>
        </li>        
        <li class="popup">
		    <ui:popup>
		        <ui:popupTrigger aura:id="triggerCurtain">
                    <span>body trigger + curtain</span>
		        </ui:popupTrigger>
		        <ui:popupTarget aura:id="targetCurtain" attachToBody="true" curtain="true">
		            <div style="width:150px;height:200px;">
                      body trigger + curtain
		            </div>
		        </ui:popupTarget>
		    </ui:popup>
        </li>
        <li class="popup">
		    <ui:popup>
		        <ui:popupTrigger aura:id="triggerManualPositionCurtain" label="label trigger + manualPosition + curtain"/>
		        <ui:popupTarget aura:id="targetManualPositionCurtain" attachToBody="true" manualPosition="true" curtain="true">
		            <div style="width:150px;height:200px;">
    	              label trigger + manualPosition + curtain
		            </div>
	            </ui:popupTarget>
		    </ui:popup>
        </li>
        <li class="popup">
        <ui:popup>
        <ui:popupTrigger class='triggerExtendedTarget' aura:id='triggerExtendedTarget' label='Triggerglsc'/>
        <ui:popupTarget aura:id='targetExtendedTarget' attachToBody='true' manualPosition='true' autoPosition='false'>
        	<div style='position: absolute;left: 5px;width: 100px;height: 220px'>Targetbdir</div>
        </ui:popupTarget>
        </ui:popup>
        </li>
    </ol>
    <iframe src="/uitest/popupTestFrame.cmp?frameId=Frame1"/>
    <iframe src="/uitest/popupTestFrame.cmp?frameId=Frame2"/>
    <ui:button press="{!c.destroyPopup}" label="destroy popup1"/>
</aura:application>