## API Endpoints
### APlay
```
/live/:channel --> Live feed of a tv channel (see antena.js file)

/shows --> List of tv shows currently listed statically

/show/play/:showid/:epid --> Play one episode of a show

/show/:showid/ --> Get show episodes
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
Create a file auth.json with the following format and fill in blank with the appropriate values
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