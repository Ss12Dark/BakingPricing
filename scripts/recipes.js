let recipeEditIndex = null;
let editingRecipeName = null;

document.addEventListener("DOMContentLoaded", () => {
    loadLaborCost();
    loadRecipes();
    addIngredientField(); // Add one ingredient selector on load
  });
  
  function addIngredientField() {
    const ingredients = JSON.parse(localStorage.getItem("ingredients")) || [];
    if (ingredients.length === 0) {
      alert("הכניסי מצרכים על מנת לבנות מתכון");
      return;
    }
  
    const div = document.createElement("div");
    div.classList.add("ingredient-row");
  
    const select = document.createElement("select");
    ingredients.forEach(ing => {
      const option = document.createElement("option");
      option.value = ing.name;
      option.dataset.pricePerGram = (ing.price / ing.amount).toFixed(4); // Price per gram
      option.textContent = ing.name;
      select.appendChild(option);
    });
  
    const input = document.createElement("input");
    input.type = "number";
    input.step = "0.01";
    input.placeholder = "כמות בגרמים";
    input.required = true;
  
    div.appendChild(select);
    div.appendChild(input);
    document.getElementById("ingredient-selection").appendChild(div);
  }
  
document.getElementById("labor-cost-form").addEventListener("submit", function (event) {
  event.preventDefault();
  
  const laborCost = parseFloat(document.getElementById("labor-cost").value);
  if (!isNaN(laborCost) && laborCost >= 0) {
    localStorage.setItem("laborCost", laborCost);
    location.reload();
  }
});

function getLaborCost() {
  return parseFloat(localStorage.getItem("laborCost")) || 0;
}

function loadLaborCost() {
  const savedCost = getLaborCost();
  if (savedCost > 0) {
    document.getElementById("labor-cost").value = savedCost;
  }
}

  
  document.getElementById("recipe-form").addEventListener("submit", function (event) {
    event.preventDefault();
  
    const name = document.getElementById("recipe-name").value.trim();
    const time = parseFloat(document.getElementById("recipe-time").value);
    const ingredientRows = document.querySelectorAll(".ingredient-row");
  
    if (!name || !time || ingredientRows.length === 0) return;
  
    let ingredientsList = [];
    let totalCost = 0;
  
    ingredientRows.forEach(row => {
      const select = row.querySelector("select");
      const grams = parseFloat(row.querySelector("input").value);
  
      if (grams > 0) {
        const pricePerGram = parseFloat(select.selectedOptions[0].dataset.pricePerGram);
        const cost = pricePerGram * grams;
        totalCost += cost;
  
        ingredientsList.push(`${select.value} (${grams}g)`);
      }
    });
  
    const recipe = { name, ingredients: ingredientsList, time, price: totalCost.toFixed(2) };
  
    let recipes = JSON.parse(localStorage.getItem("recipes")) || [];
    if (editingRecipeName !== null) {
      // Editing: Replace recipe with same name
      const index = recipes.findIndex(r => (r.name).replace(/['"`']/g, '') === editingRecipeName);
      if (index !== -1) recipes[index] = recipe;
      editingRecipeName = null;
    } else {
      recipes.push(recipe);
    }
  
    localStorage.setItem("recipes", JSON.stringify(recipes));
    document.getElementById("recipe-table-body").innerHTML = "";
    loadRecipes();
  
    this.reset();
    document.getElementById("ingredient-selection").innerHTML = "";
    addIngredientField();
  });

  function saveRecipe(recipe) {
    let recipes = JSON.parse(localStorage.getItem("recipes")) || [];
    recipes.push(recipe);
    localStorage.setItem("recipes", JSON.stringify(recipes));
  }
  
  function loadRecipes() {
    const recipes = JSON.parse(localStorage.getItem("recipes")) || [];
    recipes.forEach(addRecipeToTable);
  }

  function addRecipeToTable(recipe) {
    const tableBody = document.getElementById("recipe-table-body");
    const row = document.createElement("tr");
    const laborCost = getLaborCost();
    let totalCost = parseFloat(recipe.price) + (recipe.time / 60) * laborCost;

    let safeName = (recipe.name).replace(/['"`']/g, '');
    row.innerHTML = `
      <td>${safeName}</td>
      <td>${recipe.ingredients.join("<br>")}</td>
      <td>${recipe.time} דקות</td>
      <td>₪${totalCost.toFixed(2)}</td>
      <td>
        <button onclick="editRecipe('${safeName}')">✏️</button>
        <button onclick="deleteRecipe(this, '${safeName}')">❌</button>
        <button onclick="duplicateRecipe('${safeName}')">📄</button>
      </td>
    `;
  
    tableBody.appendChild(row);
  }

  function adjustGrams(factor) {
    document.querySelectorAll(".ingredient-row input[type='number']").forEach(input => {
      let current = parseFloat(input.value);
      if (!isNaN(current)) {
        input.value = (current * factor).toFixed(2);
      }
    });
  }  

  function duplicateRecipe(name) {
    let recipes = JSON.parse(localStorage.getItem("recipes")) || [];
    const original = recipes.find(r => r.name === name);
    if (!original) return;
  
    let newName = name + " (עותק)";
    let counter = 1;
    while (recipes.find(r => r.name === newName)) {
      newName = `${name} (עותק ${counter++})`;
    }
  
    const copy = { ...original, name: newName };
    saveRecipe(copy);
    addRecipeToTable(copy);
  }
  

  function editRecipe(name) {
    const recipes = JSON.parse(localStorage.getItem("recipes")) || [];
    
    const recipe = recipes.find(r => (r.name).replace(/['"`']/g, '') === (name).replace(/['"`']/g, ''));
    if (!recipe) return;
  
    document.getElementById("recipe-name").value = (recipe.name).replace(/['"`']/g, '');
    document.getElementById("recipe-time").value = recipe.time;
    document.getElementById("ingredient-selection").innerHTML = "";
    
    const allIngredients = JSON.parse(localStorage.getItem("ingredients")) || [];
    
    recipe.ingredients.forEach(entry => {
      const match = entry.match(/^(.+?) \((\d+)g\)$/);
      if (!match) return;
      
      const ingName = match[1];
      const grams = match[2];
      
      const div = document.createElement("div");
      div.classList.add("ingredient-row");
      
      const select = document.createElement("select");
      allIngredients.forEach(ing => {
        const option = document.createElement("option");
        option.value = ing.name;
        option.dataset.pricePerGram = (ing.price / ing.amount).toFixed(4);
        option.textContent = ing.name;
        if (ing.name === ingName) option.selected = true;
        select.appendChild(option);
      });
      
      const input = document.createElement("input");
      input.type = "number";
      input.placeholder = "כמות בגרמים";
      input.step = "0.01";
      input.required = true;
      input.value = grams;
  
      div.appendChild(select);
      div.appendChild(input);
      document.getElementById("ingredient-selection").appendChild(div);
    });
  
    editingRecipeName = (name).replace(/['"`']/g, '');
  }
  
  function deleteRecipe(button, name) {
    let recipes = JSON.parse(localStorage.getItem("recipes")) || [];
    recipes = recipes.filter(rec => rec.name !== name);
    localStorage.setItem("recipes", JSON.stringify(recipes));
    button.closest("tr").remove();
  }
  