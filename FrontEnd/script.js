const API_BASE_URL = 'http://localhost:5678/api';

async function loadWorks() {
    try {
        const res = await fetch(`${API_BASE_URL}/works`);
        if (!res.ok) throw new Error('Erreur lors de la récupération des travaux');
        return await res.json();
    } catch (error) {
        console.error(error);
        return [];
    }
}

function displayWorks(worksList) {
    const container = document.querySelector('.gallery');
    container.innerHTML = '';

    worksList.forEach(work => {
        const figure = document.createElement('figure');
        const image = document.createElement('img');
        const legend = document.createElement('figcaption');

        image.src = work.imageUrl;
        image.alt = work.title;
        legend.textContent = work.title;

        figure.append(image, legend);
        container.appendChild(figure);
    });
}

async function initGallery() {
    const works = await loadWorks();
    displayWorks(works);
}

initGallery();