const API_URL = "https://671891927fc4c5ff8f49fcac.mockapi.io/v2";
let page = 1;                  // trang hiện tại
const batchSize = 20;          // số record mỗi batch
let isLoading = false;         // trạng thái đang fetch
let hasMore = true;            // còn dữ liệu không

const tableBody = document.getElementById("table-body");
const loader = document.getElementById("loader");
const container = document.getElementById("table-container");

// -------------------- Fetch Data --------------------
async function fetchData() {
  if (!hasMore || isLoading) return;

  isLoading = true;
  loader.style.display = "block";

  try {
    // Thêm timeout 1 giây max để UX nhanh hơn
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1000);

    const res = await fetch(`${API_URL}?page=${page}&limit=${batchSize}`, { signal: controller.signal });
    clearTimeout(timeoutId);

    const result = await res.json();

    if (result.length === 0) {
      hasMore = false; // hết dữ liệu
    } else {
      renderBatch(result);
      page++; // tăng page
    }
  } catch (err) {
    if (err.name === 'AbortError') {
      console.warn('Fetch request timed out (<1s)');
    } else {
      console.error(err);
    }
  }

  loader.style.display = "none";
  isLoading = false;
}

// -------------------- Render Batch --------------------
function renderBatch(users) {
  users.forEach((user) => {
    const tr = document.createElement("tr");
    tr.style.backgroundColor = user.color || "#fff"; // color áp dụng cho card / row
    tr.style.transition = "background 0.3s ease";

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
    `;
    tableBody.appendChild(tr);
  });
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
