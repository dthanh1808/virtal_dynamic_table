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
    if (err.name === 'AbortError') {
      console.warn('Fetch request timed out');
    } else {
      console.error('Fetch error:', err);
    }
  }

  loader.style.display = "none";
  isLoading = false;
}

// -------------------- Render Batch --------------------
function renderBatch(users) {
  users.forEach((user) => {
    const tr = document.createElement("tr");
    tr.style.backgroundColor = user.color || "#fff";

    tr.innerHTML = `
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
      <td data-label="Actions">
        <button class="btn-delete" data-id="${user.id}">❌ Delete</button>
      </td>
    `;
    tableBody.appendChild(tr);
  });
}

// -------------------- Sort --------------------
function sortData(field) {
  if (isLoading) return;

  if (sortField === field) sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
  else { sortField = field; sortOrder = 'asc'; }

  tableBody.innerHTML = '';
  page = 1;
  hasMore = true;
  fetchData();
}

// -------------------- Scroll --------------------
container.addEventListener("scroll", () => {
  const { scrollTop, scrollHeight, clientHeight } = container;
  if (scrollTop + clientHeight >= scrollHeight - 20 && !isLoading && hasMore) {
    fetchData();
  }
});

// -------------------- Delete --------------------
tableBody.addEventListener("click", async (e) => {
  if (!e.target.classList.contains("btn-delete")) return;

  const id = e.target.dataset.id;
  if (!confirm("Bạn có chắc muốn xóa record này không?")) return;

  try {
    const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(res.status);
    // Xóa khỏi bảng
    e.target.closest("tr").remove();
    console.log(`Deleted record ${id}`);
  } catch (err) {
    console.error("Lỗi xóa record:", err);
  }
});

// -------------------- Modal Add Record --------------------
function showModal() { document.getElementById("modal").style.display="flex"; }
function closeModal() { 
  document.getElementById("modal").style.display="none"; 
  document.getElementById("formAdd").reset(); 
}

document.getElementById("formAdd").addEventListener("submit", async(e) => {
  e.preventDefault();
  const f = new FormData(e.target);
  const now = new Date().toISOString();

  const payload = {
    avatar: f.get("avatar") || "https://via.placeholder.com/40",
    name: f.get("name") || "N/A",
    genre: f.get("genre") || "N/A",
    email: f.get("email") || "N/A",
    company: f.get("company") || "N/A",
    phone: f.get("phone") || "N/A",
    dob: f.get("dob") || now,
    timezone: f.get("timezone") || "UTC",
    music: f.get("music") || "N/A",
    city: f.get("city") || "N/A",
    state: f.get("state") || "N/A",
    address: f.get("address") || "N/A",
    street: f.get("street") || "N/A",
    building: f.get("building") || "N/A",
    zipcode: f.get("zipcode") || "00000",
    createdAt: now,
    password: f.get("password") || "***",
    color: f.get("color") || "#cccccc"
  };

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error(res.status);
    const newUser = await res.json();
    closeModal();
    renderBatch([newUser]); // thêm vào bảng ngay
  } catch(err) {
    console.error("Lỗi thêm record:", err);
  }
});

// -------------------- Init --------------------
fetchData();
