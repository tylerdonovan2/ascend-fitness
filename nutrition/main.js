let meals = JSON.parse(localStorage.getItem("meals")) || [];


let groupTables = {}
let selectedMeal;
document.addEventListener("DOMContentLoaded", () => {
    const navButtons = document.querySelectorAll("#navigation-button-container .nav-button");

    navButtons.forEach(button => {
        button.addEventListener("click", () => {
            const page = button.innerText.toLowerCase();
            window.location.href = "../" + page;
        });
    });

    groupTables = {
        "Breakfast": document.querySelector("#breakfast-table-body"),
        "Lunch": document.querySelector("#lunch-table-body"),
        "Dinner": document.querySelector("#dinner-table-body"),
        "Snack": document.querySelector("#snack-table-body"),
    }
    resetMealEntryTable()

    const addMealButton = document.querySelector("#add-button")
    const addMealContainer = document.querySelector("body > div.meal-entry-container")

    addMealButton.addEventListener("click", () => {
        addMealContainer.classList.toggle("hidden")
    })

    const exitMealEntryView = document.querySelector("#exit-meal-entry-view")
    exitMealEntryView.addEventListener("click", () => {
        resetMealEntryView();
    })

    const bubbles = document.querySelectorAll(".bubble");
    const mealInput = document.getElementById("mealGroupInput");

    bubbles.forEach(bubble => {
        bubble.addEventListener("click", (e) => {
            Array.from(document.querySelectorAll(".bubble.selected")).map(b => b.classList.toggle("selected"));
            bubble.classList.toggle("selected");
            mealInput.value = bubble.dataset.value;
        });
    });

    const servingsInput = document.getElementById("servings-input");
    const barcodeInput = document.getElementById("barcodeInput");
    const scanBarcodeButton = document.getElementById("scan-meal");
    scanBarcodeButton.addEventListener("click", async (e) => {
        const file = barcodeInput.files[0];
        const result = await uploadBarcodeImage(file);
        console.log(result);

        if (result.success === false) return;

        const barcode = result.data
        const productData = await lookupProductByBarcode(barcode);
        console.log(productData);

        const productName = productData.product.product_name;
        console.log(`You scanned ${productName}`)

        createMealEntry(productData, mealInput.value, servingsInput.value);
        resetMealEntryView()
    });


    const searchButton = document.getElementById('search-button')
    const searchSelect = document.querySelector("#search-select");
    const foodSearch = document.getElementById('food-search')

    searchButton.addEventListener('click', async () => {
        let foodName = foodSearch.value.trim();

        searchSelect.innerHTML = '';
        const loadingOption = document.createElement('option');
        loadingOption.textContent = 'Loading...';
        searchSelect.appendChild(loadingOption);

        const topResults = await lookupProductByName(foodName);

        if (topResults.length === 0) {
            const option = document.createElement('option');

            option.textContent = 'No results found.';
            return;
        }

        searchSelect.innerHTML = '';
        topResults.forEach((item, index) => {
            const option = document.createElement('option');
            option.value = item.barcode;
            option.textContent = `${item.name} (Barcode: ${item.barcode})`;
            searchSelect.appendChild(option);
        });
    });

    const createMealButton = document.querySelector("#create-meal");
    createMealButton.addEventListener("click", async () => {
        const barcode = searchSelect.value
        const productData = await lookupProductByBarcode(barcode);
        console.log(productData);

        const productName = productData.product.product_name;
        console.log(`You logged ${productName}`)

        createMealEntry(productData, mealInput.value, servingsInput.value);
        resetMealEntryView()
    })

    const exitMealDetailView = document.querySelector("#exit-meal-view")
    const mealDetailView = document.querySelector("#meal-view-container")
    exitMealDetailView.addEventListener("click", () => {
        mealDetailView.classList.add("hidden")
    })

    const deleteMealEntry = document.querySelector("#delete-entry")
    deleteMealEntry.addEventListener("click", () => {
        deleteMealEntryById(selectedMeal.id)
        mealDetailView.classList.add("hidden")
    })

    function resetMealEntryView() {
        addMealContainer.classList.add("hidden")

        bubbles.forEach(bubble => bubble.classList.remove("selected"));
        bubbles[0].classList.add("selected");
        mealInput.value = "Breakfast"

        foodSearch.value = "";
        servingsInput.value = 1;
    }
    resetMealEntryView();
})


