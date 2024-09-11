document.addEventListener('DOMContentLoaded', () => {
    const loginButton = document.querySelector('.login-button');
    const emailInput = document.querySelector('input[placeholder="아이디"]');
    const passwordInput = document.querySelector('input[placeholder="비밀번호"]');

    loginButton.addEventListener('click', async function(event) {
        event.preventDefault();
        const email = emailInput.value;
        const password = passwordInput.value;

        if (!email || !password) {
            alert('이메일과 비밀번호를 입력해주세요.');
            return;
        }

        try {
            const response = await fetch('http://localhost:8080/api/members/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    password: password,
                }),
            });

            if (!response.ok) {  // 오류 상태를 먼저 처리
                const errorMessage = await response.text();
                alert('로그인 실패: ' + errorMessage);
                return;  // 오류가 발생하면 아래 코드 실행하지 않음
            }

            // 성공 처리
            const data = await response.json();
            console.log(data);
            if (data.accessToken && data.refreshToken) {
                localStorage.setItem('accessToken', data.accessToken);
                localStorage.setItem('refreshToken', data.refreshToken);
                alert('로그인 성공!');
                window.location.href = '../main.html';  // 로그인 성공 시 페이지 이동

                // Access Token 자동 갱신 설정 (14분 30초 후 갱신)
                scheduleTokenRefresh(14.5 * 60 * 1000);
            } else {
                alert('로그인 실패: 응답 데이터에 문제가 있습니다.');
            }
            
        } catch (error) {
            alert('로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
            console.error(error);
        }
    });

    passwordInput.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            loginButton.click();
        }
    });
});
