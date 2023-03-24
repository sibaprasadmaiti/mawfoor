/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "products",
    {
      id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      storeId: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
      },
      sku: {
        type: DataTypes.STRING(64),
        allowNull: true,
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      slug: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      url: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      shortDescription: {
        type: DataTypes.TEXT(),
        allowNull: true,
      },
      description: {
        type: DataTypes.TEXT(),
        allowNull: true,
      },
      searchKeywords: {
        type: DataTypes.TEXT(),
        allowNull: true,
      },
      topNotes: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      middleNotes: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      baseNotes: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      price: {
        type: DataTypes.DECIMAL(10,2),
        allowNull: true,
      },
      specialPrice: {
        type: DataTypes.DECIMAL(10,2),
        allowNull: true,
      },
      specialPriceFrom: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      specialPriceTo: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      bestSellers: {
        type: DataTypes.ENUM("yes","no"),
        allowNull: true,
        defaultValue: "no",
      },  
      newArrivals: {
        type: DataTypes.ENUM("yes","no"),
        allowNull: true,
        defaultValue: "no",
      },   
      spicey: {
        type: DataTypes.ENUM("yes","no"),
        allowNull: true,
        defaultValue: "no",
      },
      taxClassId: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
      },  
      weight: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },  
      isConfigurable: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        defaultValue: 0,
      },  
      metaTitle: {
        type: DataTypes.TEXT(),
        allowNull: true,
      },   
      metaKey: {
        type: DataTypes.TEXT(),
        allowNull: true,
      },    
      metaDescription: {
        type: DataTypes.TEXT(),
        allowNull: true,
      },  
      metaImage: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      optionTitle: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },   
      optionType: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },    
      optionValue: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },     
      color: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },      
      size: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },      
      brand: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },       
      application: {
        type: DataTypes.TEXT(),
        allowNull: true,
      },       
      type: {
        type: DataTypes.STRING(30),
        allowNull: true,
      },        
      fromDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },        
      fromTime: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },         
      toDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },        
      toTime: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },     
      visibility: {
        type: DataTypes.ENUM("Not Visible Individually", "Catalog"),
        allowNull: true,
        defaultValue: "Catalog",
      }, 
      sequence:{
        type: DataTypes.INTEGER(10),
        allowNull: true,
      },    
      status: {
        type: DataTypes.ENUM("active", "inactive"),
        allowNull: true,
        defaultValue: "active",
      },   
      inventory: {
        type: DataTypes.ENUM("alwaysInStock","manageStock"),
        allowNull: true,
        defaultValue: "alwaysInStock",
      },     
      attr1: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },       
      attr2: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },       
      attr3: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },       
      attr4: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },       
      attr5: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },       
      attr6: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },       
      attr7: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },       
      attr8: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },       
      attr9: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },       
      attr10: {
        type: DataTypes.STRING(100),
        allowNull: true,
      }, 
      createdBy: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      updatedBy: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "products",
      comment:"Products Table",
    }
  );
};