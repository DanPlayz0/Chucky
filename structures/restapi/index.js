const cookieParser = require('cookie-parser'), express = require('express'), cors = require('cors');

module.exports = class RestAPI {
  constructor(config, manager) {
    this.config = config;
    this.manager = manager;

    // Web Server
    this.express = express();
    this.express.use(async (req,res,next) => { 
      req.config = this.config;
      req.manager = this.manager;

      res.sendStatus = (code) => {
        if (code == 401) return res.status(code).send({ message: "Missing Authorization" });
        else if (code == 403) return res.status(code).send({ message: "Invalid Authorization" });
        else if (code == 404) return res.status(code).send({ message: "That page is missing or never existed." });
        else if (code == 500) return res.status(code).send({ message: "Internal Server Error" });
        else return res.status(code).send({ message: `${code} - Not sure what this means` });
      }
      next();
    })
    this.express.use(cookieParser());
    this.express.use(express.json());
    this.express.use(express.urlencoded({extended: true}));
    this.express.use(cors({ origin: this.config.domain, credentials: true }));
    this.express.disable('x-powered-by');

    this.loadRoutes().loadErrorHandler();
  }

  listen(port) {
    var server = this.express.listen(port);
    return server;
  }

  loadRoutes() {
    // this.express.use("/auth", require(`./auth/index.js`));
    this.express.use("/v1", require(`./v1/index.js`));
    // this.express.use("/guild", require(`./guild/index.js`));
    return this;
  }

  loadErrorHandler() {
    this.express.use((error, _req, res, _next) => {
      const { message, statusCode = 500 } = error;
      if (statusCode >= 500) console.error(error);
      
      if(_req.accepts("json")) res.status(statusCode).send({ message, status: statusCode });
      res.type("txt").send(`${statusCode} - ${message}`);
    });

    this.express.use((_req, res, _next) => {
      if(_req.accepts("json")) return res.send({ status: 404, error: "Not found" });
      res.type("txt").send("404 - Not found");
    });

    return this;
  }
}