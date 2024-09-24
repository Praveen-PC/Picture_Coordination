const mysql=require('mysql2')

const con=mysql.createConnection({
    host:'localhost',
    user:'root',
    database:'picture',
    password:'@Root123'
})

con.connect((err)=>{
    if (err) throw err
    console.log('db is connected')
})

module.exports = con