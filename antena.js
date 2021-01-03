const { default: axios } = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const puppeteer = require("puppeteer");
const path = require('path');
channels = [
  "antena1",
  "happy-channel",
  "zu-tv",
  "antena-stars",
  "antena3",
  "mireasa",
  "antena-international",
];
var stream = {};
let consoleL = false;
function Cookie(name, value) {
  this.name = name;
  this.value = value;
}
Cookie.prototype.toString = function CookietoString() {
  return `${this.name}=${this.value}`;
};
exports.live = async (req, res, next) => {
  try {
    if (channels.includes(req.params.channel)) {
      if (stream[req.params.channel] != undefined) {
        if(consoleL) console.log("antena| live: cached URL");
        if(consoleL) console.log(`antena| live: URL used: ${stream[req.params.channel]}`);
        res.redirect(stream[req.params.channel]);
      } else {
        let url = await getStream(req.params.channel);
        if(consoleL) console.log("antena| live: getting stream URL");
        if(consoleL && url) console.log("antena| live: stream URL received");
        if(consoleL) console.log(`antena| live: URL used: ${url}`);
        stream[req.params.channel] = url;
        setTimeout(() => {delete stream[req.params.channel];if(consoleL) console.log("antena| live: Timeout set");}, 2.16e+7);
        res.redirect(url);
      }
    } else next();
  } catch (error) {
    if(consoleL) console.error(error);
    res.status(505).send(error);
  }
};
exports.showid = async (req, res) => {
  try {
    if(consoleL) console.log("antena| showid: Getting show episodes");
    if(consoleL) console.log(`antena| showid: params = ${JSON.stringify(req.params)}`);
    req.query.year && req.query.month ? res.send(await getShow(req.params.show, req.query.year, req.query.month)) : res.send(await getShow(req.params.show));
  } catch (error) {
    if(consoleL) console.error(error);
    res.status(500).send(error);
  }
};
exports.episode = async (req, res) => {
  try {
    if(consoleL) console.log("antena| episode: Getting show episode");
    if(consoleL) console.log(`antena| episode: params = ${JSON.stringify(req.params)}`);
    let ep = await getEpisode(req.params.show, req.params.epid);
    if(consoleL && ep) console.log(`antena| episode: Got Episode`);
    if(!ep) throw "antena| episode: No Episode Callback"
    res.redirect(ep.data.match('ivmSourceFile.src = "(.*)";')[1]);
  } catch (error) {
    if(consoleL) console.error(error);
    res.status(505).send(error)
  }
};
// function m3uParse(m3u) {
//   let line;
//   while ((line = m3u.shift())) {
//     if (line.startsWith("http")) {
//       console.log(line);
//     }
//   }
// }
exports.shows = async function getShowsRoute() {
  return new Promise(async (resolve,reject) => {
    try {
      if(consoleL) console.log("antena| shows: Getting HTML code");
      let html = await getShows();
      if(consoleL && html) console.log("antena| shows: Got HTML");
      let $ = cheerio.load("<html><head><title>Shows</title></head><body></body></html>");
      $("body").append("<ul></ul>");
      html.forEach((el) => {
        if(consoleL) console.log(`antena| shows: Appending show ${el.name}`);
        if(consoleL) console.log(`antena| shows: Appending show link ${el.link}`);
        if(consoleL) console.log(`antena| shows: Appending show img ${el.img}`);
        $("ul").append(`<li><a href=${el.link}><img src=${el.img} width=100px><br><span>${el.name}</span></a></li>`);
      });
      resolve($.html());
    } catch (error) {
      reject(`antena| getShowRoute: ${error}`);
    }
  })

}
async function getEpisode(show, epid) {
  return new Promise(async (resolve, reject) => {
  try {
    if(!show || !epid){
      throw "antena| getEpisode: Params Missing"
    }
    if(consoleL) console.log("antena| getEpisode: Getting cookies");
    let auth = await getLogin();
    if(consoleL && auth) console.log("antena| getEpisode: Got cookies");
    if(consoleL) console.log("antena| getEpisode: Getting episode's HTML");
    let response = await axios.get(
      `https://antenaplay.ro/${show}/${epid}`,
      {
        headers: {
          accept: "*/*",
          "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
          "cache-control": "no-cache",
          pragma: "no-cache",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          "x-newrelic-id": "VwMCV1VVGwEEXFdQDwIBVQ==",
          "x-requested-with": "XMLHttpRequest",
          cookie: auth.join("; "),
        },
        referrer: "https://antenaplay.ro/",
        referrerPolicy: "no-referrer-when-downgrade",
        mode: "cors",
      }
    );
    if(consoleL && response.data) console.log("antena| getEpisode: Got HTML");
    if(consoleL) console.log("antena| getEpisode: Getting stream link");
    let link = await axios
      .get(
        "https:" +
        cheerio.load(response.data)(".video-container script")
            .html()
            .match("var playerSrc = '(.*)'")[1] +
          "no",
        {
          headers: {
            "user-agent": "curl/7.68.0",
            pragma: "no-cache",
            accept: "*/*",
            "sec-fetch-site": "same-site",
            "sec-fetch-mode": "no-cors",
            "sec-fetch-dest": "script",
            referer: "https://antenaplay.ro/",
            "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
          },
        }
      );
      if(consoleL && link.data) console.log("antena| getEpisode: Got stream URL");
      resolve(link)
  } catch (error) {
    reject(`antena| getEpisode: ${error}`);
    if(consoleL)
      console.error(error);
  }
})
}
async function getShows() {
  return new Promise(async (resolve, reject) => {
    try {
      if(consoleL) console.log("antena| getShows: Getting cookies");
      let auth = await getLogin();
      if(consoleL && auth) console.log("antena| getShows: Got cookies");
      if(consoleL) console.log("antena| getShows: Getting HTML");
      let html = await axios.get(`https://antenaplay.ro/seriale`, {
        headers: {
          accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
          "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
          "cache-control": "no-cache",
          pragma: "no-cache",
          "sec-fetch-dest": "document",
          "sec-fetch-mode": "navigate",
          "sec-fetch-site": "same-origin",
          "sec-fetch-user": "?1",
          "upgrade-insecure-requests": "1",
          cookie: auth.join("; "),
        },
        referrer: `https://antenaplay.ro/`,
        referrerPolicy: "no-referrer-when-downgrade",
        mode: "cors",
      });
      if(consoleL && html.data) console.log("antena| getShows: Got HTML");
      if(consoleL) console.log("antena| getShows: loading into cheerio");
      let $ = cheerio.load(await html.data);
      let $$ = cheerio.load(
        $($(".slider-container")[$(".slider-container").length - 1]).html()
      );
      let shows = [];
      $$($$("a").each((i, el) => shows.push({
        name: $$(el).children("h5").text(),
        link: '/show' + $$(el).attr("href"),
        img: $$(el).children('.container').children("img").attr('src')
      })));
      shows.length !== 0 ? resolve(shows) : reject("antena| getShows: No List");
    } catch (error) {
      reject(`antena| getShows: ${error}`);
      if(consoleL)
        console.error(error);
    }
  });
}
async function fetchLinkShow(
  url,
  year = new Date().getFullYear(),
  month = new Date().getMonth() + 1
) {
  return new Promise(async (resolve, reject) => {
    try {
      if(consoleL) console.log("antena| fetchLinkShow: Getting Cookies ");
      let auth = await getLogin();
      if(consoleL && auth) console.log("antena| fetchLinkShow: Got cookies");
      if(consoleL) console.log("antena| fetchLinkShow: Getting Episodes List");
      if(consoleL) console.log(`antena| fetchLinkShow: Link used ${url}${year && month ? '&year=' + year + '&month=' + month : ''}`);
      let response = await axios.get(`${url}${year && month ? '&year=' + year + '&month=' + month : ''}`, {
        headers: {
          accept: "*/*",
          "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
          "cache-control": "no-cache",
          pragma: "no-cache",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          "x-newrelic-id": "VwMCV1VVGwEEXFdQDwIBVQ==",
          "x-requested-with": "XMLHttpRequest",
          cookie: auth.join("; "),
        },
        withCredentials: true,
        referrer: "https://antenaplay.ro/",
        referrerPolicy: "no-referrer-when-downgrade",
        mode: "cors",
      });
      if(consoleL && response.data) console.log("antena| fetchLinkShow: Got Episodes");
      var $ = cheerio.load(response.data.view);
      $("a").each((i, url) => {
        $(url).attr("href", "/show/play" + $(url).attr("href"));
      });
      $(".container").each((i, el) => $(el).remove());
      $ ? resolve($.html()) : reject('antena| fetchLinkShow: No JSON')
    } catch (error) {
      reject(`antena| fetchLinkShow: ${error}`);
      if(consoleL)
        console.error(error);
    }
  });
}
async function getShow(show, year, month) {
  return new Promise(async (resolve, reject) => {
  try {
    if(consoleL) console.log("antena| getShow: Getting Cookies ");
    let auth = await getLogin();
    if(consoleL && auth) console.log("antena| getShow: Got Cookies ");
    if(consoleL) console.log("antena| getShow: Getting HTML");
    let html = await axios.get(`https://antenaplay.ro/${show}`, {
      headers: {
        accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
        "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
        "cache-control": "no-cache",
        pragma: "no-cache",
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "same-origin",
        "sec-fetch-user": "?1",
        "upgrade-insecure-requests": "1",
        cookie: auth.join("; "),
      },
      referrer: `https://antenaplay.ro/seriale`,
      referrerPolicy: "no-referrer-when-downgrade",
      mode: "cors",
    });
    if(consoleL && html.data) console.log("antena| getShow: Got HTML");
    if(consoleL) console.log("antena| getShow: loading into cheerio");
    let $ = cheerio.load(await html.data);
    let $$ = cheerio.load("<html><head><title>Selector</title></head><body></body></html>");
    $$('body').append("<h1>Month</h1>");
    $$("body").append(`<select id="month"></select>`)
      if($("#js-selector-month option:not([disabled])").length){
        $("#js-selector-month option:not([disabled])").each((i, el) => {
          $$("#month").append(`<option value=${$(el).val()}>${$(el).text()}</option>`);
        });
      }else $$("#month").append(`<option selected value=${$("#js-selector-month option:not([disabled])").val()}>${$("#js-selector-month option:not([disabled])").text()}</option>`)
    $$('body').append("<h1>Year</h1>")
    $$("body").append(`<select id="year"></select>`);
      if($("#js-selector-year option:not([disabled])").length){
        $("#js-selector-year option:not([disabled])").each((i, el) => {
          $$("#year").append(`<option value=${$(el).val()}>${$(el).text()}</option>`);
        })
      }else $$("#year").append(`<option selected value=${$("#js-selector-year option:not([disabled])").val()}>${$("#js-selector-year option:not([disabled])").text()}</option>`)
      $$($$('#month > option')[$$('#month > option').length - 1]).attr('selected',true);
      $$($$('#year > option')[$$('#year > option').length - 1]).attr('selected',true);
      $$("body").append(`<button onclick="window.location.href='${"?year=" + $$("#year > option").val() + "&month=" + $$("#month > option").val()}'">Submit</button>`)
      !year || !month ? resolve($$.html()) : $ ? resolve(await fetchLinkShow(
        "https://antenaplay.ro" +
          $(".js-slider-button.slide-right").attr("data-url"),year, month
      )) : reject('getShow: No HTML')
    } catch (error) {
      reject("antena| getShow: " + error);
      if(consoleL)
        console.error(error);
    }
  })
}
async function getLogin() {
  return new Promise(async (resolve, reject) => {
    try {
      if(consoleL) console.log("antena| getLogin: getting auth.json file");
      let auth = JSON.parse(fs.readFileSync(path.join(__dirname, './', 'auth.json')).toString()).antena;
      if(consoleL) console.log("antena| getLogin: auth.json file valid");
      if(!auth || !auth.username || !auth.password || auth.username === "" || auth.password === "") throw "antena| No Credentials"
      if (auth.cookies) {
        resolve(auth.cookies);
      } else if (!auth.cookies) {
        resolve(await login());
      }
    } catch (error) {
      reject("antena| getLogin: " + error);
      if(consoleL)
        console.error(error);
    }
  });
}

