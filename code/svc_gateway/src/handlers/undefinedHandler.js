function handleUndefinedRoutes(req, res) {
  const error = {
    status: 404,
    message: "Not Found",
  };
  res.status(404).json({ error });
}

module.exports = handleUndefinedRoutes;
