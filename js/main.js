const API_URL = "https://671891927fc4c5ff8f49fcac.mockapi.io/v2";
let page = 1;
const batchSize = 20;
let isLoading = false;
let hasMore = true;

let allData = [];
let isEditMode = false;
let editingUser = null;

const tableBody = document.getElementById("table-body");
const loader = document.getElementById("loader");
const container = document.getElementById("table-container");
const modal = document.getElementById("modal");
const formAdd = document.getElementById("formAdd");
const avatarFile = document.getElementById("avatarFile");
const avatarPreview = document.getElementById("avatarPreview");


function lightenColor(hex, amount = 0.4) {
    if (!hex) return "#fff";
    if (!hex.startsWith("#")) return hex;
    try {
        let [r,g,b] = hex.match(/\w\w/g).map(x => parseInt(x,16));
        r = Math.min(255, r + 255*amount);
        g = Math.min(255, g + 255*amount);
        b = Math.min(255, b + 255*amount);
        return `rgb(${r}, ${g}, ${b})`;
    } catch { return hex; }
}

function resizeImage(file, maxWidth=80, maxHeight=80) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => {
            const img = new Image();
            img.onload = () => {
                let {width, height} = img;
                if(width>maxWidth){ height*=maxWidth/width; width=maxWidth; }
                if(height>maxHeight){ width*=maxHeight/height; height=maxHeight; }
                const canvas = document.createElement("canvas");
                canvas.width = width; canvas.height = height;
                canvas.getContext("2d").drawImage(img,0,0,width,height);
                resolve(canvas.toDataURL("image/png"));
            };
            img.onerror = reject;
            img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}


async function fetchData(){
    if(!hasMore || isLoading) return;
    isLoading = true; loader.style.display="block";

    try{
        const res = await fetch(`${API_URL}?page=${page}&limit=${batchSize}&sortBy=id&order=asc`);
        const result = await res.json();
        if(result.length===0) hasMore=false;
        else { allData.push(...result); renderBatch(result); page++; }
    }catch(err){ console.error(err); }

    loader.style.display="none";
    isLoading=false;
}

function renderBatch(users){ users.forEach(u=>renderRow(u)); }

function renderRow(user){
    const tr=document.createElement("tr");
    tr.dataset.id=user.id;
    tr.style.backgroundColor = lightenColor(user.color||"#fff",0.6);
    tr.innerHTML=`
        <td>
            <button class="btn-edit" style="background-color:#7ad6ca;border:none;width:30px;height:30px;border-radius:4px" data-id="${user.id}">✏️</button>
            <button class="btn-delete" style="background-color:#D9D9D9;border:none;width:30px;height:30px;border-radius:4px" data-id="${user.id}">❌</button>
        </td>
        <td>${user.id}</td>
        <td><img src="${user.avatar||'https://via.placeholder.com/40'}" style="width:40px;height:40px;border-radius:50%;object-fit:cover;"></td>
        <td>${user.name||'N/A'}</td>
        <td>${user.genre||'N/A'}</td>
        <td>${user.email||'N/A'}</td>
        <td>${user.company||'N/A'}</td>
        <td>${user.phone||'N/A'}</td>
        <td>${user.dob||'N/A'}</td>
        <td>${user.timezone||'N/A'}</td>
        <td>${user.music||'N/A'}</td>
        <td>${user.city||'N/A'}</td>
        <td>${user.state||'N/A'}</td>
        <td>${user.address||'N/A'}</td>
        <td>${user.street||'N/A'}</td>
        <td>${user.building||'N/A'}</td>
        <td>${user.zip||'N/A'}</td>
        <td>${user.createdAt||'N/A'}</td>
        <td>${user.password||'N/A'}</td>
    `;
    tableBody.appendChild(tr);
}


container.addEventListener("scroll", ()=>{
    const {scrollTop, scrollHeight, clientHeight} = container;
    if(scrollTop+clientHeight >= scrollHeight-20 && !isLoading && hasMore) fetchData();
});


