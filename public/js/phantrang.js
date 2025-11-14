const totalPages = leng - 1;
const pagesPerGroup = 4;

// Lấy page từ URL nếu có
const urlParams = new URLSearchParams(window.location.search);
let currentPage = num;

let currentGroup = Math.floor((currentPage - 1) / pagesPerGroup);

function renderPagination() {
  const container = document.getElementById("pagination");
  container.innerHTML = "";

  const totalGroups = Math.ceil(totalPages / pagesPerGroup);
  const startPage = currentGroup * pagesPerGroup + 1;
  const endPage = Math.min(startPage + pagesPerGroup - 1, totalPages);

  const first = document.createElement("div");
  first.textContent = "<<";
  first.className = "page";
  if (currentGroup > 0) {
    first.onclick = () => {
      window.location.href = `/${part[1]}/${part[2]}/page-1`;
    };
  } else {
    first.classList.add("faded");
  }
  container.appendChild(first);

  const prev = document.createElement("div");
  prev.textContent = "<";
  prev.className = "page";
  if (currentGroup > 0) {
    const prevPage = (currentGroup - 1) * pagesPerGroup + 1;
    prev.onclick = () => {
      window.location.href = `/${part[1]}/${part[2]}/page-${prevPage}`;
    };
  } else {
    prev.classList.add("faded");
  }
  container.appendChild(prev);

  for (let i = startPage; i <= endPage; i++) {
    const page = document.createElement("a");
    page.textContent = i;
    page.href = `/${part[1]}/${part[2]}/page-${i}`;
    page.className = `page page-${i}` + (i === currentPage ? " active" : "");
    container.appendChild(page);
  }

  if (endPage < totalPages) {
    const fadedPreview = document.createElement("div");
    fadedPreview.textContent = "...";
    fadedPreview.className = "page faded";
    container.appendChild(fadedPreview);
  }

  const next = document.createElement("div");
  next.textContent = ">";
  next.className = "page";
  if (currentGroup < totalGroups - 1) {
    const nextPage = (currentGroup + 1) * pagesPerGroup + 1;
    next.onclick = () => {
      window.location.href = `/${part[1]}/${part[2]}/page-${nextPage}`;
    };
  } else {
    next.classList.add("faded");
  }
  container.appendChild(next);

  const last = document.createElement("div");
  last.textContent = ">>";
  last.className = "page";
  if (currentGroup < totalGroups - 1) {
    const lastPage = totalPages;
    last.onclick = () => {
      window.location.href = `/${part[1]}/${part[2]}/page-${lastPage}`;
    };
  } else {
    last.classList.add("faded");
  }
  container.appendChild(last);
}

renderPagination();

// Phần kiểm tra ảnh có chạy k
