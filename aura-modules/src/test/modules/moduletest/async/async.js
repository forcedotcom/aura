import { Element } from 'engine';

function resolveAfter1Sec(x) {
    return new Promise(resolve => {
        setTimeout(() => { // eslint-disable-line lwc/no-set-timeout
            resolve(x);
        }, 1000);
    });
}

async function test(number) {
    const t = await resolveAfter1Sec(number);
    return t;
}

export default class Async extends Element {
    connectedCallback() {
        test(7).then((n) => {
            console.log('YAY!', n); // eslint-disable-line no-console
        });
    }
}
