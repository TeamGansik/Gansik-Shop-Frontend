document.addEventListener('DOMContentLoaded', async () => {
    // 동적 HTML 로딩 함수
    async function loadHTML(url, elementId) {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.text();
        document.getElementById(elementId).innerHTML = data;
    }

    // header.html을 동적으로 로드
    await loadHTML('header.html', 'header-placeholder');

    // 동적으로 로드된 후에 header.js 추가
    const script = document.createElement('script');
    script.src = 'header.js';  // 이미 존재하는 header.js를 다시 로드하여 이벤트 리스너 등록
    document.body.appendChild(script);

    // 로그인 상태를 확인하고, 마이페이지와 장바구니 접근을 제어하는 함수
    await checkLoginAndRestrictAccess();

    const urlParams = new URLSearchParams(window.location.search);
    const keyword = urlParams.get('keyword');
    const category = urlParams.get('category');

    loadItems(0, 20, keyword, category);

    async function loadItems(page, size, keyword, category) {
        try {
            let apiUrl = `http://localhost:8080/api/items?page=${page}&size=${size}`;

            if (keyword) {
                apiUrl += `&keyword=${encodeURIComponent(keyword)}`;
            } else if (category) {
                apiUrl += `&category=${encodeURIComponent(category)}`;
            }

            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error('네트워크 응답이 실패했습니다');
            }
            const data = await response.json();

            const productList = document.querySelector('.product-list');
            productList.innerHTML = '';

            const totalItems = data.page.totalElements;
            const totalItemsElement = document.querySelector('.total span');
            totalItemsElement.textContent = totalItems;

            const searchTypeMessage = document.querySelector('.name');
            if (keyword) {
                searchTypeMessage.textContent = `"${keyword}"에 대한 검색 결과`;
            } else if (category) {
                searchTypeMessage.textContent = `"${category}" 카테고리의 검색 결과`;
            } else {
                searchTypeMessage.textContent = `전체 상품 목록`;
            }

            const moveBar = document.querySelector('.move-bar');

            // 검색 결과가 없을 때
            if (productList) { // productList가 null이 아닐 때만 동작
                if (!data._embedded) {
                    productList.style.gridTemplateColumns = 'none';
                    productList.innerHTML = `
                        <div class="no-results">
                            <span>텅</span>
                            <div class="introduce">검색 결과가 없네요...</div>
                        </div>`;
                    // 페이지 네비게이션을 표시하지 않음
                    moveBar.style.display = 'none';
                    return;
                }
            } else {
                console.error('productList 요소를 찾을 수 없습니다.');
            }

            // 검색 결과가 있을 때
            data._embedded.itemSummaryDtoList.forEach(item => {
                const productItem = document.createElement('a');
                const imageUrl = item.repImgUrl.replace('C:\\frontend\\sample\\gansik\\uploads\\', 'http://localhost:5501/uploads/');
                productItem.href = `item-details.html?itemId=${item.itemId}`;  // 상세 페이지 링크에 itemId 추가
                productItem.className = 'product-total';
                productItem.innerHTML = `
                    <div class="product-item">
                        <img src="${imageUrl}" alt="${item.name}">
                        <h2 class="product-name">${item.name}</h2>
                        <p class="product-price">${item.price.toLocaleString()}원</p>
                        <button class="busket" type="button">
                            <i class="bi bi-bag"></i>
                        </button>
                    </div>
                `;
                productList.appendChild(productItem);
            });

            // 페이지 네비게이션 생성 및 표시
            moveBar.style.display = 'flex';
            createPagination(data.page.totalPages, data.page.number, keyword, category);
        } catch (error) {
            console.error('상품을 불러오는 중 오류가 발생했습니다:', error);
        }
    }

    function createPagination(totalPages, currentPage, keyword, category) {
        const moveLink = document.querySelector('.move-link');
        moveLink.innerHTML = '';

        for (let i = 0; i < totalPages; i++) {
            const pageLink = document.createElement('a');
            pageLink.href = '#';
            pageLink.textContent = i + 1;
            pageLink.className = i === currentPage ? 'mark' : 'no-mark';
            pageLink.addEventListener('click', (event) => {
                event.preventDefault();
                loadItems(i, 20, keyword, category);
            });
            moveLink.appendChild(pageLink);
        }
    }

    // 로그인 상태를 확인하고 마이페이지 및 장바구니 접근 제어
    async function checkLoginAndRestrictAccess() {
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');

        if (accessToken && refreshToken) {
            try {
                const response = await fetch('http://localhost:8080/api/members', {
                    method: 'GET',
                    headers: {
                        'Authorization': accessToken,
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    const userData = await response.json();
                    // 로그인이 되어 있으므로 별도의 제어가 필요 없음
                } else {
                    console.error('사용자 정보를 가져오는데 실패했습니다.');
                    restrictAccess();
                }
            } catch (error) {
                console.error('사용자 정보를 가져오는 중 오류 발생:', error);
                restrictAccess();
            }
        } else {
            restrictAccess();
        }
    }

    // 마이페이지와 장바구니 접근 제한 함수
    function restrictAccess() {
        const myProfileLink = document.querySelector('.myPage');
        const cartLink = document.querySelector('.shoppingCart');

        if (myProfileLink) {
            myProfileLink.addEventListener('click', (event) => {
                event.preventDefault();
                alert('로그인이 필요한 서비스입니다.');
                location.href = '/pages/login.html'; // 로그인 페이지로 리디렉션
            });
        }

        if (cartLink) {
            cartLink.addEventListener('click', (event) => {
                event.preventDefault();
                alert('로그인이 필요한 서비스입니다.');
                location.href = '/pages/login.html'; // 로그인 페이지로 리디렉션
            });
        }
    }
});
