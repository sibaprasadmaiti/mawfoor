const models = require('../../models')
const fs = require("file-system");

exports.questionaireList = async (req, res) =>{
	const storeId =req.body.data.storeId || '';

	if(storeId && storeId != '' && storeId != null) {
        const questionaire = await models.questionaire.findAll({where: { storeId:storeId}})

        if(questionaire.length > 0){
            return res.status(200).send({ data:{success:true, details:questionaire}, errorNode:{errorCode:0, errorMsg:"No Error"}})
        } else {
            return res.status(200).send({ data:{success:true, details:[]}, errorNode:{errorCode:0, errorMsg:"No Error"}})
        }
	} else {
		return res.status(400).send({ data:{success:false, details:[]}, errorNode:{errorCode:1, errorMsg:"storeId is required"}})
	}
}

exports.questionaireView = async (req, res) =>{
	const storeId =req.body.data.storeId || '';
	const id =req.body.data.id || '';

	if(storeId && storeId != '' && storeId != null) {
        if (id != '') {
            const questionaire = await models.questionaire.findOne({where: { storeId:storeId, id:id}})
            return res.status(200).send({ data:{success:true, title: 'Edit Questionnarie', details:questionaire}, errorNode:{errorCode:0, errorMsg:"No Error"}})
        } else {
            return res.status(200).send({ data:{success:true, title: 'Add Questionnarie', details:''}, errorNode:{errorCode:0, errorMsg:"No Error"}})
        }
	} else {
		return res.status(400).send({ data:{success:false, details:[]}, errorNode:{errorCode:1, errorMsg:"storeId is required"}})
	}
}

exports.questionaireCreate = async (req, res) =>{
	const {updateId,storeId,title,description,mediaUrl,timeInMinute,totalQuestion} =req.body.data

	if(storeId && storeId != '' && storeId != null) {
        if (!updateId) {
            await models.questionaire.findAndCountAll({ where:{title:title, storeId:storeId}}).then(async (value)=>{
                let slug
                if(value.count >= 1){														
                  slug = title.toString().toLowerCase().replace(/\s+/g, '-')+"-"+(value.count)
                }else{
                  slug = title.toString().toLowerCase().replace(/\s+/g, '-')
                }
                await models.questionaire.create({
                    storeId: storeId,
                    title: title,
                    slug:slug,
                    mediaUrl: mediaUrl,
                    description: description,
                    timeInMinute: timeInMinute,
                    totalQuestion: totalQuestion
                }).then(()=>{
                    return res.status(201).send({ data:{success:true, message:"Successfully created"}, errorNode:{errorCode:0, errorMsg:"No Error"}})
                }).catch((err)=>{
                    console.log(err)
                    return res.status(500).send({ data:{success:false, message:"Something went wrong !"}, errorNode:{errorCode:1, errorMsg:"Internal server error"}})
                })
            }).catch((err)=>{
                console.log(err)
                return res.status(500).send({ data:{success:false, message:"Something went wrong !"}, errorNode:{errorCode:1, errorMsg:"Internal server error"}})
            })
        } else {
            await models.questionaire.update({
                storeId: storeId,
                title: title,
                mediaUrl: mediaUrl,
                description: description,
                timeInMinute: timeInMinute,
                totalQuestion: totalQuestion
            }, {where:{id:updateId}}).then(()=>{
                return res.status(201).send({ data:{success:true, message:"Successfully updated"}, errorNode:{errorCode:0, errorMsg:"No Error"}})
            }).catch((err)=>{
                console.log(err)
                return res.status(500).send({ data:{success:false, message:"Something went wrong !"}, errorNode:{errorCode:1, errorMsg:"Internal server error"}})
            })
        }
	} else {
		return res.status(400).send({ data:{success:false, details:[]}, errorNode:{errorCode:1, errorMsg:"storeId is required"}})
	}
}

