const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

const public_key = fs.readFileSync(path.join(__dirname, "public.key"));

const verifyOptions = {
  algorithms: ["RS256"],
};

module.exports = function decodeFedEdToken(token) {
  try {
    const decoded = jwt.verify(token, public_key, verifyOptions);

    decoded.exp = new Date(decoded.exp * 1000);
    decoded.iat = new Date(decoded.iat * 1000);

    return { decoded, error: null };
  } catch (error) {
    return { decoded: null, error };
  }
};
