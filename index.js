const express = require('express')
const app = express()
const port = 3000;
const {digi} = require('./digionline');
const {pro} = require('./protv');
const fs = require('fs');
const {live, showid, shows, episode} = require('./antena');
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

