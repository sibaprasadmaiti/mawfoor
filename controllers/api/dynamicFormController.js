const models = require('../../models');
const config = require('../../config/config.json');
const Sequelize = require("sequelize");
const Op = Sequelize.Op
const sequelizee = new Sequelize(
    config.development.database, 
    config.development.username,
    config.development.password, {
      host: 'localhost',
      dialect: 'mysql',
      pool: {
        max: 5,
        min: 0,
        idle: 10000
      },
    }
);
/**
* Description:  dynamic form listing
* Developer:Partha Mandal
**/
exports.dynamicForm = async (req, res, next) =>{
	const storeId =req.body.data.storeId;
	const title =req.body.data.title;
	if(storeId && storeId != '' && storeId != null) {
        const dynamicFormData = await models.dynamicforms.findAll({ attributes:['id','formName','tableName','title'], where: { storeId: storeId,title: { [Op.like]: `%${title}%` }, status:'Yes' },  include: [{ attributes:['id','dynamicFormId','fieldName','displayName','dataType','fileType','label','required','requiredMessage','regularExpression','regexMessage','placeholder','multiSelect'], model:  models.dynamicformfields, include: [{ attributes:['id','dynamicFormId','dynamicFormFieldId','label','values'], model: models.dynamicformfieldvalues, required: false }]}], order: [[ models.dynamicformfields, 'position', 'ASC']] });

        if(dynamicFormData) {
			if(dynamicFormData.length > 0){
				return res.status(200).send({ data:{success:true, details:dynamicFormData}, errorNode:{errorCode:0, errorMsg:"No Error"}});
			} else {
				return res.status(200).send({ data:{success:false, details:[]}, errorNode:{errorCode:0, errorMsg:"No Data found"}});
			}
		}else {
			return res.status(500).send({ data:{success:false, details:[]}, errorNode:{errorCode:1, errorMsg:"Something went wrong! Please try again"}});
		}
	} else {
		return res.status(400).send({ data:{success:false, details:[]}, errorNode:{errorCode:1, errorMsg:"Please fill the required field"}});
	}
};

/**
* Description:  dynamic form data save
* Developer:Partha Mandal
**/
exports.saveData = async (req, res) => {
	const id = req.body.data.id;
	const tableName = req.body.data.tableName;

	sequelizee.query(`SELECT * FROM ${tableName} LIMIT 1`, { type: sequelizee.QueryTypes.SELECT }).then(async(jsonData)=>{
		console.log(jsonData);
		
		let commingColumns = Object.keys(req.body.data.formValue); // Create an array of Fields Name coming from frontend

		let existColumns = []; 

		// Get all fields name which is already exist into table and create an array
		for(let obj in jsonData){
			if(jsonData.hasOwnProperty(obj)){
				for(let prop in jsonData[obj]){
					existColumns.push(prop);
				}
			}
		}
		
		// This function is created for compare 2 arrays
		const sub = (x, y) => {
			myArray = x.filter((el) => {
				return y.indexOf(el) < 0;
			});
			return myArray;
		};
		
		// Pass 2 arrays and get the new fields 
		let newFields = sub(commingColumns, existColumns);
		
		// If get any new fields then alter table and after that insert into table
		if(newFields){
			for(let item of newFields){
				await sequelizee.query(`ALTER TABLE ${tableName} ADD COLUMN ${item} VARCHAR(255)`)
			}
			let query = `INSERT INTO ${tableName} (`
			let value = '';
			
			Object.keys(req.body.data.formValue).forEach((item, index) => {
				if(index === Object.keys(req.body.data.formValue).length -1){
					query+= `${item} `;
					value += `'${req.body.data.formValue[item]}'`
				}else{
					query+= `${item}, `;
					value += `'${req.body.data.formValue[item]}',`
				}
			})
			query +=') VALUES ('+ value + ');';
			sequelizee.query(query).then((success)=>{
				return res.status(201).send({ data:{success:true, details:""}, errorNode:{errorCode:0, errorMsg:"Successfully Submitted"}});
			}).catch((error)=>{
				return res.status(400).send({ data:{success:false, details:""}, errorNode:{errorCode:1, errorMsg:"Something wend wrong"}});
			})
			
		// If not get any new field then directly insert into existing table
		}else{
			let query = `INSERT INTO ${tableName} (`
			let value = '';
			
			Object.keys(req.body.data.formValue).forEach((item, index) => {
				if(index === Object.keys(req.body.data.formValue).length -1){
					query+= `${item} `;
					value += `'${req.body.data.formValue[item]}'`
				}else{
					query+= `${item}, `;
					value += `'${req.body.data.formValue[item]}',`
				}
			})
			query +=') VALUES ('+ value + ');';
			sequelizee.query(query).then((success)=>{
				return res.status(201).send({ data:{success:true, details:""}, errorNode:{errorCode:0, errorMsg:"Successfully Submitted"}});
			}).catch((error)=>{
				return res.status(400).send({ data:{success:false, details:""}, errorNode:{errorCode:1, errorMsg:"Something wend wrong"}});
			})
		}       
	
	// If table not exist then create table first and after that insert data into table
	}).catch(async(error)=>{
		let arr = await models.dynamicformfields.findAll({attributes: ['fieldName', 'dataType'], where: { dynamicFormId: id } });
		let query = '';
		for(let item of arr){
			query+= `, ${item.fieldName} VARCHAR(255) `;
		}
		sequelizee.query(`CREATE TABLE IF NOT EXISTS ${tableName}(id int NOT NULL PRIMARY KEY AUTO_INCREMENT ${query})`).then((ok)=>{
			let query = `INSERT INTO ${tableName} (`
			let value = '';
			
			Object.keys(req.body.data.formValue).forEach((item, index) => {
				
				if(index === Object.keys(req.body.data.formValue).length -1){
					query+= `${item} `;
					value += `'${req.body.data.formValue[item]}'`
				}else{
					query+= `${item}, `;
					value += `'${req.body.data.formValue[item]}',`
				}
			})
			query +=') VALUES ('+ value + ');';
			sequelizee.query(query).then((success)=>{
				return res.status(201).send({ data:{success:true, details:""}, errorNode:{errorCode:0, errorMsg:"Successfully Submitted"}});
			}).catch((error)=>{
				return res.status(400).send({ data:{success:false, details:""}, errorNode:{errorCode:1, errorMsg:"Something wend wrong"}});
			})
		});
	});
}

