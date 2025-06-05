import { Router } from 'express'
import auth from '../middlewares/auth.js';
import upload from '../middlewares/multer.js';
import { createCategory, deleteCategory, getCategories, getCategoriesCount, getCategory, getSubCategoriesCount, removeImageFromCloudinary, updatedCategory, uploadImages } from '../controllers/category.controller.js';
import vendorAuth from '../middlewares/vendorAuth.js';

const categoryRouter = Router();

categoryRouter.post('/uploadImages',auth,upload.array('images'),uploadImages);
categoryRouter.post('/create',auth,createCategory);
categoryRouter.get('/',getCategories);
categoryRouter.get('/get/count',getCategoriesCount);
categoryRouter.get('/get/count/subCat',getSubCategoriesCount);
categoryRouter.get('/:id',getCategory);
categoryRouter.delete('/deteleImage',auth,removeImageFromCloudinary);
categoryRouter.delete('/deleteVendorImage',vendorAuth,removeImageFromCloudinary);
categoryRouter.delete('/:id',auth,deleteCategory);
categoryRouter.put('/:id',auth,updatedCategory);
categoryRouter.get('/getVendorCategories',vendorAuth, getCategories);


export default categoryRouter;