let isEmailVerified = false;
let verificationTimeout;

function execDaumPostcode() {
    new daum.Postcode({
        oncomplete: function (data) {
            var addr = '';

            if (data.userSelectedType === 'R') {
                addr = data.roadAddress;
            } else {
                addr = data.jibunAddress;
            }

            document.getElementById("postcode").value = data.zonecode;
            document.getElementById("roadAddress").value = addr;
            document.getElementById("detailAddress").focus();
        }
    }).open();
}

function validateName() {
    var name = document.getElementById("name").value;
    var nameMessage = document.getElementById("nameMessage");

    var namePattern = /^[가-힣]{1,10}$/;

    if (name === "") {
        nameMessage.textContent = "";
    } else if (!namePattern.test(name)) {
        nameMessage.textContent = "이름은 한글만 입력할 수 있으며, 최대 10글자까지 가능합니다.";
    } else {
        nameMessage.textContent = "";
    }

    if (name.length > 10) {
        document.getElementById("name").value = name.substring(0, 10);
    }
}

function validateEmail() {
    var email = document.getElementById("email").value;
    var emailMessage = document.getElementById("emailMessage");

    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email === "") {
        emailMessage.textContent = "";
    } else if (!emailPattern.test(email)) {
        emailMessage.textContent = "유효한 이메일 주소를 입력해주세요.";
    } else if (isEmailVerified) {
        emailMessage.textContent = "이메일 인증이 완료되었습니다.";
        emailMessage.className = "message success";
    } else {
        emailMessage.textContent = "유효한 이메일 주소입니다.";
        emailMessage.className = "message success";
    }
}

function sendEmailVerification() {
    var email = document.getElementById("email").value;
    var emailMessage = document.getElementById("emailMessage");

    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        emailMessage.textContent = "유효한 이메일 주소를 입력해주세요.";
        return;
    }

    fetch('http://localhost:8080/api/mail', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: email })
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert("인증번호가 이메일로 전송되었습니다.");
                document.getElementById("emailVerificationContainer").style.display = "block";
                startVerificationTimer(180); // 3분 타이머 시작
            } else {
                emailMessage.textContent = "이메일 전송에 실패했습니다. 다시 시도해주세요.";
            }
        })
        .catch(error => {
            emailMessage.textContent = "서버 오류가 발생했습니다. 나중에 다시 시도해주세요.";
        });
}

function startVerificationTimer(duration) {
    var timerDisplay = document.getElementById("timer");
    var timeRemaining = duration;

    clearInterval(verificationTimeout); // 기존 타이머 중지
    verificationTimeout = setInterval(function () {
        var minutes = Math.floor(timeRemaining / 60);
        var seconds = timeRemaining % 60;

        seconds = seconds < 10 ? '0' + seconds : seconds;
        minutes = minutes < 10 ? '0' + minutes : minutes;

        timerDisplay.textContent = `남은 시간: ${minutes}분 ${seconds}초`;
        timeRemaining--;

        if (timeRemaining < 0) {
            clearInterval(verificationTimeout);
            timerDisplay.textContent = "인증 시간이 만료되었습니다.";
        }
    }, 1000);
}

function verifyEmailCode() {
    var email = document.getElementById("email").value;
    var emailCode = document.getElementById("emailCode").value;
    var emailCodeMessage = document.getElementById("emailCodeMessage");

    fetch('http://localhost:8080/api/mail/check', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: email, userNumber: emailCode })
    })
        .then(response => response.json())
        .then(isMatch => {
            if (isMatch) {
                alert("인증번호가 확인되었습니다.");
                emailCodeMessage.textContent = "인증이 완료되었습니다.";
                emailCodeMessage.className = "message success";

                // 이메일 입력 필드와 인증 버튼 비활성화
                document.getElementById("email").setAttribute("readonly", true);
                document.querySelector(".input-group button").setAttribute("disabled", true);
                document.querySelector(".input-group button").style.backgroundColor = "#ccc";
                document.querySelector(".input-group button").style.cursor = "not-allowed";

                clearInterval(verificationTimeout);
                document.getElementById("timer").textContent = "";
                isEmailVerified = true;
                document.getElementById("emailCode").setAttribute("readonly", true);
                document.querySelector("#emailVerificationContainer button").setAttribute("disabled", true);
            } else {
                emailCodeMessage.textContent = "인증번호가 일치하지 않습니다. 다시 확인해주세요.";
            }
        })
        .catch(error => {
            emailCodeMessage.textContent = "서버 오류가 발생했습니다. 나중에 다시 시도해주세요.";
        });
}