exports.questionaireDelete = async (req, res) =>{
	const id =req.params.id
	if(id && id != '' && id != null) {
        await models.questionaire.findOne({where:{id:id}}).then(async(value)=>{
            if (value) {
                await models.questionaire.destroy({where: {id:id}}).then(()=>{
                    return res.status(200).send({ data:{success:true, message:"Successfully deleted"}, errorNode:{errorCode:0, errorMsg:"No Error"}})
                }).catch((err)=>{
                    console.log(err)
                    return res.status(500).send({ data:{success:false, message:"Something went wrong !"}, errorNode:{errorCode:1, errorMsg:"Internal server error"}})
                })
            } else {
                return res.status(200).send({ data:{success:false, message:"Id not match"}, errorNode:{errorCode:1, errorMsg:"No Error"}})
            }
        }).catch((err)=>{
            console.log(err)
            return res.status(500).send({ data:{success:false, message:"Something went wrong !"}, errorNode:{errorCode:1, errorMsg:"Internal server error"}})
        })
	} else {
		return res.status(400).send({ data:{success:false, details:[]}, errorNode:{errorCode:1, errorMsg:"Id is required"}})
	}
}

exports.questionsList = async (req, res) =>{
    const storeId =req.body.data.storeId || '';
    const questionaireId =req.body.data.questionaireId || '';

    if(storeId && storeId != '' && storeId != null && questionaireId != '') {
        const questionaire = await models.questionaire.findOne({attributes:['title'], where: { id: questionaireId } });
        const questions = await models.questions.findAll({ where: { questionaireId: questionaireId }, order: [['updatedAt', 'DESC']] });

        if(questions.length > 0){
            return res.status(200).send({ data:{success:true, questionaireId:questionaireId, questionaireTitle:questionaire.title, details:questions}, errorNode:{errorCode:0, errorMsg:"No Error"}})
        } else {
            return res.status(200).send({ data:{success:true, questionaireId:questionaireId, questionaireTitle:questionaire.title, details:[]}, errorNode:{errorCode:0, errorMsg:"No Error"}})
        }
	} else {
		return res.status(400).send({ data:{success:false, details:[]}, errorNode:{errorCode:1, errorMsg:"storeId and questionaireId is required"}})
	}
}

exports.questionsView = async (req, res) =>{
	const storeId =req.body.data.storeId || '';
	const id =req.body.data.id || '';

	if(storeId && storeId != '' && storeId != null) {
        if (id != '') {
            const questions = await models.questions.findOne({where: { storeId:storeId, id:id}})
            return res.status(200).send({ data:{success:true, title: 'Edit Question', details:questions}, errorNode:{errorCode:0, errorMsg:"No Error"}})
        } else {
            return res.status(200).send({ data:{success:true, title: 'Add Question', details:''}, errorNode:{errorCode:0, errorMsg:"No Error"}})
        }
	} else {
		return res.status(400).send({ data:{success:false, details:[]}, errorNode:{errorCode:1, errorMsg:"storeId is required"}})
	}
}

