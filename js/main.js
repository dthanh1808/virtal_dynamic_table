const API_URL = "https://671891927fc4c5ff8f49fcac.mockapi.io/v2";
let page = 1;
const batchSize = 20;
let isLoading = false;
let hasMore = true;

// *** Biến trạng thái SORT mới ***
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
    const timeoutId = setTimeout(() => controller.abort(), 1000);

    const apiUrlWithSort = `${API_URL}?page=${page}&limit=${batchSize}&sortBy=${sortField}&order=${sortOrder}`;

    const res = await fetch(apiUrlWithSort, { signal: controller.signal });
    clearTimeout(timeoutId);

    const result = await res.json();

    if (result.length === 0) {
      hasMore = false; // hết dữ liệu
      console.log("--- Đã tải hết dữ liệu ---");
    } else {
      renderBatch(result);
      page++; // tăng page
    }
  } catch (err) {
    if (err.name === 'AbortError') {
      console.warn('Fetch request timed out (<1s)');
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

// -------------------- Sort Logic MỚI --------------------
/**
 * Thiết lập trường và thứ tự sắp xếp mới, sau đó reset và tải lại dữ liệu.
 * @param {string} field .
 */
function sortData(field) {
  if (isLoading) return; // Không cho phép sort khi đang tải

  // 1. Cập nhật thứ tự sắp xếp
  if (sortField === field) {
    // Đảo ngược thứ tự nếu nhấp vào cùng trường
    sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
  } else {
    // Đặt trường sắp xếp mới và reset thứ tự về 'asc'
    sortField = field;
    sortOrder = 'asc';
  }

  console.log(`Sorting by: ${sortField}, order: ${sortOrder}`);

  // 2. Reset trạng thái và giao diện
  tableBody.innerHTML = ''; // Xóa dữ liệu cũ trên bảng
  page = 1; // Quay lại trang 1
  hasMore = true; // Cho phép tải lại

  // 3. Tải dữ liệu mới
  fetchData();
}


// -------------------- Scroll Event --------------------
container.addEventListener("scroll", () => {
  const { scrollTop, scrollHeight, clientHeight } = container;
  // Tải dữ liệu khi cuộn đến gần cuối (cách 20px)
  if (scrollTop + clientHeight >= scrollHeight - 20 && !isLoading && hasMore) {
    fetchData();
  }
});

// -------------------- Init --------------------
fetchData();

