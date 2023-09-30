const conf = require('./config.json');

const privateKey = conf.privateKey;

const port = conf.port;
const connectionString = conf.connectionString;

const port_int = parseInt(port);

module.exports = () => {
    return {
        privateKey,
        port_int,
        connectionString
    };
}