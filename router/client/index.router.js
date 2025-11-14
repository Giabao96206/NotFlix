const ProductRouter = require("./product.router");
const homeRouter = require("./home.router");
const watchRouter = require("./watch.router");
const watchmainRouter = require("./watchmain.router");
const watchtapphimRouter = require("./watchtapphim.router");
const searchRouter = require("./search.router");
const countryRouter = require("./country.router");
const loginRouter = require("./login.router");
const signprouter = require("./signup.routerr");
const upfrofile = require("./profile.router");
const messageRouter = require("./message.router");
const callmess = require("./message.call.router");
const tuphim = require("./tuphim.router");
const adminmain = require("./trangchu.admin.router");
const quantripeople = require("./quantripeople.admin.router");
const quantriphim = require("./quantriphim.admin.router");

module.exports = (app) => {
  // app.use("/", homeRouter);
  app.use("/signup", signprouter);
  app.use("/login", loginRouter);
  app.use("/products", ProductRouter);
  app.use("/watch", watchRouter);
  app.use("/watchmain", watchmainRouter);
  app.use("/watchmain", watchtapphimRouter);
  app.use("/search", searchRouter);
  app.use("/country", countryRouter);
  app.use("/profile", upfrofile);
  app.use("/message", messageRouter);
  app.use("/callmess", callmess);
  app.use("/me/tuphim", tuphim);
  app.use("/admin", adminmain);
  app.use("/admin/users", quantripeople);
  app.use("/admin/films", quantriphim);
  app.use((req, res, next) => {
    res.setTimeout(5000, () => {
      // timeout sau 10 giây
      res.status(503).send("⏳ Server timeout. Xin vui lòng thử lại sau!");
    });
    next();
  });
};
