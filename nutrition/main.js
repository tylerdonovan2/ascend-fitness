let meals = JSON.parse(localStorage.getItem("meals")) || [];


let groupTables = {}
document.addEventListener("DOMContentLoaded", () => {
    const navButtons = document.querySelectorAll("#navigation-button-container .nav-button");

    navButtons.forEach(button => {
        button.addEventListener("click", () => {
            const page = button.innerText.toLowerCase();
            window.location.href = page;
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
        addMealContainer.classList.toggle("hidden")
    })

    function resetMealEntryView() {
        dateInput.value = new Date().toISOString().split('T')[0];
        bubbles.forEach(bubble => bubble.classList.remove("selected"));
        muscleInput.value = "";
    }

    const bubbles = document.querySelectorAll(".bubble");
    const mealInput = document.getElementById("mealGroupInput");

    bubbles.forEach(bubble => {
      bubble.addEventListener("click", (e) => {
        Array.from(document.querySelectorAll(".bubble.selected")).map(b => b.classList.toggle("selected"));
        bubble.classList.toggle("selected");
        mealInput.value = e.target.dataset.value;
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
    });
})


function createMealEntry(productData, meal, servings){
    const mealEntry = {
        name: productData.product.product_name,
        image: productData.product.image_small_url,
        meal: meal,
        servings: servings,
        total_calories: productData.product.nutriments["energy-kcal_serving"] * servings,
        calories_per_serving: productData.product.nutriments["energy-kcal_serving"],
        protein: productData.product.nutriments["proteins"],
        carbohydrates: productData.product.nutriments["carbohydrates"],
        fat: productData.product.nutriments["fat"],
    }
    
    meals.push(mealEntry)
    localStorage.setItem("meals", JSON.stringify(meals))
    resetMealEntryTable();
}

function resetMealEntryTable(){
    Object.values(groupTables).forEach(tbody => {
        tbody.innerHTML = "";
    });

    meals.forEach(entry => {
        addMealEntryToTable(entry);
    });

    updateTotals();
}

function updateTotals(){
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
    tableRow.appendChild(createElementWithText("td", mealEntry.total_calories + "cal"));

    tableRow.value = mealEntry.id;

    console.log(mealEntry.meal)

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

    const res = await fetch(`https://world.openfoodfacts.net/api/v2/product/${barcode}?fields=product_name,nutriscore_data,nutriments,nutrition_grades`, {
        method: "GET",
    });

    const data = await res.json();
    return data;
}