// main.js

document.addEventListener('DOMContentLoaded', async () => {
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
});
