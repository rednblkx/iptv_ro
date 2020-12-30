const { default: axios } = require("axios");
const fs = require("fs");
const puppeteer = require("puppeteer");
const { setTimeout } = require("timers");

var ch = {};

var ch24 = ["digi24", "digisport1", "digisport2", "digisport3", "digisport4"];

var channels = {
  "kanal-d": {
    id: 30,
    category: "general",
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
  "paramount-channel": {
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
  let cookies = JSON.parse(fs.readFileSync("./auth.json").toString()).digi
    .cookies;
  return new Promise(async (resolve) => {
    try {
      if (cookies) {
        resolve(cookies);
      } else if (!cookies) {
        resolve(await login());
      }
    } catch (error) {
      reject("getLogin: " + error);
      console.error(error);
    }
  });
}
async function login() {
  return new Promise(async (resolve, reject) => {
    try {
      let auth = JSON.parse(fs.readFileSync("./auth.json").toString());
      let browser = await puppeteer.launch({ headless: false });
      let page = await browser.newPage();
      await page.goto("https://www.digionline.ro/auth/login", {
        waitUntil: "domcontentloaded",
      });
      await page.type("#form-login-email", auth.digi.username);
      await page.type("#form-login-password", auth.digi.password);
      await page.evaluate(
        "document.querySelector('button[type=submit]').click()"
      );
      await page.waitForSelector(".login-step.login-step-4");
      (await page.cookies())
        .map((b) =>
          ["cmp_level", "deviceId", "DOSESSV3PRI"].includes(b.name) ? b : null
        )
        .filter(function (el) {
          return el != null;
        })
        .forEach(
          (el, index, array) =>
            (auth.digi.cookies = array.map((n) =>
              new Cookie(n.name, n.value).toString()
            ))
        );
      fs.writeFileSync("./auth.json", JSON.stringify(auth));

      if (
        auth.digi.cookies.some((a) => a.match(/[^=]*/)[0].includes("device"))
      ) {
        resolve(auth.digi.cookies);
      } else {
        reject("Something went wrong while signing in");
      }
    } catch (error) {
      reject("login: " + error);
      console.error(error);
    }
  });
}
async function getFromDigi(id, name, category) {
  try {
    let auth = await getLogin();
    return axios.post(
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
    // .then((stream) => {
    // setTimeout(() => { delete channels[req.params.channel] }, 2.16e+7)
    // stream.data.stream_url ? callback(stream.data.stream_url) : callback(0);
    // });
  } catch (error) {
    console.error(error);
  }
}

async function getFrom24(scope) {
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
  return axios.get(
    `https://balancer2.digi24.ro/streamer.php?&scope=${scope}&key=${
      key.data
    }&outputFormat=json&type=hq&quality=hq&is=4&ns=${scope}&pe=site&s=site&sn=${
      scope.includes("sport") ? "digisport.ro" : "digi24.ro"
    }&p=browser&pd=linux`
  );
}
function m3uParse(data) {
  let line;
  var m3u = data.split("\n").filter(function (str) {
    return str.length > 0;
  });
  while ((line = m3u.shift())) {
    if (
      line.startsWith("http") ||
      (line.endsWith(".m3u8") && (line.includes("hd") || line.includes("hq")))
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
  if (req.params.channel.match("(.*).m3u8"))
    req.params.channel = req.params.channel.match("(.*).m3u8")[1];

  if (channels[req.params.channel]) {
    if (ch[req.params.channel]) {
      let m3u8 = await axios.get(ch[req.params.channel]);
      // res.download('streams/kanald.strm');
      // res.set("Content-Type", "application/vnd.apple.mpegurl");
      res.send(
        m3uFixURL(
          m3u8.data,
          ch[req.params.channel].match("(.*)/(.*).m3u8")[1] + "/"
        )
      );
    } else {
      let url = await getFromDigi(
        channels[req.params.channel].id,
        req.params.channel,
        channels[req.params.channel].category
      );
      // res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
      // res.send(`#EXTM3U\n#EXT-X-VERSION:3\n#EXTINF:0,Kanal D\n${url}`);
      // url != 0 ? res.redirect(url) : res.status(404)
      let m3u8 = await axios.get(url.data.stream_url);
      ch[req.params.channel] =
        m3u8.config.url.match("(.*)/(.*).m3u8")[1] + "/" + m3uParse(m3u8.data);
      let m3u8_fix = await axios.get(
        m3u8.config.url.match("(.*)/(.*).m3u8")[1] + "/" + m3uParse(m3u8.data)
      );
      // res.set("Content-Type", "application/vnd.apple.mpegurl");
      res.send(
        m3uFixURL(
          m3u8_fix.data,
          (
            m3u8.config.url.match("(.*)/(.*).m3u8")[1] +
            "/" +
            m3uParse(m3u8.data)
          ).match("(.*)/(.*).m3u8")[1] + "/"
        )
      );
    }
  } else if (ch24.includes(req.params.channel)) {
    if (ch[req.params.channel]) {
      let c24 = await axios.get(ch[req.params.channel]);
      res.send(
        m3uFixURL(
          c24.data,
          ch[req.params.channel].match("(.*)/(.*).m3u8")[1] + "/"
        )
      );
    } else {
      try {
        let video = await getFrom24(req.params.channel);
        res.redirect(video.data.file);
      } catch (error) {
        res.status(500).send(error);
      }
    }
  } else next();
};
