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
            let auth = JSON.parse(fs.readFileSync(path.join(__dirname, './', 'auth.json')).toString());
            if(consoleL) console.log("pro| login: auth.json valid");
            if(consoleL) console.log("pro| login: now signing in");
            let step1 = await axios.post(
                "https://protvplus.ro/login",
                `email=${encodeURIComponent(auth.pro.username)}&password=${encodeURIComponent(auth.pro.password)}&login=Autentificare&_do=content11374-loginForm-form-submit`,
                {
                headers: {
                    'Accept': "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
                    "Content-Type": "application/x-www-form-urlencoded"
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
                fs.writeFileSync(path.join(__dirname, './', 'auth.json'), JSON.stringify(auth));
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
            let auth = JSON.parse(fs.readFileSync(path.join(__dirname, './', 'auth.json')).toString()).pro;
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
            if(consoleL && auth) console.log(`pro| getPlaylist: got tokens`);
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
                    accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
                    "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
                    cookie: auth.cookie,
                    referrer: "https://protvplus.ro/"
                },
            });
            if(consoleL && step3.data) console.log(`pro| getPlaylist: got channel's stream`);
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
function selectQuality(data) {
    if(consoleL) console.log(`pro| selectQuality: ${data.match("(.*)fullhd.m3u8(.*)")[0] ? data.match("(.*)fullhd.m3u8(.*)")[0] : data.match("(.*)hd.m3u8(.*)")[0]}`);
    return data.match("(.*)fullhd.m3u8(.*)")[0] ? data.match("(.*)fullhd.m3u8(.*)")[0] : data.match("(.*)hd.m3u8(.*)")[0];
}
exports.pro = async (req, res, next) => {
    try {
        if (channels[req.params.channel]) {
            if(consoleL) console.log(`pro| pro: Getting channel stream URL`);
            let quality = await axios.get(await getPlaylist(req.params.channel), {
                headers: {
                    accept: "*/*",
                    referrer: "https://media.cms.protvplus.ro/",
                },
            });
            if(consoleL && quality.data) console.log(`pro| pro: got channel's stream URL`);
            if(consoleL && quality.data) console.log(`pro| pro: ${quality.config.url.match("(.*)/playlist.m3u8")[1] + "/" + selectQuality(quality.data)}`);
            res.redirect(quality.config.url.match("(.*)/playlist.m3u8")[1] + "/" + selectQuality(quality.data));
        } else
            next();
    } catch (error) {
        res.status(500).send(error);
    }
};
