document.addEventListener('DOMContentLoaded', async () => {
    try {
        await loadUserData();

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

        const userName = document.getElementById('name');
        if (userName) {
            userName.textContent = userData.name;
        }

        const userEmail = document.getElementById('email');
        if (userEmail) {
            userEmail.textContent = userData.email;
        }

        const userPhone = document.getElementById('phone');
        if (userPhone) {
            userPhone.textContent = userData.phone;
        }

        const userPostCode = document.getElementById('postCode');
        if (userPostCode) {
            userPostCode.textContent = userData.postcode;
        }

        const userRoadAddress = document.getElementById('roadAddress');
        if (userRoadAddress) {
            userRoadAddress.textContent = userData.roadAddress;
        }

        const userDetailAddress = document.getElementById('detailAddress');
        if (userDetailAddress) {
            userDetailAddress.textContent = userData.detailAddress;
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