async function setCookies(cookies) {
  return new Promise((resolve, reject) => {
    try {
        fs.readFile('./auth.json', (err, data) => {
          if(consoleL) console.log("antena| setCookies: creating cookies object");
          let auth = JSON.parse(data.toString());
          auth.antena.cookies[auth.antena.cookies.findIndex(el => el.includes('XSRF-TOKEN'))] = cookies[cookies.findIndex(el => el.includes('XSRF-TOKEN'))];
          auth.antena.cookies[auth.antena.cookies.findIndex(el => el.includes('laravel_session'))] = cookies[cookies.findIndex(el => el.includes('laravel_session'))];
          fs.writeFile('./auth.json', JSON.stringify(auth), () => {if(consoleL) console.log("antena| setCookies: cookies successfully set");});
          resolve('antena| setCookies: New Cookies!')
        })
      } catch (error) {
        reject("antena| setCookies: " + error)
    }
  })
}

async function getStream(channel) {
  return new Promise(async (resolve, reject) => {
    try {
      if(consoleL) console.log("antena| getStream: getting cookies");
      let auth = await getLogin();
      if(consoleL && auth) console.log("antena| getStream: got cookies");
      if(consoleL) console.log("antena| getStream: getting HTML");
      let html = await axios.get(`https://antenaplay.ro/live/${channel}`, {
        headers: {
          accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
          "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
          "cache-control": "no-cache",
          pragma: "no-cache",
          "sec-fetch-dest": "document",
          "sec-fetch-mode": "navigate",
          "sec-fetch-site": "same-origin",
          "sec-fetch-user": "?1",
          "upgrade-insecure-requests": "1",
          cookie: auth.join("; "),
        },
        withCredentials: true,
        referrer: "https://antenaplay.ro/seriale",
        referrerPolicy: "no-referrer-when-downgrade",
        mode: "cors",
      });
      if(consoleL && html.data) console.log("antena| getStream: got HTML");
      setCookies(html.headers['set-cookie']);
      let $ = cheerio.load(await html.data);
        $ ? resolve(
          $(".video-container script")
            .html()
            .match("streamURL: (.*)")[1]
            .replace('",', '"')
            .match('"(.*)"')[1]
        ): reject("antena| getStream: HTML not available");
      } catch (error) {
        reject("antena| getStream: " + error);
        if(consoleL)
          console.error(error);
    }
  });
}
async function login() {
  return new Promise(async (resolve, reject) => {
  try {
    if(consoleL) console.log("antena| login: getting auth.json file");
    let auth = JSON.parse(fs.readFileSync(path.join(__dirname, './', 'auth.json')).toString());
    if(consoleL && auth) console.log("antena| login: auth.json valid");
    let browser = await puppeteer.launch({ headless: true });
    if(consoleL && browser) console.log("antena| login: launching puppeteer");
    let page = await browser.newPage();
    if(consoleL && page) console.log("antena| login: puppeteer newPage");
    await page.goto("https://antenaplay.ro/intra-in-cont", {
      waitUntil: "domcontentloaded",
    });
    if(consoleL) console.log("antena| login: puppeteer ");
    await page.type(
      "input[name=email]",
      JSON.parse(fs.readFileSync(path.join(__dirname, './', 'auth.json'))).antena.username
    );
    await page.type(
      "input[name=password]",
      JSON.parse(fs.readFileSync(path.join(__dirname, './', 'auth.json'))).antena.password
    );
    await page.evaluate("document.querySelector('button[type=submit]').click()");
    await page.waitForSelector(".header");
    await page.goto("https://antenaplay.ro/live/antena1", {
      waitUntil: "domcontentloaded",
    });
    (await page.cookies())
      .map((b) =>
        [
          "deviceName",
          "deviceType",
          "deviceId",
          "XSRF-TOKEN",
          "laravel_session",
        ].includes(b.name)
          ? b
          : null
      )
      .filter(function (el) {
        return el != null;
      })
      .forEach(
        (el, index, array) =>
          (auth.antena.cookies = array.map((n) =>
            new Cookie(n.name, n.value).toString()
          ))
      );
    fs.writeFileSync(path.join(__dirname, './', 'auth.json'), JSON.stringify(auth));
    if (auth.antena.cookies.some((a) => a.match(/[^=]*/)[0].includes("device"))) {
      if(consoleL) console.log("antena| login: cookies found ");
        resolve(auth.antena.cookies);
      } else {
        reject("antena| login: Username/Password incorrect");
      }
    } catch (error) {
      reject("antena| login: " + error);
      if(consoleL)
        console.error(error);
    }
  });
}
