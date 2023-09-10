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

  type Pizza= z.infer<typeof PizzaSchema>

//----------------------------------------App state-----------------------------------------------------------------------//
let pizzas: Pizza[];
let selectedPizza: Pizza = {id:NaN, name:"",ingredients:[],url:"", status:true}
let isLoading = false
let isSending = false
let image : FormData | null = null






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

const changeStatus = (status: boolean) => {
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

 //----------------------------------------Render-----------------------------------------------------------------------// 
const renderList = () => {
    const container = document.getElementById("pizza-list")!
    container.innerHTML = ""

    for (const pizza of pizzas) {
        const content = `
        <div class="card w-96 bg-base-100 shadow-xl">
            <div class="card-body">
                <h2 class="card-title">${pizza.name}</h2>
                <div class="card-actions justify-end">
                    <button id="modify-${"" + pizza.id}" class="btn btn-primary">Modify</button>
                    <button id = "delete-${"" + pizza.id}" class="btn btn-circle btn-outline">
                        X
                    </button>
                </div>
            </div>
        </div>
        `
        const paragraph = document.createElement("p")
        paragraph.id = "pizza-" + pizza.id
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
 
        <div class="card w-96 bg-base-100 shadow-xl">
            <div class="card-body">
                <div class="card-actions justify-end">
                    <div class="form-control w-full max-w-xs">
                        <input id= "pizza-name"type="text" placeholder="Pizza Name" class="input input-bordered w-full max-w-xs" value="${selectedPizza.name}" />
                        <div class="flex flex-row items-center">
                            <select id ="topping-value" class="select select-secondary w-full max-w-xs">
                                <option disabled selected>Toppings</option>
                                ${toppingOptions()}
                            </select>
                            <button id="add-topping" class="btn btn-xs">Add</button>
                        </div>
                        <ul id="toppings" class="menu menu-vertical lg:menu-horizontal bg-base-200 rounded-box">
                        </ul>
                        <div class="form-control w-52">
                            <label class="cursor-pointer label">
                                <span class="label-text">Status</span> 
                                <div>
                                    <input id="status" type="checkbox" class="toggle toggle-secondary" checked />  
                                </div>
                            </label>
                        </div>
                        <img id="pizza-image" src="/src/placeholder.jpg" class= "h-80 w-80" >
                        <input id="input-image" type="file" class="file-input file-input-bordered file-input-info w-full max-w-xs bg-secondary" />
                        <button id= "save" class="btn btn-success btn-xs bg-secondary">Save</button>
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
        <li>${topping}<button id= "${topping}">x</button></li>
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

/* const renderOrderButton = () => {
    const container = document.getElementById()
} */

//----------------------------------------EventListener-----------------------------------------------------------------------//
const init = async () => {
    await getAllPizza();
    if (pizzas.length)
        renderList()

    renderAddPizzaButton()
    //renderOrderButton()
};

const deleteListener = async (event: Event) => {
    const id = (event.target as HTMLButtonElement).id.split("-")[1]
    
    await axios.delete(BASE_URL + "/admin/deletepizza/" + id)
    
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

   changeStatus(status)
   console.log(selectedPizza)
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

        await axios.post(BASE_URL + "/admin/addpizza", selectedPizza);
        
        await axios.post(BASE_URL + "/admin/addpizzaimage", image, {
            headers: {
              "Content-Type": "multipart/form-data",
            }
        });
    
        await getAllPizza();
        renderList()
        renderSuccess("added") 
        return 
    }
    console.log(selectedPizza)

    if (image) {
        await axios.patch(BASE_URL + "/admin/updatepizzaimage/" + selectedPizza.id, image, {
            headers: {
              "Content-Type": "multipart/form-data",
            }
        })
     }

     await axios.patch(BASE_URL + "/admin/updatepizza/" + selectedPizza.id, selectedPizza)
    
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

/* const selectListener = () => {
    selectedPizza = pizzas.find(pizza => pizza.id === 5)!
    console.log(selectedPizza)
    renderAddPizza()
} */

init()



//----------------------------------------EventListener-----------------------------------------------------------------------//

