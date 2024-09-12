const express = require('express');
const { getGames, getGameById, getCategories} = require('../db/fucntions');


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

router.post('/add-new', async (req, res)=>{

    console.log(req.body);
    res.send('added');
}) 


module.exports = router;