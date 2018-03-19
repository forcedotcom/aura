import { getActionsFromBridge, sendActionsToBridge, getErrorResponse, getErrorResponseWithNoToken } from "./cordova-bridge";

let reifyApi;
let prepareRequestApi;

async function hydrateStoredActions() {
    const actions = await getActionsFromBridge();
    return reifyApi(actions);
}

// This function (and module) has priviledge access to the hydration API
export default function ActionHydration({ reifyActions, prepareRequest }) {
    // Store the APIs as closures for easy code organization
    reifyApi = reifyActions;
    prepareRequestApi = prepareRequest;

    hydrateStoredActions(); // Do all pre-primming
    return { name: 'primer-service' };
}

export async function primeAuraActions(auraActions) {
    const result = await fetchActionsToPrime(auraActions);
    const results = [{status:200, responseText:result}];
    await sendActionsToBridge(results);
    const reifyResult = await reifyApi(results);
    // console.log('>> storable actions returned: ', reifyResult.storableActions.length);
    return reifyResult.storableActions;
}

export async function submitError() {
    const mockError = await getErrorResponse();
    const reifyResult = await reifyApi(mockError);
    return reifyResult.error;
}

export async function submitErrorWithNoToken() {
    const mockError = await getErrorResponseWithNoToken();
    const reifyResult = await reifyApi(mockError);
    return reifyResult.error;
}

/*
 * NOTE:
 * This SHOULD run in native land rather than in JS land
 * In order to mock an aura action you just need
 * {
 *   aura.token: ...
 *   aura.context: JSON.stringify(context)
 *   message: JSON.stringify({ actions })
 * }
 * We use an internal method in Aura to prepare the request
*/
function fetchActionsToPrime(auraActions) {
    const rawActions = auraActions.map((auraAction) => {
        const rawAction = auraAction.toJSON();
        rawAction.storable = true;
        return rawAction;
    });

    return new Promise((resolve, reject) => {
        const requestPayload = prepareRequestApi(rawActions);
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "/aura?prime");
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=ISO-8859-13');
        xhr.onload = () => resolve(xhr.response);
        xhr.onerror = (err) => reject(err);
        xhr.send(requestPayload);
    });
}