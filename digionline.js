const { default: axios } = require("axios");
const fs = require("fs");
const path = require('path');

let consoleL = false;

var ch = {};

var ch24 = ["digi24", "digisport1", "digisport2", "digisport3", "digisport4"];

var channels = {
  "kanal-d": {
    id: 30,
    category: "general",
  },
  "tvr": {
    id: 24,
    category: "general",
  },
  "digi-life": {
    id: 6,
    category: "general",
  },
  "tv-paprika": {
    id: 39,
    category: "general",
  },
  "travel-mix": {
    id: 74,
    category: "general",
  },

  "eurosport-1": {
    id: 31,
    category: "general",
  },
  "eurosport-2": {
    id: 32,
    category: "general",
  },

  "romania-tv": {
    id: 27,
    category: "general",
  },
  "slager-tv": {
    id: 93,
    category: "general",
  },
  "e-entertainement": {
    id: 73,
    category: "general",
  },

  "tvr2": {
    id: 38,
    category: "general",
  },
  "cbs": {
    id: 65,
    category: "general",
  },
  "fishing-and-hunting": {
    id: 92,
    category: "general",
  },
  "hgtv": {
    id: 103,
    category: "general",
  },

  "digi-sport-1-digionline": {
    id: 1,
    category: "sport",
  },
  "digi-sport-2-digionline": {
    id: 2,
    category: "sport",
  },
  "digi-sport-3-digionline": {
    id: 3,
    category: "sport",
  },
  "travel-channel": {
    id: 21,
    category: "sport",
  },

  "digi-sport-4-digionline": {
    id: 49,
    category: "sport",
  },
  "cinethronix": {
    id: 101,
    category: "sport",
  },

  "film-cafe": {
    id: 94,
    category: "filme",
  },
  tnt: {
    id: 91,
    category: "filme",
  },
  "comedy-central": {
    id: 58,
    category: "filme",
  },
  "teennick": {
    id: 111,
    category: "filme",
  },
  "tv-1000": {
    id: 43,
    category: "filme",
  },
  axn: {
    id: 44,
    category: "filme",
  },
  amc: {
    id: 102,
    category: "filme",
  },
  diva: {
    id: 106,
    category: "filme",
  },
  "epic-drama": {
    id: 95,
    category: "filme",
  },
  "bollywood-tv": {
    id: 96,
    category: "filme",
  },
  "axn-black": {
    id: 45,
    category: "filme",
  },
  "axn-spin": {
    id: 57,
    category: "filme",
  },
  "axn-white": {
    id: 46,
    category: "filme",
  },
  cinemaraton: {
    id: 99,
    category: "filme",
  },
  "comedy-est": {
    id: 100,
    category: "filme",
  },
  nickelodeon: {
    id: 28,
    category: "copii",
  },
  "nick-jr": {
    id: 108,
    category: "copii",
  },
  minimax: {
    id: 37,
    category: "copii",
  },
  jimjam: {
    id: 105,
    category: "copii",
  },
  "nick-toons": {
    id: 109,
    category: "copii",
  },
  "disney-junior": {
    id: 18,
    category: "copii",
  },
  "disney-channel": {
    id: 17,
    category: "copii",
  },
  "davinci-learning": {
    id: 66,
    category: "copii",
  },
  "cartoon-network": {
    id: 89,
    category: "copii",
  },
  boomerang: {
    id: 90,
    category: "copii",
  },
  "digi-world": {
    id: 5,
    category: "tematice",
  },
  "discovery-channel": {
    id: 71,
    category: "tematice",
  },
  "history-channel": {
    id: 20,
    category: "tematice",
  },
  "national-geographic": {
    id: 19,
    category: "tematice",
  },
  tlc: {
    id: 72,
    category: "tematice",
  },
  "viasat-history": {
    id: 41,
    category: "tematice",
  },
  "viasat-explorer": {
    id: 40,
    category: "tematice",
  },
  "viasat-nature": {
    id: 42,
    category: "tematice",
  },
  "nat-geo-wild": {
    id: 33,
    category: "tematice",
  },
  "cnn": {
    id: 63,
    category: "tematice",
  },
  "tv5": {
    id: 48,
    category: "tematice",
  },
 
  "bbc-earth": {
    id: 67,
    category: "tematice",
  },
  "u-tv": {
    id: 9,
    category: "muzica",
  },
  vh1: {
    id: 110,
    category: "muzica",
  },
  "hit-music-channel": {
    id: 35,
    category: "muzica",
  },
  "kiss-tv": {
    id: 34,
    category: "muzica",
  },
  "mtv-europe": {
    id: 104,
    category: "muzica",
  },
  "music-channel": {
    id: 25,
    category: "muzica",
  },
};
async function getLogin() {
  return new Promise(async (resolve, reject) => {
    try {
      if(consoleL) console.log("digi| getLogin: get auth.json");
      let auth = JSON.parse(fs.readFileSync(path.join(__dirname, './', 'auth.json')).toString()).digi;
      if(consoleL) console.log("digi| getLogin: auth.json valid");
      if(!auth || !auth.username || !auth.password || auth.username === "" || auth.password === "") throw "digi: No Credentials"
      if (auth.cookies) {
        if(consoleL) console.log("digi| getLogin: got cookies");
        resolve(auth.cookies);
      } else if (!auth.cookies) {
        if(consoleL) console.log("digi| getLogin: trying login");
        resolve(await login());
      }
    } catch (error) {
      reject("digi| getLogin: " + error);
      if(consoleL)
        console.error(error);
    }
  });
}
async function login() {
  let auth = JSON.parse(fs.readFileSync(path.join(__dirname, './', 'auth.json')).toString());
  return new Promise(async (resolve, reject) => {
    try {
      let log = await axios.post(
        'https://www.digionline.ro/auth/login', 
        `form-login-email=${encodeURIComponent(auth.digi.username)}&form-login-password=${encodeURIComponent(auth.digi.password)}&sbm=`, 
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Origin': 'https://www.digionline.ro',
            'User-Agent': "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.101 Safari/537.36"
          },
          maxRedirects: 0,
          validateStatus: (status) => status === 302
        })
        auth.digi.cookies = [];
        log.headers['set-cookie'].forEach(cookie => {
          auth.digi.cookies.push(cookie.match(/[^;]*/)[0]);
        });
        fs.writeFileSync(path.join(__dirname, './', 'auth.json'), JSON.stringify(auth));
        if (
          auth.digi.cookies.some((a) => a.match(/[^=]*/)[0].includes("device"))
        ) {
        if(consoleL) console.log("digi| login: cookies found");
          resolve(auth.digi.cookies);
        } else {
          reject("Something went wrong while signing in");
        }
    } catch (error) {
      reject("digi| login: " + error);
      if(consoleL)
        console.error(error);
    }
  });
}
async function getFromDigi(id, name, category) {
  return new Promise(async (resolve, reject) => {
    try {
      if(consoleL) console.log("digi| getFromDigi: getting cookies");
      let auth = await getLogin();
      if(consoleL && auth) console.log("digi| getFromDigi: got cookies");
      if(consoleL) console.log("digi| getFromDigi: getting the stream");
      let play = await axios.post(
        "https://www.digionline.ro/api/stream",
        `id_stream=${id}&quality=hq`,
        {
          headers: {
            authority: "www.digionline.ro",
            pragma: "no-cache",
            "cache-control": "no-cache",
            accept: "application/json, text/javascript, */*; q=0.01",
            dnt: "1",
            "x-requested-with": "XMLHttpRequest",
            "user-agent":
              "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36",
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            origin: "https:/www.digionline.ro",
            "sec-fetch-site": "same-origin",
            "sec-fetch-mode": "cors",
            "sec-fetch-dest": "empty",
            referer: `https:/www.digionline.ro/${category}/${name}`,
            "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
            cookie: auth.join("; "),
          },
        }
      );
      if(consoleL && play) console.log("digi| getFromDigi: got the stream");
      resolve(play);
      // .then((stream) => {
      // setTimeout(() => { delete channels[req.params.channel] }, 2.16e+7)
      // stream.data.stream_url ? callback(stream.data.stream_url) : callback(0);
      // });
    } catch (error) {
      reject(error);
      if(consoleL)
        console.error(error);
    }
  })
}

