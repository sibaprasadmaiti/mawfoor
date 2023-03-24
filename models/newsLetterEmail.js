module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
      "newsLetterEmail",
      {
        storeId: {
         type: DataTypes.INTEGER(10),
         allowNull: true,
        },
        newsLetterId: {
         type: DataTypes.INTEGER(10),
         allowNull: true,
        },
        emails: {
          type: DataTypes.STRING(100),
          allowNull: true,
        }
      },
      {
        tableName: "newsLetterEmail",
        comment:"News Letter Email Table",
      }
    );
  };