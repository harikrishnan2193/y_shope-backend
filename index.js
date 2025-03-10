require('dotenv').config()
require('./src/db/connection')

const express = require('express')
const cors = require('cors')
const router = require('./src/routes/router')

const yshopeServer = express()

yshopeServer.use(cors())
yshopeServer.use(express.json())
yshopeServer.use(router)
yshopeServer.use('/uploads', express.static('src/uploads'))

const PORT = process.env.PORT || 5000

yshopeServer.listen(PORT,()=>{
    console.log(`Yshope server running successfully at port number ${PORT}`);
})

yshopeServer.get('/',(req,res)=>{
    res.send('<h1>Server running successfully and ready to accept clint request</h1>')
})