/* eslint-disable @typescript-eslint/no-unused-vars */
import express, { NextFunction, Request, Response } from 'express';
import Joi from 'joi';
import output from '../../utils/response';
import { asyncMiddleware } from '../../middleware/error_middleware';
import { Story } from '../../db/models';
import { isAdmin } from '../../middleware/access_middleware';
import { pagination, validate } from '../../middleware/middleware';
import cloudinaryUpload from '../../utils/file_upload';
import { computePaginationRes } from '../../utils';

const router = express.Router();

// story validations
const storyValidations = Joi.object({
    title: Joi.string().required(),
    content: Joi.string().required(),
});

router.post('/', isAdmin, cloudinaryUpload.single('image'), validate(storyValidations), asyncMiddleware(async (req: Request, res: Response, next: NextFunction) => {
    const { title, content } = req.body;
    const file = req.file as Express.Multer.File;

    const storyExists = await Story.findOne({ where: { title, content } });
    if (storyExists) {
        return output(res, 409, 'Story already exixts', null, 'CONFLICT_ERROR');
    }
    const story = await Story.create({ ...req.body, image: file.path });
    return output(res, 201, 'Story created successfully', story, null);
})
);

router.get('/', pagination, asyncMiddleware(async (req: Request, res: Response, next: NextFunction) => {
    const orderClause = Story.getOrderQuery(req.query);
    const selectClause = Story.getSelectionQuery(req.query);

    const stories = await Story.findAndCountAll({
        order: orderClause,
        attributes: selectClause,
        limit: res.locals.pagination.limit,
        offset: res.locals.pagination.offset,
    });

    return output(
        res, 200, 'Stories retrieved successfully',
        computePaginationRes(
            res.locals.pagination.page,
            res.locals.pagination.limit,
            stories.count,
            stories.rows),
        null);
})
);

export default router;
