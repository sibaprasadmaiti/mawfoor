var path = require('path');

var config_path = path.join(__dirname, '..', 'config', 'config.json');
//console.log(config_path +"jjjjjjjjjjjjjj");

var config = require(config_path);
var Sequelize = require("sequelize");
exports.sequelize = new Sequelize(
	config.development.database, 
	config.development.username,
	config.development.password, {
		host: 'localhost',
		dialect: 'mysql',
		pool: {
			max: 5,
			min: 0,
			idle: 10000
		}
	}
);