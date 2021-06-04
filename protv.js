const {default: axios} = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const path = require('path');

const channels = {
    "pro-tv": 1,
    "pro-2": 2,
    "pro-x": 3,
    "pro-gold": 4,
    "pro-cinema": 5
};
var consoleL = process.env.DEBUG;
async function login() {
    return new Promise(async (resolve, reject) => {
        try {
            if(consoleL) console.log("pro| login: getting auth.json");
            let auth = JSON.parse(fs.readFileSync(__dirname + "/auth.json").toString());
            if(consoleL) console.log("pro| login: auth.json valid");
            if(consoleL) console.log("pro| login: now signing in");
            let step1 = await axios.post(
                "https://protvplus.ro/login",
                `email=${encodeURIComponent(auth.pro.username)}&password=${encodeURIComponent(auth.pro.password)}&login=Autentificare&_do=content11374-loginForm-form-submit`,
                {
                headers: {
                    'Accept': "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Cookie": "SID=l73i9m3q6psvkm19s7piphmsni; votoken=DXuxOECh5nd8wwtaQ5qh6X90fLEM4Ee8MXlfc1FyhF4s31EWQ3YjUZg7Z8JPGvMVF3YGlpRhTmMC9n5UG6%2BBAHsidG9rZW4iOiI1ZDdkOTFmMDUzMDg0MjRmYjM5ODg5MDdlNDg1NWY1YSIsImlkIjoxMjQ2MDI4LCJuYW1lIjoiV2hpdGUiLCJlbWFpbCI6ImRhbm5lZ3J1NDBAZ21haWwuY29tIiwiZGV2aWNlIjp7InR5cGUiOiJkZXNrdG9wIiwib3MiOiJXaW5kb3dzIiwib3NfdmVyc2lvbiI6IjEwLjAiLCJtb2RlbCI6bnVsbCwibWFudWZhY3R1cmVyIjpudWxsLCJwcm9kdWN0aW9uX3llYXIiOm51bGwsIm5hbWUiOm51bGwsImJyb3dzZXIiOiJDaHJvbWUiLCJicm93c2VyX3ZlcnNpb24iOiI4OC4wLjQzMjQuOTYifX0%3D;"
                },
                responseType: 'document',
                maxRedirects: 0,
                validateStatus: (status) => status === 302
              })
            if(consoleL && step1 && step1.data) console.log("pro| login: received response", step1.data , step1.headers);
            if (step1.headers["set-cookie"]) {
                if(consoleL) console.log("pro| login: got cookies");
                if(consoleL) console.log(`pro| login: cookies_received = ${step1.headers["set-cookie"]}`);
                auth.pro.cookies = step1.headers["set-cookie"].map((a) => a.match(/[^;]*/)[0]).join(";");
                fs.writeFileSync(__dirname + "/auth.json", JSON.stringify(auth));
                resolve({cookie: auth.pro.cookies});
            } else reject("pro| login: Something wen wrong while signing in");

        } catch (error) {
            reject("pro| login: " + error);
            if(consoleL) console.error("pro| " + error);
        }
    });
}
async function getLogin() {
    return new Promise(async (resolve, reject) => {
        try {
            if(consoleL) console.log(`pro| getLogin: getting auth.json`);
            let auth = JSON.parse(fs.readFileSync(__dirname + "/auth.json").toString()).pro;
            if(consoleL && auth) console.log(`pro| getLogin: auth.json valid`);
            if(!auth || !auth.username || !auth.password || auth.username === "" || auth.password === "") throw "pro: No Credentials"
            if (auth.cookies) {
                if(consoleL) console.log(`pro| getLogin: using existing tokens`);
                resolve({cookie: auth.cookies});
            } else if (!auth.cookies) {
                if(consoleL) console.log(`pro| getLogin: trying getLogin`);
                let token = await login();
                if(consoleL && token) console.log(`pro| getLogin: got tokens`);
                resolve({cookie: token.cookie});
            }
        } catch (error) {
            reject("pro| getLogin: " + error);
            if(consoleL) console.error(error);
        }
    });
}
async function getPlaylist(name) {
    return new Promise(async (resolve, reject) => {
        try {
            if(consoleL) console.log(`pro| getPlaylist: getting tokens`);
            let auth = await getLogin();
            if(consoleL && auth) console.log(`pro| getPlaylist: got tokens ${auth.cookie}`);
            if(consoleL) console.log(`pro| getPlaylist: getting channel's HTML`);
            let step1 = await axios.get(`https://protvplus.ro/tv-live/${
                channels[name]
            }-${name}`, {
                headers: {
                    accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
                    "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
                    cookie: auth.cookie
                }
            });
            if(consoleL && step1.data) console.log(`pro| getPlaylist: got first link`);
            let $ = cheerio.load(step1.data);
            if(consoleL && $) console.log(`pro| getPlaylist: ${$(".live-iframe-wrapper.js-user-box")[0].attribs["data-url"]}`);
            if(consoleL) console.log(`pro| getPlaylist: getting channel's second link`);
            let step2 = await axios.get($(".live-iframe-wrapper.js-user-box")[0].attribs["data-url"], {
                headers: {
                    accept: "*/*",
                    "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
                    authorization: `Bearer undefined`,
                    "x-requested-with": "XMLHttpRequest",
                    cookie: auth.cookie,
                    referrer: `https://protvplus.ro/tv-live/${
                        channels[name]
                    }-${name}`,
                }
            });
            if(consoleL && step1.data) console.log(`pro| getPlaylist: got channel's second link`);
            $ = cheerio.load(step2.data);
            if(consoleL && $) console.log(`pro| getPlaylist: ${$("iframe").attr("src")}`);
            if(consoleL) console.log(`pro| getPlaylist: getting channel's stream URL`);
            let step3 = await axios.get($("iframe").attr("src"), {
                headers: {
                    cookie: auth.cookie,
                    referer: "https://protvplus.ro/tv-live/1-pro-tv"
                },
            });
            if(consoleL && step3.data) console.log(`pro| getPlaylist: got channel's stream`);
            // if(consoleL && step3.data) console.log(`pro| getPlaylist: ${step3.data}`);
            if(consoleL && step3.data) console.log(`pro| getPlaylist: ${step3.data.match('{"HLS"(.*)}]}')}`);
            if(consoleL && step3.data) console.log(`pro| getPlaylist: ${JSON.parse(step3.data.match('{"HLS"(.*)}]}')[0]).HLS[0].src}`);
            resolve(JSON.parse(step3.data.match('{"HLS"(.*)}]}')[0]).HLS[0].src);
        } catch (error) {
            reject("pro| getPlaylist: " + error);
            console.error(error);
        }
    });
}