exports.questionsCreate = async (req, res) =>{
	const {updateId,storeId,questionTitle,description,questionType, marks, audio, audioExt} =req.body.data
    const questionaireId = req.body.data.questionaireId || null

	if(storeId && storeId != '' && storeId != null) {
        if (!updateId) {
            await models.questions.create({
                storeId: storeId,
                questionaireId: questionaireId,
                marks: marks,
                questionTitle: questionTitle,
                description: description,
                questionType:questionType
            }).then(async(val)=>{

                if (audio && audio != "" && audioExt && audioExt != "") {
                    const fileTitle = Date.now();
                    const path = "./public/admin/module/" + storeId + "/" + fileTitle + "." + audioExt;
                    const normalfile = fileTitle + "." + audioExt;
                    try {
                      const audioData = audio;
                      const base64Data = audioData.replace(/^data:([A-Za-z-+/]+);base64,/,"");           
                      fs.writeFileSync(path, base64Data,  {encoding: 'base64'});
                      await models.questions.update({ audio: normalfile},{ where: { id: val.id } });
                    } catch (e) {
                      console.log(e);
                    }
                }

                return res.status(201).send({ data:{success:true, message:"Successfully created"}, errorNode:{errorCode:0, errorMsg:"No Error"}})
            }).catch((err)=>{
                console.log(err)
                return res.status(500).send({ data:{success:false, message:"Something went wrong !"}, errorNode:{errorCode:1, errorMsg:"Internal server error"}})
            })
        } else {
            await models.questions.update({
                storeId: storeId,
                questionaireId: questionaireId,
                marks: marks,
                questionTitle: questionTitle,
                description: description,
                questionType:questionType
            }, {where:{id:updateId}}).then(async()=>{

                if (audio && audio != "" && audioExt && audioExt != "") {
                    const existFile = await models.questions.findOne({ attributes: ["audio"], where: { id: updateId }});
                    if (existFile && existFile.audio && existFile.audio != "" && existFile.audio != null) {
                      if (fs.existsSync(__dirname + "/../../public/admin/module/" + storeId + "/" + existFile.audio)) {
                        fs.unlink(__dirname + "/../../public/admin/module/" + storeId + "/" +  existFile.audio,
                          (err) => {
                            if (err) throw err;
                            console.log("successfully deleted");
                          }
                        );
                      }
                    }
        
                    const fileTitle = Date.now();
                    const path = "./public/admin/module/" + storeId + "/" + fileTitle + "." + audioExt;
                    const normalfile = fileTitle + "." + fileExt;
                    try {
                      const audioData = audio;
                      const base64Data = audioData.replace(/^data:([A-Za-z-+/]+);base64,/,"");           
                      fs.writeFileSync(path, base64Data,  {encoding: 'base64'});
                      await models.questions.update({ audio: normalfile},{ where: { id: updateId } });
                    } catch (e) {
                        console.log(e);
                    }
                }

                return res.status(201).send({ data:{success:true, message:"Successfully updated"}, errorNode:{errorCode:0, errorMsg:"No Error"}})
            }).catch((err)=>{
                console.log(err)
                return res.status(500).send({ data:{success:false, message:"Something went wrong !"}, errorNode:{errorCode:1, errorMsg:"Internal server error"}})
            })
        }
	} else {
		return res.status(400).send({ data:{success:false, details:[]}, errorNode:{errorCode:1, errorMsg:"storeId is required"}})
	}
}

exports.questionsSorting = async (req, res) => {
    const sequence = req.body.data.sequence;
    const storeId = req.body.data.storeId;
    sequence.forEach(async(id, value) => {
        await models.questions.update({
            sequence: value,
        }, { where: { id: id} })
    })
    return res.status(200).send({ data:{success:true, message:"Sorting successful"}, errorNode:{errorCode:0, errorMsg:"No Error"}})
}

exports.questionsDelete = async (req, res) =>{
	const id =req.params.id
	if(id && id != '' && id != null) {
        await models.questions.findOne({where:{id:id}}).then(async(value)=>{
            if (value) {
                await models.questions.destroy({where: {id:id}}).then(()=>{
                    return res.status(200).send({ data:{success:true, message:"Successfully deleted"}, errorNode:{errorCode:0, errorMsg:"No Error"}})
                }).catch((err)=>{
                    console.log(err)
                    return res.status(500).send({ data:{success:false, message:"Something went wrong !"}, errorNode:{errorCode:1, errorMsg:"Internal server error"}})
                })
            } else {
                return res.status(200).send({ data:{success:false, message:"Id not match"}, errorNode:{errorCode:1, errorMsg:"No Error"}})
            }
        }).catch((err)=>{
            console.log(err)
            return res.status(500).send({ data:{success:false, message:"Something went wrong !"}, errorNode:{errorCode:1, errorMsg:"Internal server error"}})
        })
	} else {
		return res.status(400).send({ data:{success:false, details:[]}, errorNode:{errorCode:1, errorMsg:"Id is required"}})
	}
}

