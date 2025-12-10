import jwt from "jsonwebtoken";
export default function AuthorizeUser(req, res, next){

        const header = req.header("Authorization")
        
        if(header != null){
            const token = header.replace("Bearer ", "")
            console.log(token)

            jwt.verify(token, "i-computers-54!", 
                (err, decoded)=>{
                    if(decoded == null){
                        res.status(401).json({
                            message : ("Invalid token please login again..")
                        })
                    }else{
                        req.user = decoded
                        next()
                    }
                }
            )
        }else{
            next()
        }
    }