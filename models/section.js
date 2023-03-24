/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('section', {
      storeId: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      slug: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      shortDescription: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      sequence: {
        type: DataTypes.STRING(255),
        allowNull: true
      },      
      status: {
        type: DataTypes.ENUM('Yes','No'),
        allowNull: true
      },
      createdBy: {
        type: DataTypes.STRING(200),
        allowNull: true
      },
      updatedBy: {
        type: DataTypes.STRING(200),
        allowNull: true
      }
    }, {
      tableName: 'section'
    });
  };
  