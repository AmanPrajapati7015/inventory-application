const express = require('express');
const { getGames, getGameById} = require('../db/fucntions');


const router = express.Router();


router.get('/', async (req, res)=>{
    const games = await getGames();
    res.render('games', {games});
})

router.get('/game-page/:id', async(req, res)=>{
    const id = req.params.id;
    const game = await getGameById(+id);
    
    res.render('game-page', game);
})


module.exports = router;