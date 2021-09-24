const { default: axios } = require("axios");
const cheerio = require("cheerio");
const { query } = require("express");
const fs = require("fs");

var channels = [
  "antena1",
  "happy-channel",
  "zu-tv",
  "antena-stars",
  "antena3",
  "mireasa",
  "antena-international",
  "comedy-play",
  "antena-monden",
  "cookplay"
];
var stream = {};
let consoleL = process.env.DEBUG;
function Cookie(name, value) {
  this.name = name;
  this.value = value;
}
Cookie.prototype.toString = function CookietoString() {
  return `${this.name}=${this.value}`;
};
function setQuality(data, quality) {
  let line;
  var m3u8;

  var m3u = data.split("\n").filter(function (str) {
    return str.length > 0;
  });
  while ((line = m3u.shift())) {
    if (
      (line.includes(".m3u8") && (line.includes(quality)))
    ) {
      return line;
    } else if (line.includes(".m3u8")){
      m3u8 = line;
    }
  }

  return line ? line : m3u8
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
exports.live = async (req, res, next) => {
  if (req.params.channel.match("(.*).m3u8"))
    req.params.channel = req.params.channel.match("(.*).m3u8")[1];
  if(!req.query.cached){
    req.query.cached = getDefault('cache_url')
  }
  if(!req.query.ts){
    req.query.ts = getDefault('rewrite_url')
  }
  if(!req.query.quality){
    req.query.quality = getDefault('quality')
  }
  var time;
  try {
    if (channels.includes(req.params.channel)) {
      if (stream[req.params.channel] != undefined && req.query.cached === 'true') {
        if(consoleL) console.log("antena| live: cached URL");
        if(consoleL) console.log(`antena| live: URL used: ${stream[req.params.channel]}`);
        if(req.query.ts === 'true'){
          if(consoleL) console.log("antena| live: rewriting enabled");
          res.contentType("application/vnd.apple.mpegurl")
          let m3u8 = await axios.get(stream[req.params.channel])
          let quality_url = setQuality(m3u8.data, req.query.quality)
          let qu = await axios.get(quality_url)
          if(consoleL && quality_url) console.log(`antena| live: trying quality "${req.query.quality}"`);
          res.send(m3uFixURL(qu.data, qu.config.url.match("(.*)/")[0]))
        }else if(req.query.quality !== "auto"){
          let m3u8 = await axios.get(stream[req.params.channel])
          if(consoleL && quality_url) console.log(`antena| live: trying quality "${req.query.quality}"`);
          let quality_url = setQuality(m3u8.data, req.query.quality)
          res.redirect(quality_url)
        } else res.redirect(stream[req.params.channel]);
      } else {
        if(consoleL) console.log("antena| live: getting stream URL");
        let url = await getStream(req.params.channel);
        if(consoleL && url) console.log(`antena| live: stream URL received ${url}`);
        stream[req.params.channel] = url;
        clearTimeout(time);
        time = setTimeout(() => {delete stream[req.params.channel];if(consoleL) console.log("antena| live: Cache Expired");}, getDefault('cache_expire_ms') || 2.16e+7);
        if(req.query.ts === 'true'){
          res.contentType("application/vnd.apple.mpegurl")
          let m3u8 = await axios.get(url)
          let quality_url = setQuality(m3u8.data, req.query.quality)
          if(consoleL && quality_url) console.log(`antena| live: selected quality URL "${quality_url}"`);
          let qu = await axios.get(quality_url)
          if(consoleL && quality_url) console.log(`antena| live: rewriting urls with quality "${req.query.quality}"`);
          res.send(m3uFixURL(qu.data, qu.config.url.match("(.*)/")[0]))
        } else if(req.query.quality === "get"){
          let m3u8 = await axios.get(url)
          res.json({"qualities": getQualities(m3u8.data, "")});
        }else if(req.query.quality !== "auto"){
          let m3u8 = await axios.get(stream[req.params.channel])
          if(consoleL) console.log(`antena| live: using quality "${req.query.quality}"`);
          let quality_url = setQuality(m3u8.data, req.query.quality)
          res.redirect(quality_url)
      }else res.redirect(url);
      }
    } else next();
  } catch (error) {
    if(consoleL) console.error(error);
    res.status(505).send(error);
  }
};
exports.flush = (req,res) => {
  if(req.query.channel){
    stream[req.query.channel] = null;
  } else stream = {};
  res.send("Flushed");
}
exports.showid = async (req, res) => {
  try {
    if(consoleL) console.log("antena| showid: Getting show episodes");
    if(consoleL) console.log(`antena| showid: params = ${JSON.stringify(req.params)}`);
    req.query.year && req.query.month ? res.send(await getShow(req.params.show, req.query.format, req.query.year, req.query.month)) : res.send(await getShow(req.params.show, req.query.format));

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
exports.showshtml = async function getShowsRoute() {
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
      return $.html();
    } catch (error) {
      return `antena| getShowRoute: ${error}`;
    }

}
exports.emshtml = async function getEmsRoute(page) {
    try {
      if(consoleL) console.log("antena| shows: Getting HTML code");
      let html = (await getEms(page || "1")).shows;
      if(consoleL && html) console.log("antena| shows: Got HTML");
      let $ = cheerio.load("<html><head><script src='https://cdnjs.cloudflare.com/ajax/libs/jquery/3.5.1/jquery.min.js'/><title>Shows</title></head><body></body></html>");
      $("body").append("<ul></ul>");
      $("body").append(`
      <script>
        function nextPage(){
          window.location.href = window.location.href.match("page") ? window.location.href.match(/[^=]*/)[0] + "=" + (Number(location.search.match(/\\?page=(\\d)/)[1]) + 1) : "?page=" + 2
        }
      </script>`)
      $('body').append(`<button onClick="nextPage()">Next Page</button>`)
      html.forEach((el) => {
        if(consoleL) console.log(`antena| shows: Appending show ${el.name}`);
        if(consoleL) console.log(`antena| shows: Appending show link ${el.link}`);
        if(consoleL) console.log(`antena| shows: Appending show img ${el.img}`);
        $("ul").append(`<li><a href=${el.link}><img src=${el.img} width=100px><br><span>${el.name}</span></a></li>`);
      });
      return $.html();
    } catch (error) {
      return `antena| getEmsRoute: ${error}`
    }

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
            referer: "https://antenaplay.ro/",
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
exports.shows = getShows;
async function getShows() {
  return new Promise(async (resolve, reject) => {
    try {
      if(consoleL) console.log("antena| getShows: Getting cookies");
      let auth = await getLogin();
      if(consoleL && auth) console.log("antena| getShows: Got cookies");
      if(consoleL) console.log("antena| getShows: Getting HTML");
      let html = await axios.get(`https://antenaplay.ro/seriale`, {
        headers: {
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
      $$($$("a").each((i, el) => {
        if(consoleL) console.log(`antena| shows: Appending show ${$$(el).children("h5").text()}`);
        if(consoleL) console.log(`antena| shows: Appending show link ${'/show' + $$(el).attr("href")}`);
        if(consoleL) console.log(`antena| shows: Appending show img ${$$(el).children('.container').children("img").attr('src')}`);
        shows.push({
          name: $$(el).children("h5").text(),
          link: '/show' + $$(el).attr("href"),
          img: $$(el).children('.container').children("img").attr('src')
        })
      }));
      shows.length !== 0 ? resolve(shows) : reject("antena| getShows: No List");
    } catch (error) {
      reject(`antena| getShows: ${error}`);
      if(consoleL)
        console.error(error);
    }
  });
}
exports.ems = getEms;
async function getEms(page) {
    try {
      if(consoleL) console.log("antena| getShows: Getting cookies");
      let auth = await getLogin();
      if(consoleL && auth) console.log("antena| getShows: Got cookies");
      if(consoleL) console.log("antena| getShows: Getting HTML");
      let pages = await axios.get(`https://antenaplay.ro/emisiuni-tv/load?page=1`,
      {
        headers: {
          referer: "https://antenaplay.ro/antena1",
          "x-newrelic-id": "VwMCV1VVGwEEXFdQDwIBVQ==",
          "x-requested-with": "XMLHttpRequest",
          'user-agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.146 Safari/537.36",
        }
      })      
      let html = await axios.get(`https://antenaplay.ro/emisiuni-tv/load?page=${page <= pages.data.pagination.total_pages && page ? page : !page ? 1 : pages.data.pagination.total_pages}`,
      {
        headers: {
          referer: "https://antenaplay.ro/antena1",
          "x-newrelic-id": "VwMCV1VVGwEEXFdQDwIBVQ==",
          "x-requested-with": "XMLHttpRequest",
          'user-agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.146 Safari/537.36",
        }
      })
      if(consoleL && html.data) console.log("antena| getEms: Got HTML");
      if(consoleL) console.log("antena| getEms: loading into cheerio");
      let $ = cheerio.load(html.data.view);
      let shows = [];
      let meta = {"total_pages": pages.data.pagination.total_pages, "per_page": pages.data.pagination.per_page, "total": pages.data.pagination.total, "current_page": pages.data.pagination.current_page}
      $("a").each((i, el) => {
        if(consoleL) console.log(`antena| shows: Appending show ${$(el).children(".text-container").children('h5').text()}`);
        if(consoleL) console.log(`antena| shows: Appending show link ${'/show' + $(el).attr("href")}`);
        if(consoleL) console.log(`antena| shows: Appending show img ${$(el).children(".container").children('img').attr('src')}`);
      shows.push({
        name: $(el).children(".text-container").children('h5').text(),
        link: '/show' + $(el).attr("href"),
        img: $(el).children(".container").children('img').attr('src')
      })
    });
      return shows.length !== 0 ? {meta,shows} : "antena| getShows: No List"
    } catch (error) {
      if(consoleL)
        console.error(error);
      return `antena| getEms: ${error}`
    }
}
async function fetchLinkShow(
  url,
  format,
  year = new Date().getFullYear(),
  month = new Date().getMonth() + 1
) {
  return new Promise(async (resolve, reject) => {
    try {
      if(!format){
        format = getDefault('res_format')
      }
      if(consoleL) console.log("antena| fetchLinkShow: Getting Cookies ");
      let auth = await getLogin();
      if(consoleL && auth) console.log("antena| fetchLinkShow: Got cookies");
      if(consoleL) console.log("antena| fetchLinkShow: Getting Episodes List");
      if(consoleL) console.log(`antena| fetchLinkShow: Link used ${url}${year && month ? '&year=' + year + '&month=' + month : ''}`);
      let response = await axios.get(`${url}${year && month ? '&year=' + year + '&month=' + month : ''}`, {
        headers: {
          "x-newrelic-id": "VwMCV1VVGwEEXFdQDwIBVQ==",
          "x-requested-with": "XMLHttpRequest",
          cookie: auth.join("; "),
        },
        withCredentials: true,
        referrer: "https://antenaplay.ro/"
      });
      if(consoleL && response.data) console.log("antena| fetchLinkShow: Got Episodes");
      var $ = cheerio.load(response.data.view);
      let shows = [];
      $("a").each((i, url) => {
        $(url).prepend($($(url).children('.container').children('img')).attr("width", "200px")) 
        $(url).attr("href", "/show/play" + $(url).attr("href"));
        shows.push({"name": $(url).children("h5").text(), "link": "/show/play" + $(url).attr("href"), "img": $(url).children("img").attr("src")});
      });
      $(".container").each((i, el) => $(el).remove());
      if(format && format === 'html'){
        $ ? resolve($.html()) : reject('antena| fetchLinkShow: No Data')
      }else {
        shows.length > 0 ? resolve(JSON.stringify(shows)) : reject('antena| fetchLinkShow: No Data')
      }
    } catch (error) {
      reject(`antena| fetchLinkShow: ${error}`);
      if(consoleL)
        console.error(error);
    }
  });
}
async function getShow(show, format, year, month) {
  return new Promise(async (resolve, reject) => {
  try {
    if(!format){
      format = getDefault('res_format')
    }
    if(consoleL) console.log("antena| getShow: Getting Cookies ");
    let auth = await getLogin();
    if(consoleL && auth) console.log("antena| getShow: Got Cookies ");
    if(consoleL) console.log("antena| getShow: Getting HTML");
    let html = await axios.get(`https://antenaplay.ro/${show}`, {
      headers: {
        cookie: auth.join("; "),
      },
      referrer: `https://antenaplay.ro/seriale`,
      referrerPolicy: "no-referrer-when-downgrade",
      mode: "cors",
    });
    if(consoleL && html.data) console.log("antena| getShow: Got HTML");
    if(consoleL) console.log("antena| getShow: loading into cheerio");
    let $ = cheerio.load(await html.data);
    if(format && format === 'html'){
      let $$ = cheerio.load("<html><head><script src='https://cdnjs.cloudflare.com/ajax/libs/jquery/3.5.1/jquery.min.js'/><title>Selector</title></head><body></body></html>");
      $$('body').append("<h1>Month</h1>");
      $$('body').append(`
      <script>
        $( document ).ready(function() {
          $("#year").on("change", function() {
            var t = $(this).find("option:selected"),
            e = t.data("months").split(";");
            $("#month option").each(function() {
              $.inArray($(this).val(), e) >= 0 ? $(this).prop("disabled", !1) : $(this).prop("disabled", !0)
            }), $("#month option:enabled").eq(0).prop("selected", !0)
          })
          var t = $("#year").find("option:selected"),
                  e = t.data("months").split(";");
              $("#month option").each(function() {
                  $.inArray($(this).val(), e) >= 0 ? $(this).prop("disabled", !1) : $(this).prop("disabled", !0)
              }), $("#month option:enabled").eq(0).prop("selected", !0)
        });
      </script>
      `);
      $$('body')
        $$('body').append(`<select id="month" data-month="true">
        <option selected="" disabled="" class="option">Luna</option> 
        <option value="01" class="option" disabled="">Ianuarie</option>
        <option value="02" class="option" disabled="">Februarie</option>
        <option value="03" disabled="" class="option">Martie</option>
        <option value="04" disabled="" class="option">Aprilie</option>
        <option value="05" disabled="" class="option">Mai</option>
        <option value="06" disabled="" class="option">Iunie</option>
        <option value="07" disabled="" class="option">Iulie</option>
        <option value="08" disabled="" class="option">August</option>
        <option value="09" disabled="" class="option">Septembrie</option>
        <option value="10" disabled="" class="option">Octombrie</option>
        <option value="11" class="option">Noiembrie</option>
        <option value="12" class="option">Decembrie</option>       
      </select>`)
      $$('body').append("<h1>Year</h1>")
      $$("body").append(`<select id="year"></select>`);
        if($("#js-selector-year option:not([disabled])").length > 0){
          $("#js-selector-year option:not([disabled])").each((i, el) => {
            $$("#year").append(`<option data-months=${$(el).attr('data-months')} value=${$(el).val()}>${$(el).text()}</option>`);
          })
        }else $$("#year").append(`<option selected data-months=${$("#js-selector-year option:not([disabled])").attr('data-months')} value=${$("#js-selector-year option:not([disabled])").val()}>${$("#js-selector-year option:not([disabled])").text()}</option>`)
        $$($$('#month > option')[$$('#month > option').length - 1]).attr('selected',true);
        $$($$('#year > option')[$$('#year > option').length - 1]).attr('selected',true);
        $$('body').append(`
        <script>
          function select(){
            window.location.href='?year=' + document.querySelector('#year').value + '&month=' + document.querySelector('#month').value
          }
        </script>`)
        $$("body").append(`<button onclick="select()">Submit</button>`)
        !year || !month ? resolve($$.html()) : $ ? resolve(await fetchLinkShow(
          "https://antenaplay.ro" +
            $(".js-slider-button.slide-right").attr("data-url"), format, year, month
        )) : reject('getShow: No HTML')
    }else {
      let list = {};
      if($("#js-selector-year option:not([disabled])").length > 0){
        $("#js-selector-year option:not([disabled])").each((i, el) => {
          $(el).attr('value') && (list[$(el).attr('value')] = ($(el).attr('data-months')).split(";"))
        })
      }else list[$("#js-selector-year option:not([disabled])").attr('value')] = ($("#js-selector-year option:not([disabled])").attr('data-months')).split(";")
      !year || !month ? resolve(JSON.stringify(list)) : $ ? resolve(await fetchLinkShow(
        "https://antenaplay.ro" +
          $(".js-slider-button.slide-right").attr("data-url"), format, year, month
      )) : reject('getShow: No HTML')
    }
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
      let auth = JSON.parse(fs.readFileSync(__dirname + '/auth.json').toString()).antena;
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

function getDefault(scope){
  const conf = JSON.parse(fs.readFileSync('config.json')).antena
  return conf[scope]
}

async function setCookies(cookies) {
  return new Promise((resolve, reject) => {
    try {
        fs.readFile(__dirname + '/auth.json', (err, data) => {
          if(consoleL) console.log("antena| setCookies: creating cookies object");
          let auth = JSON.parse(data.toString());
          auth.antena.cookies[auth.antena.cookies.findIndex(el => el.includes('XSRF-TOKEN'))] = cookies[cookies.findIndex(el => el.includes('XSRF-TOKEN'))];
          auth.antena.cookies[auth.antena.cookies.findIndex(el => el.includes('laravel_session'))] = cookies[cookies.findIndex(el => el.includes('laravel_session'))];
          fs.writeFile(__dirname + '/auth.json', JSON.stringify(auth), () => {if(consoleL) console.log("antena| setCookies: cookies successfully set");});
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
          if(consoleL) console.log(`antena| getQualities: ${line}`);
          lines.push(baseUrl + line);
      }
    }
    return lines;
}

async function login() {
  return new Promise(async (resolve, reject) => {
  try {
    if(consoleL) console.log("antena| login: getting auth.json file");
    let auth = JSON.parse(fs.readFileSync(__dirname + '/auth.json'));
    if(consoleL && auth) console.log("antena| login: auth.json valid");
    let tokens = await axios.get("https://antenaplay.ro/intra-in-cont", {
      headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Origin': 'https://antenaplay.ro',
          referer: "https://antenaplay.ro",
          'user-agent': "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.101 Safari/537.36",
      },
    });
    let $ = cheerio.load(tokens.data);
      const login = await axios.post(
          'https://antenaplay.ro/intra-in-cont', 
      `email=${encodeURIComponent(auth.antena.username)}&password=${encodeURIComponent(auth.antena.password)}&_token=${$("input[name=_token]").val()}`, 
      {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Origin': 'https://antenaplay.ro',
        referer: "https://antenaplay.ro/intra-in-cont",
        cookie: tokens.headers["set-cookie"].map((a) => a.match(/[^;]*/)[0]).join(";"),
        'user-agent': "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.101 Safari/537.36",
      },
      maxRedirects: 0,
      validateStatus: (status) => status === 302
    })
    let live = await axios.get("https://antenaplay.ro/live/antena1", {
      headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Origin': 'https://antenaplay.ro',
          referer: "https://antenaplay.ro",
          cookie: login.headers["set-cookie"].map((a) => a.match(/[^;]*/)[0]).join(";"),
          'user-agent': "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.101 Safari/537.36"
      },
    });
    auth.antena.cookies = live.headers["set-cookie"].map((a) => a.match(/[^;]*/)[0])
    fs.writeFileSync(__dirname + '/auth.json', JSON.stringify(auth));
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
exports.login = login;
