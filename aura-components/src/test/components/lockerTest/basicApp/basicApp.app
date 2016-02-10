<aura:application>
	<aura:attribute name="xss" type="String" default="&lt;button onclick='javascript:alert(1)'&gt;Press me for attempted XSS&lt;/button&gt;"/>

	<lockerTest:basic xss="{!v.xss}"/>
</aura:application>