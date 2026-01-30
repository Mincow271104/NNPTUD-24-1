const jsonServer = require("json-server");
const fs = require("fs");

const server = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(jsonServer.bodyParser);

function getNextId(collection) {
  if (!collection.length) return "1";
  const maxId = Math.max(...collection.map((i) => Number(i.id)));
  return String(maxId + 1);
}

server.post(["/posts", "/comments"], (req, res, next) => {
  const db = JSON.parse(fs.readFileSync("db.json", "utf-8"));
  const collectionName = req.path.replace("/", "");
  const collection = db[collectionName];

  req.body.id = getNextId(collection);
  req.body.isDeleted = false;

  next();
});

server.delete(["/posts/:id", "/comments/:id"], (req, res) => {
  const db = router.db;
  const collectionName = req.path.split("/")[1];
  const id = req.params.id;

  const item = db.get(collectionName).find({ id }).value();
  if (!item) {
    return res.status(404).json({ message: "Not found" });
  }

  db.get(collectionName).find({ id }).assign({ isDeleted: true }).write();

  res.json({ message: "Soft deleted successfully" });
});

server.use(router);

server.listen(3000, () => {
  console.log("Server chạy tại http://localhost:3000");
});
