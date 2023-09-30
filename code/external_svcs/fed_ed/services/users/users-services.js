const bcrypt = require("bcrypt");
var dbModels;

const setDbModels = function (models) {
	dbModels = models;
};

const create = async function () {
	let saltRounds = 10;

	const users_json = require("./users.json");
	const users = users_json.users;

	console.log("Creating users...");

	for (let i = 0; i < users.length; i++) {
		let user = users[i];
		let hash = await bcrypt.hash(user.password, saltRounds);
		user.password = hash;
		let userFound = await dbModels.User.findByPk(user.email);
		if (userFound) {
			console.log("User already exists: " + JSON.stringify(userFound));
			return;
		}
		let newUser = await dbModels.User.create(user);
		console.log("User created: " + JSON.stringify(newUser));
	}
};

const getUser = async function (email) {
	let user = await dbModels.User.findByPk(email);
};

const login = async function (email, password) {
	let user = await dbModels.User.findByPk(email);
	let match = await bcrypt.compare(password, user.password);
	return match;
};

module.exports = {
	create,
	getUser,
	login,
	setDbModels,
};
