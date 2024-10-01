const express = require('express');
const { getGames, getGameById, getCategories} = require('../db/fucntions');
const addNewGameValidator = require('../utils/new-game-validator');
const {validationResult} = require('express-validator');


const router = express.Router();


router.get('/', async (req, res)=>{
    const games = await getGames();
    res.render('games', {games, active:'/games'});
})

router.get('/game-page/:id', async(req, res)=>{
    const id = req.params.id;
    const game = await getGameById(+id);
    res.render('game-page', game);
})

router.get('/add-new', async(req, res)=>{
    const categories = await getCategories();
    res.render('add-new-game', {categories}); 
})

router.post('/add-new',addNewGameValidator, async (req, res)=>{
    const result = validationResult(req);
    const categories = await getCategories();
    
    if(result.errors.length == 0){
        console.log(result);
        res.send('added');
    }
    else{
        console.log(result.errors);

        // res.send(result.errors)
        
        res.render('add-new-game', {...req.body, errors:result.errors, categories});
    }
}) 


module.exports = router;