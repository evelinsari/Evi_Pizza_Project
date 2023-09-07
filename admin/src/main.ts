import "./style.css";
import axios from "axios";
import { z } from "zod";

type Data = {
    id: number,
    name: string,
    ingredients:string[],
    url: string,
    status?: boolean
}
const BASE_URL = "http://localhost:3333"

const PizzaSchema = z.object ({
    id: z.number(),
    name: z.string(),
    ingredients: z.string().array(),
    url: z.string(),
  })

  type Pizza= z.infer<typeof PizzaSchema>
//----------------------------------------App state-----------------------------------------------------------------------//
let pizzas: Pizza[];
let selectedPizza: Pizza | null = null;
let newPizza: Pizza |null = null;
let isLoading = false
let isSending = false



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
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
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
      /* (document.getElementById(`modify-${"" + pizza.id}`) as HTMLButtonElement).addEventListener("click", selectListener) */
      
    }
}

const renderAddPizza = () => {
   const container = document.getElementById("new-pizza")!
    const content = `
        <button id="add-pizza" class="btn btn-secondary">Add New Pizza</button>

    `
    const paragraph = document.createElement("p")
    paragraph.innerHTML = content
    container.appendChild(paragraph);

    (document.getElementById("add-pizza") as HTMLButtonElement).addEventListener("click", addListener)
}


//----------------------------------------EventListener-----------------------------------------------------------------------//
const init = async () => {
    await getAllPizza();
    if (pizzas.length)
        renderList()

    renderAddPizza()
  };

 const deleteListener = (event: Event) => {
    const id = (event.target as HTMLButtonElement).id.split("-")[1]
    axios.delete(BASE_URL + "/admin/deletepizza/" + id)
  
    getAllPizza()
    if (pizzas.length)
        renderList()
 }

const addListener = () => {
    

}






init()



//----------------------------------------EventListener-----------------------------------------------------------------------//

/* const idInput = document.getElementById("id") as HTMLInputElement
const nameInput = document.getElementById("name")as HTMLInputElement
const ingredientsInput = document.getElementById("ingredients")as HTMLInputElement
const urlInput = document.getElementById("url") as HTMLInputElement
const statusInput = document.getElementById("status") as HTMLInputElement
const fileInput = document.getElementById("file") as HTMLInputElement


async function createData() {
    const data = new FormData()
    data.append("id", idInput.value)
    data.append("name", nameInput.value)
    const ingredientsArray = ingredientsInput.value.split(',').map(ingredient => ingredient.trim());
    data.append("ingredients", JSON.stringify(ingredientsArray))
    data.append("url", urlInput.value)
    data.append("status", statusInput.value)
    const input = fileInput.files
    if (!input) return null
    data.append("file", input[0])

    return data 
}

const sendData = async function (data: FormData) {
    console.log("bent")
    const response = await axios.post(BASE_URL + "/admin/addpizza", data , {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
    })
}

document.getElementById("add")?.addEventListener("click", async () => {
    const data = await createData();
    if (data) {
        sendData(data);
    }
})
 */