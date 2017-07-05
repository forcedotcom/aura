import {executeGlobalController} from "aura";

export function executedGlobalControllerWithCustomException() {
    return executeGlobalController("TestController.handleCustomExceptionWithData", {})
        .catch(err => {
            throw new Error(err['data']['customMessage']); // eslint-disable-line dot-notation
        });
}