// function m3uFixURL(m3u, url){
//     m3u = m3u.split('\n');
//     m3u.forEach((el, index, array) => {
//         if(el.match('URI=\"(.*)\"') != null){
//             array[index] = el.replace(el.match('\"(.*).key\"')[0], '\"' + url + el.match('URI=\"(.*)\"')[1] + "\"")
//         }
//          if(el.match('(.*).ts') != null){
//             array[index] = url + el;
//         }
//     })
//     return m3u.join('\n');
// }
function selectQuality(data, quality) {
    let line;
    let arr = data.split("\n").filter(function (str) {
        return str.length > 0;
      });
      while ((line = arr.shift())) {
          if(quality === "fullhd"){
              if(line.includes("hq")){
                  line = line.replace("hq", quality)
                  return line
              }
          }
          else
            if (
            line.includes(".m3u8") && (line.includes(['hq', 'lq', 'mq'].includes(quality) ? quality : "hq"))
            ) {
            return line;
            }
      }
    // if(consoleL) console.log(`pro| selectQuality: ${data.match("(.*)fullhd.m3u8(.*)")[0] ? data.match("(.*)fullhd.m3u8(.*)")[0] : data.match("(.*)hd.m3u8(.*)")[0]}`);
    // return data.match("(.*)fullhd.m3u8(.*)")[0] ? data.match("(.*)fullhd.m3u8(.*)")[0] : data.match("(.*)hd.m3u8(.*)")[0];
}

function getQualities(data, baseUrl) {
    let line;
    let lines = [];
    let arr = data.split("\n").filter(function (str) {
        return str.length > 0;
      });
      arr.forEach(element => {
          if(element.includes("hq")){
            lines.push(baseUrl + element.replace("hq", "fullhd"))
          }
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

exports.pro = async (req, res, next) => {
    try {
        if (channels[req.params.channel]) {
            let stream = await getPlaylist(req.params.channel);
            if(consoleL) console.log(`pro| pro: Getting channel stream URL`);
            if(consoleL) console.log(`pro| pro: ${stream}`);
            if(req.query.quality === 'get'){
                let quality = await axios.get(stream, {
                    headers: {
                        accept: "*/*",
                        referer: "https://media.cms.protvplus.ro/",
                    },
                });
                if(consoleL) console.log(`pro| pro: ${quality.data}`);
                res.json({"qualities": getQualities(quality.data, quality.config.url.match("(.*)\/")[0])})
            }else if(req.query.quality){
                let quality = await axios.get(stream, {
                    headers: {
                        accept: "*/*",
                        referer: "https://media.cms.protvplus.ro/",
                    },
                });
                if(consoleL && quality.data) console.log(`pro| pro: got channel's quality "${req.query.quality}" stream URL`);
                if(consoleL && quality.data) console.log(`pro| pro: ${quality.data}`);
                if(consoleL && quality.data) console.log(`pro| pro: ${quality.config.url}`);
                if(consoleL && quality.data) console.log(`pro| pro: ${quality.config.url.match("(.*)\/")[0] + selectQuality(quality.data, req.query.quality)}`);
                res.redirect(quality.config.url.match("(.*)\/")[0] + selectQuality(quality.data, req.query.quality));
            }else res.redirect(stream)
        } else
            next();
    } catch (error) {
        res.status(500).send(error);
    }
};
