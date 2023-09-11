import "./style.css";
import axios from "axios";
import { z } from "zod";

const BASE_URL = "http://localhost:3333"

const PizzaSchema = z.object ({
    id: z.number(),
    name: z.string(),
    ingredients: z.string().array(),
    url: z.string(),
    status: z.boolean()
  })

  type Pizza = z.infer<typeof PizzaSchema>

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
    status: z.boolean()
  })
  
  type Order = z.infer<typeof OrderSchema>

  type Item = {
    id: number,
    amount: number
  }

//----------------------------------------App state-----------------------------------------------------------------------//
let pizzas: Pizza[];
let selectedPizza: Pizza = {id:NaN, name:"",ingredients:[],url:"", status:true}
let isLoading = false
let isSending = false
let image : FormData | null = null
let orders : Order[] = []
let filter = true 

//----------------------------------------Mutation-----------------------------------------------------------------------//

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

const addTopping = (topping:string) => {
    if (!selectedPizza.ingredients.includes(topping)) {
        selectedPizza.ingredients.push(topping)
    }
}

const removeTopping = (topping: string) => {
    selectedPizza.ingredients = selectedPizza.ingredients.filter(element => element !== topping)
}

const changePizzaName = (name:string) => {
    selectedPizza.name = name
}

const changePizzaStatus = (status: boolean) => {
    selectedPizza.status = status
}

const changeFile = (file: FileList) =>{
    image = new FormData()
    image.append("picture", file[0])
    selectedPizza.url = file[0].name   
}

const addId = () => {
    selectedPizza.id = pizzas.reduce((maxIdPizza,currentPizza)=>maxIdPizza.id > currentPizza.id ? maxIdPizza : currentPizza).id + 1
}

const initNewPizza = () => {
    selectedPizza = {id:NaN, name:"",
                ingredients:[],
                url:"", status:true
                }
}

const selectPizza = (id:number) => {
    const selectedPizzaOrNull = pizzas.find(pizza => pizza.id === id)
    if (selectedPizzaOrNull) {
        selectedPizza = selectedPizzaOrNull
    }
    
}

const getAllOrder = async () => {
    isLoading = true
    const response =await axios.get(BASE_URL + "/admin/orders")
    isLoading = false
    
    const result = OrderSchema.array().safeParse(response.data)
    if (!result.success) {
        orders = []
    } else {
        orders = result.data
    }
}

const changeOrderStatus = (email:string, status:boolean) => {
    orders[orders.findIndex(order => order.email === email)].status = status
}

const changeFilter = () => {
    filter = !filter
}


 //----------------------------------------Render-----------------------------------------------------------------------// 
const renderList = () => {
    const container = document.getElementById("pizza-list")!
    container.innerHTML = ""

    for (const pizza of pizzas) {
        const content = `
        <div class="card w-96 bg-base-100 shadow-xl card-bordered">
            <div class="card-body">
                <h2 class="card-title">${pizza.name}</h2>
                <div class="card-actions justify-end">
                    <button id="modify-${"" + pizza.id}" class="btn btn-secondary">Modify</button>
                    <button id = "delete-${"" + pizza.id}" class="btn btn-circle btn-outline">
                        X
                    </button>
                </div>
            </div>
        </div>
        `
        const paragraph = document.createElement("p")
        paragraph.innerHTML = content
        container.appendChild(paragraph);
        (document.getElementById(`delete-${"" + pizza.id}`) as HTMLButtonElement).addEventListener("click", deleteListener);
        (document.getElementById(`modify-${"" + pizza.id}`) as HTMLButtonElement).addEventListener("click", modifyListener)
      
    }
}

const renderAddPizzaButton = () => {
    const container = document.getElementById("add-block")!
    
    const content = `
    <button id="add-pizza" class="btn btn-secondary">Add New Pizza</button>
      <div id="new-pizza">
      </div>
    `
    container.innerHTML = content;

    (document.getElementById("add-pizza") as HTMLButtonElement).addEventListener("click", renderAddListener)
}

