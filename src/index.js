const express = require('express')
require('./db/mongoose')
const userRouter = require('./routers/user')

const app = express()
const port = process.env.PORT || 3000

//Middleware for maintenance
// app.use((req, res, next) => {
//     res.status(503).send('The site is under maintenance, please try again later')
// })

app.use(express.json())
app.use(userRouter)

app.listen(port, () => {   
    console.log('Server is up on port ' + port)
})

