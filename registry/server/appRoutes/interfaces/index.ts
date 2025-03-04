import JoiDefault from 'joi';

import {
    templateNameSchema,
} from '../../templates/interfaces';
import {
    appNameSchema,
} from '../../apps/interfaces';
import db from "../../db";
import {getJoiErr} from "../../util/helpers";

const Joi = JoiDefault.defaults(schema => {
    return schema.empty(null)
});

interface AppRouteSlotProps {
    [propName: string]: any,
}

const commonAppRouteSlot = {
    name: Joi.string().trim().min(1).max(255),
    appName: appNameSchema.external(async value => {
        const wrapperApp = await db('apps').first('kind').where({ name: value });
        if (!wrapperApp) {
            throw getJoiErr('appName', `Non-existing app name "${value}" specified.`);
        } else if (wrapperApp.kind === 'wrapper') {
            throw getJoiErr('appName', 'It\'s forbidden to use wrappers in routes.');
        }

        return value;
    }),
    props: Joi.object().default({}),
    kind: Joi.string().valid('primary', 'essential', 'regular', null),
};

export const appRouteSlotSchema = Joi.object({
    ...commonAppRouteSlot,
    name: commonAppRouteSlot.name.forbidden(),
    appName: commonAppRouteSlot.appName.required(),
});

export const appRouteIdSchema = Joi.string().trim().required();

const commonAppRoute = {
    specialRole: Joi.string().valid('404'),
    orderPos: Joi.number(),
    route: Joi.string().trim().max(255),
    next: Joi.bool().default(false),
    templateName: templateNameSchema.allow(null),
    slots: Joi.object().pattern(commonAppRouteSlot.name, appRouteSlotSchema),
    domainId: Joi.number().default(null),
    meta: Joi.object().default({}),
};

export const partialAppRouteSchema = Joi.object({
    ...commonAppRoute,
});

export const appRouteSchema = Joi.object({
    ...commonAppRoute,
    orderPos: commonAppRoute.orderPos.required(),
    route: commonAppRoute.route.required(),
    slots: commonAppRoute.slots.required(),
});
