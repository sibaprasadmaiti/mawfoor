module.exports = function(sequelize, DataTypes) {
    return sequelize.define('catalogPriceRule',
        {
            storeId: {
                type: DataTypes.INTEGER(11),
                allowNull: true,
            }, 
            title: {
                type: DataTypes.STRING(255),
                allowNull: true
            }, 
            description: {
                type: DataTypes.TEXT,
                allowNull: true
            },
            offerType: {
                type: DataTypes.ENUM('general','wholesale','retailers'),
                allowNull: true
            },
            discountType: {
                type: DataTypes.ENUM('fixed','percentage'),
                allowNull: true
            },
            discountValue: {
                type: DataTypes.INTEGER(11),
                allowNull: true
            },
            offerFrom: {
                type: DataTypes.DATEONLY,
                allowNull: true
            },
            offerTo: {
                type: DataTypes.DATEONLY,
                allowNull: true
            },
            customerType: {
                type: DataTypes.ENUM('new','existing'),
                allowNull: true
            },
            productCategory: {
                type: DataTypes.STRING(255),
                allowNull: true
            }, 
            productSubcategory: {
                type: DataTypes.STRING(255),
                allowNull: true
            }, 
            size: {
                type: DataTypes.STRING(255),
                allowNull: true
            }, 
            color: {
                type: DataTypes.STRING(255),
                allowNull: true
            }, 
            piece: {
                type: DataTypes.INTEGER(11),
                allowNull: true
            }, 
            sequence: {
                type: DataTypes.INTEGER(11),
                allowNull: true
            },
            status: {
                type: DataTypes.ENUM('Yes','No'),
                allowNull: false,
                defaultValue:'Yes'
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
        tableName: 'catalogPriceRule'
    })
}