const API_URL = "https://671891927fc4c5ff8f49fcac.mockapi.io/v2";

let page = 1;
const batchSize = 20;
let isLoading = false;
let hasMore = true; // để kiểm tra xem còn dữ liệu không

const tableBody = document.getElementById("table-body");
const loader = document.getElementById("loader");
const container = document.getElementById("table-container");

// Lấy dữ liệu từ API theo page
async function fetchData() {
  if (!hasMore) return;

  isLoading = true;
  loader.style.display = "block";

  try {
    const res = await fetch(`${API_URL}?page=${page}&limit=${batchSize}`);
    const result = await res.json();

    if (result.length === 0) {
      hasMore = false; // không còn dữ liệu
    } else {
      renderBatch(result);
      page++; // tăng page cho lần gọi tiếp theo
    }
  } catch (err) {
    console.error(err);
  }

  loader.style.display = "none";
  isLoading = false;
}

// Render batch
function renderBatch(users) {
  users.forEach((user) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${user.id || ''}</td>
      <td><img src="${user.avatar || 'https://via.placeholder.com/40'}" alt="avatar" style="width:40px;height:40px;border-radius:50%;border:2px solid ${user.color || '#ccc'};object-fit:cover;"></td>
      <td style="font-weight:700; color:${user.color || '#000'};">${user.name || 'N/A'}</td>
      <td>${user.genre || 'N/A'}</td>
      <td>${user.email || 'N/A'}</td>
      <td>${user.company || 'N/A'}</td>
      <td>${user.phone || 'N/A'}</td>
      <td>${user.dob || 'N/A'}</td>
      <td>${user.timezone || 'N/A'}</td>
      <td>${user.music || 'N/A'}</td>
      <td>${user.city || 'N/A'}</td>
      <td>${user.state || 'N/A'}</td>
      <td>${user.address || 'N/A'}</td>
      <td>${user.street || 'N/A'}</td>
      <td>${user.building || 'N/A'}</td>
      <td>${user.zipcode || 'N/A'}</td>
      <td>${user.createdAt || 'N/A'}</td>
      <td>${user.password || 'N/A'}</td>
    `;
    tableBody.appendChild(tr);
  });
}

// Lắng nghe scroll để load tiếp
container.addEventListener("scroll", () => {
  const { scrollTop, scrollHeight, clientHeight } = container;
  if (scrollTop + clientHeight >= scrollHeight - 20 && !isLoading && hasMore) {
    fetchData();
  }
});

// Chạy ban đầu
fetchData();
