const $A = window.$A;
const aura = window.Aura;

var cmp;
var rootElem = document.getElementById("main");

const cmpName = "aura:if";
const cmpParams = {"body":"Blah!!!!!"};

describe(cmpName, () => {

    benchmark('create_component', () => {
        run(() => {
            $A.createComponent(cmpName, cmpParams, (res) => {
                cmp = res;
            });
        });
    });

    benchmark('render_component', () => {
        run(() => {
            $A.renderingService.render(cmp, rootElem);
        });
    });

    benchmark('unrender_component', () => {
        run(() => {
            $A.renderingService.unrender(cmp, rootElem);
        });
    });

    benchmark('destroy_component', () => {
        before(() => {
            $A.createComponent(cmpName, cmpParams, (res) => {
                cmp = res;
                $A.renderingService.render(cmp, rootElem);
            });
        });

        run(() => {
            cmp.destroy();
        });
    });
});