exports.questionOptionsList = async (req, res) =>{
    const storeId =req.body.data.storeId || '';
    const questionaireId =req.body.data.questionaireId || '';
    const questionId =req.body.data.questionId || '';

    if(storeId && storeId != '' && storeId != null && questionaireId != '' && questionId != '') {
        const questionaire = await models.questionaire.findOne({attributes:['title'], where: { id: questionaireId } });
        const questions = await models.questions.findOne({attributes:['questionTitle'], where: { id: questionId } });
        const questionOptions = await models.questionoptions.findAll({ where: { questionId: questionId }});

        if(questionOptions.length > 0){
            return res.status(200).send({ data:{success:true, questionaireTitle:questionaire.title, questionTitle:questions.questionTitle, details:questionOptions}, errorNode:{errorCode:0, errorMsg:"No Error"}})
        } else {
            return res.status(200).send({ data:{success:true, questionaireTitle:questionaire.title, questionTitle:questions.questionTitle, details:[]}, errorNode:{errorCode:0, errorMsg:"No Error"}})
        }
	} else {
		return res.status(400).send({ data:{success:false, details:[]}, errorNode:{errorCode:1, errorMsg:"storeId, questionaireId and questionId is required"}})
	}
}

exports.questionOptionsCreate = async (req, res) =>{
	const {storeId,options,isCorrectAnswer} =req.body.data
    const questionaireId = req.body.data.questionaireId || null
    const questionId = req.body.data.questionId || null

	if(storeId && storeId != '' && storeId != null) {
        await models.questionoptions.create({
            storeId: storeId,
            questionaireId: questionaireId,
            questionId: questionId,
            options: options,
            isCorrectAnswer:isCorrectAnswer
        }).then(()=>{
            return res.status(201).send({ data:{success:true, message:"Successfully created"}, errorNode:{errorCode:0, errorMsg:"No Error"}})
        }).catch((err)=>{
            console.log(err)
            return res.status(500).send({ data:{success:false, message:"Something went wrong !"}, errorNode:{errorCode:1, errorMsg:"Internal server error"}})
        })
	} else {
		return res.status(400).send({ data:{success:false, details:[]}, errorNode:{errorCode:1, errorMsg:"storeId is required"}})
	}
}

exports.questionOptionsDelete = async (req, res) =>{
	const id =req.params.id
	if(id && id != '' && id != null) {
        await models.questionoptions.findOne({where:{id:id}}).then(async(value)=>{
            if (value) {
                await models.questionoptions.destroy({where: {id:id}}).then(()=>{
                    return res.status(200).send({ data:{success:true, message:"Successfully deleted"}, errorNode:{errorCode:0, errorMsg:"No Error"}})
                }).catch((err)=>{
                    console.log(err)
                    return res.status(500).send({ data:{success:false, message:"Something went wrong !"}, errorNode:{errorCode:1, errorMsg:"Internal server error"}})
                })
            } else {
                return res.status(200).send({ data:{success:false, message:"Id not match"}, errorNode:{errorCode:1, errorMsg:"No Error"}})
            }
        }).catch((err)=>{
            console.log(err)
            return res.status(500).send({ data:{success:false, message:"Something went wrong !"}, errorNode:{errorCode:1, errorMsg:"Internal server error"}})
        })
	} else {
		return res.status(400).send({ data:{success:false, details:[]}, errorNode:{errorCode:1, errorMsg:"Id is required"}})
	}
}

