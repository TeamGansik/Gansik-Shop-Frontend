document.addEventListener('DOMContentLoaded', async () => {
    // Function to load HTML content into a specified element
    async function loadHTML(url, elementId) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to load HTML');
            const data = await response.text();
            document.getElementById(elementId).innerHTML = data;
        } catch (error) {
            console.error('Error loading HTML:', error);
        }
    }

    // Load header and footer HTML
    await loadHTML('header.html', 'header-placeholder');
    await loadHTML('footer.html', 'footer-placeholder');

    // Now, you can safely interact with the elements loaded from header.html
    const rightMenu = document.querySelector('.right-menu');

    if (!rightMenu) {
        console.error('rightMenu 요소를 찾을 수 없습니다.');
        return;
    }

    // Access Token 확인
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

                // 로그인 상태에서 헤더 변경
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
});

// 로그아웃 처리
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
            window.location.href = 'main.html'
        } else {
            const errorMessage = await response.text();
            alert('로그아웃 실패: ' + errorMessage);
        }
    } catch (error) {
        console.error('로그아웃 중 오류 발생:', error);
        alert('로그아웃 중 오류가 발생했습니다.');
    }
}
