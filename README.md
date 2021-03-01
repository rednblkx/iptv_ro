## Disclaimer
This script is not officially commissioned/supported by DIGI, Antena or ProTV. 
For more information about digionline, antenaplay or protvplus, visit their official website.

This script offers a way to retrieve the streams using the credentials PROVIDED BY YOU.

THIS SCRIPT DOES NOT OFFER FREE IPTV.

THERE IS NO WARRANTY FOR THE SCRIPT, IT MIGHT NOT WORK AT ALL AND IT CAN BREAK AND STOP WORKING AT ANY TIME.

## API Endpoints
### APlay
```
/:channel(?ts=1) --> Live feed of tv channel (see antena.js file for channel IDs)

/shows --> List of all the TV Series

/ems --> List of TV Shows

/show/:showid --> Year & Month Selector for :showid episodes

/show/:showid?year=:year&month=:month --> Get Episodes from Year :year & Month :month

/show/play/:showid/:epid --> Play episode :epid of a show :showid

```
### DiGi
```
/:channel(.m3u8)?ts=(0||1)&quality=(hq||mq||lq) --> Live feed of :channel (see digionline.js file for channel ids)
/:channel/epg --> EPG for :channel
```
Note: digi24, digisport1, digisport2, digisport3, digisport4 are available without account.

Note 2: For VLC use the "ts=1" query string(this is because digi banned the ffmpeg & VLC user-agents from accessing the main playlist but not the playlists with the .ts files)

quality -> Choose the stream quality (see below)

ts -> The API sends a playlist that has full-links for .ts and .key (see example below)

Stream Qualities available:
- hd - 1888595 - 1280x720 ( only for digi24, digisport1, digisport2, digisport3, digisport4 )
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
### ProPlus
```
/:channel --> Live feed of a tv channel (see protv.js file)
```

## Authentication

Acces login configuration page at "/login", select the desired service and fill accordingly.

------------------------------------

## Notes


&copy; **This project is licensed under the terms of the MIT license.**
