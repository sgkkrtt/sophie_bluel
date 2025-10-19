const API_BASE = "http://localhost:5678/api";

async function fetchWorks() {
  const res = await fetch(`${API_BASE}/works`);
  return res.json();
}
async function fetchCategories() {
  const res = await fetch(`${API_BASE}/categories`);
  return res.json();
}

function renderWorks(list) {
  const gallery = document.querySelector(".gallery");
  gallery.innerHTML = "";
  list.forEach((w) => {
    const fig = document.createElement("figure");
    const img = document.createElement("img");
    const cap = document.createElement("figcaption");
    img.src = w.imageUrl;
    img.alt = w.title;
    cap.textContent = w.title;
    fig.append(img, cap);
    gallery.append(fig);
  });
}

function renderFilters(categories, works) {
  const bar = document.querySelector(".filtres");
  if (!bar) return;
  bar.innerHTML = "";

  const btnAll = document.createElement("button");
  btnAll.textContent = "Tous";
  btnAll.classList.add("active");
  bar.append(btnAll);
  btnAll.addEventListener("click", () => {
    renderWorks(works);
    setActive(btnAll);
  });

  categories.forEach((cat) => {
    const btn = document.createElement("button");
    btn.textContent = cat.name;
    bar.append(btn);
    btn.addEventListener("click", () => {
      const filtered = works.filter((w) => w.categoryId === cat.id);
      renderWorks(filtered);
      setActive(btn);
    });
  });
}
function setActive(btn) {
  document.querySelectorAll(".filtres button").forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
}

function applyAdminUI() {
  const token = localStorage.getItem("token");
  const banner = document.querySelector(".edit-banner");
  const editBtn = document.querySelector(".edit-btn");
  const loginLink = document.querySelector("#login-link");

  if (!loginLink) return;

  if (token) {
    if (banner) banner.style.display = "block";
    if (editBtn) {
      editBtn.style.display = "inline-block";
      editBtn.onclick = openModal;
    }
    loginLink.textContent = "logout";
    loginLink.href = "#";
    loginLink.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("token");
      window.location.reload();
    });
  } else {
    if (banner) banner.style.display = "none";
    if (editBtn) {
      editBtn.style.display = "none";
      editBtn.onclick = null;
    }
    loginLink.textContent = "login";
    loginLink.href = "login.html";
  }
}

const modal = document.querySelector("#modal");
const modalGallery = document.querySelector(".modal-gallery");
const modalClose = document.querySelector(".modal-close");
const modalTitle = document.querySelector(".modal-title");
let isAddMode = false;

if (modalClose) modalClose.addEventListener("click", () => closeModal());
if (modal) modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });

function openModal() {
  modal.classList.add("active");
  isAddMode = false;
  renderModalGallery();
  if (modalTitle) modalTitle.textContent = "Galerie photo";
}
function closeModal() {
  modal.classList.remove("active");
  isAddMode = false;
}

