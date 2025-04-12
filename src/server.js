require("dotenv").config();
const app = require('./app');
const dbConnect = require('./config/dbConfig');
dbConnect();


const PORT = process.env.PORT;
app.listen(PORT ,()=>{
    console.log(`Server is running on port ${PORT}`);
    console.log(`http://localhost:${PORT}`);
})