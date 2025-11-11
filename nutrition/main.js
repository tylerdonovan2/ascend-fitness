let meals = JSON.parse(localStorage.getItem("meals")) || [];


let groupTables = {}
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

    function resetMealEntryView() {
        addMealContainer.classList.toggle("hidden")
        bubbles.forEach(bubble => bubble.classList.remove("selected"));
        foodSearch.value = "";
        servingsInput.value = 0;
    }
})


function createMealEntry(productData, meal, servings) {
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

async function lookupProductByName(foodName) {
    try {
        const response = await fetch(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(foodName)}&search_simple=1&action=process&json=1`);
        const data = await response.json();

        if (data.products && data.products.length > 0) {
            return data.products.filter(product => product.product_name && product.product_name.trim() !== "").slice(0, 5).map(product => ({
                name: product.product_name || "No name",
                barcode: product.code || "No barcode"
            }));
        } else {
            return []; // No products found
        }
    } catch (error) {
        console.error("Error fetching data:", error);
        return [];
    }
}



