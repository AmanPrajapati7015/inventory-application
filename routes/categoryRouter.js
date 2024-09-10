const express = require('express')
const { getCategoryById, getCategories} = require('../db/fucntions');


const router = express.Router();


router.get('/', async(req, res)=>{
    const categories = await getCategories();
    res.render('categories', {categories});
})

router.get('/:id', async(req, res)=>{
    const id = req.params.id;
    const category = await getCategoryById(id);
    res.render('category-page', category);
})



module.exports = router;