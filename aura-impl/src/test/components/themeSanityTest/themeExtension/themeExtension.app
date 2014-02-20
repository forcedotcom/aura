<!-- I want to extend another theme -->
<aura:application>
    <themeSanityTest:header>This should be red text with green background, since its from base theme</themeSanityTest:header>
    <themeSanityTest:header2>This should be yellow with green background, since color is overriden in child theme and background color is inherited</themeSanityTest:header2>
</aura:application>
