const express = require('express')
const app = express()
const port = 3000;
const {streamDigi, digiEpg, flush: flushD, login: loginD, channels: chD} = require('./digionline');
const {pro, login: loginP, channels: chP} = require('./protv');
const fs = require('fs')
const {live, showid, shows, episode, flush: flushA, ems, emshtml, showshtml, login: loginA, channels: chA} = require('./antena');
const path = require('path')
app.get('/antena/flush', flushA)
app.get('/digi/flush', flushD)
app.get('/login', (req,res) => {
    res.sendFile(path.join(__dirname, './public', 'login.html'))
})
function getDefault(platform, scope){
    const conf = JSON.parse(fs.readFileSync('config.json'))[platform]
    return conf[scope]
  }
app.post('/login',express.urlencoded({extended: false}), (req,res) => {
    var file;
    // try {
    //     file = fs.readFileSync('./auth.json').toString() && JSON.parse(fs.readFileSync('./auth.json').toString());
    // } catch (error) {
    //     fs.writeFileSync('./auth.json', `{"${req.body.provider}": {}}`);
    //     file = JSON.parse(fs.readFileSync('./auth.json').toString())
    // }
    try {
        file = fs.readFileSync('./auth.json').toString() && JSON.parse(fs.readFileSync('./auth.json').toString());
        if(!file){
            var auth = {};
            auth[req.body.provider] = {};
            fs.writeFileSync('./auth.json', JSON.stringify(auth));
            file = auth[req.body.provider];
        }
        if(['antena', 'pro', 'digi'].includes(req.body.provider)){
            file[req.body.provider] = {}
            file[req.body.provider].username = req.body.username;
            file[req.body.provider].password = req.body.password;
            fs.writeFile("./auth.json", JSON.stringify(file), () => {
                switch(req.body.provider){
                    case "antena":
                        loginA().then(cookie => {
                            res.send(`Success!\nReceived Cookies: ${cookie.toString()}`)
                        }).catch(b => {
                            throw b
                        })
                        break;
                        
                    case "pro":
                        loginP().then(cookie => {
                            res.send(`Success!\nReceived Cookies: ${cookie.cookie.toString()}`)
                        }).catch(b => {
                            throw b
                        })
                        break;
                    
                    case "digi":
                        loginD().then(cookie => {
                            res.send(`Success!\nReceived Cookies: ${cookie.toString()}`)
                        }).catch(b => {
                            throw b
                        })
                        break;
                }
            })
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

