import mongoose from 'mongoose';
import Label from '../models/label.model.js';

// Get all labels
export const getAllLabels = async (req, res) => {
    try {
        const labels = await Label.find();
        res.status(200).json({
            error: false,
            data: labels
        });
    } catch (error) {
        res.status(500).json({
            error: true,
            message: error.message
        });
    }
};

// Create a label
export const createLabel = async (req, res) => {
    try {
        const { name, status } = req.body;
        if (!name) {
            return res.status(400).json({
                error: true,
                message: 'Label name is required'
            });
        }
        const label = new Label({
            name,
            status: status || 'active'
        });
        const savedLabel = await label.save();
        res.status(201).json({
            error: false,
            message: 'Label created successfully',
            data: savedLabel
        });
    } catch (error) {
        res.status(500).json({
            error: true,
            message: error.message
        });
    }
};

// Update a label
export const updateLabel = async (req, res) => {
    try {
        const { name, status } = req.body;
        const label = await Label.findById(req.params.id);

        if (!label) {
            return res.status(404).json({
                error: true,
                message: 'Label not found'
            });
        }

        if (name) label.name = name;
        if (status) label.status = status;

        const updatedLabel = await label.save();

        res.status(200).json({
            error: false,
            message: 'Label updated successfully',
            data: updatedLabel
        });
    } catch (error) {
        res.status(500).json({
            error: true,
            message: error.message
        });
    }
};

// Delete a label
export const deleteLabel = async (req, res) => {
    try {
        const label = await Label.findByIdAndDelete(req.params.id);
        if (!label) {
            return res.status(404).json({
                error: true,
                message: 'Label not found'
            });
        }
        res.status(200).json({
            error: false,
            message: 'Label deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            error: true,
            message: error.message
        });
    }
};