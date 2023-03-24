module.exports = function(sequelize, DataTypes) {
    return sequelize.define('cartPriceRule',
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
            discountType: {
                type: DataTypes.ENUM('fixed','percentage'),
                allowNull: true
            },
            discountValue: {
                type: DataTypes.INTEGER(11),
                allowNull: true
            },
            minDiscountValue: {
                type: DataTypes.INTEGER(11),
                allowNull: true
            },
            maxDiscountValue: {
                type: DataTypes.INTEGER(11),
                allowNull: true
            },
            purchaseLimit: {
                type: DataTypes.INTEGER(11),
                allowNull: true
            },
            offerFrom: {
                // type: DataTypes.DATE,
                type: DataTypes.DATEONLY,
                allowNull: true
            },
            offerTo: {
                // type: DataTypes.DATE,
                type: DataTypes.DATEONLY,
                allowNull: true
            },
            customerType: {
                type: DataTypes.ENUM('new','existing'),
                allowNull: true
            },
            couponType: {
                type: DataTypes.ENUM('noCoupon','specificCoupon'),
                allowNull: true
            }, 
            couponCode: {
                type: DataTypes.STRING(255),
                allowNull: true
            },
            usesPerCoupon: {
                type: DataTypes.INTEGER(11),
                allowNull: true
            },
            usesPerCustomer: {
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
        tableName: 'cartPriceRule'
    })
}