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
Function.RegisterNamespace("Test.Aura");

[Fixture]
Test.Aura.AuraErrorTest = function() {
    var _AuraError;
    var _StackFrame;
    var _ErrorStackParser;
    var _murmurHash3;
    var _generateErrorId;
    var _generateErrorIdHashGen;

    Mocks.GetMocks(Object.Global(), {
        "Aura": {Errors: {}},
    })(function() {
        Import("aura-impl/src/main/resources/aura/polyfill/stackframe.js");
        Import("aura-impl/src/main/resources/aura/polyfill/error-stack-parser.js");
        Import("aura-impl/src/main/resources/aura/error/AuraError.js");
        _StackFrame = StackFrame;
        _ErrorStackParser = ErrorStackParser;
        _AuraError = AuraError;
        _murmurHash3 = Aura.Errors.MurmurHash3;
        _generateErrorId = Aura.Errors.GenerateErrorId;
        _generateErrorIdHashGen = Aura.Errors.GenerateErrorIdHashGen;
        delete StackFrame;
        delete ErrorStackParser;
        delete AuraError;
    });

    function getAuraMock(during) {
        return Mocks.GetMocks(Object.Global(), {
            Aura: {
                Errors: {
                    AuraError: _AuraError,
                    StackFrame: _StackFrame,
                    StackParser: _ErrorStackParser,
                    MurmurHash3: _murmurHash3,
                    GenerateErrorId: _generateErrorId,
                    GenerateErrorIdHashGen: _generateErrorIdHashGen,
                }
            }
        })(during);
    }

    [Fixture]
    function Construct() {
        [Fact]
        function ReturnsNameDefault() {//no message nor innerError, the default name is AuraError
            var actual;
            var expected = "AuraError";

            getAuraMock(function() {
                actual = new Aura.Errors.AuraError().name;
            });

            Assert.Equal(expected, actual);
        }

        [Fact]
        function ReturnsNameofInnerError() {//when innerError has name, we just use that
            var actual;
            var innerError = new TypeError();
            var expected = innerError.name;

            getAuraMock(function() {
                actual = new Aura.Errors.AuraError(null, innerError).name;
            });

            Assert.Equal(expected, actual);
        }

        [Fact]
        function ReturnsEmptyMessageDefault() {//when pass in no message nor innerError, we set message to empty
            var actual;

            getAuraMock(function() {
                actual = new Aura.Errors.AuraError().message;
            });

            Assert.Empty(actual);
        }

        [Fact]
        function ReturnsMessage() {//when pass in message, no innerError, we use that as message
            var actual;
            var expected = "test message";

            getAuraMock(function() {
                actual = new Aura.Errors.AuraError(expected).message;
            });

            Assert.Equal(expected, actual);
        }

        [Fact]
        function ReturnsMessageofMessageAndInnerError() {//when pass in both message and innerError, we construct message from them
            var actual;
            var innerError = "from inner error";
            var message = "from ctor";
            var expected = message + " [" + innerError.toString() + "]";

            getAuraMock(function() {
                actual = new Aura.Errors.AuraError(message, innerError).message;
            });

            Assert.Equal(expected, actual);
        }

        [Fact]
        function ReturnsStackTraceDefault() {//no innerError, we create a new Error("foo"), and use its stackTrace
            var actual;

            getAuraMock(function() {
                actual = new Aura.Errors.AuraError();
            });

            Assert.NotNull(actual.stackTrace);//make sure stackTrace is not null
        }

        [Fact]
        function ReturnsSeverity() {
            var actual;
            var expected = "FATAL";

            getAuraMock(function() {
                actual = new Aura.Errors.AuraError(null, null, expected).severity;
            });

            Assert.Equal(expected, actual);
        }

        [Fact]
        function ReturnsStackTrace_StrangeMessage() {
            var actual = "";
            var innerError = undefined;// new Error();
            //innerError.message = "innerErrorMessage";
            var expected = "SomeMessage";

            getAuraMock(function() {
                actual = new Aura.Errors.AuraError("SomeMessage", innerError).message;
            });

            Assert.Equal(expected, actual);
        }

        [Fact]
        function ReturnsInnerErrorStackTrace() {
            var actual = "";
            var innerError = new Error();
            innerError.stack = "innerErrorStack";
            var expected = "innerErrorStack()";

            getAuraMock(function() {
                actual = new Aura.Errors.AuraError("SomeMessage", innerError).stackTrace;
            });

            Assert.Equal(expected, actual);
        }



        [Fact]
        function ReturnsNoFrameworkStackTrace() {
            var actual;
            var innerError = new Error();
            innerError.message = "Error from app client controller";
            innerError.stack = "Error: Error from app client controller\n\
    at throwErrorFromClientController (http://localhost:9090/components/auratest/errorHandlingApp.js:42:15)\n\
    at Action.$runDeprecated$ (http://localhost:9090/auraFW/javascript/iMVf5-orschKyiiWELafJg/aura_dev.js:8469:36)\n\
    at Object.Component$getActionCaller [as $handler$] (http://localhost:9090/auraFW/javascript/iMVf5-orschKyiiWELafJg/aura_dev.js:6695:20)\n\
    at Aura.$Event$.$Event$.$executeHandlerIterator$ (http://localhost:9090/auraFW/javascript/iMVf5-orschKyiiWELafJg/aura_dev.js:8100:15)\n\
    at Aura.$Event$.$Event$.$executeHandlers$ (http://localhost:9090/auraFW/javascript/iMVf5-orschKyiiWELafJg/aura_dev.js:8078:8)\n\
    at http://localhost:9090/auraFW/javascript/iMVf5-orschKyiiWELafJg/aura_dev.js:8130:10\n\
    at AuraInstance.$run$ (http://localhost:9090/auraFW/javascript/iMVf5-orschKyiiWELafJg/aura_dev.js:18350:12)\n\
    at Aura.$Event$.$Event$.$fire$ (http://localhost:9090/auraFW/javascript/iMVf5-orschKyiiWELafJg/aura_dev.js:8128:6)\n\
    at Object.catchAndFireEvent (http://localhost:9090/components/ui/button.js:90:33)\n\
    at press (http://localhost:9090/components/ui/button.js:34:16)";
            var expected = "throwErrorFromClientController()@http://localhost:9090/components/auratest/errorHandlingApp.js:42:15\n\
Object.catchAndFireEvent()@http://localhost:9090/components/ui/button.js:90:33\n\
press()@http://localhost:9090/components/ui/button.js:34:16";

            getAuraMock(function() {
                actual = new Aura.Errors.AuraError(null, innerError).stackTrace;
            });

            Assert.Equal(expected, actual);
        }

        [Fact]
        function ReturnsFrameworkStackframesBeforeNonFrameworkStackframe() {
            var actual;
            var innerError = new Error();
            innerError.message = "Error from app client controller";
            innerError.stack = "Error: Error from app client controller\n\
    at Action.$runDeprecated$ (http://localhost:9090/auraFW/javascript/iMVf5-orschKyiiWELafJg/aura_dev.js:8469:36)\n\
    at Object.Component$getActionCaller [as $handler$] (http://localhost:9090/auraFW/javascript/iMVf5-orschKyiiWELafJg/aura_dev.js:6695:20)\n\
    at throwErrorFromClientController (http://localhost:9090/components/auratest/errorHandlingApp.js:42:15)\n\
    at Aura.$Event$.$Event$.$executeHandlerIterator$ (http://localhost:9090/auraFW/javascript/iMVf5-orschKyiiWELafJg/aura_dev.js:8100:15)\n\
    at Aura.$Event$.$Event$.$executeHandlers$ (http://localhost:9090/auraFW/javascript/iMVf5-orschKyiiWELafJg/aura_dev.js:8078:8)\n\
    at http://localhost:9090/auraFW/javascript/iMVf5-orschKyiiWELafJg/aura_dev.js:8130:10\n\
    at AuraInstance.$run$ (http://localhost:9090/auraFW/javascript/iMVf5-orschKyiiWELafJg/aura_dev.js:18350:12)\n\
    at Object.catchAndFireEvent (http://localhost:9090/components/ui/button.js:90:33)\n\
    at Aura.$Event$.$Event$.$fire$ (http://localhost:9090/auraFW/javascript/iMVf5-orschKyiiWELafJg/aura_dev.js:8128:6)\n\
    at press (http://localhost:9090/components/ui/button.js:34:16)";
            var expected = "Action.$runDeprecated$()@http://localhost:9090/auraFW/javascript/iMVf5-orschKyiiWELafJg/aura_dev.js:8469:36\n\
Object.Component$getActionCaller [as $handler$]()@http://localhost:9090/auraFW/javascript/iMVf5-orschKyiiWELafJg/aura_dev.js:6695:20\n\
throwErrorFromClientController()@http://localhost:9090/components/auratest/errorHandlingApp.js:42:15\n\
Object.catchAndFireEvent()@http://localhost:9090/components/ui/button.js:90:33\n\
press()@http://localhost:9090/components/ui/button.js:34:16";

            getAuraMock(function() {
                actual = new Aura.Errors.AuraError(null, innerError).stackTrace;
            });

            Assert.Equal(expected, actual);
        }


        [Fact]
        function ReturnsInnerErrorSeverity() {
            var actual;
            var innerError = new Error();
            innerError.severity = "TEST";
            var expected = innerError.severity;

            getAuraMock(function() {
                actual = new Aura.Errors.AuraError(null, innerError).severity;
            });

            Assert.Equal(expected, actual);
        }

        [Fact]
        function ReturnsHandled() {//handled is set to false
            var actual;
            var expected = false;

            getAuraMock(function() {
                actual = new Aura.Errors.AuraError().handled;
            });

            Assert.Equal(expected, actual);
        }

        [Fact]
        function ReturnsReported() {//reported is set to false
            var actual;
            var expected = false;

            getAuraMock(function() {
                actual = new Aura.Errors.AuraError().reported;
            });

            Assert.Equal(expected, actual);
        }
    }

    [Fixture]
    function FindComponentFromStackTrace() {

        [Fact]
        function ReturnsFailingDescriptorForComponent() {
            var innerError = new Error();
            innerError.message = "Error from app client controller";
            innerError.stack = "Error: Error from app client controller\n\
    at throwErrorFromClientController (http://localhost:9090/components/auratest/errorHandlingApp.js:42:15)\n\
    at Action.$runDeprecated$ (http://localhost:9090/auraFW/javascript/iMVf5-orschKyiiWELafJg/aura_dev.js:8469:36)\n\
    at Object.Component$getActionCaller [as $handler$] (http://localhost:9090/auraFW/javascript/iMVf5-orschKyiiWELafJg/aura_dev.js:6695:20)\n\
    at Aura.$Event$.$Event$.$executeHandlerIterator$ (http://localhost:9090/auraFW/javascript/iMVf5-orschKyiiWELafJg/aura_dev.js:8100:15)\n\
    at Aura.$Event$.$Event$.$executeHandlers$ (http://localhost:9090/auraFW/javascript/iMVf5-orschKyiiWELafJg/aura_dev.js:8078:8)\n\
    at http://localhost:9090/auraFW/javascript/iMVf5-orschKyiiWELafJg/aura_dev.js:8130:10\n\
    at AuraInstance.$run$ (http://localhost:9090/auraFW/javascript/iMVf5-orschKyiiWELafJg/aura_dev.js:18350:12)\n\
    at Aura.$Event$.$Event$.$fire$ (http://localhost:9090/auraFW/javascript/iMVf5-orschKyiiWELafJg/aura_dev.js:8128:6)\n\
    at Object.catchAndFireEvent (http://localhost:9090/components/ui/button.js:90:33)\n\
    at press (http://localhost:9090/components/ui/button.js:34:16)";

            var expected = "markup://auratest:errorHandlingApp";

            var actual;
            getAuraMock(function() {
                var auraError = new Aura.Errors.AuraError(null, innerError);
                actual = auraError.findComponentFromStackTrace();
            });

            Assert.Equal(expected, actual);
        }

        [Fact]
        function ReturnsFailingDescriptorForLibrary() {
            var innerError = new Error();
            innerError.message = "Error from library";
            innerError.stack = "Object.getElement()@https://gus.lightning.force.com/libraries/ui/panelPositioningLib/elementProxyFactory.js:4:161\n\
Object.createRelationship()@https://gus.lightning.force.com/libraries/ui/panelPositioningLib/panelPositioning.js:6:480\n\
Object._createRelationship()@https://gus.lightning.force.com/components/ui/panel.js:17:418\n\
Object._createConstraints()@https://gus.lightning.force.com/components/ui/panel.js:17:515\n\
Object.position()@https://gus.lightning.force.com/components/ui/panel.js:15:21\n\
Object.position()@https://gus.lightning.force.com/components/force/hoverPanel.js:7:86\n\
Object.show()@https://gus.lightning.force.com/components/ui/panel.js:12:177\n\
show()@https://gus.lightning.force.com/components/ui/panel.js:3:398";

            var expected = "js://ui:panelPositioningLib.elementProxyFactory";

            var actual;
            getAuraMock(function() {
                var auraError = new Aura.Errors.AuraError(null, innerError);
                actual = auraError.findComponentFromStackTrace();
            });

            Assert.Equal(expected, actual);
        }

    }

    [Fixture]
    function SetComponent() {

        [Fact]
        function SetsErrorId() {
            var actual;

            getAuraMock(function() {
                var auraError = new Aura.Errors.AuraError();
                auraError.setComponent("test");
                actual = auraError.id;
            });

            Assert.NotNull(actual);
        }

        [Fact]
        function ReturnsIdTheSameAsGackStackTraceId() {
            var actual;
            var innerError = new Error();
            innerError.message = "Error from app client controller";
            innerError.stack = "Error: Error from app client controller\n\
    at throwErrorFromClientController (http://localhost:9090/components/auratest/errorHandlingApp.js:42:15)\n\
    at Action.$runDeprecated$ (http://localhost:9090/auraFW/javascript/iMVf5-orschKyiiWELafJg/aura_dev.js:8469:36)\n\
    at Object.Component$getActionCaller [as $handler$] (http://localhost:9090/auraFW/javascript/iMVf5-orschKyiiWELafJg/aura_dev.js:6695:20)\n\
    at Aura.$Event$.$Event$.$executeHandlerIterator$ (http://localhost:9090/auraFW/javascript/iMVf5-orschKyiiWELafJg/aura_dev.js:8100:15)\n\
    at Aura.$Event$.$Event$.$executeHandlers$ (http://localhost:9090/auraFW/javascript/iMVf5-orschKyiiWELafJg/aura_dev.js:8078:8)\n\
    at http://localhost:9090/auraFW/javascript/iMVf5-orschKyiiWELafJg/aura_dev.js:8130:10\n\
    at AuraInstance.$run$ (http://localhost:9090/auraFW/javascript/iMVf5-orschKyiiWELafJg/aura_dev.js:18350:12)\n\
    at Aura.$Event$.$Event$.$fire$ (http://localhost:9090/auraFW/javascript/iMVf5-orschKyiiWELafJg/aura_dev.js:8128:6)\n\
    at Object.catchAndFireEvent (http://localhost:9090/components/ui/button.js:90:33)\n\
    at press (http://localhost:9090/components/ui/button.js:34:16)";
            // Murmur32 hash with stacktraceIdGen
            var expected = 4611780;

            getAuraMock(function() {
                var auraError = new Aura.Errors.AuraError(null, innerError);
                auraError.setComponent("auratest:errorHandlingApp");
                actual = auraError.id;
            });

            Assert.Equal(expected, actual);
        }

    }

    [Fixture]
    function ToString() {
        [Fact]
        function ContainsMessage() {
            var expected = "test message";
            var target;

            getAuraMock(function(){
                target = new Aura.Errors.AuraError(expected);
            });

            Assert.Equal(expected, target.toString());
        }

        //when message is undefined, we will call Error.prototype.toString(), note in browser this will give us "Error"
        [Fact]
        function ReturnsEmptyStringWhenMessageIsUndefined() {
            var target;
            getAuraMock(function(){
                target = new Aura.Errors.AuraError();
            });
            Assert.Equal('', target.toString());
        }

    }
    [Fixture]
    function setStackTrace() {

        [Fact]
        function SetsStackTrace() {
            var actual;
            var expected = "test stack";

            getAuraMock(function() {
                actual = new Aura.Errors.AuraError();
                actual.setStackTrace(expected);
            });

            Assert.Equal(actual.stackTrace, expected);
        }

    }

    [Fixture]
    function GenerateErrorIdHashGen() {

        [Fact]
        function HashGenStringWhenCmpIsNotSet() {
            var innerError = new Error();
            innerError.stack = innerError.stack = "Error: Error from app client controller\n\
    at throwErrorFromClientController (http://localhost:9090/components/auratest/errorHandlingApp.js:42:15)\n\
    at Action.$runDeprecated$ (http://localhost:9090/auraFW/javascript/iMVf5-orschKyiiWELafJg/aura_dev.js:8469:36)\n\
    at Object.Component$getActionCaller [as $handler$] (http://localhost:9090/auraFW/javascript/iMVf5-orschKyiiWELafJg/aura_dev.js:6695:20)\n\
    at Aura.$Event$.$Event$.$executeHandlerIterator$ (http://localhost:9090/auraFW/javascript/iMVf5-orschKyiiWELafJg/aura_dev.js:8100:15)\n\
    at Aura.$Event$.$Event$.$executeHandlers$ (http://localhost:9090/auraFW/javascript/iMVf5-orschKyiiWELafJg/aura_dev.js:8078:8)\n\
    at http://localhost:9090/auraFW/javascript/iMVf5-orschKyiiWELafJg/aura_dev.js:8130:10\n\
    at AuraInstance.$run$ (http://localhost:9090/auraFW/javascript/iMVf5-orschKyiiWELafJg/aura_dev.js:18350:12)\n\
    at Aura.$Event$.$Event$.$fire$ (http://localhost:9090/auraFW/javascript/iMVf5-orschKyiiWELafJg/aura_dev.js:8128:6)\n\
    at Object.catchAndFireEvent (http://localhost:9090/components/ui/button.js:90:33)\n\
    at press (http://localhost:9090/components/ui/button.js:34:16)";

            var expected = "undefined$throwErrorFromClientController";
            var actual;

            getAuraMock(function() {
                var auraError = new Aura.Errors.AuraError(null, innerError);
                actual = Aura.Errors.GenerateErrorIdHashGen(undefined, auraError.stackFrames);
            });

            Assert.Equal(expected, actual);
        }

        [Fact]
        function HashGenStringUsesComponentAndFunction() {
            var innerError = new Error();
            innerError.stack = innerError.stack = "Error: Error from app client controller\n\
    at throwErrorFromClientController (http://localhost:9090/components/auratest/errorHandlingApp.js:42:15)\n\
    at Action.$runDeprecated$ (http://localhost:9090/auraFW/javascript/iMVf5-orschKyiiWELafJg/aura_dev.js:8469:36)\n\
    at Object.Component$getActionCaller [as $handler$] (http://localhost:9090/auraFW/javascript/iMVf5-orschKyiiWELafJg/aura_dev.js:6695:20)\n\
    at Aura.$Event$.$Event$.$executeHandlerIterator$ (http://localhost:9090/auraFW/javascript/iMVf5-orschKyiiWELafJg/aura_dev.js:8100:15)\n\
    at Aura.$Event$.$Event$.$executeHandlers$ (http://localhost:9090/auraFW/javascript/iMVf5-orschKyiiWELafJg/aura_dev.js:8078:8)\n\
    at http://localhost:9090/auraFW/javascript/iMVf5-orschKyiiWELafJg/aura_dev.js:8130:10\n\
    at AuraInstance.$run$ (http://localhost:9090/auraFW/javascript/iMVf5-orschKyiiWELafJg/aura_dev.js:18350:12)\n\
    at Aura.$Event$.$Event$.$fire$ (http://localhost:9090/auraFW/javascript/iMVf5-orschKyiiWELafJg/aura_dev.js:8128:6)\n\
    at Object.catchAndFireEvent (http://localhost:9090/components/ui/button.js:90:33)\n\
    at press (http://localhost:9090/components/ui/button.js:34:16)";

            var expected = "auratest:errorHandlingApp$throwErrorFromClientController";
            var actual;

            getAuraMock(function() {
                var auraError = new Aura.Errors.AuraError(null, innerError);
                auraError["component"] = "auratest:errorHandlingApp";
                actual = Aura.Errors.GenerateErrorIdHashGen(auraError.component, auraError.stackFrames);
            });

            Assert.Equal(expected, actual);
        }

        [Fact]
        function HashGenStringWhenComponentIsAction() {
            var innerError = new Error();
            innerError.stack = "Object.getElement()@https://gus.lightning.force.com/libraries/ui/panelPositioningLib/elementProxyFactory.js:4:161\n\
Object.createRelationship()@https://gus.lightning.force.com/libraries/ui/panelPositioningLib/panelPositioning.js:6:480\n\
Object._createRelationship()@https://gus.lightning.force.com/components/ui/panel.js:17:418\n\
Object._createConstraints()@https://gus.lightning.force.com/components/ui/panel.js:17:515\n\
Object.position()@https://gus.lightning.force.com/components/ui/panel.js:15:21\n\
Object.position()@https://gus.lightning.force.com/components/force/hoverPanel.js:7:86\n\
Object.show()@https://gus.lightning.force.com/components/ui/panel.js:12:177\n\
show()@https://gus.lightning.force.com/components/ui/panel.js:3:398";

            var expected = "force:hoverPanel$controller$show$Object.getElement()";
            var actual;

            getAuraMock(function() {
                var auraError = new Aura.Errors.AuraError(null, innerError);
                auraError["component"] = "force:hoverPanel$controller$show";
                actual = Aura.Errors.GenerateErrorIdHashGen(auraError.component, auraError.stackFrames);
            });

            Assert.Equal(expected, actual);
        }
    }
}