/**
* Description:  dynamic form listing
* Developer:Partha Mandal
**/
exports.formList = async (req, res) =>{
	const storeId =req.body.data.storeId;
	if(storeId && storeId != '' && storeId != null) {
        const formList = await models.dynamicforms.findAll({ attributes:['id','formName','title','status','createdAt'], where: { storeId: storeId }})

		if(formList.length > 0){
			return res.status(200).send({ data:{success:true, details:formList}, errorNode:{errorCode:0, errorMsg:"No Error"}})
			// return res.status(200).send({ data:{success:true, details:[]}, errorNode:{errorCode:0, errorMsg:"No Error"}})
		} else {
			return res.status(200).send({ data:{success:true, details:[]}, errorNode:{errorCode:0, errorMsg:"No Data found"}});
		}
	} else {
		return res.status(400).send({ data:{success:false, details:"StoreId is required"}, errorNode:{errorCode:1, errorMsg:"Please fill the required field"}})
	}
}

/**
* Description:  dynamic form details
* Developer:Partha Mandal
**/
exports.formDetails = async (req, res) =>{
	const storeId =req.body.data.storeId;
	const id =req.body.data.id;
	if(storeId && storeId != '' && storeId != null && storeId != undefined && id && id != '' && id != null && id != undefined) {
        const tableName = await models.dynamicforms.findOne({attributes:['tableName'], where: { id: id } });
		const dynamicforms = await models.dynamicformfields.findAll({attributes:['fieldName','displayName'], where: { dynamicFormId: id } })

		const details = await sequelizee.query(`SELECT * FROM ${tableName.tableName}`,{ type: sequelizee.QueryTypes.SELECT })

		if(details.length > 0){
			return res.status(200).send({ data:{success:true, fields:dynamicforms, details:details}, errorNode:{errorCode:0, errorMsg:"No Error"}})
		} else {
			return res.status(200).send({ data:{success:true, fields:dynamicforms, details:[]}, errorNode:{errorCode:0, errorMsg:"No Data found"}});
		}
	} else {
		return res.status(400).send({ data:{success:false, details:[]}, errorNode:{errorCode:1, errorMsg:"Please fill the required field"}})
	}
}

/**
* Description:  dynamic form delete
* Developer:Partha Mandal
**/
exports.formDelete = async (req, res) =>{
	const storeId =req.body.data.storeId;
	const id =req.body.data.id;
	if(storeId && storeId != '' && storeId != null && storeId != undefined && id && id != '' && id != null && id != undefined) {
        await models.dynamicforms.destroy({where: { storeId:storeId,id: id } }).then(()=>{
			return res.status(200).send({ data:{success:true, details:"Successfully Deleted"}, errorNode:{errorCode:0, errorMsg:"No Error"}})
		}).catch((err)=>{
			return res.status(500).send({ data:{success:false, details:"Something went wrong"}, errorNode:{errorCode:1, errorMsg:err}})
		})
	} else {
		return res.status(400).send({ data:{success:false, details:"Please fill the required field"}, errorNode:{errorCode:1, errorMsg:"Please fill the required field"}})
	}
}