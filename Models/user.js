// making user class for mysql for now
var Sequelize = require('sequelize');
var bcrypt = require('bcrypt-nodejs');

var sequelize = new Sequelize(process.env.RDS_DB_NAME,process.env.RDS_USERNAME,process.env.RDS_PASSWORD,{
    host: process.env.RDS_HOST,
    dialect: 'mysql',

    pool: {
        max:5,
        min:0,
        acquire:30000,
        idle:10000
    }
});

// setup User model and its fields.
// Think about contact number being unique
var User = sequelize.define('users', {
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    lastname: {
        type: Sequelize.STRING,
        allowNull: true
    },
    email: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
    },
    contact: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    },
    Role: {
        type: Sequelize.STRING,
        default: 'student'
    },
    college: {
    	type: Sequelize.STRING,
        allowNull: false
    },
    rdvId: {
    	type: Sequelize.STRING,
        allowNull: false
    },
    gender: {
    	type: Sequelize.Integer,
    	allowNull: false
    }
    rdvPoints:{
    	type: Sequelize.Integer,
    	allowNull: false
    }
    verify: {
        type: Sequelize.INTEGER,
        default: 0
    }
}, {
    hooks: {
      beforeCreate: (user) => {
        const salt = bcrypt.genSaltSync();
        user.password = bcrypt.hashSync(user.password, salt);
      }
    },
    instanceMethods: {
      validPassword: function(password) {
        return bcrypt.compareSync(password, this.password);
      }
    }    
});

User.prototype.validPassword = function(password) {
        return bcrypt.compareSync(password, this.password);
      }

// Sequel sync
sequelize.sync()
    .then(() => console.log('users table has been successfully created, if one doesn\'t existed before'))
    .catch(error => console.log('This error occured: ', error));

// export User model for use in other files.
module.exports = User;