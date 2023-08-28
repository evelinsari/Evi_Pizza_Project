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

type Order = {
  name: string,
  zipCode: string,
  items: {
    id: number,
    amount: number
  }[]
}

const BASE_URL = "http://localhost:3333/pizza"

let pizzas: Pizza[];
let amount = 0;
let order: Order 

const getAllPizza = async ()=> {

  const response = await axios.get(BASE_URL);
  const data = response.data

  const result = PizzaSchema.array().safeParse(data);
  console.log(result)
  if (!result.success) {
    console.log(result.error);
    pizzas = []
    return pizzas;
  }
    pizzas = result.data;
    return pizzas
};

const loadPage = async () => {
  const pizzas = await getAllPizza();
  console.log(pizzas)
  renderName()
};

loadPage()


function renderName() {
  let listItems = document.getElementById("list")

  for (let pizza of pizzas) {
    let paragraph = document.createElement("p")
    paragraph.id = `${pizza.id}`
    paragraph.innerText = `${pizza.name}`
    paragraph.addEventListener("click", renderDetails)
    listItems?.appendChild(paragraph)
    
  }
}

const renderDetails = (event: Event) =>  {
  
  let selectedPizzaId = +(event.target as HTMLParagraphElement).id

  for (let pizza of pizzas) {
    if (selectedPizzaId === pizza.id) {
      const content = `
      <div>
        <h1>${pizza.name}</h1>
        <p class="bg-red-600">${pizza.ingredients}</p>
        <img src="${pizza.url}" />
        <input type="number" id="amount"/>
        <button id="add">Add to order</button>
      </div>
    `
    
    /*let paragraph = document.createElement("p") 
    paragraph.innerText = `${pizza.name}`
    selectedPizza?.appendChild(paragraph)
    let paragraphIngredients = document.createElement("p")
    paragraph.innerText = `${pizza.ingredients}`
    selectedPizza?.appendChild(paragraphIngredients)
    let pizzaImage = document.createElement("img")
    pizzaImage.setAttribute("src",`${pizza.url}`)
    selectedPizza?.appendChild(pizzaImage)*/
    
    document.getElementById("selected-pizza")!.innerHTML = content
    document.getElementById("amount")?.addEventListener("change", changeAmount)
    document.getElementById("add")?.addEventListener("click", function handleClick(event) {
      loadOrder(selectedPizzaId)
      orderDetails(selectedPizzaId)
    });
    } 
    
  }
}

const changeAmount = () => {
  let number = (document.getElementById("amount") as HTMLInputElement).value
  amount = +number
      
}

const loadOrder = (selectedPizzaId : number) => {
  
  if (order) {
    order = {
      name: order.name,
      zipCode: order.zipCode,
      items : [...order.items.filter(item => item.id !== selectedPizzaId),
      { id: selectedPizzaId, amount}
      ]
    } 
  } else {
    order = {name: "", zipCode: "", items : [{id:selectedPizzaId, amount}]}
  }
  
}

const orderDetails = (selectedPizzaId:number) =>  {
  
  let name = localStorage.getItem("name");
  let zipCode = localStorage.getItem("zipCode");
    const orderContent = `
    <div id=order2>
    <h1>Your order</h1>
    ${order.items.map(order => `<p id="details">${order.amount} x ${pizzas.find( pizza => order.id === pizza.id)!.name} </p><button id ="delete-button-${order.id}">x</button>`)}
    <input id="name" placeholder="Name" value="${name}">
    <input id="zip-code" placeholder="Zip code" value="${zipCode}">
    <button id="send-order">Send order</button>
    </div>
    `
    document.getElementById("order")!.innerHTML = orderContent
    localStorage.setItem("name",(document.getElementById("name") as HTMLInputElement).value);
    localStorage.setItem("zipCode", (document.getElementById("zip-code") as HTMLInputElement).value);
    document.getElementById("delete-button-" + selectedPizzaId)?.addEventListener("click", function handleClick(event){
      remove(event, selectedPizzaId)
    })
    document.getElementById("send-order")?.addEventListener("click", sendOrder)
    console.log(document.getElementById("details"))
    
    
}

const remove = (event: Event, selectedPizzaId:number) => {
   for (let item of order.items) {
     if (item.id === selectedPizzaId) {
        if (item.amount === 0) {
          let removedOrder = (event.target as HTMLButtonElement).parentElement
            removedOrder?.remove()
        } else {
          item.amount -= 1          
        }
      }
   }

   orderDetails(selectedPizzaId)
}


const sendOrder = ( ev: MouseEvent) =>  {
  const finalItems = (document.getElementById("details") as HTMLParagraphElement).innerText;
  const name = (document.getElementById("name") as HTMLInputElement).value;
  const zipCode = (document.getElementById("zip-code") as HTMLInputElement).value

  axios.post(BASE_URL.concat("/order"), {
      finalItems: finalItems,
      name: name,
      zipCode: zipCode
    })
    .then((response) => {
      console.log(response);
     
    });
   
};






