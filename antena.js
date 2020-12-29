const express = require("express");
// const app = express();
const { default: axios } = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const puppeteer = require("puppeteer");
const { resolve } = require("path");

// app.listen(3001, ()=> {
//     console.log('started');
// });
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
function Cookie(name, value) {
  this.name = name;
  this.value = value;
}
Cookie.prototype.toString = function CookietoString() {
  return `${this.name}=${this.value}`;
};
exports.live = (req, res) => {
  if (channels.includes(req.params.channel)) {
    if (stream[req.params.channel] != undefined) {
      res.redirect(stream[req.params.channel]);
    } else {
      getStream(req.params.channel).then((url) => {
        stream[req.params.channel] = url;
        res.redirect(url);
      });
    }
  } else res.status(404).send("No Match");
};
exports.showid = async (req, res) => {
  res.send(await getShow(req.params.show));
};
exports.episode = async (req, res) => {
  try {
    let auth = await getLogin();
    var response = await axios.get(
      `https://antenaplay.ro/${req.params.show}/${req.params.epid}`,
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
    $ = cheerio.load(await response.data);
    axios
      .get(
        "https:" +
          $(".video-container script")
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
      )
      .then((a) => {
        res.redirect(a.data.match('ivmSourceFile.src = "(.*)";')[1]);
      });
  } catch (error) {
    console.error(error);
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
      let html = await getShows();
      let $ = cheerio.load("<html><head><title>Shows</title></head><body></body></html>");
      $("body").append("<ul></ul>");
      html.forEach((el) => {
        $("ul").append(`<img src=${el.img} width=100px>`);
        $("ul").append(`<li><a href=${el.link}>${el.name}</a></li>`);
      });
      resolve($.html());
    } catch (error) {
      reject('no elements');
    }
  })

}
async function getShows() {
  try {
    let auth = await getLogin();
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
    return new Promise((resolve, reject) => {
      shows.length !== 0 ? resolve(shows) : reject("No List");
    });
  } catch (error) {
    console.error(error);
  }
}
async function fetchLinkShow(
  url,
  year = new Date().getFullYear(),
  month = new Date().getMonth() + 1
) {
  try {
    let auth = await getLogin();
    let response = await axios.get(url, {
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
    var $ = cheerio.load(response.data.view);
    $("a").each((i, url) => {
      $(url).attr("href", "/show/play" + $(url).attr("href"));
    });
    $(".container").each((i, el) => $(el).remove());
    return new Promise((resolve) => {
      resolve($.html());
    });
  } catch (error) {
    console.error();
  }
}
async function getShow(show) {
  try {
    let auth = await getLogin();
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
    let $ = cheerio.load(await html.data);
    //   console.log(root);
    return await fetchLinkShow(
      "https://antenaplay.ro" +
        $(".js-slider-button.slide-right").attr("data-url")
    );
  } catch (error) {
    console.error(error);
  }
}
async function getLogin() {
  let cookies = JSON.parse(fs.readFileSync("./auth.json").toString()).antena
    .cookies;
  try {
    return new Promise(async (resolve) => {
      if (cookies) {
        resolve(cookies);
      } else if (!cookies) {
        if ((await login()) === 1) {
          resolve(
            JSON.parse(fs.readFileSync("./auth.json").toString()).antena.cookies
          );
        }
      }
    });
  } catch (error) {
    console.error(error);
  }
}
async function getStream(channel) {
  try {
    let auth = await getLogin();
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
      referrer: "https://antenaplay.ro/seriale",
      referrerPolicy: "no-referrer-when-downgrade",
      mode: "cors",
    });
    let $ = cheerio.load(await html.data);

    return new Promise(async (resolve, reject) => {
      resolve(
        $(".video-container script")
          .html()
          .match("streamURL: (.*)")[1]
          .replace('",', '"')
          .match('"(.*)"')[1]
      );
      reject("Stream not available!");
    });
  } catch (error) {
    console.error(error);
  }
}

async function login() {
  let auth = JSON.parse(fs.readFileSync("./auth.json").toString());
  let browser = await puppeteer.launch({ headless: true });
  let page = await browser.newPage();
  await page.goto("https://antenaplay.ro/intra-in-cont", {
    waitUntil: "domcontentloaded",
  });
  await page.type(
    "input[name=email]",
    JSON.parse(fs.readFileSync("./auth.json")).antena.username
  );
  await page.type(
    "input[name=password]",
    JSON.parse(fs.readFileSync("./auth.json")).antena.password
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
  fs.writeFileSync("./auth.json", JSON.stringify(auth));
  if (auth.antena.cookies.some((a) => a.match(/[^=]*/)[0].includes("device"))) {
    return new Promise((resolve, reject) => {
      resolve(auth.antena.cookies);
    });
  } else {
    return new Promise((resolve, reject) => {
      reject("Something went wrong while signing in");
    });
  }
}
