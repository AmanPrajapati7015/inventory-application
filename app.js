const  express = require('express');
const session = require('express-session');

const gameRouter = require('./routes/gameRouter');
const categoryRouter = require('./routes/categoryRouter');
const authRoutes = require('./routes/authRouter');
const cartRouter = require('./routes/cartRouter');
const orderRouter = require('./routes/orderRouter')



const app = express();

app.set('view engine', 'ejs'); 

app.use(express.static('public'));
app.use(express.urlencoded({extended:true}))
app.use(session({
    secret: 'secret123',
    resave: false,
    saveUninitialized: false
}));

// Make user available in all EJS templates
app.use((req, res, next) => {
    res.locals.user = req.session.user;
    next();
});

function checkLogedIn(req, res,  next){
    if(req.session.user )
        next();
    else
        res.redirect('/auth/login');
}

app.get('/', (req, res)=>{
    res.render('homepage');
})



app.use('/auth', authRoutes);

app.use('/games', gameRouter);

app.use('/category', categoryRouter);

app.use('/cart',checkLogedIn ,cartRouter);

app.use('/order',checkLogedIn ,orderRouter);
 
 
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
// 1. design a navbar for mobile phone