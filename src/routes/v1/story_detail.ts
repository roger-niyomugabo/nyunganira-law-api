import express, { NextFunction, Request, Response } from 'express';
import { asyncMiddleware } from '../../middleware/error_middleware';
import output from '../../utils/response';
import { Story } from '../../db/models';
const router = express.Router({ mergeParams: true });

// Get a single story
router.get('/', asyncMiddleware(async (req: Request, res: Response, next: NextFunction) => {
    const { storyId } = req.params;
    const story = await Story.findOne({ where: { id: storyId } });
    if (!story) {
        return output(res, 404, 'Story not found', null, 'NOT_FOUND_ERROR');
    }
    return output(res, 200, 'Story retrieved successfully', story, null);
})
);

export default router;
