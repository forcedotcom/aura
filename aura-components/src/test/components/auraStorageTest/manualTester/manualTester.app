<!--
    
-->
<aura:application>
    <aura:attribute name="stopper" type="Boolean" default="false" />
    <aura:attribute name="randomActions" type="Boolean" default="true" />
    <aura:attribute name="randomTiming" type="Boolean" default="true" />
    <aura:attribute name="windowCount" type="Integer" default="2" />
    <aura:attribute name="actionStorageSize" type="Integer" default="4096" />
    <aura:attribute name="componentDefStorageSize" type="Integer" default="520000" />

    <div>
        Manual test app for Aura's persistent storage<br/><br/>

        This app should be used when there are any non-trivial changes to persistent
        storage and how the framework manages stored actions and definitions. What
        definitions are requested from the server and the probability of certain events
        can be modified in the manualTestEventLib.<br/>

        Instructions for use:
        <ul>
            <li>Open this page</li>
            <li>Turn off pop-up blocker in browser</li>
            <li>Select on-screen options</li>
            <li>Click "Start test"</li>
            <li>App will automatically open the desired amount of tabs and start looping through events that exercise the storage</li>
            <li>App will automatically stop execution and display error as well as a list of recent events for each tab when there is an error or storage is in a bad state</li>
        </ul>

        Tips for debugging:
        <ul>
            <li>Look at the output text box in each tab to see details of that tabs storage state after each event</li>
            <li>Leave dev console open in each tab for extra info logged</li>
        </ul>
    </div>

    <ui:button label="Start test" press="{!c.start}"/>
    <ui:button label="Stop test" press="{!c.stop}"/>
    <ui:button label="Close current test tabs" press="{!c.closeTabs}"/>
    <ui:inputCheckbox label="Random Action Ordering" value="{!v.randomActions}" />
    <ui:inputCheckbox label="Random Action Timing" value="{!v.randomTiming}" />
    [Not implemented] Action storage max size: <ui:inputNumber value="{!v.actionStorageSize}" /><br/>
    [Not implemented] Component def storage max size: <ui:inputNumber value="{!v.componentDefStorageSize}" /><br/>
    Number of concurrent windows: <ui:inputNumber value="{!v.windowCount}" min="1" max="10" /><br/>

    <div>
        Output:<br/>
        <ui:outputText value="Waiting for user input" aura:id="output"/>
    </div>

</aura:application>