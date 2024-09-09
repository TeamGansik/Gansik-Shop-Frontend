document.addEventListener('DOMContentLoaded', async () => {
  async function fetchCartItems() {
    const accessToken = localStorage.getItem('accessToken');
    const response = await fetch('http://localhost:8080/api/carts', {
      method: 'GET',
      headers: {
        'Authorization': accessToken
      }
    });

    if (!response.ok) {
      alert('장바구니를 불러오는 데 실패했습니다.');
      return [];
    }

    const data = await response.json();
    return data.items;
  }

  async function updateCartItemCount(cartItemId, count) {
    const accessToken = localStorage.getItem('accessToken');
    const response = await fetch(`http://localhost:8080/api/carts/${cartItemId}`, {
      method: 'PUT',
      headers: {
        'Authorization': accessToken,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({ count })
    });

    if (!response.ok) {
      const errorMessage = await response.text();
      alert(errorMessage || '수량 업데이트에 실패했습니다.');
      throw new Error('수량 업데이트에 실패했습니다.');
    }
  }

  async function deleteCartItem(cartItemId) {
    const accessToken = localStorage.getItem('accessToken');
    const params = new URLSearchParams({ cartItemIds: cartItemId });
    const response = await fetch(`http://localhost:8080/api/carts?${params.toString()}`, {
      method: 'DELETE',
      headers: {
        'Authorization': accessToken
      }
    });

    if (!response.ok) {
      const errorMessage = await response.text();
      alert(errorMessage || '상품 삭제에 실패했습니다.');
      throw new Error('상품 삭제에 실패했습니다.');
    }
  }

  async function purchaseSelectedItems(orderItems) {
    const accessToken = localStorage.getItem('accessToken');
    const response = await fetch('http://localhost:8080/api/orders/cart', {
      method: 'POST',
      headers: {
        'Authorization': accessToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ orderItems })
    });

    if (!response.ok) {
      const errorMessage = await response.text();
      alert('구매에 실패했습니다. ' + errorMessage);
      throw new Error('구매에 실패했습니다.');
    }

    return response;
  }

  function updateTotalPrice() {
    let totalPrice = 0;
    let estimatedPrice = 0;
    let selectedItemCount = 0;
    const uniqueItemIds = new Set();

    document.querySelectorAll('.item-check:checked').forEach(checkbox => {
      const cartItemId = checkbox.dataset.id;
      const resultElement = document.querySelector(`.result[data-id="${cartItemId}"]`);
      const wonElement = document.querySelector(`.won[data-id="${cartItemId}"]`);
      const price = parseInt(wonElement.textContent.replace(/[^0-9]/g, ''));
      const count = parseInt(resultElement.textContent);

      totalPrice += price;
      estimatedPrice += price;
      selectedItemCount += count;

      uniqueItemIds.add(cartItemId);
    });

    document.getElementById('total-price').textContent = totalPrice.toLocaleString() + '원';
    document.getElementById('estimated-price').textContent = estimatedPrice.toLocaleString() + '원';
    document.getElementById('buy').textContent = `총 ${uniqueItemIds.size}건 주문하기 (${totalPrice.toLocaleString()}원)`; // 유니크 아이디 개수로 건수 표시
  }

  function updateCartItems(items) {
    const itemContainer = document.querySelector('.item .detail');
    itemContainer.innerHTML = ''; // 기존 항목 제거

    if (items.length === 0) {
      // 장바구니가 비어있을 때 메시지 표시
      const itemSelector = document.querySelector('.choose-all');
      itemSelector.innerHTML = '';
      itemSelector.style.backgroundColor = 'white';
      itemContainer.innerHTML = `
        <div class="no-results">
          <span>텅</span>
          <div class="introduce">장바구니 내역이 없네요...</div>
        </div>
      `;
      return; // 더 이상 진행하지 않음
    }

    items.forEach(item => {
      // 이미지 URL 변환
      const imageUrl = item.repImgUrl.replace('C:\\frontend\\sample\\gansik\\uploads\\', 'http://localhost:5501/uploads/');

      const itemElement = document.createElement('div');
      itemElement.className = 'item-detail';
      itemElement.innerHTML = `
        <div class="item-info" data-item-id="${item.itemId}">
          <input class="item-check" type="checkbox" data-id="${item.cartId}">
          <img src="${imageUrl}" alt="${item.name}">
          <div class="item-name">
            <h4>${item.name}</h4>
            <div class="how-much">${item.price.toLocaleString()}원</div>
          </div>
        </div>
        <div class="item-option">
          <div class="option">
            <button class="dash" data-id="${item.cartId}">
              <i class="bi bi-dash-lg"></i>
            </button>
            <span class="result" data-id="${item.cartId}">${item.count}</span>
            <button class="plus" data-id="${item.cartId}">
              <i class="bi bi-plus-lg"></i>
            </button>
          </div>
          <div class="option-delete">
            <button type="button" class="X" data-id="${item.cartId}">X</button>
            <span class="won" data-id="${item.cartId}">${(item.price * item.count).toLocaleString()}원</span>
          </div>
        </div>
      `;
      itemContainer.appendChild(itemElement);
    });

    // 수량 조정 버튼 이벤트 리스너 등록
    document.querySelectorAll('.dash, .plus').forEach(button => {
      button.addEventListener('click', async (event) => {
        const cartItemId = event.currentTarget.dataset.id;
        const isPlus = event.currentTarget.classList.contains('plus');
        const resultElement = document.querySelector(`.result[data-id="${cartItemId}"]`);
        let count = parseInt(resultElement.textContent) + (isPlus ? 1 : -1);

        if (count < 1) {
          alert('최소 수량은 1개입니다.');
          return;
        }

        try {
          await updateCartItemCount(cartItemId, count);
          resultElement.textContent = count;
          const priceElement = document.querySelector(`.won[data-id="${cartItemId}"]`);
          const item = items.find(item => item.cartId == cartItemId);
          priceElement.textContent = (item.price * count).toLocaleString() + '원';

          updateTotalPrice(); // 수량 변경 시 총 가격 업데이트
        } catch (error) {
          console.error('수량 업데이트 중 오류가 발생했습니다.', error);
        }
      });
    });

    // 체크박스 이벤트 리스너 등록
    document.querySelectorAll('.item-check').forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        updateTotalPrice();
      });
    });

    // X 버튼 클릭 이벤트 리스너 등록
    document.querySelectorAll('.X').forEach(button => {
      button.addEventListener('click', async (event) => {
        const cartItemId = event.currentTarget.dataset.id;
        try {
          await deleteCartItem(cartItemId);
          location.reload(); // 페이지 새로고침
        } catch (error) {
          console.error('상품 삭제 중 오류가 발생했습니다.', error);
        }
      });
    });

    // 전체 선택/해제 기능
    const checkAll = document.getElementById('check-all');
    checkAll.addEventListener('change', (event) => {
      const isChecked = event.currentTarget.checked;
      document.querySelectorAll('.item-check').forEach(checkbox => {
        checkbox.checked = isChecked;
      });
      updateTotalPrice(); // 전체 선택/해제 시 총 가격 업데이트
    });

    // 선택 삭제 버튼 이벤트 리스너 등록
    document.querySelector('.delete button').addEventListener('click', async () => {
      const selectedItems = Array.from(document.querySelectorAll('.item-check:checked'))
        .map(checkbox => checkbox.dataset.id);

      if (selectedItems.length === 0) {
        alert('삭제할 항목을 선택하세요.');
        return;
      }

      try {
        await deleteCartItem(selectedItems.join(',')); // 여러 항목을 삭제하도록 수정
        location.reload(); // 페이지 새로고침
      } catch (error) {
        console.error('선택한 상품 삭제 중 오류가 발생했습니다.', error);
      }
    });

    // 구매 버튼 클릭 이벤트 리스너 등록
    document.getElementById('buy').addEventListener('click', async () => {
      const selectedItems = Array.from(document.querySelectorAll('.item-check:checked'))
        .map(checkbox => {
          const cartItemId = checkbox.dataset.id;
          const item = items.find(item => item.cartId == cartItemId);
          if (!item) {
            alert('장바구니에서 항목을 찾을 수 없습니다.');
            return null; // 항목을 찾지 못하면 null 반환
          }
          const count = parseInt(document.querySelector(`.result[data-id="${cartItemId}"]`).textContent);
          return { itemId: item.itemId, count };
        })
        .filter(item => item !== null); // null 제거

      if (selectedItems.length === 0) {
        alert('구매할 항목을 선택하세요.');
        return;
      }

      try {
        await purchaseSelectedItems(selectedItems);
        alert('구매가 완료되었습니다.');
        location.reload(); // 페이지 새로고침
      } catch (error) {
        console.error('구매 중 오류가 발생했습니다.', error);
      }
    });
  }

  try {
    const items = await fetchCartItems();
    updateCartItems(items);
  } catch (error) {
    console.error('장바구니 항목을 불러오는 중 오류가 발생했습니다.', error);
  }
});