exports.surveyQuestionarieList = async (req, res) => {
    const storeId = req.body.data.storeId;
    const empId = req.body.data.empId;
    const slug = req.body.data.slug;
    if(storeId && storeId !='' && storeId != null && slug && slug != '' && slug != null){
        try{
            const value = await models.questionaire.findOne({ attributes:['id','title','description','slug','mediaUrl','timeInMinute','totalQuestion'], where:{storeId:storeId,slug:slug}})

            const dynamicSection = await models.dynamicSection.findOne({ attributes:['id'], where:{storeId:storeId,slug:slug}})
            const subSection = await models.subSection.findAll({where:{storeId:storeId,sectionId:dynamicSection.id}})

            const details = subSection.map(sub => {
                return Object.assign({},{
                    id : sub.id,
                    storeId : sub.storeId,
                    sectionId: sub.sectionId,
                    title : sub.title,
                    description : sub.description,
                    shortText : sub.shortText,
                    longText : sub.longText,
                    slug : sub.slug,
                    metaTitle : sub.metaTitle,
                    metaKeyword : sub.metaKeyword,
                    metaDescription : sub.metaDescription,
                    buttonlink : sub.buttonlink,
                    cssClass : sub.cssClass,
                    link : sub.link,
                    buttontext : sub.buttontext,
                    status : sub.status,
                    createdAt: sub.createdAt,
                    image: (sub.image!='' && sub.image!=null) ? req.app.locals.baseurl+'admin/module/'+storeId+'/'+sub.image : null,
                    backgroundImage : (sub.backgroundImage!='' && sub.backgroundImage!=null) ? req.app.locals.baseurl+'admin/module/'+storeId+'/'+sub.backgroundImage : null,
                })
            })

            if(value != null && value != ''){
                let list={}
                // const countservay=await models.surveyResult.count({where:{storeId:storeId,empId:empId,questionaireId:value.id}})
                // let results
                // if(countservay > 0){
                //     const surveyResult=await models.surveyResult.findOne({where:{storeId:storeId,empId:empId,questionaireId:value.id}})
                //     results = surveyResult.resultInJson
                // }else{
                //     results = []
                // }

                // let submitOrNot=false;
                // let servaySubmit='No';
                // if(countservay>0){
                //     submitOrNot=true;
                // }
                // if(submitOrNot==true){
                //     servaySubmit='Yes';
                // }

                list.id = value.id
                list.title = value.title
                list.description = value.description
                list.slug = value.slug
                list.mediaUrl = value.mediaUrl
                list.timeInMinute = value.timeInMinute
                list.totalQuestion = value.totalQuestion
                // list.servaySubmit = servaySubmit
                // list.result = results

                return res.status(200).send({data:{success:true,moduleDetails:details, questionaireDetails:list},errorNode:{errorCode:0,errorMsg:"No Error"}});
            }else{
                return res.status(200).send({data:{success:true,moduleDetails:details, questionaireDetails:{}},errorNode:{errorCode:0,errorMsg:"No Error"}});
            }
        }catch(error){
            return res.status(500).send({data:{success:false, message:"Something went wrong"},errorNode:{errorCode:1,errorMsg:"Internal server error"}})
        }
    }else{
        return res.status(400).send({ data:{success:false, message:"storeId, empId and slug is required"}, errorNode:{errorCode:1, errorMsg:"error"}});
    }
}

exports.surveyQuestionList = async (req, res) => {
    const {storeId,questionaireId}=req.body.data;

    if(storeId && storeId!='' && questionaireId && questionaireId!=''){
        try{
            const questionsList = await models.questions.findAll({ where:{storeId:storeId, questionaireId:questionaireId}, order:[['sequence','ASC']] })
            if(questionsList.length>0){
                let questions = []
                for(let q of questionsList){
                    let answer = []
                    const questionoptions=await models.questionoptions.findAll({ where:{storeId:storeId, questionaireId:questionaireId, questionId:q.id }})

                    if(questionoptions.length>0){
                        for(let option of questionoptions){
                            answer.push({
                                options:option.options,
                                isCorrectAnswer: option.isCorrectAnswer
                            })
                        }
                    }
                    
                    questions.push({
                        id: q.id,
                        questionTitle: q.questionTitle,
                        audio: (q.audio!='' && q.audio!=null) ? req.app.locals.baseurl+'admin/module/'+storeId+'/'+q.audio : null,
                        description: q.description,
                        questionType: q.questionType,
                        options: answer
                    })
                }
                
                if(questions.length>0){
                    return res.status(200).send({data:{success:true, details:questions},errorNode:{errorCode:0,errorMsg:"No Error"}})
                }else{
                    return res.status(200).send({data:{success:true, details:[]},errorNode:{errorCode:0,errorMsg:"No Error"}})
                }
            }else{
                return res.status(200).send({data:{success:true,details:[]},errorNode:{errorCode:0,errorMsg:"No Error"}})
            }
        }catch(error){
            console.log("qqqqqqqqqqqqq---"+error)
            return res.status(500).send({data:{success:false, message:"Something went wrong"},errorNode:{errorCode:1,errorMsg:"Internal server error"}})
        }
    }else{
        return res.status(400).send({data:{success:false, message:"storeId and questionaireId is required"},errorNode:{errorCode:1,errorMsg:"error"}})
    }

}

