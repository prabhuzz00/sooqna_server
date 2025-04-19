import express from 'express';
import { getAllLabels, createLabel, updateLabel, deleteLabel } from '../controllers/label.controller.js';

const labelRouter = express.Router();

labelRouter.get('/', getAllLabels);
labelRouter.post('/create', createLabel);
labelRouter.put('/:id', updateLabel);
labelRouter.delete('/:id', deleteLabel);

export default labelRouter;