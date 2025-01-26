> [!WARNING]  
> Project no longer maintained and has been deprecated in favor of [iptvro_v2](https://github.com/rednblkx/iptvro_v2)

## Disclaimer
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fredmusicxd%2Fiptv_ro.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2Fredmusicxd%2Fiptv_ro?ref=badge_shield)

This script is not officially commissioned/supported by DIGI, Antena or ProTV. 
For more information about digionline, antenaplay or protvplus, visit their official website.

This script offers a way to retrieve the streams using the credentials PROVIDED BY YOU.

THIS SCRIPT DOES NOT OFFER FREE IPTV.

THERE IS NO WARRANTY FOR THE SCRIPT, IT MIGHT NOT WORK AT ALL AND IT CAN BREAK AND STOP WORKING AT ANY TIME.

## API Endpoints
### **APlay**

```
/:channel(?ts=true&cached=true) --> Live feed of :channel

/antena/channels --> Get the available channel list

/shows(?format=html) --> List of all the TV Series

/ems(?page=:page) --> List of TV Shows

/show/:showid --> Year & Month Selector for :showid episodes

/show/:showid?year=:year&month=:month --> Get Episodes from Year :year & Month :month

/show/play/:showid/:epid --> Play episode :epid of a show :showid

/antena/flush(?channel=:channel) --> Flush cached urls

```

**Notes** 

Use value "get" for "quality" paramater to get links for every bitrate.

Responses for "/ems" and "/shows" endpoints are by default JSON, use "format" query paramater with "html" value for an HTML response.

"/ems" endpoint is paginated by the platform, use "page" query paramater to select page, total of pages is stated in "meta" object, "total_pages" key.

"/:channel" endpoint has the cached option to use in memory url.

### **DiGi**
```
/:channel(.m3u8)?ts=(0||1)&quality=(hq||mq||lq) --> Live feed of :channel

/digi/channels --> Get the available channel list

/:channel/epg --> EPG for :channel

/digi/flush(?channel=:channel) --> Flush cached urls
```
**Notes** 

Use value "get" for "quality" paramater to get links for every bitrate.

digi24, digisport1, digisport2, digisport3, digisport4 are available without account.

For VLC use the "ts=1" query string(this is because digi banned the ffmpeg & VLC user-agents from accessing the main playlist but not the playlists with the .ts files)

quality -> Choose the stream quality (see below)

ts -> The API sends a playlist that has full-links for .ts and .key (see example below)

Stream Qualities available:
- hd - 1888595 - 1280x720 ( only for digi24, digisport1, digisport2, digisport3, digisport4, kanal-d )
- hq - 1213681 - 1024x576
- mq - 296020 - 640x360
- lq - 296020 - 320x180

Example Response

Initial
```
#EXTM3U
#EXT-X-VERSION:3
#EXT-X-TARGETDURATION:6
#EXT-X-MEDIA-SEQUENCE:192729
#EXT-X-KEY:METHOD=AES-128,URI="stream.key"
#EXTINF:6.0,
stream.ts
```

Rewrited
```
#EXTM3U 
#EXT-X-VERSION:3 
#EXT-X-TARGETDURATION:6
#EXT-X-MEDIA-SEQUENCE:192712
#EXT-X-KEY:METHOD=AES-128,URI="https://xxxx.yyyy.zzz/stream.key"
#EXTINF:6.0,
https://xxxx.yyyy.zzz/stream.ts
```
### **ProPlus**
```
/:channel(?quality=(hq,mq,lq)) --> Live feed of a tv channel

/pro/channels --> Get the available channel list
```

**Notes**

Use value "get" for "quality" paramater to get links for every bitrate.

You have to add the following HTTP Header to every stream to be able to watch:

- Referer: https://media.cms.protvplus.ro/

## Authentication

Acces login configuration page at "/login", select the desired service and fill accordingly.

------------------------------------

## Notes

config.json - here set some defaults, adjust accordingly as following:

 
1. Antena
    - res_format: receive response in JSON or HTML (possible values "json" or "html")
    - cache_url: whether the stream url should be kept in memory for cache_expire_ms miliseconds (6 hours by default - 2.16e+7)
    - cache_expire_ms - time for cached url to be saved
    - rewrite_url: url up to .ts files rewriting to absolute path
    - quality: the quality (bitrate) of the stream
2. Pro
    - quality: the quality (bitrate) of the stream


&copy; **This project is licensed under the terms of the MIT license.**


## License
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fredmusicxd%2Fiptv_ro.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2Fredmusicxd%2Fiptv_ro?ref=badge_large)
