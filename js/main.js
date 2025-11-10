const API_URL = "https://671891927fc4c5ff8f49fcac.mockapi.io/v2";
let page = 1;
const batchSize = 20;
let isLoading = false;
let hasMore = true;

let sortField = 'id';
let sortOrder = 'asc';

const tableBody = document.getElementById("table-body");
const loader = document.getElementById("loader");
const container = document.getElementById("table-container");

let currentEditTr = null; 


function lightenColor(hex, amount = 0.4) {
  if (!hex) return "#fff";
  if (!hex.startsWith("#")) return hex;
  try {
    let [r, g, b] = hex.match(/\w\w/g).map(x => parseInt(x, 16));
    r = Math.min(255, r + 255 * amount);
    g = Math.min(255, g + 255 * amount);
    b = Math.min(255, b + 255 * amount);
    return `rgb(${r}, ${g}, ${b})`;
  } catch {
    return hex;
  }
}

// -------------------- Fetch Data --------------------
async function fetchData() {
  if (!hasMore || isLoading) return;
  isLoading = true;
  loader.style.display = "block";

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const apiUrlWithSort = `${API_URL}?page=${page}&limit=${batchSize}&sortBy=${sortField}&order=${sortOrder}`;
    const res = await fetch(apiUrlWithSort, { signal: controller.signal });
    clearTimeout(timeoutId);

    const result = await res.json();

    if (result.length === 0) {
      hasMore = false;
      console.log("--- Đã tải hết dữ liệu ---");
    } else {
      renderBatch(result);
      page++;
    }
  } catch (err) {
    if (err.name === 'AbortError') console.warn('Fetch request timed out');
    else console.error('Fetch error:', err);
  }

  loader.style.display = "none";
  isLoading = false;
}

// -------------------- Render Batch --------------------
function renderBatch(users) {
  users.forEach((user) => {
    const tr = document.createElement("tr");
    tr.style.backgroundColor = lightenColor(user.color || "#ffffff", 0.4);

    tr.innerHTML = `
      <td data-label="Actions" style=" display: flex; gap: 20px; flex-wrap: nowrap;">
        <button class="btn-edit" style="width: 40px; height: 40px;" data-id="${user.id}">✏️</button>
        <button class="btn-delete" style="width: 40px; height: 40px;" data-id="${user.id}"> ❌</button>
      </td>
      <td data-label="ID">${user.id || ''}</td>
      <td data-label="Avatar"><img src="${user.avatar || 'https://via.placeholder.com/40'}" alt="avatar" style="width:40px;height:40px;border-radius:50%;border:2px solid #fff;object-fit:cover;"></td>
      <td data-label="Name" style="font-weight:700;">${user.name || 'N/A'}</td>
      <td data-label="Genre">${user.genre || 'N/A'}</td>
      <td data-label="Email">${user.email || 'N/A'}</td>
      <td data-label="Company">${user.company || 'N/A'}</td>
      <td data-label="Phone">${user.phone || 'N/A'}</td>
      <td data-label="DOB">${user.dob || 'N/A'}</td>
      <td data-label="Timezone">${user.timezone || 'N/A'}</td>
      <td data-label="Music">${user.music || 'N/A'}</td>
      <td data-label="City">${user.city || 'N/A'}</td>
      <td data-label="State">${user.state || 'N/A'}</td>
      <td data-label="Address">${user.address || 'N/A'}</td>
      <td data-label="Street">${user.street || 'N/A'}</td>
      <td data-label="Building">${user.building || 'N/A'}</td>
      <td data-label="ZIP">${user.zipcode || 'N/A'}</td>
      <td data-label="CreatedAt">${user.createdAt || 'N/A'}</td>
      <td data-label="Password">${user.password || 'N/A'}</td>
    `;
    tableBody.appendChild(tr);
  });
}

