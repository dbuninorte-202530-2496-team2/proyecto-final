import express from 'express';

const apiRouter = express.Router();

apiRouter.get("/", (req, res) => {
  res.json({
    from: "backend :)",
    message: "un poco de aplicacion en mi  docker"
  });
});

export default apiRouter;