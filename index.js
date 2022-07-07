const express = require('express')
const app = express()
const port = 3000;
const {streamDigi, digiEpg, flush: flushD, login: loginD, channels: chD} = require('./digionline');
const {pro, login: loginP, channels: chP} = require('./protv');
const fs = require('fs')
const {live, showid, shows, episode, flush: flushA, ems, emshtml, showshtml, login: loginA, channels: chA} = require('./antena');
const path = require('path');
const { spawn } = require('child_process');
app.get('/antena/flush', flushA)
app.get('/digi/flush', flushD)
app.get('/login', (req,res) => {
    res.sendFile(path.join(__dirname, './public', 'login.html'))
})
function getDefault(platform, scope){
    const conf = JSON.parse(fs.readFileSync('config.json'))[platform]
    return conf[scope]
  }
app.post('/login',express.json({extended: false}), (req,res) => {
    var file;
    try {
        file = fs.existsSync('./auth.json') && JSON.parse(fs.readFileSync('./auth.json').toString());
        if(!file){
            var auth = {};
            auth[req.body.provider] = {};
            fs.writeFileSync('./auth.json', JSON.stringify(auth, null, 2));
            file = auth[req.body.provider];
        }
        if(['antena', 'pro', 'digi'].includes(req.body.provider)){
            !file[req.body.provider] && (file[req.body.provider] = {})
            file[req.body.provider].username = file[req.body.provider].username || req.body.username;
            file[req.body.provider].password = file[req.body.provider].password || req.body.password;
            fs.writeFileSync("./auth.json", JSON.stringify(file, null, 2))
            switch(req.body.provider){
                case "antena":
                    loginA().then(token => {
                        res.send(`Success, token saved!\nReceived token: ${token.toString()}`)
                    }).catch(b => {
                        res.status(500).send(`${b}`)
                    })
                    break;
                    
                case "pro":
                    loginP().then(token => {
                        res.send(`Success, token saved!\nReceived token: ${token}`)
                    }).catch(b => {
                        res.status(500).send(`${b}`)
                    })
                    break;
                
                case "digi":
                    loginD().then(token => {
                        res.send(`Success, token saved!\nReceived token: ${token}`)
                    }).catch(b => {
                        res.status(500).send(`${b}`)
                    })
                    break;
            }
        }else res.send('Invalid Provider ID!')
    } catch (error) {
        res.status(500).send(`${error}`)
    }
})
//AntenaP
app.get('/:channel.?(m3u8)?', live);
app.get('/shows',async (req,res) => {
    if(!req.query.format){
        req.query.format = getDefault('antena','res_format')
    }
    try {
        if(req.query.format && req.query.format === 'html'){
            res.send(await showshtml())
        }else res.send(await shows());
    } catch (error) {
        res.status(505);
    }
});
app.get('/ems',async (req,res) => {
    if(!req.query.format){
        req.query.format = getDefault('antena','res_format')
    }
    try {
        if(req.query.format && req.query.format === 'html'){
            res.send(await emshtml(req.query.page))
        }else {
            res.setHeader("Content-Type", 'application/json').send(await ems(req.query.page));
        }
    } catch (error) {
        res.status(505);
    }
});
app.get('/show/play/:show/:epid', episode);
app.get('/show/:show', showid);
app.get('/antena/channels', (_, res) => {
    res.send(chA)
});
//DiGiOnline
app.get('/:channel/epg', digiEpg);
app.get('/:channel.?(m3u8)?', streamDigi);
app.get('/digi/channels', (_, res) => {
    res.send(Object.keys(chD))
});
//ProPlus
app.get('/:channel', pro);
app.get('/pro/channels', (_, res) => {
    res.send(Object.keys(chP))
});

app.listen(port, () => console.log(`IPTV_RO is up and listening on port ${port}`))

spawn(process.argv[0], ['cors.js'], {
    // detached: true,               // this removes ties to the parent
    stdio: [ 'ignore', process.stdout, process.stderr ]
});