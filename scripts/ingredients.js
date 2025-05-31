document.addEventListener("DOMContentLoaded", loadIngredients);

let editIndex = null;

// Handle form submission
document.getElementById("ingredient-form").addEventListener("submit", function (e) {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const amount = parseFloat(document.getElementById("amount").value);
  const price = parseFloat(document.getElementById("price").value);

  if (!name || isNaN(amount) || isNaN(price)) return;

  let ingredients = JSON.parse(localStorage.getItem("ingredients")) || [];

  if (editIndex !== null) {
    ingredients[editIndex] = { name, amount, price };
    editIndex = null; // Reset after edit
  } else {
    ingredients.push({ name, amount, price });
  }

  localStorage.setItem("ingredients", JSON.stringify(ingredients));
  this.reset();
  loadIngredients();
});

function saveIngredient(ingredient) {
  let ingredients = JSON.parse(localStorage.getItem("ingredients")) || [];
  ingredients.push(ingredient);
  localStorage.setItem("ingredients", JSON.stringify(ingredients));
}

function loadIngredients() {
  const ingredients = JSON.parse(localStorage.getItem("ingredients")) || [];
  const tableBody = document.getElementById("ingredient-table-body");
  tableBody.innerHTML = "";

  ingredients.forEach((ingredient, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
    <td>${ingredient.name}</td>
    <td>${ingredient.amount}g</td>
    <td>₪${ingredient.price}</td>
    <td style="text-align:center;">
    <button onclick="editIngredient(${index})">✏️</button>
    <button onclick="deleteIngredient(${index})">❌</button>
    <button onclick="duplicateIngredient('${ingredient.name}')">📄</button>
    </td>
    `;
    tableBody.appendChild(row);
  });
}

function duplicateIngredient(name) {
  const ingredients = JSON.parse(localStorage.getItem("ingredients")) || [];
  const original = ingredients.find(ing => ing.name === name);
  if (!original) return;

  let newName = `${original.name} (copy)`;
  let counter = 1;
  while (ingredients.some(ing => ing.name === newName)) {
    newName = `${original.name} (copy ${counter++})`;
  }

  const duplicate = {
    name: newName,
    amount: original.amount,
    price: original.price
  };

  ingredients.push(duplicate);
  localStorage.setItem("ingredients", JSON.stringify(ingredients));
  addIngredientToTable(duplicate);
  location.reload();
}

function editIngredient(index) {
  const ingredients = JSON.parse(localStorage.getItem("ingredients")) || [];
  const ingredient = ingredients[index];

  document.getElementById("name").value = ingredient.name;
  document.getElementById("amount").value = ingredient.amount;
  document.getElementById("price").value = ingredient.price;
  
  editIndex = index;
}

function addIngredientToTable(ingredient) {
  const tableBody = document.getElementById("ingredient-table-body");
  const row = document.createElement("tr");

  row.innerHTML = `
  <td>${ingredient.name}</td>
  <td>${ingredient.amount}g</td>
  <td>₪${ingredient.price}</td>
  <td><button onclick="deleteIngredient(this, '${ingredient.name}')">❌</button></td>
  `;

  tableBody.appendChild(row);
}

function deleteIngredient(index) {
  let ingredients = JSON.parse(localStorage.getItem("ingredients")) || [];
  ingredients.splice(index, 1);
  localStorage.setItem("ingredients", JSON.stringify(ingredients));
  loadIngredients();
}