exports.submitServay = async (req, res) => {
    const storeId=req.body.data.storeId || ''
    const empId=req.body.data.uid || null
    const questionaireId=req.body.data.questionaireId || ''
    const servayJson=req.body.data.answers
    const timeInMinute=req.body.data.timeInMinute || ''
    const name=req.body.data.name || ''
    const mobile=req.body.data.mobile || ''
    const email=req.body.data.email || ''

    if(storeId && storeId!='' && questionaireId && questionaireId!=''){
        await models.surveyResult.create({
            storeId:storeId,
            empId:empId,
            name:name,
            mobile:mobile,
            email:email,
            questionaireId:questionaireId,
            resultInJson:JSON.stringify(servayJson),
            timeInMinute:timeInMinute,
            createdBy:empId
        }).then(async (value) => {
            if(value){

                const id = value.id
                const result = await models.surveyResult.findOne({where:{id:id}})
                const jsonData = JSON.parse(result.resultInJson)
                const subject = await models.questionaire.findOne({attributes:['title','totalQuestion','timeInMinute'],where:{id:result.questionaireId}})
                let totalMarks = 0
                let obtainedMarks = 0
                let totalCorrect = 0

                if(jsonData.length > 0){
                    for(let data of jsonData){
                        const questionId = data.id
                        const questons = await models.questions.findOne({where:{id:questionId}})
                        
                        if(questons.marks != '' && questons.marks != null){
                            totalMarks += parseInt(questons.marks)
                        }else{
                            totalMarks += 0
                        }

                        if(data.correct == 'Yes'){
                            totalCorrect += 1
                            if(questons.marks != '' && questons.marks != null){
                                obtainedMarks += parseInt(questons.marks)
                            }else{
                                obtainedMarks += 0
                            }
                        }else{
                            totalCorrect += 0
                            obtainedMarks += 0
                        }
                    }
                }

                let percentage = ((100/ totalMarks)*obtainedMarks)
                const finalResult = {}
                finalResult.id = id
                finalResult.name = result.name
                finalResult.mobile = result.mobile
                finalResult.email = result.email
                finalResult.subject = subject.title
                finalResult.totalQuestion = subject.totalQuestion
                finalResult.allotedTime = subject.timeInMinute
                finalResult.timeTaken = result.timeInMinute
                finalResult.submittedDate = result.createdAt
                finalResult.totalMarks = totalMarks
                finalResult.obtainedMarks = obtainedMarks
                finalResult.percentage = percentage
                finalResult.totalCorrect = totalCorrect

                return res.status(200).send({data:{success:true,details:finalResult},errorNode:{errorCode:0,errorMsg:"No Error"}})
            }else{
                return res.status(200).send({data:{success:true,details:{}},errorNode:{errorCode:0,errorMsg:"No Error"}})
            }
        }).catch(error => {
            return res.status(500).send({data:{success:false, message:"Something went wrong"},errorNode:{errorCode:1,errorMsg:"Internal server error"}})
        })
    }else{
        return res.status(400).send({data:{success:false, message:"storeId and questionaireId is required"},errorNode:{errorCode:1,errorMsg:"error"}})
    }
}

exports.surveyResult = async (req, res) => {
    const storeId=req.body.data.storeId

    if(storeId && storeId!=''){
        const results = await models.surveyResult.findAll({where:{storeId: storeId}})
        
        if(results.length > 0){
            let details = []
            for(let r of results){
                const questionaire = await models.questionaire.findOne({attributes:['title'],where:{id: r.questionaireId}})
                let questionaireTitle = ''
                if (questionaire != '') {
                    questionaireTitle = questionaire.title
                }
                details.push({
                    id: r.id,
                    questionaireTitle: questionaireTitle,
                    timeInMinute: r.timeInMinute,
                    result: r.resultInJson
                })
            }
            return res.status(200).send({data:{success:true, details:details},errorNode:{errorCode:0,errorMsg:"No Error"}})
        }else{
            return res.status(200).send({data:{success:true, details:[]},errorNode:{errorCode:0,errorMsg:"No Error"}})
        }
    }else{
        return res.status(400).send({data:{success:false, message:"storeId is required"},errorNode:{errorCode:1,errorMsg:"error"}})
    }
}

