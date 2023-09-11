import "./style.css";
import axios from "axios";
import { z } from "zod";

const PizzaSchema = z.object ({
  id: z.number(),
  name: z.string(),
  ingredients: z.string().array(),
  url: z.string(),
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

const BASE_URL = "http://localhost:3333"

// app state
let pizzas: Pizza[];
let selectedPizza: Pizza | null = null
let amount = 0;
let order: Order | null = null
let isLoading = false
let isSending = false


//mutation
const getAllPizza = async () => {
  isLoading = true
  const response = await axios.get(BASE_URL + "/pizzas");
  isLoading = false

  const result = PizzaSchema.array().safeParse(response.data);

  if (!result.success) 
    pizzas = []
  else
    pizzas = result.data;
};

const selectPizza = function(id:number) {
  selectedPizza = pizzas.find(pizza => pizza.id === id) || null
}

const updateOrderWithItem = function() {
  order = order ? {
    name: order.name,
    zipCode: order.zipCode,
    items : [
      ...order.items.filter(item => item.id !== selectedPizza!.id),
    { id: selectedPizza!.id, amount}
      ],
    address: order.address,
    email: order.email,
    phone: order.phone
    } : {
    name: "", 
    zipCode: "", 
    items : [
      {id:selectedPizza!.id, amount}
    ],
    address: "",
    email: "",
    phone: ""
    }
}

const updateAmount = function(num: number) {
amount = num
}

const removeItemFromOrder = function(id:number) {
  order = {
    name: order!.name,
    zipCode: order!.zipCode,
    items : order!.items.filter(item => item.id !== id),
    address: order!.address,
    email: order!.email,
    phone: order!.phone

  }
}

const changeName = (name:string) => {
  order = order ? {name, zipCode: order.zipCode, items: order.items, address: order.address, email:order.email, phone: order.phone} : null
}



//render
function renderList(pizzas: Pizza[]) {
  const container = document.getElementById("list")!
  
  for (const pizza of pizzas) {
    const paragraph = document.createElement("p")
    paragraph.id = "" + pizza.id
    paragraph.className = "btn  h-20 w-80"
    paragraph.innerHTML = pizza.name
    container.appendChild(paragraph)
    paragraph.addEventListener("click", selectListener)
   
  }
}

const renderSelected = function(pizza: Pizza) {
  const content = `
      <div class="card card-compact w-96 bg-base-100 shadow-xl">
        <figure><img src="${pizza.url}" alt="pizza" class="h-80 w-80" /></figure>
        <div class="card-body">
          <h2 class="card-title">${pizza.name}</h2>
          <p>${pizza.ingredients}</p>
          <div class="card-actions justify-end">
            <input type="number" id="amount"/>
            <button id="add" class="btn btn-success">Add to order</button>
          </div>
        </div>
      </div> 
    `

    document.getElementById("selected-pizza")!.innerHTML = content
    document.getElementById("add")!.addEventListener("click", addListener);
    (document.getElementById("amount") as HTMLInputElement).addEventListener("change", changeListener)

}

const renderOrder = function(order: Order) {
  const content = `
    <div class="card w-96 bg-base-100 shadow-xl p-8 gap-4" id=order>
      <h1 class="font-bold text-lg">Your order</h1>
      ${renderItems(order)}
      <input id="name" placeholder="Name" value="${order.name}">
      <input id="zipCode" placeholder="Zip code" value="${order.zipCode}">
      <input id="address" placeholder="Address" value="${order.address}">
      <input id="email" placeholder="Email" value="${order.email}">
      <input id="phone" placeholder="Phone" value="${order.phone}">
      <button class="btn btn-success" id="sendOrder">Send order</button>
    </div>
  `
  
  document.getElementById("order")!.innerHTML = content

  for (const orderID of order.items) {
    (document.getElementById(`deleteItem_${orderID.id}`) as HTMLButtonElement).addEventListener("click", removeListener)
  }

  (document.getElementById("sendOrder") as HTMLButtonElement).addEventListener("click", sendOrder);
  (document.getElementById("name") as HTMLButtonElement).addEventListener("change", addNameDetails);
  (document.getElementById("zipCode") as HTMLButtonElement).addEventListener("change", addZipDetails);
  (document.getElementById("address") as HTMLButtonElement).addEventListener("change", addAddressDetails);
  (document.getElementById("email") as HTMLButtonElement).addEventListener("change", addEmailDetails);
  (document.getElementById("phone") as HTMLButtonElement).addEventListener("change", addPhoneDetails);

}

const renderItems = (order:Order):string => {
  let result = ""

  for (const item of order.items) {
    result += `
    <div class="flex flex-row gap-4">
    <p id="details">${item.amount} x ${pizzas.find(pizza => item.id === pizza.id)!.name} </p>
    <button class="btn btn-circle btn-outline btn-xs" id ="deleteItem_${item.id}">x</button>
    </div>
    `
  }

  return result
}

// eventListeners
const init = async () => {
  await getAllPizza();
  if (pizzas.length)
  renderList(pizzas)
};


const selectListener = (event: Event) =>  {
  selectPizza(+(event.target as HTMLParagraphElement).id)
  
  if (selectedPizza)
    renderSelected(selectedPizza)

}

const addListener = function() {
  updateOrderWithItem()
  if (order)
    renderOrder(order)
}

const changeListener = function(event: Event) {
  updateAmount(+(event.target as HTMLInputElement).value)
}

const removeListener = function(event: Event) {
  removeItemFromOrder(+(event.target as HTMLButtonElement).id.split("_")[1])

  if (order)
    renderOrder(order)
}

const sendOrder = async function() {
  isSending = true
  const response = await axios.post(BASE_URL + "/pizza/order", JSON.stringify(order),  {
  headers: {
    "Content-Type": "application/json"
  }
  })                
  isSending = false
}

const addNameDetails = (event:Event) => {
    changeName((event.target as HTMLInputElement).value)
}

const addZipDetails = (event:Event) => {
  order!.zipCode  = ((event.target as HTMLInputElement).value)
}

const addAddressDetails = (event:Event) => {
  order!.address = (event.target as HTMLInputElement).value
}

const addEmailDetails = (event:Event) => {
  order!.email = (event.target as HTMLInputElement).value
}

const addPhoneDetails = (event:Event) => {
  order!.phone = (event.target as HTMLInputElement).value
}

init()







