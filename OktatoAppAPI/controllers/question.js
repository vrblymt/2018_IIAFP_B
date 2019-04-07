const Question = require('../models/question')
const GameSession = require('../models/gamesession')

exports.get_all_question = (req,res,next)=>{
    Question.GetAllQuestion((err,result)=>{
        res.status(200).json({
            "status_code":"200",
            "description":"Összes kérdés sikeresen lekérdezve!",
            "data": result
        })
    })
}

exports.getAllQuestionsBySessionName = (req, res, next)=>{
    const session_name = req.params.session_name
    GameSession.getGameSessionByName(session_name, (selectSessionErr, selectSessionRes)=>{
        if(selectSessionErr || selectSessionRes === null || Object.keys(selectSessionRes).length === 0)
        {
           return res.status(404).json({
                "status_code":"404",
                "description":"A játékmenet nem létezik!"
            })
        }
        else{
            const sessionid = selectSessionRes[0].id
            Question.selectAllBySessionName(sessionid, (selectQuestionErr, selectQuestionRes)=>{
                return res.status(200).json({
                    "status_code":"200",
                    "description":"Játékmenethez tartozó kérdések sikeresen lekérdezve!",
                    "data":selectQuestionRes
                })
            })
        }
    })
}

exports.create_new_question = (req,res,next)=>{
    const question = new Question(req.body)

    var sessionname = req.body.session_name

    GameSession.getGameSessionByName(sessionname,(err,result)=>{
        if(err || result === null || Object.keys(result).length === 0)
        {
           return res.status(404).json({
                "status_code":"404",
                "description":"A játékmenet nem létezik!"
            })
        }
        const sessionid = result[0].id
        if(result[0].max_points === null)
        {
            result[0].max_points = 0;
        }
        const max_point = result[0].max_points
        Question.get_by_guestion(question.question,(err,result2)=>{
            if(err || Object.keys(result2).length > 0)
            {
               return res.status(409).json({
                    "status_code":"409",
                    "description":"Már létezik ilyen kérdés!"
                })
            }
            question.game_session_id = sessionid
            Question.InsertQuestion(question,(err,result3)=>{
                GameSession.modifyGameSessionMaxPointOsszeada(sessionid,max_point,question.points,(err,result4)=>{
                    Question.get_by_guestion(question.question,(err,result5)=>{
                        res.status(201).json({
                            "status_code":"201",
                            "description":"Új kérdés sikeresen felvéve!",
                            "data":result5 
                        })
                    })       
                })
            })
        })
    })
}


exports.delete_question = (req,res,next)=>{
    const id = req.params.id
    
    Question.SelectById(id,(err,result)=>{
        if(err || result === null || Object.keys(result).length === 0)
        {
            return res.status(404).json({
                "status_code":"404",
                "description":"Kérdés nem található!"
            })
        }
        const points = result[0].points
        const sessionid = result[0].game_session_id
        GameSession.getGameSessionById(sessionid,(err,result2)=>{
            const max_point = result2[0].max_points
            GameSession.modifyMaxPointKivonas(sessionid,max_point,points,(err,result3)=>{
                Question.DeleteQuestion(id,(err,result4)=>{
                    return res.status(200).json({
                        "status_code":"200",
                        "description":"Kérdés sikeresen törölve!",
                        "data":[]
                    })
                })
            })
        })
    })
}


exports.modify_question = (req,res,next)=>{
    const id = req.params.id
    const question = new Question(req.body)
    const session_name = req.body.session_name
    Question.SelectById(id,(err1,result)=>{
        if(err1 || result === null || Object.keys(result).length === 0)
        {
            return res.status(404).json({
                "status_code":"404",
                "description":"Nem létezik ilyen kérdés!"
            })
        }
        GameSession.getGameSessionByName(session_name,(err2,result2)=>{
            if(err2 || result2 === null || Object.keys(result2).length === 0)
            {
                return res.status(404).json({
                    "status_code":"404",
                    "description":"Nem létezik ilyen játékmenet!"
                })
            }
            const sessionid = result2[0].id//session namehez milyen id tartozik
            if(result2[0].max_points === 0)
            {
                result2[0].max_points = 0
            }
            const max_points = result2[0].max_points
            const inputpoints = question.points
            const recentpoints = result[0].points
            var newpoints = inputpoints - recentpoints
            //Ezt akkor kell csinálni ha a result2[0].id(bodyba kapott session_name) és a result[0].sessionid egyenlo
            //Az adott kérdésunkhoz milyen id tartozik result[0].gamesessionid
            if(result[0].game_session_id === sessionid)
            {
                Question.updateQuestion(id,inputpoints,sessionid,(err,result3)=>{
                    GameSession.modifyGameSessionMaxPointOsszeada(sessionid,max_points,newpoints,(err,result4)=>{
                        return res.status(200).json({
                            "status_code":"200",
                            "description":"Kérdés sikeresen megváltoztatva!",
                            "data":[]
                        })
                    })
                })
            }
            else{
                GameSession.getGameSessionById(result[0].game_session_id,(err,result4)=>{
                    GameSession.getGameSessionById(sessionid,(err,result5)=>{
                        GameSession.modifyMaxPointKivonas(result[0].game_session_id,result4[0].max_points,result[0].points,(err,result6)=>{
                            GameSession.modifyGameSessionMaxPointOsszeada(sessionid,result5[0].max_points,result[0].points,(err,result7)=>{
                                Question.updateQuestion(id,inputpoints,sessionid,(err,result8)=>{
                                    Question.SelectById(id,(err,result9)=>{
                                        return res.status(200).json({
                                            "status_code":"200",
                                            "description":"Kérdés sikeresen megváltoztatva!",
                                            "data": result9
                                        })
                                    })
                                })
                            })
                        })
                    })
                })
            }
        })
    })
}