const renderAddPizza = () => {
   const container = document.getElementById("new-pizza")!

    const content = `
 
        <div class="card w-96 bg-base-100 shadow-xl card-bordered">
            <div class="flex card-body">
                <div class="card-actions justify-end">
                    <div class="form-control w-full max-w-xs   gap-4">
                        <input id= "pizza-name"type="text" placeholder="Pizza Name" class="input input-bordered w-full max-w-xs" value="${selectedPizza.name}" />
                        <div class="flex flex-row items-center">
                            <select id ="topping-value" class="select select-secondary w-full max-w-xs">
                                <option disabled selected>Toppings</option>
                                ${toppingOptions()}
                            </select>
                            <button id="add-topping" class="btn btn-xs btn-secondary">Add</button>
                        </div>
                        <ul id="toppings" class="menu menu-vertical lg:menu-horizontal  rounded-box">
                        </ul>
                        <div class="form-control ">
                            <label class="flex flex-row cursor-pointer label justify-center gap-4">
                                <span class="label-text">Inactive</span> 
                                <input id="status" type="checkbox" class="toggle toggle-secondary" ${selectedPizza.status ? "checked" : "unchecked"} />  
                                <span class="label-text">Active</span>
                            </label>
                        </div>
                        <img id="pizza-image" src="/src/placeholder.jpg" class= "h-80 w-80" >
                        <input id="input-image" type="file" class="file-input   file-input-secondary file-input-bordered  w-full max-w-xs " />
                        <button id= "save" class="btn btn-secondary btn-s bg-secondary">Save</button>
                    </div>
                </div>
            </div>
        </div>
    `

    container.innerHTML = content

    if (selectedPizza.ingredients.length) {
        renderToppings()
    }
    ;

    
   (document.getElementById("add-topping") as HTMLButtonElement).addEventListener("click", addToppingListener);
   (document.getElementById("pizza-name") as HTMLInputElement).addEventListener("change", nameListener);
   (document.getElementById("status") as HTMLInputElement).addEventListener("change", statusListener);
   (document.getElementById("input-image") as HTMLInputElement).addEventListener("input", imageListener);

    const  imageElement = document.getElementById("pizza-image") as HTMLImageElement;
    const pizzaInputPicture = document.getElementById("input-image") as HTMLInputElement;

    if (selectedPizza.url) {
        imageElement.src = selectedPizza.url
    }

    pizzaInputPicture.onchange = function () {
    if (pizzaInputPicture.files) {
        imageElement.src = URL.createObjectURL(pizzaInputPicture.files[0])
    } 
  };

   (document.getElementById("save") as HTMLButtonElement).addEventListener("click", sendPizzaListener)
}

const renderToppings = () => {
    const container = document.getElementById("toppings")as HTMLUListElement

    container.innerHTML = ""
    for (const topping of selectedPizza.ingredients) {
        const content = `
        <li class ="flex flex-row items-center">${topping}<button id= "${topping}">x</button></li>
        `
        container.innerHTML += content;
 
    }

    for (const topping of selectedPizza.ingredients) {
        (document.getElementById(`${topping}`) as HTMLButtonElement).addEventListener("click", removeToppingListener)
    }
}

const renderSuccess = ( alert: string) => {
    const container = document.getElementById("new-pizza")!
    container.innerHTML = `
        <div class="alert alert-success bg-secondary">
            <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6 bg-sec" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>Pizza ${alert}!</span>
        </div>
  `
}

const toppingOptions = ():string => {
    const allTopping = [ "tomato sauce","pepperoni","mozzarella","basil",  "gorgonzola","grape", "parmesan", "shiitake mushrooms","oyster mushrooms","ricotta","garlic", "bacon",
    "onion", "rucola", "wild mushrooms","potato","burrata","rosemary", "pesto", "shallot", "pea","honey","goat cheese","feta", "shiitake mushrooms", "oyster mushrooms"]
    let content = ""
    
    for (const topping of allTopping) {
        content += `
        <option>${topping}</option>
        `
    }
    return content
}

const renderOrderButton = () => {
    const container = document.getElementById("orders-block")!
    const content = `
    <div class="w-96" >
        <button id="show-orders" class="btn btn-secondary">List Orders</button> 
        <button id="clear-orders" class="btn btn-secondary">Clear</button> 
        <button id="filter-orders" class="btn btn-secondary">Filter</button>
    </div>
    <div  class="overflow-x-auto" id= "order-list"></div>
    `
    container.innerHTML = content;

    (document.getElementById("show-orders") as HTMLButtonElement).addEventListener("click", renderOrdersListener);
    (document.getElementById("clear-orders") as HTMLButtonElement).addEventListener("click", renderClearOrdersListener);
    (document.getElementById("filter-orders") as HTMLButtonElement).addEventListener("click", renderFilteredOrdersListener)
} 

const listItems = (items:Item[]):string => {
    let content = ""
    for (const item of items) {
        let pizzaName = pizzas[pizzas.findIndex(pizza=> pizza.id === item.id)].name;
        content += `
        <li>${item.amount} x ${pizzaName}
        </li> `
    }
    return content
}