exports.surveyResultDetails = async (req, res) => {
    const storeId = req.body.data.storeId
    const surveyId = req.body.data.surveyId

    if(storeId && storeId !='' && surveyId && surveyId != ''){
        const results = await models.surveyResult.findOne({where:{storeId: storeId, id:surveyId}})
        console.log(results);
        if(results != '' && results != null){
            const questionaire = await models.questionaire.findOne({attributes:['title','totalQuestion'],where:{id: results.questionaireId}})
            let questionaireTitle = ''
            let totalQuestion = 0
            if (questionaire != '') {
                questionaireTitle = questionaire.title
                totalQuestion = questionaire.totalQuestion
            }

            let details = {
                id: results.id,
                questionaireTitle: questionaireTitle,
                totalQuestion: totalQuestion,
                timeInMinute: results.timeInMinute,
                result: results.resultInJson
            }
            return res.status(200).send({data:{success:true, details:details},errorNode:{errorCode:0,errorMsg:"No Error"}})
        }else{
            return res.status(200).send({data:{success:true, details:[]},errorNode:{errorCode:0,errorMsg:"No Error"}})
        }
    }else{
        return res.status(400).send({data:{success:false, message:"storeId and surveyId is required"},errorNode:{errorCode:1,errorMsg:"error"}})
    }
}

exports.surveyResultDelete = async (req, res) =>{
	const id =req.params.id
	if(id && id != '' && id != null) {
        await models.surveyResult.findOne({where:{id:id}}).then(async(value)=>{
            if (value) {
                await models.surveyResult.destroy({where: {id:id}}).then(()=>{
                    return res.status(200).send({ data:{success:true, message:"Successfully deleted"}, errorNode:{errorCode:0, errorMsg:"No Error"}})
                }).catch((err)=>{
                    console.log(err)
                    return res.status(500).send({ data:{success:false, message:"Something went wrong !"}, errorNode:{errorCode:1, errorMsg:"Internal server error"}})
                })
            } else {
                return res.status(200).send({ data:{success:false, message:"Id not match"}, errorNode:{errorCode:1, errorMsg:"No Error"}})
            }
        }).catch((err)=>{
            console.log(err)
            return res.status(500).send({ data:{success:false, message:"Something went wrong !"}, errorNode:{errorCode:1, errorMsg:"Internal server error"}})
        })
	} else {
		return res.status(400).send({ data:{success:false, details:[]}, errorNode:{errorCode:1, errorMsg:"Id is required"}})
	}
}

exports.surveyCertificate = async (req, res) => {
    const storeId = req.body.data.storeId || ''
    const id = req.body.data.id || ''

    if(storeId != '' && id != ''){
        const result = await models.surveyResult.findOne({where:{id:id, storeId:storeId}})
        if(result != '' && result != null){
            const jsonData = JSON.parse(result.resultInJson)
            const subject = await models.questionaire.findOne({attributes:['title','totalQuestion','timeInMinute'],where:{id:result.questionaireId}})
            let totalMarks = 0
            let obtainedMarks = 0
            let totalCorrect = 0

            if(jsonData.length > 0){
                for(let data of jsonData){
                    const questionId = data.id
                    const questons = await models.questions.findOne({where:{id:questionId}})
                    
                    if(questons.marks != '' && questons.marks != null){
                        totalMarks += parseInt(questons.marks)
                    }else{
                        totalMarks += 0
                    }

                    if(data.correct == 'Yes'){
                        totalCorrect += 1
                        if(questons.marks != '' && questons.marks != null){
                            obtainedMarks += parseInt(questons.marks)
                        }else{
                            obtainedMarks += 0
                        }
                    }else{
                        totalCorrect += 0
                        obtainedMarks += 0
                    }
                }
            }

            let percentage = ((100/ totalMarks)*obtainedMarks)
            const finalResult = {}
            finalResult.id = id
            finalResult.name = result.name
            finalResult.mobile = result.mobile
            finalResult.email = result.email
            finalResult.subject = subject.title
            finalResult.totalQuestion = subject.totalQuestion
            finalResult.allotedTime = subject.timeInMinute
            finalResult.timeTaken = result.timeInMinute
            finalResult.submittedDate = result.createdAt
            finalResult.totalMarks = totalMarks
            finalResult.obtainedMarks = obtainedMarks
            finalResult.percentage = percentage
            finalResult.totalCorrect = totalCorrect

            return res.status(200).send({data:{success:true,details:finalResult},errorNode:{errorCode:0,errorMsg:"No Error"}})
        }else{
            return res.status(200).send({data:{success:false,details:{}},errorNode:{errorCode:1,errorMsg:"No Data Found"}})
        }
    }else{
        return res.status(400).send({ data:{success:false, details:"storeId and questionaireId is required"}, errorNode:{errorCode:1, errorMsg:"storeId and questionaireId is required"}})
    }
}

