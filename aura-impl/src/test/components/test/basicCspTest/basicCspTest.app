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
    <aura:attribute name='testIframe' type='Boolean' default='false'/>
    <aura:attribute name='testScriptSource' type='Boolean' default='false'/>
    <aura:attribute name='testStyleSource' type='Boolean' default='false'/>
    <aura:attribute name='testMediaSource' type='Boolean' default='false'/>
    <aura:attribute name='testConnectionSource' type='Boolean' default='false'/>
    <aura:attribute name='xmlHttpRequestComplete' type='Boolean' default='false'/>
    <aura:attribute name='xmlHttpRequestDebug' type='String' default='Start; '/>
    <aura:attribute name='testObjectSource' type='Boolean' default='false'/>
    
    <!-- frameSource, by default, we can load same origin , also we can be ifram-ed by same origin -->
    <aura:if isTrue='{!v.testIframe}'> 
        <div aura:id='iframeDiv'>
            <iframe id='iframe_kitchenSink' src="/test/kitchenSink.cmp" width='400' height='200'/>
        </div>
    </aura:if> 
    
    <!-- ScriptSources: same-origin, UNSAFE_EVAL, UNSAFE_INLINE -->
    <aura:if isTrue='{!v.testScriptSource}'> 
        <div>
            <br/>for ScriptSources, we allow same origin, eval(..)  <br/>
            <script src="/auraFW/resources/codemirror/js/codemirror.js"></script>
          <!--  /aura-resources/src/main/resources/aura/resources/codemirror/js/codemirror.js -->
            <script>
                var eval_res = "test result from eval: "+eval("window.location.pathname");
                document._eval_res = eval_res;
                <!-- 
                    alert("Hi from application:"+eval_res);
                -->
            </script>
        </div>
        <div>
            <br/>component below will load, but it's custom script is gone<br/> 
            <test:basicCspCmpExtendsTemplate/>
            <br/>component above will load, but it's custom script is gone<br/>
        </div>
    </aura:if>
    
    <!-- StyleSources: same-origin, UNSAFE_INLINE 
        same-origin is tested by loading resetCSS.css in head <link href="/auraFW/resources/aura/resetCSS.css" rel="stylesheet" type="text/css">
    -->
    <aura:if isTrue='{!v.testStyleSource}'> 
        <div>
            <h1 style="color:blue">This is a Blue Heading</h1>
        </div>
    </aura:if>
    
    <!-- MediaSources: *, should be anything, but the non-same-domain src is blocked by connect-src anyway 
         NOTE: MP4 type isn't supported on Firefox, For Firefox you'll need .ogg file or.webm video files as sources
    -->
    <aura:if isTrue='{!v.testMediaSource}'>
         <video id='videoSameDomain' width="400" controls="controls" preload="preload">
            <source src="/auraFW/resources/aura/videos/Test6.mp4" type="video/mp4"></source>
            Your browser does not support HTML5 video.
        </video>
    </aura:if>
    
    <!-- connect-src : 'self' http://invalid.salesforce.com , not used in js test, here for easy trying-out -->
    <aura:if isTrue='{!v.testConnectionSource}'>
        <ui:button aura:id='uiButton_sendXHR' press='{!c.post}' label='Send XHR' class='button'/>
        xmlHttpRequestDebug = {!v.xmlHttpRequestDebug} <br/>
    </aura:if>
    
    <!-- object-src: 'self': actually this doesn't matter as we don't allow the object tag in htmlTag.java
    make it object(true) in htmlTag.java then you can see the flash down here
    <aura:if isTrue='{!v.testObjectSource}'>
        <object width="400" height="400" data="/auraFW/resources/ckeditor/ckeditor-4.x/rel/plugins/htmlwriter/samples/assets/outputforflash/outputforflash.swf">
        </object>
    </aura:if>
    -->
    
    
    
</aura:application>