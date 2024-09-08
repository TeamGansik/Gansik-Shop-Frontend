let refreshTokenTimeout; // Refresh Token 갱신 타이머 변수

// Access Token 갱신 예약 함수
function scheduleTokenRefresh(timeout) {
    if (refreshTokenTimeout) {
        clearTimeout(refreshTokenTimeout); // 기존 타이머 제거
    }
    refreshTokenTimeout = setTimeout(async () => {
        try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) {
                alert('세션이 만료되었습니다. 다시 로그인 해주세요.');
                window.location.href = 'pages/login.html';
                return;
            }

            const response = await fetch('http://localhost:8080/api/members/refresh-token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Refresh-Token': refreshToken,
                },
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('accessToken', data.newToken); // 새로운 Access Token 저장
                // 14분 30초 후 다시 갱신 요청
                scheduleTokenRefresh(14.5 * 60 * 1000); 
            } else {
                alert('세션이 만료되었습니다. 다시 로그인 해주세요.');
                window.location.href = 'pages/login.html'; // 로그아웃 처리
            }
        } catch (error) {
            alert('토큰 갱신 중 오류가 발생했습니다. 다시 시도해주세요.');
            console.error(error);
            window.location.href = 'pages/login.html'; // 오류 발생 시 로그아웃 처리
        }
    }, timeout);
}

// 페이지 로드 시 Access Token 갱신 예약을 시작
function initTokenRefresh() {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');

    if (accessToken && refreshToken) {
        // 기존에 토큰이 있다면, 14분 30초 후 갱신
        scheduleTokenRefresh(14.5 * 60 * 1000);
    }
}

// 초기화 함수
document.addEventListener('DOMContentLoaded', () => {
    initTokenRefresh(); // 토큰 갱신을 초기화
});