exports.surveyReport = async (req, res) => {
    const storeId = req.body.data.storeId || ''
    const id = req.body.data.id || ''

    if(storeId != '' && id != ''){
        const result = await models.surveyResult.findOne({where:{id:id, storeId:storeId}})
        if(result != '' && result != null){
            const jsonData = JSON.parse(result.resultInJson)
            const subject = await models.questionaire.findOne({attributes:['title','totalQuestion','timeInMinute'],where:{id:result.questionaireId}})
            let totalMarks = 0
            let obtainedMarks = 0
            let totalCorrect = 0

            const yourQnA = []
            if(jsonData.length > 0){
                for(let data of jsonData){
                    const questionId = data.id
                    const questons = await models.questions.findOne({where:{id:questionId}})
                    const questonOptions = await models.questionoptions.findAll({where:{questionId:questionId}})
                    let correctAnswer = ""
                    for(let qo of questonOptions){
                        if(qo.isCorrectAnswer == "Yes"){
                            if(correctAnswer != ""){
                                correctAnswer += ` / ${qo.options}`
                            }else{
                                correctAnswer = qo.options
                            }
                        }
                    }
                    if(questons.marks != '' && questons.marks != null){
                        totalMarks += parseInt(questons.marks)
                    }else{
                        totalMarks += 0
                    }

                    if(data.correct == 'Yes'){
                        totalCorrect += 1
                        if(questons.marks != '' && questons.marks != null){
                            obtainedMarks += parseInt(questons.marks)
                        }else{
                            obtainedMarks += 0
                        }
                    }else{
                        totalCorrect += 0
                        obtainedMarks += 0
                    }

                    yourQnA.push({
                        question: data.question,
                        yourAnswer: data.answer,
                        correctAnswer: correctAnswer,
                        isCorrectAnswer: data.correct
                    })
                }
            }

            let percentage = ((100/ totalMarks)*obtainedMarks)
            const finalResult = {}
            finalResult.id = id
            finalResult.name = result.name
            finalResult.mobile = result.mobile
            finalResult.email = result.email
            finalResult.subject = subject.title
            finalResult.totalQuestion = subject.totalQuestion
            finalResult.allotedTime = subject.timeInMinute
            finalResult.timeTaken = result.timeInMinute
            finalResult.submittedDate = result.createdAt
            finalResult.totalMarks = totalMarks
            finalResult.obtainedMarks = obtainedMarks
            finalResult.percentage = percentage
            finalResult.totalCorrect = totalCorrect
            finalResult.record = yourQnA

            return res.status(200).send({data:{success:true,details:finalResult},errorNode:{errorCode:0,errorMsg:"No Error"}})
        }else{
            return res.status(200).send({data:{success:false,details:{}},errorNode:{errorCode:1,errorMsg:"No Data Found"}})
        }
    }else{
        return res.status(400).send({ data:{success:false, details:"storeId and id is required"}, errorNode:{errorCode:1, errorMsg:"storeId and id is required"}})
    }
}