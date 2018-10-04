'use strict';

let changeLevels: number = 0;
let actions: (() => void)[];

export function onChangeFinished(action: () => void): void {
    if (changeLevels === 0) {
        action();
    } else {
        actions.push(action);
    }
}

export function doChange(changeAction: () => void): void {
    const isFirstChange = changeLevels === 0;

    if (isFirstChange) {
        actions = [];
    }

    changeLevels++;

    try {
        changeAction();
    } finally {
        changeLevels--;

        if (isFirstChange) {
            for (const action of actions) {
                action();
            }

            actions = undefined;
        }
    }
}