function createMealEntry(productData, meal, servings) {
    if (productData == null || meal == null || servings == null) return;

    console.log(productData.product.images)
    console.log(productData.product.selected_images)

    let carbohydrates = productData.product.nutriments["carbohydrates"]

    const mealEntry = {
        id: crypto.randomUUID(),
        barcode: productData.code,
        name: productData.product.product_name,
        front_image: productData.product.image_url,
        nutrition_image: productData.product.image_nutrition_url,
        meal: meal,
        servings: servings,
        total_calories: productData.product.nutriments["energy-kcal"] * servings,
        calories_per_serving: productData.product.nutriments["energy-kcal"],
        protein: productData.product.nutriments["proteins"],
        carbohydrates: carbohydrates ? carbohydrates : productData.product.nutriments["carbohydrates-total"],
        fat: productData.product.nutriments["fat"],
    }

    meals.push(mealEntry)
    localStorage.setItem("meals", JSON.stringify(meals))
    resetMealEntryTable();
}


function resetMealEntryTable() {
    Object.values(groupTables).forEach(tbody => {
        tbody.innerHTML = "";
    });

    meals.forEach(entry => {
        addMealEntryToTable(entry);
    });

    updateTotals();
}

function updateTotals() {
    const calorieTotal = document.querySelector("#calorie-total")
    const proteinTotal = document.querySelector("#protein-total")
    const fatTotal = document.querySelector("#fat-total")
    const carbohydratesTotal = document.querySelector("#carbohydrates-total")

    let cals = 0;
    let proteins = 0;
    let carbohydrates = 0;
    let fats = 0;
    meals.forEach(entry => {
        cals = cals + entry.total_calories
        proteins = proteins + entry.protein * entry.servings
        carbohydrates = carbohydrates + entry.carbohydrates * entry.servings
        fats = fats + entry.fat * entry.servings
    })

    calorieTotal.innerHTML = Math.round(cals);
    proteinTotal.innerHTML = Math.round(proteins) + "g";
    carbohydratesTotal.innerHTML = Math.round(carbohydrates) + "g";
    fatTotal.innerHTML = Math.round(fats) + "g";
}

function addMealEntryToTable(mealEntry) {
    let tableRow = document.createElement("tr")

    tableRow.appendChild(createElementWithText("td", mealEntry.name));
    tableRow.appendChild(createElementWithText("td", mealEntry.servings));
    tableRow.appendChild(createElementWithText("td", Math.round(mealEntry.total_calories) + "cal"));

    tableRow.value = mealEntry.id;

    tableRow.addEventListener("click", () => {
        showMealDetails(mealEntry)
    })

    groupTables[mealEntry.meal].appendChild(tableRow);
}

function createElementWithText(tag, text) {
    let element = document.createElement(tag);
    element.textContent = text;
    return element;
}

async function uploadBarcodeImage(file) {
    const formData = new FormData();
    formData.append("image", file);

    const res = await fetch("http://localhost:5000/scan_barcode", {
        method: "POST",
        body: formData
    });

    const data = await res.json();
    return data;
}

async function lookupProductByBarcode(barcode) {

    const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`, {
        method: "GET",
    });

    const data = await res.json();
    return data;
}

async function lookupProductByName(foodName) {
    try {
        const response = await fetch(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(foodName)}&search_simple=1&action=process&json=1`);
        const data = await response.json();
        console.log(data)

        if (data.products && data.products.length > 0) {
            return data.products.filter(product => product.product_name && product.product_name.trim() !== "").slice(0, 10).map(product => ({
                name: product.product_name || "No name",
                barcode: product.code || "No barcode",
                response: product,
            }));
        } else {
            return []; // No products found
        }
    } catch (error) {
        console.error("Error fetching data:", error);
        return [];
    }
}

const mealDetailName = document.querySelector("#meal-name-view")
const mealDetailProtein = document.querySelector("#protein-view")
const mealDetailCarbohyrdates = document.querySelector("#carb-view")
const mealDetailFat = document.querySelector("#fat-view")
const mealDetailCalories = document.querySelector("#calorie-view")
const mealDetailServings = document.querySelector("#serving-view")
const mealDetailImage = document.querySelector("#meal-view-container > div > div > div:nth-child(2) > img")

function showMealDetails(entry){
    let mealDetailView = document.querySelector("#meal-view-container")
    mealDetailView.classList.remove("hidden")

    selectedMeal = entry;

    let servings = +entry.servings;

    mealDetailServings.textContent = entry.servings;
    mealDetailName.textContent = entry.name;
    mealDetailProtein.textContent = Math.round(entry.protein * servings);
    mealDetailCarbohyrdates.textContent = Math.round(entry.carbohydrates * servings);
    mealDetailFat.textContent = Math.round(entry.fat * servings);
    mealDetailCalories.textContent = Math.round(entry.total_calories);
    mealDetailImage.src = entry.front_image
}



function popMeal(){
    meals.pop()
    localStorage.setItem("meals", JSON.stringify(meals))
}


function deleteMealEntryById(mealId){
    meals = meals.filter(meal => meal.id !== mealId)

    localStorage.setItem("meals", JSON.stringify(meals));

    resetMealEntryTable();
}
