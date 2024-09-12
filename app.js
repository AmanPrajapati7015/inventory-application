const  express = require('express');
const gameRouter = require('./routes/gameRouter');
const categoryRouter = require('./routes/categoryRouter');



const app = express();
app.set('view engine', 'ejs'); 

app.use(express.static('public'));
app.use(express.urlencoded({extended:true}))

app.get('/', (req, res)=>{
    res.send('hello world');
})

app.use('/games', gameRouter);


app.use('/category', categoryRouter);



app.listen(3000, ()=>{
    console.log('server running on port 3000');
})


// todo
// 4. make add new category
// 5. make add new game
// 6. make a homepage
// 1. design a navbar for mobile phone