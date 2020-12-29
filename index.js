const express = require('express')
const app = express()
const port = 3000;
const {digi} = require('./digionline');
const {pro} = require('./protv');
const fs = require('fs');
const {live, showid, shows, episode} = require('./antena');
//AntenaP
app.use('/live/:channel', live);
app.use('/shows',async (req,res) => {
    try {
        res.send(await shows());
    } catch (error) {
        res.status(505);
    }
});
app.use('/show/play/:show/:epid', episode);
app.use('/show/:show', showid);
//DiGiOnline
app.use('/:channel\.m3u8', ({next}) => {
    // req.params.channel = req.params.channel.match('(.*).m3u8')[1]
    next();
})
app.use('/:channel', digi);
//ProPlus
app.use('/:channel', pro);

app.listen(port, () => console.log(`IPTV-AIO is up and running on port ${port}`))

