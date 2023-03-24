module.exports = function(sequelize, DataTypes) {
    return sequelize.define('catalogPriceRuleAttributes',
        {
            storeId: {
                type: DataTypes.INTEGER(11),
                allowNull: true,
            },
            catalogPriceRuleId: {
                type: DataTypes.INTEGER(11),
                allowNull: true,
            },
            attributeName: {
                type: DataTypes.STRING(255),
                allowNull: true
            }, 
            attributeValue: {
                type: DataTypes.STRING(255),
                allowNull: true
            },
            createdBy: {
                type: DataTypes.STRING(128),
                allowNull: true
            },
            updatedBy: {
                type: DataTypes.STRING(128),
                allowNull: true
            }
        },
        {
        tableName: 'catalogPriceRuleAttributes'
    })
}