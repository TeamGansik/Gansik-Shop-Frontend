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
          document.querySelector('.category2').textContent = item.category;
          document.querySelector('.name h1').textContent = item.name;
          document.querySelector('.date').textContent = `최종 수정 날짜: ${new Date(item.modifiedAt).toLocaleDateString()} ${new Date(item.modifiedAt).toLocaleTimeString([], { hour12: false }).slice(0,6)}`;
          document.querySelector('#won').textContent = item.price.toLocaleString();
          document.querySelector('#money').textContent = item.price.toLocaleString();

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

      } catch (error) {
          console.error('상품 상세 정보를 불러오는 중 오류가 발생했습니다:', error);
          alert('상품 정보를 불러오는 중 문제가 발생했습니다.');
      }
  } else {
      alert('상품 ID가 유효하지 않습니다.');
  }
});





$(() => {
    let result = 1;
    // '-' 버튼 클릭 시
    $('.dash').click(() => {
        if (result > 1) { // 수량이 1 이상일 때만 감소
            result--;
            $("#result").text(result); // 수량 업데이트
            updateTotal(); // 총 금액 업데이트
        }
    });

    // '+' 버튼 클릭 시
    $('.plus').click(() => {
        result++;
        $("#result").text(result); // 수량 업데이트
        updateTotal(); // 총 금액 업데이트
    });

    // 총 금액 업데이트 함수
    function updateTotal() {
        let won = parseInt($("#won").text().replace(/,/g, '')); // 상품 가격
        let total = won * result; // 총액 계산
        let formattedTotal = total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','); // 천 단위 콤마 추가
        $("#money").text(formattedTotal); // 총 금액 업데이트
    }

    // 페이지 로드 시 총 금액 초기화
    updateTotal();


    $(document).ready(function () {
        $('#buy').click(function () {
          if (confirm("구매 하시겠습니까?")) {
            alert("구매가 완료되었습니다.");
          }
        });
      
        $('#basket').click(function () {
          alert("장바구니에 담겼습니다.");
        });
    });
});