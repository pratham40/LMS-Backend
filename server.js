const { configDotenv } = require("dotenv");
const app = require("./app")
configDotenv()
const PORT=process.env.PORT || 5000
app.listen(PORT,()=>{
    console.log(`server is listening on http:localhost:${PORT}`);
    
})
