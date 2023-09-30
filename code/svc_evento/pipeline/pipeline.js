const { pipeline } = require("../conf/config")();

function deferBinding() {
  let type = pipeline || "direct";
  let implementation;
  try {
    implementation = require(`./${type}-pipeline`);
  } catch (err) {
    // Use default implementation
    implementation = require("./direct-pipeline");
  }
  return implementation;
}

module.exports = deferBinding();
