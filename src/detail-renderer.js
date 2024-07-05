window.onload = () => {
    const params = new URLSearchParams(window.location.search);
    const recipeId = params.get('id');

    fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${recipeId}`)
        .then(response => response.json())
        .then(data => {
            const recipe = data.meals[0];
            document.getElementById('recipe-title').textContent = recipe.strMeal;
            document.getElementById('recipe-image').src = recipe.strMealThumb;
            document.getElementById('recipe-instructions').innerHTML = formatInstructions(recipe.strInstructions);
            document.getElementById('recipe-ingredients').innerHTML = formatIngredients(recipe);
            document.getElementById('recipe-origin').innerHTML = `<strong>Origin:</strong> ${recipe.strArea}`;
            document.querySelector('.add-to-favorites').addEventListener('click', () => saveToFavorites(recipe));
            document.getElementById('more-info-link').href = recipe.strSource || '#';
        });
};

function saveToFavorites(recipe) {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const isFavorite = favorites.some(fav => fav.idMeal === recipe.idMeal);
    if (!isFavorite) {
        favorites.push(recipe);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        alert('Recipe added to favorites!');
    } else {
        alert('Recipe already in favorites!');
    }
}

function formatInstructions(instructions) {
    const steps = instructions.split('. ').map(step => step.trim()).filter(step => step.length > 0).slice(0, 6);
    return `<ul class="instructions">${steps.map(step => `<li>${step}.</li>`).join('')}</ul>`;
}

function formatIngredients(recipe) {
    let ingredients = [];
    for (let i = 1; i <= 20; i++) {
        if (recipe[`strIngredient${i}`]) {
            ingredients.push(recipe[`strIngredient${i}`]);
        }
    }
    return ingredients.join(', ');
}
