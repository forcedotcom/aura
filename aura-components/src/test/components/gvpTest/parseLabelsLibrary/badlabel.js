// Don't do this in your components or it will break label parsing {!'{this is just text}'}
// $Label.Section1.badlibrary
//
function () {
    return function () {
        return $A.get("$Label.Section2.badlibrary");
    };
}
