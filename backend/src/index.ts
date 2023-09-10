import express from "express"
import type { Request, Response } from "express"
import cors from "cors"
import fs from "fs"
import { z } from "zod"
import { UploadedFile } from "express-fileupload"
import fileUpload from "express-fileupload"
import multer from 'multer' 
import { url } from "inspector"

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

const OrderSchema = z.object({
  name: z.string(),
  zipCode: z.string(),
  items:z.object({
    id: z.number(),
    amount: z.number(),
  }).array(),
  address: z.string(),
  email: z.string().email(),
  phone: z.string(),
  status: z.boolean().optional()
})

type Order = z.infer<typeof OrderSchema>


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
  let file = req.files.picture as UploadedFile
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

  const pizzaToDelete = pizzas.find(pizza => pizza.id === id)
  if (pizzaToDelete){
    const pictureUploadPath = "./database/img/" + pizzaToDelete.url.split("/")[pizzaToDelete.url.split("/").length-1]
    if (fs.existsSync(pictureUploadPath)) {
      fs.unlinkSync(pictureUploadPath)
    }
  }

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
    url: pizza.url,
    status: result.data.status
  } : pizza)

  fs.writeFileSync('./database/pizzaList.json', JSON.stringify(updatedPizzas, null, 2), "utf-8")

  return res.send(updatedPizzas)

})

server.patch("/admin/updatepizzaimage/:id", async (req: Request, res: Response) => {

  if (!req.files) {
    return res.sendStatus(400)
  }

  const id = +req.params.id
  let pizzas: Pizza[] = await JSON.parse(fs.readFileSync('database/pizzaList.json', 'utf-8'))
  let pizzaToUpdate = pizzas.find(pizza => pizza.id === id)

  if (pizzaToUpdate){
    const pictureUploadPath = "./database/img/" + pizzaToUpdate.url.split("/")[pizzaToUpdate.url.split("/").length-1]
    if (fs.existsSync(pictureUploadPath)) {
      fs.unlinkSync(pictureUploadPath)
    }
  }
  
  let file = req.files.picture as UploadedFile
  console.log(file)
  file.mv('./database/img/' + file.name);
  let index = pizzas.findIndex(pizza => pizza.id === id)
  pizzas[index].url = imgUrl + file.name
  fs.writeFileSync('./database/pizzaList.json', JSON.stringify(pizzas, null, 2), "utf-8")
  return res.sendStatus(200)
})


server.get("/admin/orders", async (req: Request, res: Response)=> {
    let orders: Order[] = await JSON.parse(fs.readFileSync('database/orders.json', 'utf-8'))
  return res.send(orders)

})


server.listen(3333) 