function exportAllDataToCSV() {
    const ingredients = JSON.parse(localStorage.getItem("ingredients")) || [];
    const recipes = JSON.parse(localStorage.getItem("recipes")) || [];
    const cases = JSON.parse(localStorage.getItem("cases")) || [];
  
    let csv = "";
  
    // Ingredients
    csv += "Ingredients\nName,Amount (g),Price (₪)\n";
    ingredients.forEach(i => {
      csv += `"${i.name}",${i.amount},${i.price}\n`;
    });
  
    csv += "\n";
  
    // Recipes
    csv += "Recipes\nName,Ingredients,Time (min),Price (₪)\n";
    recipes.forEach(r => {
      csv += `"${r.name}","${r.ingredients.join(" / ")}",${r.time},${r.price}\n`;
    });
  
    csv += "\n";
  
    // Cases
    csv += "Cases\nName,Recipes,Total Time (min),Total Price (₪)\n";
    cases.forEach(c => {
      csv += `"${c.name}","${c.recipes.join(" / ")}",${c.time},${c.price}\n`;
    });
  
    // Download
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "bakery_data.csv";
    link.click();
  }

  document.getElementById("csv-upload").addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (!file) return;
  
    const reader = new FileReader();
    reader.onload = function (e) {
      const content = e.target.result;
      parseAndRestoreCSV(content);
    };
    reader.readAsText(file);
  });
  
  function parseAndRestoreCSV(content) {
    const lines = content.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
    
    let section = "";
    let i = 0;
    const ingredients = [], recipes = [], cases = [];
  
    while (i < lines.length) {
      const line = lines[i];
  
      if (line === "Ingredients") {
        section = "ingredients";
        i += 2; // Skip header
        continue;
      }
      if (line === "Recipes") {
        section = "recipes";
        i += 2;
        continue;
      }
      if (line === "Cases") {
        section = "cases";
        i += 2;
        continue;
      }
  
      const row = lines[i].split(",");
  
      if (section === "ingredients") {
        ingredients.push({
          name: row[0].replaceAll('"', ''),
          amount: parseFloat(row[1]),
          price: parseFloat(row[2])
        });
      } else if (section === "recipes") {
        recipes.push({
          name: row[0].replaceAll('"', ''),
          ingredients: row[1].replaceAll('"', '').split(" / "),
          time: parseFloat(row[2]),
          price: parseFloat(row[3])
        });
      } else if (section === "cases") {
        cases.push({
          name: row[0].replaceAll('"', ''),
          recipes: row[1].replaceAll('"', '').split(" / "),
          time: parseFloat(row[2]),
          price: parseFloat(row[3])
        });
      }
  
      i++;
    }
  
    // Save back to localStorage
    localStorage.setItem("ingredients", JSON.stringify(ingredients));
    localStorage.setItem("recipes", JSON.stringify(recipes));
    localStorage.setItem("cases", JSON.stringify(cases));
  
    alert("Data successfully imported! Refresh the page to see updates.");
  }
  
  