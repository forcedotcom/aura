const $A = window.$A;
const aura = window.Aura;

describe('aura:text', () => {

    benchmark('create_component', () => {
        let baseElement;
        let tempContent;
        let rootElem = document.getElementById("main");

        before(() => {
            baseElement = document.createElement('div');
        });

        run(() => {
            $A.createComponent("aura:text", {value: "blah!!!"}, (res) => {
                console.log("res", res, rootElem);
                tempContent = res;
            });
        });

        after(() => {
            baseElement.innerHTML = tempContent;
            rootElem.appendChild(baseElement);
        });
    });
});