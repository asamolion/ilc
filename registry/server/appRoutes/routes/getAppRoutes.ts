import {
    Request,
    Response,
} from 'express';

import db from '../../db';
import {
    prepareAppRoutesToRespond,
} from '../services/prepareAppRoute';

const getAppRoutes = async (req: Request, res: Response) => {
    const filters = req.query.filter ? JSON.parse(req.query.filter as string) : {};

    const query = db
        .select('routes.id as routeId', 'routes.*')
        .orderBy('orderPos', 'ASC')
        .from('routes');

    if (filters.showSpecial === true) {
        query.whereNotNull('routes.specialRole');
    } else {
        query.whereNull('routes.specialRole');
    }

    if (filters.domainId !== undefined) {
        filters.domainId = filters.domainId === 'null' ? null : filters.domainId;
        query.where('domainId', filters.domainId)
    }

    const appRoutes = await query.range(req.query.range as string | undefined);

    res.setHeader('Content-Range', appRoutes.pagination.total); //Stub for future pagination capabilities
    res.status(200).send(prepareAppRoutesToRespond(appRoutes.data));
};

export default [getAppRoutes];
