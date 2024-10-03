const  express = require('express');
const gameRouter = require('./routes/gameRouter');
const categoryRouter = require('./routes/categoryRouter');
const { render } = require('ejs');



const app = express();
app.set('view engine', 'ejs'); 

app.use(express.static('public'));
app.use(express.urlencoded({extended:true}))

app.get('/', (req, res)=>{
    res.send('hello world');
})

app.use('/games', gameRouter);


app.use('/category', categoryRouter);

app.get('*', (req, res, next)=>{
    next(new Error('Invalid URL'))
})

app.use((err, req, res, next)=>{
    res.render('error', {errorMsg:err.message});
})


app.listen(3000, ()=>{
    console.log('server running on port 3000');
})



// todo
// 6. make a homepage
// 1. design a navbar for mobile phone