async function getFrom24(scope) {
  if(consoleL) console.log("digi| getFrom24: getting balancer key");
  let key = await axios.get(
    "https://balancer2.digi24.ro/streamer/make_key.php",
    {
      headers: {
        accept: "*/*",
        "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
        "cache-control": "no-cache",
        pragma: "no-cache",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
        referrer: "https://www.digi24.ro/",
        referrerPolicy: "origin-when-cross-origin",
      },
    }
  );
  if(consoleL && key) console.log("digi| getFrom24: got key");
  return axios.get(
    `https://balancer2.digi24.ro/streamer.php?&scope=${scope}&key=${
      key.data
    }&outputFormat=json&type=hq&quality=hq&is=4&ns=${scope}&pe=site&s=site&sn=${
      scope.includes("sport") ? "digisport.ro" : "digi24.ro"
    }&p=browser&pd=linux`
  );
}
function m3uParse(data, quality) {
  let line;
  var m3u = data.split("\n").filter(function (str) {
    return str.length > 0;
  });
  while ((line = m3u.shift())) {
    if (
      line.startsWith("http") ||
      (line.endsWith(".m3u8") && (line.includes(['hq', 'lq', 'mq', 'hd'].includes(quality) ? quality : "hq")))
    ) {
      return line;
    }
  }
}
function m3uFixURL(m3u, url) {
  m3u = m3u.split("\n");
  m3u.forEach((el, index, array) => {
    if (el.match('URI="(.*)"') != null) {
      array[index] = el.replace(
        el.match('"(.*).key"')[0],
        '"' + url + el.match('URI="(.*)"')[1] + '"'
      );
    }
    if (el.match("(.*).ts") != null) {
      array[index] = url + el;
    }
  });
  return m3u.join("\n");
}
exports.digi = async (req, res, next) => {
  try {
    if (req.params.channel.match("(.*).m3u8"))
      req.params.channel = req.params.channel.match("(.*).m3u8")[1];

    if (channels[req.params.channel]) {
      if (ch[req.params.channel] && req.query.ts === '1') {
        if(req.query.quality){
          let url = ch[req.params.channel].match(req.query.quality) != null ? ch[req.params.channel] : await getFromDigi(
            channels[req.params.channel].id,
            req.params.channel,
            channels[req.params.channel].category
          );
          let m3u8 = await axios.get(url.data ? url.data.stream_url : url);
          let quality = url.data ? await axios.get((url.data ? url.data.stream_url : url).match("(.*)/(.*).m3u8")[1] + "/" + m3uParse(m3u8.data, req.query.quality)) : undefined;
          res.set("Content-Type", "application/vnd.apple.mpegurl");
          res.send(m3uFixURL(
            url.data ? quality.data : m3u8.data,
            url.data ?
            (
              (url.data ? url.data.stream_url : url).match("(.*)/(.*).m3u8")[1] +
              "/" +
              m3uParse(m3u8.data, req.query.quality ? req.query.quality : "hq")
            ).match("(.*)/(.*).m3u8")[1] + "/" : url.match("(.*)/(.*).m3u8")[1] + '/'
          ));
        }else{
          if(consoleL) console.log("digi| digi: using cache with MPEGTS playlist");
          if(consoleL) console.log(`digi| digi: ${ch[req.params.channel]}`);
          let m3u8 = await axios.get(ch[req.params.channel]);
          // res.download('streams/kanald.strm');
          res.set("Content-Type", "application/vnd.apple.mpegurl");
          if(consoleL && m3u8.data) console.log(`digi| digi: cached original URL ${m3u8.data}`);
          if(consoleL && m3u8.data) console.log(`digi| digi: rewrited URL ${m3uFixURL(m3u8.data,ch[req.params.channel].match("(.*)/(.*).m3u8")[1] + "/")}`);
          res.send(
            m3uFixURL(
              m3u8.data,
              ch[req.params.channel].match("(.*)/(.*).m3u8")[1] + "/"
            )
          );
        }
      }else if (ch[req.params.channel] && (!req.query.ts || req.query.ts === '0')) {
        if(req.query.quality){
          let url = await getFromDigi(
            channels[req.params.channel].id,
            req.params.channel,
            channels[req.params.channel].category
          );
          let m3u8 = await axios.get(url.data.stream_url);
          res.redirect(url.data.stream_url.match("(.*)/(.*).m3u8")[1] + "/" + m3uParse(m3u8.data, req.query.quality))
        }else{
          if(consoleL) console.log("digi| digi: using cache without MPEGTS playlist");
          if(consoleL) console.log(`digi| digi: ${ch[req.params.channel]}`);
          if(consoleL) console.log(`digi| digi: cached original URL ${ch[req.params.channel]}`);
          res.redirect(ch[req.params.channel]);
        }
      } else {
        try {
          if(consoleL) console.log("digi| digi: getting from digi");
          let url = await getFromDigi(
            channels[req.params.channel].id,
            req.params.channel,
            channels[req.params.channel].category
          );
          if(url.data.stream_url === "" && url.data.stream_err !== ""){
            throw url.data.stream_err
          }
          if(consoleL && url.data) console.log("digi| digi: got response");
          if(consoleL && url.data) console.log(`digi| digi: ${JSON.stringify(url.data)}`);
          // res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
          // res.send(`#EXTM3U\n#EXT-X-VERSION:3\n#EXTINF:0,Kanal D\n${url}`);
          // url != 0 ? res.redirect(url) : res.status(404)
          if(req.query.ts == '1'){
            let m3u8 = await axios.get(url.data.stream_url);
            if(consoleL && m3u8.data) console.log(`digi| digi: Original M3U8 ${m3u8.data}`);
            ch[req.params.channel] =
              url.data.stream_url.match("(.*)/(.*).m3u8")[1] + "/" + m3uParse(m3u8.data, req.query.quality ? req.query.quality : "hq");
            let m3u8_quality = await axios.get(
              url.data.stream_url.match("(.*)/(.*).m3u8")[1] + "/" + m3uParse(m3u8.data, req.query.quality ? req.query.quality : "hq")
            );
            if(consoleL && m3u8_quality.data) console.log(`digi| digi: Selected Quality M3U8 ${m3u8_quality.data}`);
            res.set("Content-Type", "application/vnd.apple.mpegurl");
            res.send(
              m3uFixURL(
                m3u8_quality.data,
                (
                  url.data.stream_url.match("(.*)/(.*).m3u8")[1] +
                  "/" +
                  m3uParse(m3u8.data, req.query.quality ? req.query.quality : "hq")
                ).match("(.*)/(.*).m3u8")[1] + "/"
              )
            );
            if(consoleL) console.log(`digi| digi: Rewrited URL ${m3uFixURL(m3u8_quality.data, (url.data.stream_url.match("(.*)/(.*).m3u8")[1] + "/" + m3uParse(m3u8.data)).match("(.*)/(.*).m3u8")[1] + "/")}`);
          }else if(req.query.quality){
            let m3u8 = await axios.get(url.data.stream_url);
            res.redirect(url.data.stream_url.match("(.*)/(.*).m3u8")[1] + "/" + m3uParse(m3u8.data, req.query.quality ? req.query.quality : "hq"));
          }else res.redirect(url.data.stream_url) 
        } catch (error) {
          res.status(400).send(error)
        }
      }
    } else if (ch24.includes(req.params.channel)) {
      if (ch[req.params.channel] && req.query.ts === "1") {
        if(req.query.quality){
          if(consoleL) console.log("digi| digi: using cache");
          let c24 = await axios.get(ch[req.params.channel]);
          let quality = await axios.get(ch[req.params.channel].match("(.*)/(.*).m3u8")[1] + "/" + m3uParse(c24.data, req.query.quality));
          if(consoleL) console.log(`digi| digi: original M3U8 ${quality.data}`);
          if(consoleL) console.log(`digi| digi: rewrited M3U8 ${m3uFixURL(quality.data, quality.config.url.match("(.*)/(.*).m3u8")[1] + "/")}`);
          res.set("Content-Type", "application/vnd.apple.mpegurl");
          res.send(
            m3uFixURL(
              quality.data,
              quality.config.url.match("(.*)/(.*).m3u8")[1] + "/"
            )
          );
        }else{
          if(consoleL) console.log("digi| digi: using cache");
          let c24 = await axios.get(ch[req.params.channel]);
          let quality = await axios.get(ch[req.params.channel].match("(.*)/(.*).m3u8")[1] + "/" + m3uParse(c24.data, "hd"));
          if(consoleL) console.log(`digi| digi: original M3U8 ${quality.data}`);
          if(consoleL) console.log(`digi| digi: rewrited M3U8 ${m3uFixURL(quality.data, quality.config.url.match("(.*)/(.*).m3u8")[1] + "/")}`);
          res.set("Content-Type", "application/vnd.apple.mpegurl");
          res.send(
            m3uFixURL(
              quality.data,
              quality.config.url.match("(.*)/(.*).m3u8")[1] + "/"
            )
          );
        }
      } else if(ch[req.params.channel] && (!req.query.ts || req.query.ts === "0")){
        try {
          if(req.query.quality){
            if(consoleL) console.log(`digi| digi: redirecting`);
            if(consoleL) console.log(`digi| digi: selected quality ${req.query.quality}`);
            let c24 = await axios.get(ch[req.params.channel]);
            res.redirect(ch[req.params.channel].match("(.*)/(.*).m3u8")[1] + "/" + m3uParse(c24.data, req.query.quality));
          }else{
            if(consoleL) console.log(`digi| digi: redirecting`);
            res.redirect(ch[req.params.channel]);
          }
        } catch (error) {
          res.status(500).send(error);
        }
      } else if(req.query.ts === "1"){
        if(req.query.quality){
          if(consoleL) console.log("digi| digi: using live");
          let video = await getFrom24(req.params.channel);
          let c24 = axios.get(video.data.file);
          ch[req.params.channel] = video.data.file;
          let quality = await axios.get(video.data.file.match("(.*)/(.*).m3u8")[1] + "/" + m3uParse(c24.data, req.query.quality));
          if(consoleL) console.log(`digi| digi: selected quality ${req.query.quality}`);
          if(consoleL) console.log(`digi| digi: original M3U8 ${quality.data}`);
          if(consoleL) console.log(`digi| digi: rewrited M3U8 ${m3uFixURL(quality.data, quality.config.url.match("(.*)/(.*).m3u8")[1] + "/")}`);
          res.set("Content-Type", "application/vnd.apple.mpegurl");
          res.send(
            m3uFixURL(
              quality.data,
              quality.config.url.match("(.*)/(.*).m3u8")[1] + "/"
            )
          );
        }else{
          if(consoleL) console.log("digi| digi: using live");
          let video = await getFrom24(req.params.channel);
          let c24 = axios.get(video.data.file);
          ch[req.params.channel] = video.data.file;
          if(consoleL) console.log(`digi| digi: original M3U8 ${c24.data}`);
          if(consoleL) console.log(`digi| digi: rewrited M3U8 ${m3uFixURL(c24.data, c24.config.url.match("(.*)/(.*).m3u8")[1] + "/")}`);
          res.set("Content-Type", "application/vnd.apple.mpegurl");
          res.send(
            m3uFixURL(
              c24.data,
              c24.config.url.match("(.*)/(.*).m3u8")[1] + "/"
            )
          );
        }
      } else {
        if(req.query.quality){
          if(consoleL) console.log("digi| digi: using live");
          let video = await getFrom24(req.params.channel);
          let c24 = await axios.get(video.data.file);
          ch[req.params.channel] = video.data.file;
          if(consoleL) console.log(`digi| digi: original M3U8 ${c24.data}`);
          if(consoleL) console.log(`digi| digi: rewrited M3U8 ${m3uFixURL(c24.data, c24.config.url.match("(.*)/(.*).m3u8")[1] + "/")}`);
          res.redirect(video.data.file.match("(.*)/(.*).m3u8")[1] + "/" + m3uParse(c24.data, req.query.quality))
        }else{
          if(consoleL) console.log("digi| digi: using live");
          let video = await getFrom24(req.params.channel);
          ch[req.params.channel] = video.data.file;
          res.redirect(video.data.file)
        }
      }
    } else next();
  } catch (error) {
    res.status(500).send(error);
  }
};
