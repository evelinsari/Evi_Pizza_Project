import express from "express"
import type { Request, Response } from "express"
import cors from "cors"
import fs from "fs"
import { z } from "zod"
import { UploadedFile } from "express-fileupload"
import fileUpload from "express-fileupload"
import multer from 'multer' 

const server = express()
/* const multer  = require('multer') */

server.use(fileUpload())
/* server.use(multer()) */
server.use(express.static("database"))
server.use(express.json())
server.use(cors())

const imgUrl = "http://localhost:3333/img/"

const PizzaSchema = z.object ({
  id: z.number(),
  name: z.string(),
  ingredients: z.string().array(),
  url: z.string(),
  status: z.boolean()
})


type Pizza= z.infer<typeof PizzaSchema>

type Order = {
  name: string,
  zipCode: string,
  items: {
    id: number,
    amount: number
  }[],
  address: string,
  email: string,
  phone: string,
  status?: boolean
}

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
  const fileData: Order = req.body
  fileData.status = true
  // zod
  
  try {
    const orders: Order [] = await JSON.parse(fs.readFileSync('database/orders.json', 'utf-8'))
    orders.push(fileData)
    fs.writeFileSync('./database/orders.json', JSON.stringify(orders, null, 2), "utf-8")

    res.send(fileData)
  } catch (error) {
    console.error('Error writing to file:', error)
    res.status(500).send('Error writing to file')
  }
})

server.post("/admin/addpizzaimage", async (req: Request, res: Response) => {
  if (!req.files) {
    return res.sendStatus(400)
  }
  let file = req.files.file as UploadedFile
  console.log(file)
  file.mv('./database/img/' + file.name);
  return res.sendStatus(200)
})

server.post("/admin/addpizza",async (req: Request, res: Response) => {
  const result = PizzaSchema.safeParse(req.body)
  if (!result.success)
    return res.sendStatus(400)
  const pizza = result.data

  const pizzas: Pizza[] = await JSON.parse(fs.readFileSync('database/pizzaList.json', 'utf-8'))
  pizzas.push({id: pizza.id , name: pizza.name, ingredients: pizza.ingredients, url: imgUrl + pizza.url, status: pizza.status})

  fs.writeFileSync('./database/pizzaList.json', JSON.stringify(pizzas, null, 2), "utf-8")

  return res.send(pizzas)
})


server.delete("/admin/deletepizza/:id",async (req: Request, res: Response) => {
  const id = +req.params.id

  let pizzas: Pizza[] = await JSON.parse(fs.readFileSync('database/pizzaList.json', 'utf-8'))
  pizzas = pizzas.filter(pizza => pizza.id !== id)

  fs.writeFileSync('./database/pizzaList.json', JSON.stringify(pizzas, null, 2), "utf-8")

  return res.send(pizzas)

})

server.patch("/admin/updatepizza/:id",async (req: Request, res: Response) => {
  const id = +req.params.id

  const result = PizzaSchema.safeParse(req.body)
  if (!result.success)
    return res.sendStatus(400)

  let pizzas: Pizza[] = await JSON.parse(fs.readFileSync('database/pizzaList.json', 'utf-8'))
  let pizzaToUpdate = pizzas.find(pizza => pizza.id === id)
  console.log(pizzaToUpdate)
  if (!pizzaToUpdate)
    return res.sendStatus(404)

  const updatedPizzas: Pizza[] = pizzas.map(pizza => pizza.id === id ? {
    id: result.data.id,
    name: result.data.name,
    ingredients: result.data.ingredients,
    url: result.data.url,
    status: result.data.status
  } : pizza)

  fs.writeFileSync('./database/pizzaList.json', JSON.stringify(updatedPizzas, null, 2), "utf-8")

  return res.send(updatedPizzas)

})


server.listen(3333) 