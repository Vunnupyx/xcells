Logging
=======

Both the frontend and the backend use the same logging library ['debug'](npm-debug). It allows to filter for specific
components or log levels.

Other libraries in use also use this logging library. That means if you set the filter to '*' (which means all outputs),
you will also receive logs from socket.io and possibly other components.

**NOTE:** currently the frontend uses the 'app:' prefix while the backend uses 'infinity:'. This is scheduled to change
in one of the coming releases.

Frontend
--------

Set `localStorage.debug` to reflect the desired debug level. The app sets a default debug level of

```
localStorage.debug = 'app:*::ERROR'
```

which displays only errors. For development consider

```
localStorage.debug = 'app:*,-app:*::FLOOD'
```

which displays all logs beside the FLOOD level. If you want to see only logs of a specific component you can use

```
localStorage.debug = 'app:RenderEngine*'
```

which will also include FLOOD level.

Backend
-------

The prefix for logs in the backend is `infinity:*`. The prefix of the frontend will be adapted to this in the near
future.

You can set a debug level with the help of an environment variable:

```
DEBUG="infinity:*" npm run dev
```

[npm-debug]: https://www.npmjs.com/package/debug
