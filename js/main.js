const API_URL = "https://671891927fc4c5ff8f49fcac.mockapi.io/v2";
const tableBody = document.getElementById("table-body");
const loader = document.getElementById("loader");
const container = document.getElementById("table-container");

let isLoading = false;
let hasMore = true;
let loadCount = 0; // số lần fetch

// -------------------- Extra Record Mới --------------------
const extraRecords = [
  {
    createdAt: "2025-11-04T13:25:00.000Z",
    name: "TaeKook",
    avatar: "https://i.pinimg.com/1200x/93/eb/08/93eb085b92787a510a88beb9b2f74a83.jpg",
    address: "North Avenue",
    genre: "male",
    city: "East Monroe",
    street: "Baker Street",
    timezone: "Asia/HoChiMinh",
    company: "Usider Studio",
    dob: "2004-01-05T08:00:00.000Z",
    color: "#a4c2f4",
    music: "Counting Stars",
    building: "A12",
    state: "California",
    zip: "90045",
    email: "taekook@example.com",
    phone: "84 912 456 789",
    password: "X9T6LpQ1zA",
    id: "101"
  }
];

// -------------------- Fetch Data --------------------
async function fetchData() {
  if (!hasMore || isLoading) return;

  isLoading = true;
  loader.style.display = "block";

  let batchSize;
  switch (loadCount + 1) {
    case 1: batchSize = 20; break;
    case 2: batchSize = 20; break;
    case 3: batchSize = 40; break;
    case 4: batchSize = 20; break;
    default:
      hasMore = false;
      loader.style.display = "none";
      renderExtraRecords(); 
      return;
  }

  const start = loadCount === 0 ? 1 : loadCount === 1 ? 21 : loadCount === 2 ? 41 : 81;
  const end = start + batchSize - 1;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1000);

    const res = await fetch(`${API_URL}`, { signal: controller.signal });
    clearTimeout(timeoutId);

    const allData = await res.json();

    const batch = allData
      .filter((u) => Number(u.id) >= start && Number(u.id) <= end)
      .sort((a, b) => Number(a.id) - Number(b.id));

    if (batch.length === 0) {
      hasMore = false;
    } else {
      renderBatch(batch);
      loadCount++;
    }
  } catch (err) {
    if (err.name === "AbortError") console.warn("Fetch request timed out (<1s)");
    else console.error(err);
  }

  loader.style.display = "none";
  isLoading = false;

  // Nếu đã fetch hết batch cuối, render extra record xuống cuối
  if (!hasMore) renderExtraRecords();
}

// -------------------- Render Batch --------------------
function renderBatch(users) {
  users.forEach(renderRow);
}

// -------------------- Render Extra Records --------------------
function renderExtraRecords() {
  extraRecords.forEach(renderRow);
}

// -------------------- Render Row --------------------
function renderRow(user) {
  const tr = document.createElement("tr");
  tr.style.backgroundColor = user.color || "#fff";
  tr.style.transition = "background 0.3s ease";

  tr.innerHTML = `
    <td data-label="ID">${user.id || ""}</td>
    <td data-label="Avatar"><img src="${user.avatar || "https://via.placeholder.com/40"}" alt="avatar" style="width:40px;height:40px;border-radius:50%;border:2px solid #fff;object-fit:cover;"></td>
    <td data-label="Name" style="font-weight:700;">${user.name || "N/A"}</td>
    <td data-label="Genre">${user.genre || "N/A"}</td>
    <td data-label="Email">${user.email || "N/A"}</td>
    <td data-label="Company">${user.company || "N/A"}</td>
    <td data-label="Phone">${user.phone || "N/A"}</td>
    <td data-label="DOB">${user.dob || "N/A"}</td>
    <td data-label="Timezone">${user.timezone || "N/A"}</td>
    <td data-label="Music">${user.music || "N/A"}</td>
    <td data-label="City">${user.city || "N/A"}</td>
    <td data-label="State">${user.state || "N/A"}</td>
    <td data-label="Address">${user.address || "N/A"}</td>
    <td data-label="Street">${user.street || "N/A"}</td>
    <td data-label="Building">${user.building || "N/A"}</td>
    <td data-label="ZIP">${user.zip || "N/A"}</td>
    <td data-label="CreatedAt">${user.createdAt || "N/A"}</td>
    <td data-label="Password">${user.password || "N/A"}</td>
  `;
  tableBody.appendChild(tr);
}

// -------------------- Scroll Event --------------------
container.addEventListener("scroll", () => {
  const { scrollTop, scrollHeight, clientHeight } = container;
  if (scrollTop + clientHeight >= scrollHeight - 20 && !isLoading && hasMore) {
    fetchData();
  }
});

// -------------------- Init --------------------
fetchData();
