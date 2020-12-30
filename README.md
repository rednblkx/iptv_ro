## API Endpoints
### APlay
```
/:channel --> Live feed of tv channel (see antena.js file for channel IDs)

/shows --> List of all the tv shows

/show/:showid --> Year & Month Selector for :showid episodes

/show/:showid?year=:year&month=:month --> Get Episodes from Year :year & Month :month

/show/play/:showid/:epid --> Play episode :epid of a show :showid

```
### DiGi
```
/:channel(.m3u8) --> Live feed of a tv channel (see digionline.js file)
```

### ProPlus
```
/:channel --> Live feed of a tv channel (see protv.js file)
```
## Authentication
Create a file auth.json with the following format and fill in the blanks with the appropriate values
```json
{
  "antena": {
    "username": "",
    "password": "",
  },
  "digi": {
    "username": "",
    "password": "",
  },
  "pro": {
    "username": "",
    "password": "",
  }
}

```
