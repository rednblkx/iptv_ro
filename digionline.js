const { default: axios } = require("axios");
const fs = require("fs");
const path = require('path');
const http2 = require('http2');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');

let consoleL = process.env.DEBUG;

var ch = {};

var ch24 = ["digi24", "digisport1", "digisport2", "digisport3", "digisport4"];

var channels = {
  "kanal-d": {
    id: 30,
    drm: "n", 
    category: "general",
  },
  "tvr": {
    id: 24,
    drm: "n", 
    category: "general",
  },
  "digi-life": {
    id: 6,
    drm: "n", 
    category: "general",
  },
  "tv-paprika": {
    id: 39,
    drm: "n", 
    category: "general",
  },
  "travel-mix": {
    id: 74,
    drm: "n", 
    category: "general",
  },
  "digi24":{
    id: 4,
    category: "stiri",
    drm: "n"
  },
  "eurosport-1": {
    id: 31,
    drm: "n", 
    category: "general",
  },
  "eurosport-2": {
    id: 32,
    drm: "n", 
    category: "general",
  },

  "romania-tv": {
    id: 27,
    drm: "n", 
    category: "general",
  },
  "slager-tv": {
    id: 93,
    drm: "n", 
    category: "general",
  },
  "e-entertainement": {
    id: 73,
    drm: "n", 
    category: "general",
  },

  "tvr2": {
    id: 38,
    drm: "n", 
    category: "general",
  },
  "cbs": {
    id: 65,
    drm: "n", 
    category: "general",
  },
  "fishing-and-hunting": {
    id: 92,
    drm: "n", 
    category: "general",
  },
  "hgtv": {
    id: 103,
    drm: "n", 
    category: "general",
  },

  "digisport1": {
    id: 1,
    drm: "n", 
    category: "sport",
  },
  "digisport2": {
    id: 2,
    drm: "n", 
    category: "sport",
  },
  "digisport3": {
    id: 3,
    drm: "n", 
    category: "sport",
  },
  "travel-channel": {
    id: 21,
    drm: "n", 
    category: "sport",
  },

  "digi-sport-4-digionline": {
    id: 49,
    drm: "n", 
    category: "sport",
  },
  "cinethronix": {
    id: 101,
    drm: "n", 
    category: "sport",
  },

  "film-cafe": {
    id: 94,
    drm: "n", 
    category: "filme",
  },
  tnt: {
    id: 91,
    drm: "n", 
    category: "filme",
  },
  "comedy-central": {
    id: 58,
    drm: "n", 
    category: "filme",
  },
  "teennick": {
    id: 111,
    drm: "n", 
    category: "filme",
  },
  "tv-1000": {
    id: 43,
    drm: "n", 
    category: "filme",
  },
  axn: {
    id: 44,
    drm: "n", 
    category: "filme",
  },
  amc: {
    id: 102,
    drm: "n", 
    category: "filme",
  },
  diva: {
    id: 106,
    drm: "n", 
    category: "filme",
  },
  "epic-drama": {
    id: 95,
    drm: "n", 
    category: "filme",
  },
  "bollywood-tv": {
    id: 96,
    drm: "n", 
    category: "filme",
  },
  "axn-black": {
    id: 45,
    drm: "n", 
    category: "filme",
  },
  "axn-spin": {
    id: 57,
    drm: "n", 
    category: "filme",
  },
  "axn-white": {
    id: 46,
    drm: "n", 
    category: "filme",
  },
  cinemaraton: {
    id: 99,
    drm: "n", 
    category: "filme",
  },
  "comedy-est": {
    id: 100,
    drm: "n", 
    category: "filme",
  },
  nickelodeon: {
    id: 28,
    drm: "n", 
    category: "copii",
  },
  "nick-jr": {
    id: 108,
    drm: "n", 
    category: "copii",
  },
  minimax: {
    id: 37,
    drm: "n", 
    category: "copii",
  },
  jimjam: {
    id: 105,
    drm: "n", 
    category: "copii",
  },
  "nick-toons": {
    id: 109,
    drm: "n", 
    category: "copii",
  },
  "disney-junior": {
    id: 18,
    drm: "n", 
    category: "copii",
  },
  "disney-channel": {
    id: 17,
    drm: "n", 
    category: "copii",
  },
  "davinci-learning": {
    id: 66,
    drm: "n", 
    category: "copii",
  },
  "cartoon-network": {
    id: 89,
    drm: "n", 
    category: "copii",
  },
  boomerang: {
    id: 90,
    drm: "n", 
    category: "copii",
  },
  "digi-world": {
    id: 5,
    drm: "n", 
    category: "tematice",
  },
  "discovery-channel": {
    id: 71,
    drm: "n", 
    category: "tematice",
  },
  "history-channel": {
    id: 20,
    drm: "n", 
    category: "tematice",
  },
  "national-geographic": {
    id: 19,
    drm: "n", 
    category: "tematice",
  },
  tlc: {
    id: 72,
    drm: "n", 
    category: "tematice",
  },
  "viasat-history": {
    id: 41,
    drm: "n", 
    category: "tematice",
  },
  "viasat-explorer": {
    id: 40,
    drm: "n", 
    category: "tematice",
  },
  "viasat-nature": {
    id: 42,
    drm: "n", 
    category: "tematice",
  },
  "nat-geo-wild": {
    id: 33,
    drm: "n", 
    category: "tematice",
  },
  "cnn": {
    id: 63,
    drm: "n", 
    category: "tematice",
  },
  "tv5": {
    id: 48,
    drm: "n", 
    category: "tematice",
  },
 
  "bbc-earth": {
    id: 67,
    drm: "n", 
    category: "tematice",
  },
  "u-tv": {
    id: 9,
    drm: "n", 
    category: "muzica",
  },
  vh1: {
    id: 110,
    drm: "n", 
    category: "muzica",
  },
  "hit-music-channel": {
    id: 35,
    drm: "n", 
    category: "muzica",
  },
  "kiss-tv": {
    id: 34,
    drm: "n", 
    category: "muzica",
  },
  "mtv-europe": {
    id: 104,
    drm: "n", 
    category: "muzica",
  },
  "music-channel": {
    id: 25,
    drm: "n", 
    category: "muzica",
  },  
  "filmnow": {
    id: 7,
    drm: "y", 
    category: "filme",
  },
  "hbo": {
    id: 68,
    drm: "y", 
    category: "filme"
  },
  "hbo2": {
    id: 69,
    drm: "y", 
    category: "filme"
  },
  "hbo3": {
    id: 70,
    drm: "y", 
    category: "filme"
  },
  "cinemax": {
    id: 97,
    drm: "y", 
    category: "filme"
  },
  "cinemax2": {
    id: 98,
    drm: "y", 
    category: "filme"
  },
};
async function getLogin() {
  return new Promise(async (resolve, reject) => {
    try {
      if(consoleL) console.log("digi| getLogin: get auth.json");
      let auth = JSON.parse(fs.readFileSync(__dirname + "/auth.json").toString()).digi;
      if(consoleL) console.log("digi| getLogin: auth.json valid");
      if(!auth || !auth.username || !auth.password || auth.username === "" || auth.password === "") throw "No Credentials"
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
async function login(cookies) {
  let auth = JSON.parse(fs.readFileSync(__dirname + "/auth.json").toString());
  let reusecookie = {};
  if(consoleL && cookies) console.log('digi| login: reusing cookies');
  if(consoleL && cookies) console.log(`digi| login: ${cookies}`);
  return new Promise(async (resolve, reject) => {
    try {
      const browser = await puppeteer.launch({headless: consoleL, args: ['--no-sandbox', '--disable-setuid-sandbox']});
      const page = await browser.newPage();
      await page.goto('https://www.digionline.ro/auth/login');
      await page.evaluate((auth) => {
          document.getElementById("form-login-email").value = auth.username;
          document.getElementById("form-login-password").value = auth.password;
          for(var a=0; a==document.getElementsByTagName("button").length - 1;a++){
              if(document.getElementsByTagName("button")[a].getAttribute("type") === "submit"){
                  document.getElementsByTagName("button")[a].click()
              }
              }
      }, auth.digi)
      if(cookies){
        cookies.forEach(b => {
          aux = b.split("=");
          reusecookie[aux[0]] = aux[1]
        })
        await page.setCookie({name: "deviceId", value: reusecookie.deviceId, domain:".digionline.ro"})
      }    
      await page.waitForSelector("#form-login-mode-all");
      var pupcookie = await page.cookies();

      if(pupcookie.find(a => a.name == "deviceId")){
        auth.digi.cookies = [];
        pupcookie.forEach(cookie => {
          auth.digi.cookies.push(`${cookie.name}=${cookie.value}`)
        })
        browser.close();
        fs.writeFileSync(__dirname + "/auth.json", JSON.stringify(auth))
      }
      else throw "No cookies found"
      resolve(auth.digi.cookies);
    } catch (error) {
      reject("digi| login: " + error);
      if(consoleL)
        console.error(error);
    }
  });
}

exports.login = login;
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
      if(play.data.stream_url && !ch[name])
        setTimeout(() => { delete ch[name] }, 1.08e+7)
      // .then((stream) => {
      // stream.data.stream_url ? callback(stream.data.stream_url) : callback(0);
      // });
    } catch (error) {
        let auth = await getLogin();
        login(auth).then(() => {
            getFromDigi(id, name, category).then(stream => resolve(stream)).catch(er => reject(er))
        }).catch(er => reject(er))
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
function getQualities(data, baseUrl) {
  let line;
  let lines = [];
  let arr = data.split("\n").filter(function (str) {
      return str.length > 0;
    });
    while ((line = arr.shift())) {
      if (
        line.includes(".m3u8")
      ) {
          if(consoleL) console.log(`pro| getQualities: ${line}`);
          lines.push(baseUrl + line);
      }
    }
    return lines;
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
exports.flush = (req,res) => {
  if(req.query.channel){
    ch[req.query.channel] = null;
  } else ch = {};
  res.send("Flushed");
}
exports.streamDigi = async (req, res, next) => {
  try {
    if (req.params.channel.match("(.*).m3u8"))
      req.params.channel = req.params.channel.match("(.*).m3u8")[1];

    if (channels[req.params.channel]) {
      if(await getLogin()){
        switch(req.query.ts){
          case "1":
            if(ch[req.params.channel]){
              if(req.query.quality){
                let url = ch[req.params.channel].match(req.query.quality) != null ? ch[req.params.channel] : await getFromDigi(
                  channels[req.params.channel].id,
                  req.params.channel,
                  channels[req.params.channel].category
                );
                if(consoleL) console.log("digi| digi: using cache with MPEGTS playlist");
                if(consoleL) console.log(`digi| digi: ${ch[req.params.channel]}`);
                let m3u8 = await axios.get(url.data ? url.data.stream_url : url);
                if(consoleL && m3u8.data) console.log(`digi| digi: cached URL ${url.data ? url.data.stream_url : url}`);
                if(consoleL && m3u8.data) console.log(`digi| digi: cached URL qualities M3U8 ${m3u8.data}`);
                if(consoleL && m3u8.data) console.log(`digi| digi: cached selected quality URL ${(url.data ? url.data.stream_url : url).match("(.*)/(.*).m3u8")[1] + "/" + m3uParse(m3u8.data, req.query.quality)}`);
                let quality = url.data ? await axios.get((url.data ? url.data.stream_url : url).match("(.*)/(.*).m3u8")[1] + "/" + m3uParse(m3u8.data, req.query.quality)) : undefined;
                if(consoleL && m3u8.data) console.log(`digi| digi: cached selected quality M3U8 ${url.data ? quality.data : m3u8.data}`);
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
                if(consoleL) console.log(`digi| digi: cached response sent ${m3uFixURL(
                  url.data ? quality.data : m3u8.data,
                  url.data ?
                  (
                    (url.data ? url.data.stream_url : url).match("(.*)/(.*).m3u8")[1] +
                    "/" +
                    m3uParse(m3u8.data, req.query.quality ? req.query.quality : "hq")
                  ).match("(.*)/(.*).m3u8")[1] + "/" : url.match("(.*)/(.*).m3u8")[1] + '/'
                )}`)
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
            }else if(channels[req.params.channel].drm !== "y") {
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
            }
            break;
          default:
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
              if(req.query.quality === 'get' && channels[req.params.channel].drm !== "y"){
                let m3u8 = await axios.get(url.data.stream_url);
                res.json({"qualities": getQualities(m3u8.data, url.data.stream_url.match("(.*)\/")[0])})
              }else if(req.query.quality && channels[req.params.channel].drm !== "y"){
                let m3u8 = await axios.get(url.data.stream_url);
                res.redirect(url.data.stream_url.match("(.*)/(.*).m3u8")[1] + "/" + m3uParse(m3u8.data, req.query.quality ? req.query.quality : "hq"));
              }else channels[req.params.channel].drm === "y" ? res.json({"manifestUrl": url.data.data.content['stream.manifest.url'],"wproxy": url.data.data.content['widevine.proxy']}) : res.redirect(url.data.stream_url) 
            } catch (error) {
              res.status(400).send(error)
            }
            break;
        }
      }
    } else next();
  } catch (error) {
    if (ch24.includes(req.params.channel)) {
      switch(req.query.ts){
        case '1':
          if(ch[req.params.channel]){
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
          }else {
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
          }
          break;
        default:
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
          break;
      }
    } else res.status(400).send(error);
  }
};
exports.digiEpg = async (req, res, next) => {
  try {
    if(channels[req.params.channel]){
     let data = await axios.get(`https://www.digionline.ro/epg-xhr?channelId=${channels[req.params.channel].id}`)
    res.send(data.data)
    }else res.status(400).send("Channel not found")
  } catch (error) {
    console.log(error);
  }
}
