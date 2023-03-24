module.exports = function(sequelize, DataTypes) {
    return sequelize.define('cartPriceRuleAttributes',
        {
            storeId: {
                type: DataTypes.INTEGER(11),
                allowNull: true,
            },
            cartPriceRuleId: {
                type: DataTypes.INTEGER(11),
                allowNull: true,
            },
            attributeName: {
                type: DataTypes.STRING(255),
                allowNull: true
            }, 
            condition: {
                type: DataTypes.ENUM('gte','lte','eq','in'),
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
        tableName: 'cartPriceRuleAttributes'
    })
}