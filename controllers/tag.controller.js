import mongoose from 'mongoose';
import Tag from '../models/tag.model.js'; // Ensure .js extension for ES Modules

// Get all tags
export const getAllTags = async (req, res) => {
    try {
        const tags = await Tag.find();
        res.status(200).json({
            error: false,
            data: tags
        });
    } catch (error) {
        res.status(500).json({
            error: true,
            message: error.message
        });
    }
};

// Create a tag
export const createTag = async (req, res) => {
    try {
        const { name, status } = req.body;
        if (!name) {
            return res.status(400).json({
                error: true,
                message: 'Tag name is required'
            });
        }
        const tag = new Tag({
            name,
            status: status || 'active'
        });
        const savedTag = await tag.save();
        res.status(201).json({
            error: false,
            message: 'Tag created successfully',
            data: savedTag
        });
    } catch (error) {
        res.status(500).json({
            error: true,
            message: error.message
        });
    }
};

// Update a tag
export const updateTag = async (req, res) => {
    try {
        const { name, status } = req.body;
        const tag = await Tag.findById(req.params.id);

        if (!tag) {
            return res.status(404).json({
                error: true,
                message: 'Tag not found'
            });
        }

        if (name) tag.name = name;
        if (status) tag.status = status;

        const updatedTag = await tag.save();

        res.status(200).json({
            error: false,
            message: 'Tag updated successfully',
            data: updatedTag
        });
    } catch (error) {
        res.status(500).json({
            error: true,
            message: error.message
        });
    }
};

// Delete a tag
export const deleteTag = async (req, res) => {
    try {
        const tag = await Tag.findByIdAndDelete(req.params.id);
        if (!tag) {
            return res.status(404).json({
                error: true,
                message: 'Tag not found'
            });
        }
        res.status(200).json({
            error: false,
            message: 'Tag deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            error: true,
            message: error.message
        });
    }
};