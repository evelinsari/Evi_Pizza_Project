import express from "express"
import type { Request, Response } from "express"
import cors from "cors"
import fs from "fs"
import { z } from "zod"


const server = express()
server.use(cors())

server.use(express.static("database"))
server.use(express.json())

const PizzaSchema = z.object ({
  id: z.string(),
  name: z.string(),
  ingredients: z.string().array(),
  url: z.string(),
}).array()


server.get("/pizzas", async (request: Request, response: Response) => {

  const pizzas = await JSON.parse(fs.readFileSync('database/pizzaList.json', 'utf-8'))
  return response.json(pizzas)
})

server.post('/pizza/order', async (req: Request, res: Response) => {
  console.log("headers: " + JSON.stringify(req.headers))
  console.log("url: " + req.url)
  console.log("body: " + JSON.stringify(req.body))    
  console.log("params: " + JSON.stringify(req.params))
  console.log("query: " + JSON.stringify(req.query))
  console.log("method: " + req.method)
  const fileData = req.body
  // zod
  try {
    const fileDataString = JSON.stringify(fileData, null, 2); 
   
    const uploadPath = __dirname + '/../database/' + `${req.body.name.split(" ").join("") + new Date().getTime()}.json`
    fs.writeFileSync(uploadPath, fileDataString)

    res.send(fileDataString)
  } catch (error) {
    console.error('Error writing to file:', error)
    res.status(500).send('Error writing to file')
  }

})


server.listen(3333) 