async function deleteWork(id) {
  const token = localStorage.getItem("token");
  if (!token) return alert("Non autorisé");
  const res = await fetch(`${API_BASE}/works/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.ok) {
    document.querySelector(`[data-id="${id}"]`)?.remove();
    const works = await fetchWorks();
    renderWorks(works);
  } else alert("Erreur de suppression");
}

async function renderModalGallery() {
  const wrapper = modal.querySelector(".modal-wrapper");
  wrapper.querySelectorAll("hr, .modal-add, .modal-back").forEach(e => e.remove());

  modalGallery.innerHTML = "";
  const works = await fetchWorks();

  works.forEach((w) => {
    const fig = document.createElement("figure");
    fig.dataset.id = w.id;

    const img = document.createElement("img");
    img.src = w.imageUrl;
    img.alt = w.title;

    const del = document.createElement("i");
    del.classList.add("fa-solid", "fa-trash-can", "delete-icon");
    del.addEventListener("click", () => deleteWork(w.id));

    fig.append(img, del);
    modalGallery.append(fig);
  });

  const line = document.createElement("hr");
  const addBtn = document.createElement("button");
  addBtn.textContent = "Ajouter une photo";
  addBtn.classList.add("modal-add");
  addBtn.addEventListener("click", renderAddPhotoForm);
  wrapper.append(line, addBtn);
}

function renderAddPhotoForm() {
  if (isAddMode) return;
  isAddMode = true;
  modalGallery.innerHTML = "";
  const wrapper = modal.querySelector(".modal-wrapper");
  wrapper.querySelectorAll(".modal-add, .modal-separator, .modal-back").forEach(e => e.remove());

  let backBtn = wrapper.querySelector(".modal-back");
  if (!backBtn) {
    backBtn = document.createElement("button");
    backBtn.classList.add("modal-back");
    backBtn.innerHTML = '<i class="fa-solid fa-arrow-left"></i>';
    backBtn.addEventListener("click", () => {
      isAddMode = false;
      backBtn.remove();
      renderModalGallery();
      if (modalTitle) modalTitle.textContent = "Galerie photo";
    });
    wrapper.prepend(backBtn);
  }

  if (modalTitle) modalTitle.textContent = "Ajout photo";

  const form = document.createElement("form");
  form.classList.add("modal-add-form");
  form.enctype = "multipart/form-data";

  const uploadArea = document.createElement("div");
  uploadArea.classList.add("upload-area");

  const placeholder = document.createElement("div");
  placeholder.classList.add("upload-placeholder");
  placeholder.innerHTML = `
    <i class="fa-regular fa-image"></i>
    <button type="button">+ Ajouter photo</button>
    <p>jpg, png : 4mo max</p>
  `;

  const inputFile = document.createElement("input");
  inputFile.type = "file";
  inputFile.accept = "image/*";
  inputFile.required = true;
  inputFile.style.display = "none";
  placeholder.querySelector("button").addEventListener("click", () => inputFile.click());
  uploadArea.append(placeholder, inputFile);

  inputFile.addEventListener("change", () => {
    const file = inputFile.files[0];
    if (file) {
      const img = document.createElement("img");
      img.src = URL.createObjectURL(file);
      uploadArea.innerHTML = "";
      uploadArea.append(img);
    }
  });

  const inputTitle = document.createElement("input");
  inputTitle.type = "text";
  inputTitle.placeholder = "Titre";
  inputTitle.required = true;

  const selectCat = document.createElement("select");
  selectCat.required = true;
  fetchCategories().then((cats) => {
    cats.forEach((c) => {
      const opt = document.createElement("option");
      opt.value = c.id;
      opt.textContent = c.name;
      selectCat.append(opt);
    });
  });

  const errorMsg = document.createElement("p");
  errorMsg.style.color = "red";
  errorMsg.style.display = "none";

  const submitBtn = document.createElement("button");
  submitBtn.type = "submit";
  submitBtn.textContent = "Valider";

  form.append(uploadArea, inputTitle, selectCat, errorMsg, submitBtn);

  form.addEventListener("input", () => {
    if (inputFile.files.length && inputTitle.value.trim() && selectCat.value) {
      submitBtn.classList.add("active");
    } else {
      submitBtn.classList.remove("active");
    }
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return alert("Non autorisé");

    if (!inputFile.files.length || !inputTitle.value.trim() || !selectCat.value) {
      errorMsg.textContent = "Veuillez remplir tous les champs avant de valider.";
      errorMsg.style.display = "block";
      return;
    }
    errorMsg.style.display = "none";

    const formData = new FormData();
    formData.append("image", inputFile.files[0]);
    formData.append("title", inputTitle.value);
    formData.append("category", selectCat.value);

    const res = await fetch(`${API_BASE}/works`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (res.ok) {
      inputFile.value = "";
      inputTitle.value = "";
      selectCat.value = "";
      submitBtn.classList.remove("active");
      backBtn.remove();
      renderModalGallery();
      const works = await fetchWorks();
      renderWorks(works);
    } else {
      errorMsg.textContent = "Erreur lors de l'envoi du formulaire.";
      errorMsg.style.display = "block";
    }
  });

  modalGallery.append(form);
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const [works, categories] = await Promise.all([fetchWorks(), fetchCategories()]);
    renderWorks(works);
    renderFilters(categories, works);
    applyAdminUI();
  } catch (e) {
    console.error("Erreur d'initialisation :", e);
  }
});