const renderOrders = (id?: string) => {
    const container = document.getElementById("order-list")!

    container.innerHTML = ""

    for (const order of orders) {
        const content = `
        <div class="card w-80 bg-base-300 card-compact text-primary-content card-bordered">
            <div class="card-body">
                <h2 class="card-title">${order.name}</h2>
                <ul>
                    ${listItems(order.items)}
                </ul>
                <div class="card-actions justify-end">
                <div class="form-control">
                    <label class="label cursor-pointer">
                        <span class="label-text">Closed</span> 
                        <input id="status-change-${order.email}" type="checkbox" class="toggle" ${order.status ? "checked" : "unchecked"}/>
                        <span class="label-text">Open</span>
                    </label>
                </div>
                </div>
            </div>
        </div>
     
        `
        const paragraph = document.createElement("p")
        paragraph.innerHTML = content
        if (logicFunction(order.status, id)) {
            container.appendChild(paragraph);
            (document.getElementById(`status-change-${order.email}`))!.addEventListener("change", changeStatusListener)
        }
       
    }
}
//----------------------------------------EventListener-----------------------------------------------------------------------//
const init = async () => {
    await getAllPizza();
    if (pizzas.length)
        renderList()

    renderAddPizzaButton()
    
    await getAllOrder()
    renderOrderButton()
};

const deleteListener = async (event: Event) => {
    const id = (event.target as HTMLButtonElement).id.split("-")[1]

    isSending = true
    await axios.delete(BASE_URL + "/admin/deletepizza/" + id)
    isSending = false

    await getAllPizza()
    if (pizzas.length)
        renderList()
};

const addToppingListener = () => {
    const topping = (document.getElementById("topping-value") as HTMLInputElement).value

    addTopping(topping)
    renderToppings()
};

const removeToppingListener = (event:Event) => {
    const topping = (event.target as HTMLButtonElement).id
    removeTopping(topping)
    renderToppings()
}

const nameListener = () => {
    changePizzaName((document.getElementById("pizza-name") as HTMLInputElement).value)
}

const statusListener = (event:Event) => {
   const status = (event.target as HTMLInputElement).checked

   changePizzaStatus(status)
}

const imageListener = (event:Event) => {
    const image = (event.target as HTMLInputElement).files
    
    if (image) {
        changeFile(image)
    }
}

const sendPizzaListener = async () => {
    if (Number.isNaN(selectedPizza.id)) {
        addId()

        isSending = true
        await axios.post(BASE_URL + "/admin/addpizza", selectedPizza);
        await axios.post(BASE_URL + "/admin/addpizzaimage", image, {
            headers: {
              "Content-Type": "multipart/form-data",
            }
        });
        isSending = false

        await getAllPizza();

        renderList()
        renderSuccess("added") 
        return 
    }

    isSending = true
    if (image) {
        await axios.patch(BASE_URL + "/admin/updatepizzaimage/" + selectedPizza.id, image, {
            headers: {
              "Content-Type": "multipart/form-data",
            }
        })
     }

     await axios.patch(BASE_URL + "/admin/updatepizza/" + selectedPizza.id, selectedPizza)
     isSending = false

     await getAllPizza();

    renderList()
    renderSuccess("updated")  
    
}

const renderAddListener = () => {
    initNewPizza()
    renderAddPizza()
}

const modifyListener = (event:Event) => {
    selectPizza(+(event.target as HTMLButtonElement).id.split("-")[1]) 
    renderAddPizza()
}

const renderOrdersListener = (event?:Event) => {

    renderOrders(event ? (event.target as HTMLButtonElement).id : "")
    
}

const renderClearOrdersListener = () => {
    const container = document.getElementById("order-list")!
    container.innerHTML = ""
}

const changeStatusListener = async (event:Event) =>  {
    const email = (event.target as HTMLInputElement).id.split("-")[(event.target as HTMLInputElement).id.split("-").length - 1]

    const status = (event.target as HTMLInputElement).checked
    changeOrderStatus(email, status)
    
    isSending = true
    await axios.patch(BASE_URL + "/admin/updatestatus/" + email)
    isSending = false
}

const renderFilteredOrdersListener = () => {
    const container = document.getElementById("order-list")!
    container.innerHTML = ""

    renderOrdersListener()
    changeFilter()
    
}

const logicFunction = (status:boolean, id?: string) => {
    if (id) {
        if (id === "show-orders") {
            return true
        }
    } 
    return status === filter
}

init()



//----------------------------------------EventListener-----------------------------------------------------------------------//

