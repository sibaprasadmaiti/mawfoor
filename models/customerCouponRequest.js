module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
        "customerCouponRequest",
        {
            storeId: {
                type: DataTypes.INTEGER(10),
                allowNull: true,
            },
            customerId: {
                type: DataTypes.INTEGER(10),
                allowNull: true,
            },
            status: {
                type: DataTypes.STRING(200),
                // type: DataTypes.ENUM("Active","Inactive"),
                allowNull: true,
                // defaultValue : 'Active'
            },
            createdBy: {
                type: DataTypes.STRING(100),
                allowNull: true,
            },
            updatedBy: {
                type: DataTypes.STRING(100),
                allowNull: true,
            }
        },
        {
            tableName: "customerCouponRequest",
            comment:"customer Coupon Request Table",
        }
    )
}