import express from "express"
import type { Request, Response } from "express"
import cors from "cors"
import fs from "fs"
import { z } from "zod"
import { json } from "stream/consumers"


const server = express()
server.use(cors())

server.use(express.static("database"))
server.use(express.json())

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

server.post("/admin/addpizza",async (req: Request, res: Response) => {
  /* const pictureUploadPath = __dirname + "/../backend/data/" + "profile.jpg";

	if (req.files) {
		const uploadedPicture = req.files.picture;
		uploadedPicture.mv(pictureUploadPath, (err) => {
			if (err) {
				console.log(err);
				return res.status(500).send(err);
			}
		});
	}

	const fileData = JSON.parse(JSON.stringify(req.body));
	fileData.picture = "/profile.jpg";
	const fileDataString = JSON.stringify(fileData, null, 2);
	const uploadPath = __dirname + "/../backend/data/" + "profile.json";

	fs.writeFileSync(uploadPath, fileDataString, (err) => {
		if (err) {
			console.log(err);
			return res.status(500).send(err);
		}
	});

	return res.send(fileDataString); */


  const result = PizzaSchema.safeParse(req.body)
  if (!result.success)
    return res.sendStatus(400)
  const pizza = result.data

  const pizzas: Pizza[] = await JSON.parse(fs.readFileSync('database/pizzaList.json', 'utf-8'))
  pizzas.push({id: pizza.id , name: pizza.name, ingredients: pizza.ingredients, url: pizza.url, status: pizza.status})

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