function showModal(){ modal.style.display="flex"; }
function closeModal(){
    modal.style.display="none";
    formAdd.reset();
    avatarPreview.src="https://via.placeholder.com/80";
    formAdd.removeAttribute("data-edit-id");
    editingUser=null; isEditMode=false;
}

avatarFile?.addEventListener("change", async e=>{
    const file = e.target.files[0];
    if(file){ avatarPreview.src = await resizeImage(file,80,80); }
    else avatarPreview.src="https://via.placeholder.com/80";
});


tableBody.addEventListener("click", e=>{
    const tr = e.target.closest("tr");
    if(!tr) return;
    const id = e.target.dataset.id;


    if(e.target.classList.contains("btn-delete")){
        if(!confirm("Bạn có chắc muốn xóa record này không?")) return;
        fetch(`${API_URL}/${id}`,{method:"DELETE"})
            .then(()=>{ tr.remove(); allData = allData.filter(u=>u.id!=id); })
            .catch(err=>console.error(err));
        return;
    }


    if(e.target.classList.contains("btn-edit")){
        const data = allData.find(u=>u.id==id);
        if(!data) return alert("Không tìm thấy dữ liệu");
        isEditMode=true; editingUser=data; formAdd.dataset.editId=id;

        Object.keys(data).forEach(key=>{
            const input=formAdd.querySelector(`[name="${key}"]`);
            if(input){
                if(key==="dob" && data.dob){
                    const date=new Date(data.dob);
                    input.value=date.toISOString().slice(0,16);
                    if(!data.dob.includes("T")) input.value=`${data.dob}T00:00`;
                }else input.value=data[key];
            }
        });

        avatarPreview.src = data.avatar||"https://via.placeholder.com/80";
        showModal();
    }
});


function validateForm(payload){
    const errors = [];

    if(!payload.name || !/^[A-Za-zÀ-ÖØ-öø-ÿ\s]{2,50}$/.test(payload.name))
        errors.push("Name phải từ 2-50 ký tự chữ.");

    if(!payload.email || !/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(payload.email))
        errors.push("Email không hợp lệ.");

    if(!payload.phone || !/^\d{7,15}$/.test(payload.phone))
        errors.push("Phone chỉ chứa 7-15 chữ số.");

    if(!payload.zip || !/^\d{3,10}$/.test(payload.zip))
        errors.push("ZIP chỉ chứa 3-10 chữ số.");

    if(!payload.password || !/^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,20}$/.test(payload.password))
        errors.push("Password 6-20 ký tự, ít nhất 1 chữ, 1 số và 1 ký tự đặc biệt (!@#$%^&*).");

    if(payload.dob && isNaN(Date.parse(payload.dob)))
        errors.push("DOB không hợp lệ.");

    return errors;
}

formAdd.addEventListener("submit", async e=>{
    e.preventDefault();
    const f = new FormData(formAdd);
    const payload={};
    f.forEach((v,k)=>payload[k]=v);
    if(avatarFile.files[0]) payload.avatar = avatarPreview.src;
    else if(editingUser?.avatar) payload.avatar = editingUser.avatar;
    if(!payload.createdAt) payload.createdAt = new Date().toISOString();

    const errors = validateForm(payload);
    if(errors.length){ alert(errors.join("\n")); return; }

    try{
        let data;
        if(isEditMode && editingUser){
            const res = await fetch(`${API_URL}/${editingUser.id}`, {
                method:"PUT",
                headers:{"Content-Type":"application/json"},
                body: JSON.stringify(payload)
            });
            data = await res.json();
            allData = allData.map(u=>u.id==data.id?data:u);
            const tr = tableBody.querySelector(`tr[data-id='${data.id}']`);
            if(tr) renderRow(data); 
        }else{
            const res = await fetch(API_URL,{
                method:"POST",
                headers:{"Content-Type":"application/json"},
                body: JSON.stringify(payload)
            });
            data = await res.json();
            allData.unshift(data);
            renderRow(data);
        }
        closeModal();
    }catch(err){ console.error(err); }
});

fetchData();
