const  express = require('express');
const { getGames, getGameById } = require('./db/fucntions');

const app = express();
app.set('view engine', 'ejs'); 

app.use(express.static('public'));

app.get('/', (req, res)=>{
    res.send('hello world');
})

app.get('/games', async (req, res)=>{
    const games = await getGames();
    res.render('games', {games});
})

app.get('/games/game-page/:id', async(req, res)=>{
    const id = req.params.id;
    const game = await getGameById(+id);
    
    res.render('game-page', game);
})

app.listen(3000, ()=>{
    console.log('server running on port 3000');
})
