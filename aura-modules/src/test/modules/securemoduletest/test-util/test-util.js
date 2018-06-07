import assert from 'assert';

export function assertTrue(condition, message) {
    assert(condition === true, message);
}

export function assertFalse(condition, message) {
    assert(condition === false, message);
}

export function assertUndefined(condition, message) {
    assert(condition === undefined, message);
}

export function assertDefined(condition, message) {
    assert(condition !== undefined, message);
}

export function assertNotUndefinedOrNull(condition, message) {
    assert(condition === undefined || condition === null, message);
}

export function assertStartsWith(start, full, message) {
    assert(full && full.indexOf && full.indexOf(start) === 0, message);
}

export function assertContains(searchString, full, message) {
    assert(full && full.indexOf && (full.indexOf(searchString) !== -1), message);
}
export function assertEquals(expected, actual, message) {
    assert(expected === actual, message);
}

export function assertEqualsValue(expected, compareObj, message) {
    function traverse(data, actual) {
        const dataKeys = Object.keys(data);
        const actualKeys = Object.keys(actual);
        if (dataKeys.length !== actualKeys.length) {
            fail(message);
        }

        for (let i = 0, length = actualKeys.length; i < length; ++i) {
            const aKey = actualKeys[i];
            const dKey = dataKeys[i];
            // check key length equality
            if (aKey !== dKey) {
                fail(message);
            }

            const aEntry = actual[aKey];
            const dEntry = data[dKey];

            // check undefined values being passed
            if (aEntry === undefined) {
                if (dEntry !== undefined) {
                    fail(message);
                }

                if (dEntry === undefined) {
                    continue;
                }
            }

            // check null values being passed
            if (aEntry === null) {
                if (dEntry !== null) {
                    fail(message);
                }

                if (dEntry === null) {
                    continue;
                }
            }

            // check both data types are of the same type
            if (aEntry.constructor.name !== dEntry.constructor.name) {
                fail(message);
            }

            // deep traverse this entry if it's an Object or an Array
            if (aEntry.constructor === Object || aEntry.constructor === Array) {
                traverse(aEntry, dEntry);
                continue;
            }

            assert(aEntry === dEntry, message);
        }
    }
    traverse(expected, compareObj);
}

export function waitForTimeout(expected, valueFn, message, threshold = 5000) {
    let counter = 0;
    const step = 1000;

    const timerFn = function () {
        let result;

        try {
            result = valueFn();

            try {
                assert(result === expected, message);
            } catch (e) {
                if (counter + step <= threshold) {
                    counter += step;
                    setTimeout(timerFn, step);
                } else {
                    fail(`${message}: Timeout expired`);
                }
            }
        } catch (e) {
            fail('Error executing valueFn in waitFor: ' + e.stack);
        }
    };
    setTimeout(timerFn, 1);
}

export function waitForPromise(expected, valueFn, message, threshold = 5000) {
    let counter = 0;
    const step = 1000;

    const promise = new Promise(function (resolve, reject) {
        const timerFn = function () {
            let result;
            try {
                result = valueFn();
                if (result === expected) {
                    resolve();
                } else {
                    if (counter + step <= threshold) {
                        counter += step;
                        setTimeout(timerFn, step);
                    } else {
                        reject(`${message}: Timeout expired`);
                    }
                }
            } catch (e) {
                reject('Error executing valueFn in waitFor. ');
            }
        };
        setTimeout(timerFn, 1);
    });

    return promise;
}

export function fail(message) {
    assert(false, message);
}