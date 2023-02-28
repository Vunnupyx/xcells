
# Technical Stuff

Project is based on a nodejs backend and a reactjs/pixijs frontend.

## backend

The backend is an async implementation with the koa web framework[1]. It uses
Socket.IO[2] for real time updates and provides a REST API for other communication.
The map store uses the same technology as the frontend: automerge[3].

## frontend

The frontend was initialized with create-react-app[4]. It uses react[5] hooks for forms,
menus etc. The render engine is based on pixijs[6] and uses pixi-viewport[7].

## communication architecture

TODO

## render engine architecture

TODO

# setup

## install

1. Go to your gitlab profile page, create a "Deploy Token". Save the user and the password.

2. git clone https://gitlab.awesome-it.de/imaps/imaps.git into a local directory, for
example `~/src/infinity`

3. run the backend:
    * `cd ~/src/infinity/backend`
    * `nvm use` (If you use nvm, install the correct version of Node.js, defined in .nvmrc)
    * `npm install`
    * `npm run dev`

4. run the frontend:
    * `cd ~/src/infinity/frontend`
    * `nvm use` (If you use nvm, install the correct version of Node.js, defined in .nvmrc)
    * `npm install`
    * `npm run start`

5. add a local user:
    * `cd ~/src/infinity/backend`
    * `npx babel-node src/scripts/createUser.js dev dev@example.com dev subscriber`
    * `npx babel-node src/scripts/createUser.js admin admin@example.com admin subscriber,administrator`

Both webservers should restart automatically, whenever you change a file. In
the dev setup, all request should go to the frontend. It will automatically
forward api requests to the backend.

## database

a mongodb is needed to run the backend:

```
docker run -d --restart=unless-stopped -v /var/lib/mongodb/:/data/db -p 127.0.0.1:27017:27017 mongo:4.0 mongod --smallfiles
```

This will start a docker container, which will be started when the system starts (--restart=unless-stopped). It uses the path
`/var/lib/mongodb` (-v) and connect the mongodb default port to the localhost interface (-p).

### remove changes from a map

If someone duplicates huge amounts of data, they will reach the database limit fast.

```
db.mapchanges.aggregate([{$match: {mapId: 'Tj6pmHdL8d7'}}, {$project: {_id: 1, mapId: 1, size: {$size: "$changes"}}}])
db.mapchanges.update({mapId: 'Tj6pmHdL8d7'}, {$unset: {'changes.1125': 1}})
db.mapchanges.update({mapId: 'Tj6pmHdL8d7'}, {$pull: {'changes': null}})
```

[1]: https://github.com/koajs/koa
[2]: https://github.com/socketio/socket.io
[3]: https://github.com/automerge/automerge
[4]: https://github.com/facebook/create-react-app
[5]: https://github.com/facebook/react
[6]: https://github.com/pixijs/pixi.js
[7]: https://github.com/davidfig/pixi-viewport
