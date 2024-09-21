const mysql=require('mysql2')

const con=mysql.createConnection({
    host:'localhost',
    user:'root',
    database:'picture',
    password:'@Root123'
})
con.connect((err)=>{
    console.log('db is connected')
})

module.exports=con