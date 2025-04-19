import express from 'express';
import { getAllTags, createTag, updateTag, deleteTag } from '../controllers/tag.controller.js';

const tagRouter = express.Router();

tagRouter.get('/', getAllTags);
tagRouter.post('/create', createTag);
tagRouter.put('/:id', updateTag);
tagRouter.delete('/:id', deleteTag);

export default tagRouter;