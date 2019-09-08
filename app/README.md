# client/serverside for "data"

## Clientside

```
yarn && yarn watch
```

Client code is hosted at `./src/` and bundled out to `./static/dist` courtesy of ParcelJS.

## Backend (hosts the clientside)

```
$ virtualenv env && source env/bin/activate && pip install -r ../requirements.txt
$ python main.py
```

Go to [the web server](http://localhost:5000).