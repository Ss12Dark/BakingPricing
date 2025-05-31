let editingCaseName = null;

document.addEventListener("DOMContentLoaded", () => {
    loadRecipesForSelection();
    loadCases();
    addRecipeField(); // Add first selection field
  });
  
  // Load recipes from localStorage for selection
  function loadRecipesForSelection() {
    const recipes = JSON.parse(localStorage.getItem("recipes")) || [];
    if (recipes.length === 0) return;
  
    document.querySelectorAll(".recipe-select").forEach(select => select.innerHTML = generateRecipeOptions(recipes));
  }
  
  // Generate recipe options dynamically
  function generateRecipeOptions(recipes) {
    return recipes.map(recipe => `<option value="${recipe.name}" data-time="${recipe.time}" data-price="${recipe.price}">${recipe.name}</option>`).join("");
  }
  
  // Add new recipe selection field
  function addRecipeField() {
    const div = document.createElement("div");
    div.classList.add("recipe-row");
  
    div.innerHTML = `
      <select class="recipe-select">${generateRecipeOptions(JSON.parse(localStorage.getItem("recipes")) || [])}</select>
      <button type="button" onclick="this.parentElement.remove()">❌</button>
    `;
  
    document.getElementById("recipe-selection").appendChild(div);
  }
  
  document.getElementById("case-form").addEventListener("submit", function (event) {
    event.preventDefault();
  
    const name = document.getElementById("case-name").value.trim();
    const recipeRows = document.querySelectorAll(".recipe-select");
  
    if (!name || recipeRows.length === 0) return;
  
    let selectedRecipes = [];
    let totalTime = 0;
    let totalPrice = 0;
  
    recipeRows.forEach(select => {
      const selectedOption = select.selectedOptions[0];
      const recipeName = selectedOption.value;
      const recipeTime = parseFloat(selectedOption.dataset.time);
      const recipePrice = parseFloat(selectedOption.dataset.price);
  
      selectedRecipes.push(recipeName);
      totalTime += recipeTime;
      totalPrice += recipePrice;
    });
  
    const caseData = { name, recipes: selectedRecipes, time: totalTime, price: totalPrice.toFixed(2) };
  
    let cases = JSON.parse(localStorage.getItem("cases")) || [];
  
    if (editingCaseName !== null) {
      const index = cases.findIndex(c => c.name === editingCaseName);
      if (index !== -1) cases[index] = caseData;
      editingCaseName = null;
    } else {
      cases.push(caseData);
    }
  
    localStorage.setItem("cases", JSON.stringify(cases));
    this.reset();
    document.getElementById("recipe-selection").innerHTML = "";
    addRecipeField();
    reloadCaseTable();
  });
  
  function editCase(name) {
    const cases = JSON.parse(localStorage.getItem("cases")) || [];
    const selectedCase = cases.find(c => c.name === name);
    if (!selectedCase) return;
  
    document.getElementById("case-name").value = selectedCase.name;
    document.getElementById("recipe-selection").innerHTML = "";
  
    selectedCase.recipes.forEach(recipeName => {
      const div = document.createElement("div");
      div.classList.add("recipe-row");
  
      const select = document.createElement("select");
      select.classList.add("recipe-select");
  
      const recipes = JSON.parse(localStorage.getItem("recipes")) || [];
      select.innerHTML = generateRecipeOptions(recipes);
      select.value = recipeName;
  
      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.textContent = "❌";
      removeBtn.onclick = () => div.remove();
  
      div.appendChild(select);
      div.appendChild(removeBtn);
      document.getElementById("recipe-selection").appendChild(div);
    });
  
    editingCaseName = name;
  }
  
  function reloadCaseTable() {
    const tableBody = document.getElementById("case-table-body");
    tableBody.innerHTML = "";
    loadCases();
  }

  // Save cases to localStorage
  function saveCase(caseData) {
    let cases = JSON.parse(localStorage.getItem("cases")) || [];
    cases.push(caseData);
    localStorage.setItem("cases", JSON.stringify(cases));
  }
  
  // Load cases from storage
  function loadCases() {
    const cases = JSON.parse(localStorage.getItem("cases")) || [];
    cases.forEach(addCaseToTable);
  }

  // Function to fetch labor cost
  function getLaborCost() {
    return parseFloat(localStorage.getItem("laborCost")) || 0; // Default to 0 if not set
  }
  
  function addCaseToTable(caseData) {
    const tableBody = document.getElementById("case-table-body");
    const row = document.createElement("tr");
    let costLabor = getLaborCost();
    let totalPrice = parseFloat(caseData.price) + (parseFloat(caseData.time) / 60) * costLabor;
    let profit = (parseFloat(caseData.time) / 60) * costLabor;
  
    row.innerHTML = `
      <td>${caseData.name}</td>
      <td>${caseData.recipes.join("<br> ")}</td>
      <td>${caseData.time} דקות </td>
      <td>₪${totalPrice.toFixed(2)}</td>
      <td>₪${profit.toFixed(2)}</td>
      <td>
        <button onclick="editCase('${caseData.name}')">✏️</button>
        <button onclick="deleteCase(this, '${caseData.name}')">❌</button>
      </td>
    `;
  
    tableBody.appendChild(row);
  }
  

  // Delete case
  function deleteCase(button, name) {
    let cases = JSON.parse(localStorage.getItem("cases")) || [];
    cases = cases.filter(c => c.name !== name);
    localStorage.setItem("cases", JSON.stringify(cases));
    button.closest("tr").remove();
  }
  