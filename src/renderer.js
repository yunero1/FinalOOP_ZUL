const searchBtn = document.getElementById('searchBtn');
const searchInput = document.getElementById('search');
const recipeContainer = document.getElementById('recipeContainer');
const categoryButtons = document.querySelectorAll('.categoryBtn');
const favoritesContainer = document.getElementById('favoritesContainer');

let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

// Ni untuk search button
if (searchBtn) {
    searchBtn.addEventListener('click', () => {
        const query = searchInput.value;
        searchRecipes(query);
    });
}

// Ni untuk tambah category buttons
categoryButtons.forEach(button => {
    button.addEventListener('click', () => {
        const category = button.getAttribute('data-category');
        searchRecipesByCategory(category);
    });
});

// this one is for search recipe
function searchRecipes(query) {
    fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`)
        .then(response => response.json())
        .then(data => {
            let meals = [];
            if (data.meals) {
                meals = data.meals.slice(0, 8);
            }
            displayRecipes(meals);
        });
}
// this one to search recipe inside API
function searchRecipesByCategory(category) {
    fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`)
        .then(response => response.json())
        .then(data => {
            if (data.meals) {
                const selectedMeals = shuffleArray(data.meals).slice(0, 8);
                const mealDetailsPromises = selectedMeals.map(meal =>
                    fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`)
                        .then(response => response.json())
                );
                Promise.all(mealDetailsPromises).then(results => {
                    const meals = results.map(result => result.meals[0]);
                    displayRecipes(meals);
                });
            } else {
                displayRecipes([]);
            }
        });
}
// THis one TO display recipe including images
function displayRecipes(meals) {
    recipeContainer.innerHTML = '';
    meals.forEach(meal => {
        const recipeDiv = document.createElement('div');
        recipeDiv.className = 'recipe';
        recipeDiv.innerHTML = `
            <h2>${meal.strMeal}</h2>
            <img src="${meal.strMealThumb}" alt="${meal.strMeal}" class="recipe-image">
            <button class="view-detail-btn">View Detail</button>
            <button class="add-to-favorites">Add to Favorites</button>
        `;
        recipeContainer.appendChild(recipeDiv);

        // this one to link the eventlistener with other page
        recipeDiv.querySelector('.view-detail-btn').addEventListener('click', () => viewRecipeDetail(meal));
        recipeDiv.querySelector('.add-to-favorites').addEventListener('click', () => saveToFavorites(meal));
    });
}
//this one for random category recipe
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
//this one to save to favorite
function saveToFavorites(recipe) {
    const isFavorite = favorites.some(fav => fav.idMeal === recipe.idMeal);
    if (!isFavorite) {
        favorites.push(recipe);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        alert('Recipe added to favorites!');
    } else {
        alert('Recipe already in favorites!');
    }
}
// this to remove
function removeFromFavorites(recipe) {
    favorites = favorites.filter(fav => fav.idMeal !== recipe.idMeal);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    renderFavorites(); 
}
//this one handle for favorite including the description for product
function renderFavorites() {
    if (favoritesContainer) {
        favoritesContainer.innerHTML = '';
        if (favorites.length > 0) {
            favorites.forEach(fav => {
                const favDiv = document.createElement('div');
                favDiv.className = 'favorite-recipe';
                favDiv.innerHTML = `
                    <img src="${fav.strMealThumb}" alt="${fav.strMeal}" class="favorite-image">
                    <div class="favorite-recipe-text">
                        <h2>${fav.strMeal}</h2>
                        <p><strong>Origin:</strong> ${fav.strArea}</p>
                        <p><strong>Ingredients:</strong> <span class="edit-ingredients">${formatIngredients(fav)}</span></p>
                        <p><strong>Description:</strong> <span class="edit-description">${fav.strInstructions}</span></p>
                        <a href="${fav.strSource}" target="_blank">More info</a>
                        <button class="edit-btn">Edit</button>
                        <button class="confirm-edit" style="display: none;">Confirm</button>
                        <button class="cancel-edit" style="display: none;">Cancel</button>
                        <button class="remove-from-favorites">Remove</button>
                    </div>
                `;
                favoritesContainer.appendChild(favDiv);

                // Add event listener to the edit button
                favDiv.querySelector('.edit-btn').addEventListener('click', () => enableEdit(favDiv));
                // Add event listener to the confirm button
                favDiv.querySelector('.confirm-edit').addEventListener('click', () => confirmEdit(fav, favDiv));
                // Add event listener to the cancel button
                favDiv.querySelector('.cancel-edit').addEventListener('click', () => cancelEdit(favDiv));
                // Add event listener to the remove button
                favDiv.querySelector('.remove-from-favorites').addEventListener('click', () => removeFromFavorites(fav));
            });
        } else {
            favoritesContainer.innerHTML = '<p>No favorite recipes found.</p>';
        }
    }
}
//this one function to edit
function enableEdit(favDiv) {
    const ingredientsSpan = favDiv.querySelector('.edit-ingredients');
    const descriptionSpan = favDiv.querySelector('.edit-description');
    
    ingredientsSpan.contentEditable = 'true';
    descriptionSpan.contentEditable = 'true';

    favDiv.querySelector('.edit-btn').style.display = 'none';
    favDiv.querySelector('.confirm-edit').style.display = 'inline';
    favDiv.querySelector('.cancel-edit').style.display = 'inline';

    ingredientsSpan.focus();
}

function confirmEdit(fav, favDiv) {
    const newIngredients = favDiv.querySelector('.edit-ingredients').innerText;
    const newDescription = favDiv.querySelector('.edit-description').innerText;

    fav.strInstructions = newDescription;
    fav.strIngredients = newIngredients.split(', ');

    // Save updated favorites to localStorage
    localStorage.setItem('favorites', JSON.stringify(favorites));

    // Disable contentEditable
    favDiv.querySelector('.edit-ingredients').contentEditable = 'false';
    favDiv.querySelector('.edit-description').contentEditable = 'false';

    // Update button visibility
    favDiv.querySelector('.edit-btn').style.display = 'inline';
    favDiv.querySelector('.confirm-edit').style.display = 'none';
    favDiv.querySelector('.cancel-edit').style.display = 'none';

    alert('Recipe details updated successfully!');
}

function cancelEdit(favDiv) {
    // Disable contentEditable
    favDiv.querySelector('.edit-ingredients').contentEditable = 'false';
    favDiv.querySelector('.edit-description').contentEditable = 'false';

    // Update button visibility
    favDiv.querySelector('.edit-btn').style.display = 'inline';
    favDiv.querySelector('.confirm-edit').style.display = 'none';
    favDiv.querySelector('.cancel-edit').style.display = 'none';

    renderFavorites();
}

function viewRecipeDetail(recipe) {
    window.location.href = `recipe-detail.html?id=${recipe.idMeal}`;
}

function formatInstructions(instructions) {
    const steps = instructions.split('. ').map(step => step.trim()).filter(step => step.length > 0).slice(0, 4);
    return steps.map(step => `<li>${step}.</li>`).join('');
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

window.onload = () => {
    if (window.location.pathname.includes('favorites.html')) {
        renderFavorites();
    }
};
