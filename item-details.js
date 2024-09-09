document.addEventListener("DOMContentLoaded", async function () {
    const urlParams = new URLSearchParams(window.location.search);
    const itemId = urlParams.get('itemId');

    if (itemId) {
        try {
            const response = await fetch(`http://localhost:8080/api/items/${itemId}`);
            if (!response.ok) {
                throw new Error('상품 정보를 불러오는데 실패했습니다.');
            }
            const item = await response.json();

            // 상품 상세 정보를 HTML에 반영
            document.querySelector('.category2').textContent = '카테고리: ' + item.category;
            document.querySelector('.name h1').textContent = item.name;
            document.querySelector('.date').textContent = `상품 최종 수정 시간: ${new Date(item.modifiedAt).toLocaleDateString()} ${formatTime(new Date(item.modifiedAt))}`;
            document.querySelector('#won').textContent = item.price.toLocaleString();
            document.querySelector('#money').textContent = item.price.toLocaleString();

            function formatTime(date) {
                const hours = String(date.getHours()).padStart(2, '0');
                const minutes = String(date.getMinutes()).padStart(2, '0');
                return `${hours}:${minutes}`;
            }

            // 슬라이드 이미지 추가 (경로 변환 포함)
            const imageSlider = document.getElementById('image-slider');
            item.imgUrls.forEach((url, index) => {
                const imageUrl = url.replace('C:\\frontend\\sample\\gansik\\uploads\\', 'http://localhost:5501/uploads/');
                const img = document.createElement('img');
                img.src = imageUrl;
                img.className = 'slide';
                img.style.display = index === 0 ? 'block' : 'none';  // 첫 이미지만 보이도록 설정
                imageSlider.appendChild(img);
            });

            // 슬라이드 기능 구현
            let currentIndex = 0;
            const slides = document.querySelectorAll('.slide');
            const totalSlides = slides.length;

            document.getElementById('prevBtn').addEventListener('click', () => {
                slides[currentIndex].style.display = 'none';
                currentIndex = (currentIndex === 0) ? totalSlides - 1 : currentIndex - 1;
                slides[currentIndex].style.display = 'block';
            });

            document.getElementById('nextBtn').addEventListener('click', () => {
                slides[currentIndex].style.display = 'none';
                currentIndex = (currentIndex === totalSlides - 1) ? 0 : currentIndex + 1;
                slides[currentIndex].style.display = 'block';
            });

            // 수량 조절 기능
            let quantity = 1;
            document.querySelector('#result').textContent = quantity;

            document.querySelector('.dash').addEventListener('click', () => {
                if (quantity > 1) {
                    quantity--;
                    updateTotalPrice();
                }
            });

            document.querySelector('.plus').addEventListener('click', () => {
                quantity++;
                updateTotalPrice();
            });

            function updateTotalPrice() {
                document.querySelector('#result').textContent = quantity;
                document.querySelector('#money').textContent = (item.price * quantity).toLocaleString();
            }

            function checkLoginStatus() {
                const token = localStorage.getItem('accessToken');
                if (!token) {
                    alert('로그인이 필요한 서비스입니다.');
                    location.href = '/pages/login.html'; // 로그인 페이지로 리디렉션
                    return false;
                }
                return true;
            }

            // 장바구니 담기 버튼 클릭 시
            document.getElementById('basket').addEventListener('click', async () => {
                if (!checkLoginStatus()) return;

                const cartRequestBody = {
                    itemId: itemId,
                    count: quantity
                };

                try {
                    const token = localStorage.getItem('accessToken');
                    const cartResponse = await fetch('http://localhost:8080/api/carts', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': token
                        },
                        body: JSON.stringify(cartRequestBody)
                    });

                    if (cartResponse.ok) {
                        alert('장바구니에 담겼습니다.');
                    } else {
                        alert('장바구니 담기에 실패했습니다.');
                    }
                } catch (error) {
                    console.error('장바구니 담기 중 오류가 발생했습니다:', error);
                }
            });

            // 바로 구매 버튼 클릭 시
            document.getElementById('buy').addEventListener('click', async () => {
                if (!checkLoginStatus()) return;

                const orderRequestBody = {
                    orderItems: [
                        {
                            itemId: itemId,
                            count: quantity
                        }
                    ]
                };

                try {
                    const token = localStorage.getItem('accessToken');
                    const orderResponse = await fetch('http://localhost:8080/api/orders/instant', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': token
                        },
                        body: JSON.stringify(orderRequestBody)
                    });

                    if (orderResponse.ok) {
                        alert('구매가 완료되었습니다.');
                        // 구매 완료 후 페이지 이동 등 추가 처리
                    } else {
                        const errorText = await orderResponse.text(); // 응답 본문을 텍스트로 추출
                        alert(`구매에 실패했습니다: ${errorText}`);
                    }
                } catch (error) {
                    console.error('구매 처리 중 오류가 발생했습니다:', error);
                }
            });

        } catch (error) {
            console.error('상품 상세 정보를 불러오는 중 오류가 발생했습니다:', error);
            alert('상품 정보를 불러오는 중 문제가 발생했습니다.');
        }
    } else {
        alert('상품 ID가 유효하지 않습니다.');
    }
});
