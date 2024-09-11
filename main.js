document.addEventListener('DOMContentLoaded', async () => {
    // 동적 HTML 로딩 함수
    async function loadHTML(url, elementId) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Failed to load HTML');
            }
            const data = await response.text();
            document.getElementById(elementId).innerHTML = data;
        } catch (error) {
            console.error('Error loading HTML:', error);
        }
    }

    // header.html을 동적으로 로드
    await loadHTML('header.html', 'header-placeholder');

    // 헤더가 로드된 후에 로그인 상태에 따라 UI 업데이트를 처리하는 함수 호출
    const rightMenu = document.querySelector('.right-menu');
    if (rightMenu) {
        // 로그인 상태에 따른 헤더 업데이트
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');

        if (accessToken && refreshToken) {
            // 로그인 상태일 때 사용자 정보 가져오기
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
                    rightMenu.innerHTML = `
                        <li style="color: #000;">${userData.name}님 환영합니다.</li>
                        <li style="color: #e2e2e2;"> | </li>
                        <li><a href="#" id="logoutButton">로그아웃</a></li>
                    `;

                    // 로그아웃 버튼에 이벤트 리스너 추가
                    const logoutButton = document.getElementById('logoutButton');
                    logoutButton.addEventListener('click', handleLogout);
                } else {
                    console.error('사용자 정보를 가져오는데 실패했습니다.');
                }
            } catch (error) {
                console.error('사용자 정보를 가져오는 중 오류 발생:', error);
            }
        } else {
            // 비로그인 상태일 때 기본 로그인/회원가입 버튼 표시
            rightMenu.innerHTML = `
                <li><a href="/pages/login.html">로그인</a></li>
                <li style="color: #e2e2e2;"> | </li>
                <li><a href="/pages/signup.html">회원가입</a></li>
            `;
        }
    } else {
        console.error('rightMenu 요소를 찾을 수 없습니다.');
    }

    // 동적으로 로드된 후에 최신 아이템을 불러옴
    await loadLatestItems(0, 5);

    async function loadLatestItems(page, size) {
        try {
            const apiUrl = `http://localhost:8080/api/items?page=${page}&size=${size}&sort=createdDate,desc`;
            const response = await fetch(apiUrl);

            if (!response.ok) {
                throw new Error('네트워크 응답이 실패했습니다.');
            }

            const data = await response.json();
            const productContainer = document.querySelector('.product');
            productContainer.innerHTML = ''; // 기존 내용 초기화

            data._embedded.itemSummaryDtoList.forEach(item => {
                const productItem = document.createElement('a');
                productItem.href = `item-details.html?itemId=${item.itemId}`;  // 상세 페이지로 이동
                productItem.className = 'product-total';

                const imageUrl = item.repImgUrl.replace('C:\\frontend\\sample\\gansik\\uploads\\', 'http://localhost:5501/uploads/');

                productItem.innerHTML = `
                    <div class="product-item">
                        <img src="${imageUrl}" alt="${item.name}">
                        <h2 class="product-name">${item.name}</h2>
                        <p class="product-price">${item.price.toLocaleString()}원</p>
                    </div>
                `;

                productContainer.appendChild(productItem);
            });
        } catch (error) {
            console.error('상품을 불러오는 중 오류가 발생했습니다:', error);
        }
    }

    // 로그아웃 처리 함수
    async function handleLogout(event) {
        event.preventDefault();

        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');

        try {
            const response = await fetch('http://localhost:8080/api/members/logout', {
                method: 'POST',
                headers: {
                    'Authorization': accessToken,
                    'Refresh-Token': refreshToken,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                // 토큰 삭제 및 페이지 새로고침
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                alert('로그아웃 되었습니다.');
                location.reload(); // 페이지 새로고침
            } else {
                const errorMessage = await response.text();
                alert('로그아웃 실패: ' + errorMessage);
            }
        } catch (error) {
            console.error('로그아웃 중 오류 발생:', error);
            alert('로그아웃 중 오류가 발생했습니다.');
        }
    }
});
