import jwt from "jsonwebtoken";
import dotenv from 'dotenv'

dotenv.config()
export default function AuthorizeUser(req, res, next){

        const header = req.header("Authorization")
        
        if(header != null){
            const token = header.replace("Bearer ", "")

            jwt.verify(token, process.env.JWT_SECRET, 
                (err, decoded)=>{
                    if(err || decoded == null){
                        // Do not return 401 here globally, as it blocks public routes.
                        // Just set req.user to null. Protected routes will handle the 401.
                        req.user = null;
                        next();
                    }else{
                        req.user = decoded;
                        next();
                    }
                }
            )
        }else{
            req.user = null;
            next()
        }
    }