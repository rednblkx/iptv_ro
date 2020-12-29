const { default: axios } = require("axios");
const cheerio = require("cheerio");
var fs = require("fs");

const channels = {
  "pro-tv": 1,
  "pro-2": 2,
  "pro-x": 3,
  "pro-gold": 4,
  "pro-cinema": 5,
};
async function login() {
  let auth = JSON.parse(fs.readFileSync("./auth.json").toString());
  return new Promise((resolve, reject) => {
  axios
    .post(
      "https://protvplus.ro/",
      `------WebKitFormBoundaryqDXFH3zcgh9GNa3N\r\nContent-Disposition: form-data; name="email"\r\n\r\n${auth.pro.username}\r\n------WebKitFormBoundaryqDXFH3zcgh9GNa3N\r\nContent-Disposition: form-data; name="password"\r\n\r\n${auth.pro.password}\r\n------WebKitFormBoundaryqDXFH3zcgh9GNa3N\r\nContent-Disposition: form-data; name="_do"\r\n\r\nheader-header_login-loginForm-form-submit\r\n------WebKitFormBoundaryqDXFH3zcgh9GNa3N\r\nContent-Disposition: form-data; name="login"\r\n\r\nIntră în cont\r\n------WebKitFormBoundaryqDXFH3zcgh9GNa3N--\r\n`,
      {
        headers: {
          accept: "*/*",
          "accept-language": "en-GB,en;q=0.9",
          "cache-control": "no-cache",
          "content-type":
            "multipart/form-data; boundary=----WebKitFormBoundaryqDXFH3zcgh9GNa3N",
          pragma: "no-cache",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          "sec-gpc": "1",
          "x-requested-with": "XMLHttpRequest",
        },
        referrer: "https://protvplus.ro/",
        referrerPolicy: "strict-origin-when-cross-origin",
        mode: "cors",
      }
    )
    .then((res) => {
        if (res.headers["set-cookie"]) {
          axios.get("https://protvplus.ro/api/v1/user/check", {
            headers: {
                accept: "application/json, text/javascript, */*; q=0.01",
                "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
                "cache-control": "no-cache",
                pragma: "no-cache",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-origin",
                "sec-gpc": "1",
                "x-requested-with": "XMLHttpRequest",
                cookie: res.headers["set-cookie"][0].match(/[^;]*/)[0] + ';'
            },
            referrer: "https://protvplus.ro/",
            referrerPolicy: "strict-origin-when-cross-origin",
            mode: "cors",
        }).then(a => {
            if(a.data.data.bearer){
                auth.pro.cookies = a.headers["set-cookie"][0].match(/[^;]*/)[0];
                auth.pro.bearer = a.data.data.bearer;
                fs.writeFileSync("./auth.json", JSON.stringify(auth));
                resolve({cookie: auth.pro.cookies, bearer: auth.pro.bearer});
            }
        })
        } else reject("Something wen wrong while signing in");
      });
      // console.log(res.data);
    })
}
async function getLogin() {
    let cookies = JSON.parse(fs.readFileSync("./auth.json").toString()).pro.cookies;
    let bearer = JSON.parse(fs.readFileSync("./auth.json").toString()).pro.bearer;
    return new Promise(async (resolve, reject) => {
        try {
            if (cookies && bearer) {
            resolve({cookie: cookies, bearer: bearer});
            } else if (!cookies || !bearer) {
                login().then(token => {
                    resolve({cookie: token.cookie, bearer: token.bearer});
                }).catch(reason => reject(reason))
            }
        } catch (error) {
            console.error(error);
        }
    });
  }
async function getPlaylist(name) {
  return new Promise(async (resolve, reject) => {
      try {
        let auth = await getLogin();
        axios
        .get(`https://protvplus.ro/tv-live/${channels[name]}-${name}`, {
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
            "sec-gpc": "1",
            "upgrade-insecure-requests": "1",
            cookie: auth.cookie + ";",
          },
          referrerPolicy: "strict-origin-when-cross-origin",
          mode: "cors",
        })
        .then(async (data) => {
          let $ = cheerio.load(await data.data);
          return $(".live-iframe-wrapper.js-user-box")[0].attribs["data-url"];
        })
        .then((url) => {
          axios
            .get(url, {
              headers: {
                accept: "*/*",
                "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
                authorization:
                  `Bearer ${auth.bearer}`,
                "cache-control": "no-cache",
                pragma: "no-cache",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-origin",
                "sec-gpc": "1",
                "x-requested-with": "XMLHttpRequest",
                cookie: auth.cookie + ";",
              },
              referrer: `https://protvplus.ro/tv-live/${channels[name]}-${name}`,
              referrerPolicy: "strict-origin-when-cross-origin",
              mode: "cors",
            })
            .then(async (videoembed) => {
              let $ = cheerio.load(await videoembed.data);
              return $("iframe").attr("src");
            })
            .then((vid) => {
              axios
                .get(vid, {
                  headers: {
                    accept:
                      "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
                    "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
                    "cache-control": "no-cache",
                    pragma: "no-cache",
                    "sec-fetch-dest": "iframe",
                    "sec-fetch-mode": "navigate",
                    "sec-fetch-site": "same-site",
                    "sec-gpc": "1",
                    "upgrade-insecure-requests": "1",
                    cookie: auth.cookie + ";",
                  },
                  referrer: "https://protvplus.ro/",
                  referrerPolicy: "strict-origin-when-cross-origin",
                  mode: "cors",
                })
                .then(async (hls) => resolve(
                    JSON.parse((await hls.data).match('{"HLS"(.*)}]}')[0])
                      .HLS[0].src
                  )
                );
            });
        });
    } catch (error) {
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
  return data.match("(.*)fullhd.m3u8(.*)")[0]
    ? data.match("(.*)fullhd.m3u8(.*)")[0]
    : data.match("(.*)hd.m3u8(.*)")[0];
}
exports.pro = async (req, res, next) => {
  if (channels[req.params.channel]) {
    axios
      .get(await getPlaylist(req.params.channel), {
        headers: {
          accept: "*/*",
          "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
          "cache-control": "no-cache",
          pragma: "no-cache",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "cross-site",
          "sec-gpc": "1",
        },
        referrer: "https://media.cms.protvplus.ro/",
        referrerPolicy: "strict-origin-when-cross-origin",
        mode: "cors",
      })
      .then(async (quality) => {
        res.redirect(
          quality.config.url.match("(.*)/playlist.m3u8")[1] +
            "/" +
            selectQuality(await quality.data)
        );
      });
  } else next();
};
