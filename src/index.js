const express = require('express');
const app = express();
const port = process.env.PORT;
 
const userRouter = require('./routers/User.js');
const taskRouter = require('./routers/Task.js');


app.use(express.json())
app.use(userRouter);
app.use(taskRouter);

app.listen(port,()=>{
console.log('Server started on port '+port);
});
