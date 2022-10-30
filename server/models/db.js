const mongoose = require('mongoose')

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, { dbName: 'phonestore', useNewUrlParser: true, useUnifiedTopology: true })

        console.log(`MongoDB Connected: ${conn.connection.host}`)

        db = mongoose.connection

        db.on('error', console.error.bind(console, 'connection error:'))
        db.once('open', function(){
            console.log('Connected!')
        })
        
        return db
    } catch (err) {
        console.error(err)
        process.exit(1)
    }
}

// Models
require('./Phone')

module.exports = connectDB

