import express from "express"
import type { Request, Response } from "express"
import cors from "cors"
/* import fs from "fs/promises" */
import fs from "fs"
import { z } from "zod"

/* const fileUpload = require("express-fileupload"); */
const server = express()
server.use(cors())
/* app.use(fileUpload()) */
/* app.use("/database/pictures", express.static("dist/assets")) */
server.use(express.static("database"))
server.use(express.json())

const PizzaSchema = z.object ({
  id: z.string(),
  name: z.string(),
  ingredients: z.string().array(),
  url: z.string(),
}).array()


server.get("/pizzas", async (request: Request, response: Response) => {
 //felolvastatom vele és utána parsolom
  const pizzas = await JSON.parse(fs.readFileSync('database/pizzaList.json', 'utf-8'))
  return response.json(pizzas)
})

server.post('/api/order', async (req: Request, res: Response) => {
  const fileData = req.body
  // zod
  try {
    const fileDataString = JSON.stringify(fileData, null, 2); // Adjust spacing as needed
    /* const uploadPath = __dirname + '/../database/' + 'profile.json'
 */
    const uploadPath = __dirname + '/../database/' + `${req.body.name.split(" ").join("") + new Date().getTime()}.json`
    fs.writeFileSync(uploadPath, fileDataString)

    res.send(fileDataString)
  } catch (error) {
    console.error('Error writing to file:', error)
    res.status(500).send('Error writing to file')
  }

})


server.listen(3333) 