// -------------------- Scroll --------------------
container.addEventListener("scroll", () => {
  const { scrollTop, scrollHeight, clientHeight } = container;
  if (scrollTop + clientHeight >= scrollHeight - 20 && !isLoading && hasMore) fetchData();
});

// -------------------- Modal --------------------
function showModal() { document.getElementById("modal").style.display = "flex"; }
function closeModal() {
  const form = document.getElementById("formAdd");
  document.getElementById("modal").style.display = "none";
  form.reset();
  form.removeAttribute("data-edit-id");
  currentEditTr = null;
}

// -------------------- Delete & Edit --------------------
tableBody.addEventListener("click", async (e) => {
  const id = e.target.dataset.id;
  const tr = e.target.closest("tr");
  const form = document.getElementById("formAdd");

  // Delete
  if (e.target.classList.contains("btn-delete")) {
    if (!confirm("Bạn có chắc muốn xóa record này không?")) return;
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(res.status);
      tr.remove();
    } catch (err) { console.error("Lỗi xóa:", err); }
    return;
  }

  // Edit
  if (e.target.classList.contains("btn-edit")) {
    try {
      const res = await fetch(`${API_URL}/${id}`);
      if (!res.ok) throw new Error(res.status);
      const data = await res.json();
      currentEditTr = tr;
      form.dataset.editId = id;

      Object.keys(data).forEach(key => {
        const input = form.querySelector(`[name="${key}"]`);
        if (input) input.value = data[key];
      });

      showModal();
    } catch (err) { console.error("Lỗi tải record:", err); }
  }
});

// -------------------- Submit Form --------------------
document.getElementById("formAdd").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;
  const f = new FormData(form);

  const payload = {};
  f.forEach((v, k) => payload[k] = v);
  if (!payload.createdAt) payload.createdAt = new Date().toISOString();

  const editId = form.dataset.editId;

  try {
    let res, data;
    if (editId && currentEditTr) {
      res = await fetch(`${API_URL}/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      data = await res.json();

      currentEditTr.style.backgroundColor = lightenColor(data.color || "#fff", 0.4);
      currentEditTr.innerHTML = `
        <td data-label="Actions">
          <button class="btn-edit" data-id="${data.id}">✏️</button>
          <button class="btn-delete" data-id="${data.id}">❌</button>
        </td>
        <td data-label="ID">${data.id}</td>
        <td data-label="Avatar"><img src="${data.avatar}" style="width:40px;height:40px;border-radius:50%;border:2px solid #fff;object-fit:cover;"></td>
        <td data-label="Name" style="font-weight:700;">${data.name}</td>
        <td data-label="Genre">${data.genre}</td>
        <td data-label="Email">${data.email}</td>
        <td data-label="Company">${data.company}</td>
        <td data-label="Phone">${data.phone}</td>
        <td data-label="DOB">${data.dob}</td>
        <td data-label="Timezone">${data.timezone}</td>
        <td data-label="Music">${data.music}</td>
        <td data-label="City">${data.city}</td>
        <td data-label="State">${data.state}</td>
        <td data-label="Address">${data.address}</td>
        <td data-label="Street">${data.street}</td>
        <td data-label="Building">${data.building}</td>
        <td data-label="ZIP">${data.zipcode}</td>
        <td data-label="CreatedAt">${data.createdAt}</td>
        <td data-label="Password">${data.password}</td>
      `;
      currentEditTr = null;
    } else {
      res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      data = await res.json();
      renderBatch([data]);
    }

    closeModal();
  } catch (err) { console.error("Lỗi thêm/sửa:", err); }
});

const avatarFile = document.getElementById("avatarFile");
const avatarPreview = document.getElementById("avatarPreview");

avatarFile?.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (evt) => avatarPreview.src = evt.target.result;
    reader.readAsDataURL(file);
  } else {
    avatarPreview.src = "https://via.placeholder.com/80";
  }
});

// -------------------- Init --------------------
fetchData();
