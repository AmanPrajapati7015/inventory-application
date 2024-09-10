const  express = require('express');
const { getGames, getGameById, getCategoryById} = require('./db/fucntions');

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

app.get('/category/:id', async(req, res)=>{
    const id = req.params.id;
    const category = await getCategoryById(id);
    res.render('category-page', category);
})



app.listen(3000, ()=>{
    console.log('server running on port 3000');
})


// todo
// 1. make a navbar 
// 2. make a footer
// 3. make a category page
// 4. make add new category
// 5. make add new game