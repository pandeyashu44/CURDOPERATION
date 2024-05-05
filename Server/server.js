import express from 'express'
import mysql from 'mysql'
import cors from 'cors'

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host : "localhost",
  user : "root",
  password : "",
  database : "swiftlab"
})

app.get('/', (req,res) => {
  const sql = "select * from dlt";
  db.query(sql, (err,result) => {
    if(err) return res.json({Message: "Something went wrong"});
    else res.json(result);
  })
})

app.get('/api/search', (req,res) => {
  const { keyword } = req.query;
  const sql = "select * from dlt WHERE sender_id LIKE ? OR template_id LIKE ?";
  const params = [`%${keyword}%`, `%${keyword}%`];
  db.query(sql, params, (err,result) => {
    if(err) return res.json({Message: "Something went wrong"});
    else res.json(result);
  })
})

app.get('/api/data', (req,res) => {
  const { page, pageSize, keyword } = req.query;
  const startRow = (page - 1) * pageSize;

  if(keyword){
    const sql = "select * from dlt WHERE sender_id LIKE ? OR template_id LIKE ? LIMIT ?, ?";
    db.query(sql, [`%${keyword}%`, `%${keyword}%`, startRow, parseInt(pageSize)], (err,result) => {
      if(err) return res.json({Message: "Something went wrong"});
      else res.json(result);
    })
  } else {
    const sql = "select * from dlt LIMIT ?, ?";
    db.query(sql, [startRow, parseInt(pageSize)], (err,result) => {
      if(err){console.error('Error fetching data from database: ' + err);return res.json({Message:"Internal Server Error"});} 
      else res.json(result);
    })
  }
})

app.post('/dlt', (req,res) => {
  const sql = "INSERT INTO dlt (`principal_entity_id`,`sender_id`, `template_id`,`template_content`,`created_at`,`updated_at`) VALUES(?)";
  const values = [
    req.body.principal_entity_id,
    req.body.sender_id,
    req.body.template_id,
    req.body.template_content,
    req.body.created_at,
    req.body.updated_at,
  ]
  db.query(sql, [values], (err,result) => {
    if(err) return res.json(err);
    return res.json(result);
  })
})

app.get('/read/:id', (req,res) => {
  const sql = "SELECT * FROM dlt WHERE id = ?";
  const id = req.params.id;

  db.query(sql, [id], (err,result) => {
    if(err) return res.json({Message: "Something went wrong"});
    else res.json(result);
  })
})

app.put('/edit/:id', (req,res) => {
  const sql = "UPDATE dlt SET `principal_entity_id`=?,`sender_id`=?, `template_id`=?,`template_content`=?,`created_at`=?,`updated_at`=? WHERE id=?";
  const id = req.params.id;
  db.query(sql, [req.body.principal_entity_id,req.body.sender_id,req.body.template_id,req.body.template_content,req.body.created_at,req.body.updated_at,id], (err,result) => {
    if(err) return res.json({Message:"Internal Server Error"});
    else res.json(result)
  })
})

app.delete('/delete/:id', (req,res) => {
  const sql = "DELETE FROM dlt WHERE id=?";
  const id = req.params.id;
  db.query(sql, [id], (err,result) => {
    if(err) return res.json({Message:"Internal Server Error"});
    else res.json(result)
  })
})

app.listen(5001, ()=>{
  console.log("listening");
})