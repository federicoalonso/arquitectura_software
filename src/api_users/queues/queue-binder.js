const Queue = require("bull");

const bind = function (queueName) {
	try {
		return new Queue(queueName);
	} catch (err) {
		console.log(`Error al crear la cola ${queueName} ${err}`);
	}
};

module.exports = {
	bind,
};
