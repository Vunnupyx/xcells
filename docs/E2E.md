End-To-End Tests
================

Goals
-----

End-to-end tests are designed to run a software in an environment as the end user will do. In our case that
means spinning up a browser and navigating through the app (and later interact with the render engine).

Technologies
------------

1. Selenium[1]: Browser remote control software
2. Jest: JavaScript testing library
3. Docker and docker-compose: starting the infrastructure

Install
-------

The requirements to run the tests are only:
1. Working Dev Environment (backend and frontend)
2. Docker
3. `docker-compose`
4. E2E test dependencies: ```cd e2e && npm install```

Configuration
-------------

You need to identify, on which IP your dev server is reachable from within a docker container.
Typically, this is 172.17.0.1 and if so and your dev setup is running on the default port 3000, there is nothing 
you need to configure. If the port or the IP address differs from the default, set the target URL via environment
variable:

```bash
export TARGET_URL="http://${IP}:${PORT}",
```

More configuration parameters can be found in the tests. Look for `process.env`.

Run
---

1. start your database, frontend and backend in dev mode
2. start the docker-compose in `./e2e`: `docker-compose up -d`
3. (optional) open a VNC Client and connect to `localhost`
4. run the tests: `npm run test`

How does this work?
-------------------

The docker compose starts a Selenium[1] instance. It is a browser (in this case a chrome browser) packaged inside a 
graphical linux environment, which starts a VNC Server to allow you to watch and debug the tests while they are running.  

[1]: https://www.selenium.dev/