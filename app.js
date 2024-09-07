const  express = require('express');

const app = express();
app.set('view engine', 'ejs'); 

app.get('/', (req, res)=>{
    res.send('hello world');
})

app.get('/items', (req, res)=>{
    res.render('items');
})


app.listen(3000, ()=>{
    console.log('server running on port 3000');
})
