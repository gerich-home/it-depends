'use strict';

import { ISubscription } from './ISubscription';

export interface ITrackable<THandler> {
    onChange(handler: THandler): ISubscription;
}