function checkPasswordMatch() {
    var password = document.getElementById("password").value;
    var confirmPassword = document.getElementById("confirmPassword").value;
    var passwordMessage = document.getElementById("passwordMessage");
    var passwordValidationMessage = document.getElementById("passwordValidationMessage");

    var passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%])[A-Za-z\d!@#$%]{8,16}$/;

    if (password === "") {
        passwordValidationMessage.textContent = "";
    } else if (!passwordPattern.test(password)) {
        passwordValidationMessage.textContent = "비밀번호는 8자 이상 16자 이하, 대문자, 소문자, 숫자, 특수문자(!@#$%)를 각각 하나 이상 포함해야 합니다.";
        return;
    } else {
        passwordValidationMessage.textContent = "";
    }

    if (confirmPassword === "") {
        passwordMessage.textContent = "";
        return;
    }

    if (password === confirmPassword) {
        passwordMessage.textContent = "비밀번호가 일치합니다.";
        passwordMessage.className = "message success";
    } else {
        passwordMessage.textContent = "비밀번호가 일치하지 않습니다.";
    }
}

function validateForm() {
    var email = document.getElementById("email").value;
    var password = document.getElementById("password").value;
    var confirmPassword = document.getElementById("confirmPassword").value;

    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        alert("유효한 이메일 주소를 입력해주세요.");
        return false;
    }

    var passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%])[A-Za-z\d!@#$%]{8,16}$/;
    if (!passwordPattern.test(password)) {
        alert("비밀번호는 8자 이상 16자 이하, 대문자, 소문자, 숫자, 특수문자(!@#$%)를 각각 하나 이상 포함해야 합니다.");
        return false;
    }

    if (password !== confirmPassword) {
        alert("비밀번호가 일치하지 않습니다. 다시 확인해주세요.");
        return false;
    }

    if (!isEmailVerified) {
        alert("이메일 인증이 필요합니다.");
        return false;
    }

    return true;
}

function submitForm(event) {
    // 폼의 기본 동작(페이지 새로고침)을 막기
    event.preventDefault();

    // 이메일 인증 여부 확인
    if (!isEmailVerified) {
        alert("이메일 인증이 필요합니다.");
        return; // 이메일 인증이 되지 않았으면 폼 제출 중지
    }

    // 입력된 폼 데이터 유효성 검사
    if (!validateForm()) {
        return; // 검증 실패 시 폼 제출 중지
    }

    // 폼 데이터를 JSON 객체로 구성
    var formData = {
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        password: document.getElementById("password").value,
        phone: document.getElementById("phone").value,
        postcode: document.getElementById("postcode").value,
        roadAddress: document.getElementById("roadAddress").value,
        detailAddress: document.getElementById("detailAddress").value
    };

    fetch('http://localhost:8080/api/members', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
    .then(response => {
        console.log(response.status);  // 응답 상태 코드 출력
        if (response.status === 201) {
            console.log("회원가입 성공");
            alert("회원가입이 완료되었습니다.");
            window.location.href = 'login.html'; // 회원가입 후 로그인 페이지로 이동
        } else {
            console.log("회원가입 실패:", response.status);
            alert("회원가입에 실패했습니다. 다시 시도해주세요.");
        }
    })
    .catch(error => {
        console.error("서버 오류:", error);  // 에러 로그 출력
        alert("서버 오류가 발생했습니다. 나중에 다시 시도해주세요.");
    });    
}


