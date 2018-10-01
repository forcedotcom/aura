<aura:application>
    <aura:handler name="init" value="{!this}" action="{!c.init}"/>
    <ui:message title="Whoops! Trail closed!" severity="error" closable="false">
      	You’ve accessed an old version of the Locker API Viewer. We’ve improved the tool and moved it to a new location. We think you’ll love the new <a href="https://developer.salesforce.com/docs/component-library/tools/locker-service-viewer">Locker API Viewer</a>. Please update your bookmarks or favorites. We’ll put you on the new trail (that is, redirect you to the new page) automatically in 10 seconds.
    </ui:message>
</aura:application>
