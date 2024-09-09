document.addEventListener('DOMContentLoaded', async () => {
    try {
        await loadUserData();
        await loadOrderData(0);  // 초기 페이지는 0으로 설정

        const content = document.querySelector('.content');
        content.scrollTop = 0; // 스크롤을 맨 위로 초기화
    } catch (error) {
        console.error('오류 발생:', error);
    }
});

async function loadUserData() {
    try {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) throw new Error('No access token found');

        const response = await fetch('http://localhost:8080/api/members', {
            method: 'GET',
            headers: {
                'Authorization': accessToken,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) throw new Error('Failed to fetch user data');

        const userData = await response.json();

        const userNameElement = document.querySelector('.introduce .name strong');
        if (userNameElement) {
            userNameElement.textContent = userData.name;
        }

        const userRole = userData.role;

        // 사용자 등급 체크
        if (userRole === "CUSTOMER") {
            // 경고창을 띄우고 제품 등록 페이지로 이동하지 않음
            document.getElementById('item').onclick = function (event) {
                event.preventDefault();  // 기본 동작 차단
                alert("관리자만 상품 등록이 가능합니다.");
            };
        }
    } catch (error) {
        console.error('사용자 정보 로딩 중 오류 발생:', error);
        const userNameElement = document.querySelector('.introduce .name strong');
        if (userNameElement) {
            userNameElement.textContent = '사용자';
        }
    }
}

async function loadOrderData(pageNumber = 0) {
    try {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) throw new Error('No access token found');

        const response = await fetch(`http://localhost:8080/api/orders?page=${pageNumber}&size=5`, {
            method: 'GET',
            headers: {
                'Authorization': accessToken,
                'Content-Type': 'application/json',
            },
        });

        if (response.status === 204) {
            document.querySelector('.content').innerHTML = `
                <span>텅</span>
                <div class="introduce">주문한 제품이 없네요...</div>
                <button type="button" onclick="location.href='http://127.0.0.1:5501/item-sort.html'">주문하러 가기</button>
            `;
            return;
        }

        if (!response.ok) throw new Error('주문 데이터 로딩 중 오류 발생');

        const orderData = await response.json();

        const { content, totalOrderPrice, totalPages } = orderData;
        let orderHTML = '';

        content.forEach(order => {
            const { orderItems, createTime } = order;

            orderHTML += `
                <div class="collect">
                    <div class="date">${new Date(createTime).toLocaleDateString()} ${new Date(createTime).toLocaleTimeString()}</div>
                    <div class="item-details">
            `;

            orderItems.forEach(item => {
                const imageUrl = item.itemImageUrl.replace('C:\\frontend\\sample\\gansik\\uploads\\', 'http://localhost:5501/uploads/');
                console.log(imageUrl);

                orderHTML += `
                    <div class="item-detail">
                        <div class="item-info">
                            <img class="img" src="${imageUrl}" alt="${item.itemName}">
                            <div class="item-name">
                                <h4>${item.itemName}</h4>
                                <span class="item-price">가격: ${item.itemPrice.toLocaleString()}원</span>  <!-- 개별 상품 가격 출력 -->
                            </div>
                        </div>
                        <div class="item-option">
                            <div class="option">
                                <span class="result">${item.quantity}개</span>
                            </div>
                            <div class="option-delete">
                                <span class="won">${item.totalPrice.toLocaleString()}원</span>
                            </div>
                        </div>
                    </div>
                `;
            });

            orderHTML += `</div></div>`;
        });

        document.querySelector('.content').style.display = 'block';
        document.querySelector('.content').innerHTML = orderHTML;

        const totalOrderPriceElement = document.querySelector('.total-order-price');
        if (totalOrderPriceElement) {
            totalOrderPriceElement.textContent = `총 주문 금액: ${totalOrderPrice.toLocaleString()}원`;
        }

        // 페이지 네비게이션 처리
        const paginationElement = document.querySelector('.pagination');
        if (paginationElement) {
            paginationElement.innerHTML = '';
            for (let i = 0; i < totalPages; i++) {
                paginationElement.innerHTML += `
                    <button class="page-button ${i === pageNumber ? 'active' : ''}" data-page="${i}">${i + 1}</button>
                `;
            }

            // 페이지 버튼 클릭 이벤트 처리
            document.querySelectorAll('.page-button').forEach(button => {
                button.addEventListener('click', () => {
                    const page = button.getAttribute('data-page');
                    loadOrderData(parseInt(page));
                });
            });
        }

    } catch (error) {
        console.error('주문 데이터 로딩 중 오류 발생:', error);
        document.querySelector('#orderContent .content').innerHTML = `
            <div class="introduce">주문 데이터를 로딩하는 중 오류가 발생했습니다.</div>
            <button type="button" onclick="location.href='http://127.0.0.1:5501/item-sort.html'">주문하러 가기</button>
        `;
    }
}


document.addEventListener('DOMContentLoaded', () => loadOrderData(0));
