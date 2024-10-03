const express = require('express')
const { getCategoryById, getCategories, addCategory} = require('../db/fucntions');
const {validationResult}  = require('express-validator');
const categoryValidator = require('../utils/category-validator');


const router = express.Router();

// categories page -- to show all categories
router.get('/', async(req, res)=>{
    const categories = await getCategories();
    res.render('categories', {categories});
})

// category-page -- to show a category in details
router.get('/category-page/:id', async(req, res, next)=>{
    const id = req.params.id;
    const category = await getCategoryById(id);
    if(!category.id)
        next(new Error('invalid category id'));
    else
        res.render('category-page', category);
})

// add-new category form page
router.get('/add-new', async(req, res)=>{
    res.render('add-new-category'); 
})

// handle post request of add-new category
router.post('/add-new', categoryValidator, async(req, res)=>{
    const result = validationResult(req);
    
    if(result.errors.length == 0){
        const id = await addCategory(req.body);
        res.redirect('/category/category-page/'+id);
    }
    else{
        console.log(result.errors);
        res.render('add-new-category', {...req.body, errors:result.errors});
    }
})

module.exports = router;