const express = require('express')
const app = express()
const port = 3000;
const {digi} = require('./digionline');
const {pro} = require('./protv');
const fs = require('fs')
const {live, showid, shows, episode} = require('./antena');
const path = require('path')
app.get('/login', (req,res) => {
    res.sendFile(path.join(__dirname, './public', 'login.html'))
})
app.post('/login',express.urlencoded(), (req,res) => {
    var file;
    try {
        file = fs.readFileSync('./auth.json').toString() && JSON.parse(fs.readFileSync('./auth.json').toString());
    } catch (error) {
        fs.writeFileSync('./auth.json', `{"${req.body.provider}": {}}`);
        file = JSON.parse(fs.readFileSync('./auth.json').toString())
    }
    try {
        file[req.body.provider] = {};
        // res.setHeader("Content-Type", "application/json")
        if(['antena', 'pro', 'digi'].includes(req.body.provider)){
            file[req.body.provider].username = req.body.username;
            file[req.body.provider].password = req.body.password;
            fs.writeFile("./auth.json", JSON.stringify(file), () => {
                res.send('Success!')
            })
        }else res.send('Invalid Provider ID!')
    } catch (error) {
        res.status(500).send(`${error}`)
    }
})
//AntenaP
app.get('/:channel', live);
app.get('/shows',async (req,res) => {
    try {
        res.send(await shows());
    } catch (error) {
        res.status(505);
    }
});
app.get('/show/play/:show/:epid', episode);
app.get('/show/:show', showid);
//DiGiOnline
app.get('/:channel\.m3u8', ({next}) => {
    // req.params.channel = req.params.channel.match('(.*).m3u8')[1]
    next();
})
app.get('/:channel', digi);
//ProPlus
app.get('/:channel', pro);

app.listen(port, () => console.log(`IPTV-AIO is up and running on port ${port}`))

