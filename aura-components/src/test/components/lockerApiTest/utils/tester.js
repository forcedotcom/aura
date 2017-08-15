function tester() {

    function sortReport(report) {
        report.protos = report.protos.sort(function(a, b) { return a.proto < b.proto ? -1 : 1; } );
    }

    function testObject(object, secureObject, report) {
        if (report === undefined) report = {protos: []}; 
        var protos = report.protos;

        var baseObject = object;
        for (; object !== null; object = Reflect.getPrototypeOf(object)) {
            var proto = getType(object); 

            var props = null;
            for (var i = 0; i < protos.length; i++) {
                if (protos[i].proto === proto) props = protos[i].props;
            }

            if (!props) {
                props = [];
                protos.push({ "proto": proto, "props": props });
            }

            Object.getOwnPropertyNames(object).sort().forEach(function(prop) {
                for (var i = 0; i < props.length; i++) {
                    if (props[i].object === prop) {
                        return;
                    }
                }
                var systemType = getType(baseObject[prop]);
                var secureType = getType(secureObject[prop]);
                var status = (systemType === secureType ? "pass" : (secureType === "Undefined" ? "fail" : "warning"));
                props.push({
                    "object": prop, 
                    "objectType": systemType, 
                    "secureObjectType": secureType,
                    "status": status
                });
            });
        }
        return report;
    }

    function getType(prop) {
        var name = Object.prototype.toString.call(prop);
        var propNameRegex = /\[object (.+)\]/;
        var results = (propNameRegex).exec(name);
        return (results && results.length > 1) ? results[1] : name;
    }
    
    return {testObject: testObject, sortReport: sortReport};
}