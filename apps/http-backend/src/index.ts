import  express  from "express";
import z from "zod"

const app = express();
app.use(express.json());
app.post("/signup" , (req , res) => {
    const signupSchema = z.object({
        username : z.string(),
        password : z.string()
    })

    const { username , password } = signupSchema.parse(req.body);

    
})

app.listen(3000 , () => {
    console.log("App is Listening On Port 3000")
})