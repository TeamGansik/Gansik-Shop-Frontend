$(document).ready(function () {
    // 초기 가격 정보 설정 (data-id에 따라 다르게 설정)
    const initialPrices = {
      1: 1,    // id=1의 초기 가격
      2: 11,   // id=2의 초기 가격
      3: 111,   // id=3의 초기 가격
      4: 1111,
      5: 11111
    };
  
    // 수량 증가 버튼 클릭 시
    $('.plus').on('click', function () {
      let id = $(this).data('id');
      let $result = $(`.result[data-id="${id}"]`);
      $result.text(parseInt($result.text()) + 1);
      updateItemPrice(id);
      updateTotalPrice();
    });
  
    // 수량 감소 버튼 클릭 시
    $('.dash').on('click', function () {
      let id = $(this).data('id');
      let $result = $(`.result[data-id="${id}"]`);
      let newValue = parseInt($result.text()) - 1;
      if (newValue > 0) {
        $result.text(newValue);
        updateItemPrice(id);
        updateTotalPrice();
      }
    });
  
    // 개별 항목의 가격을 업데이트
    function updateItemPrice(id) {
      let quantity = parseInt($(`.result[data-id="${id}"]`).text());
      let basePrice = initialPrices[id]; // 초기 가격 가져오기
      let totalItemPrice = basePrice * quantity;
  
      // 업데이트된 가격을 해당 항목에 반영
      $(`.won[data-id="${id}"]`).text(totalItemPrice.toLocaleString() + '원');
    }
  
    // 전체 가격을 업데이트하는 함수
    function updateTotalPrice() {
      let totalPrice = 0;
  
      $('.item-detail').each(function () {
        let $item = $(this);
        if ($item.find('.item-check').prop('checked')) {
          let priceText = $item.find('.won').text().replace(/,/g, '').replace('원', '');
          totalPrice += parseInt(priceText);
        }
      });
  
      // 총 선택상품금액 업데이트
      $('#total-price').first().text(totalPrice.toLocaleString() + '원');
  
      // 예상 주문 금액 계산 (예상 주문 금액을 계산하려면 추가적인 비율을 적용할 수 있습니다)
      let estimatedPrice = totalPrice * 1.0; // 예시로 1.0을 적용, 필요에 따라 조정
      $('#estimated-price').last().text(estimatedPrice.toLocaleString() + '원');
  
      // 총 1건 주문하기 버튼의 텍스트 업데이트
      $('.oreder-now .buy').text(`총 ${$('.item-check:checked').length}건 주문하기 (${estimatedPrice.toLocaleString()}원)`);
    }
  
    // 전체 선택 체크박스 클릭 시
    $('#check-all').on('change', function () {
      let isChecked = $(this).prop('checked');
      $('.item-check').prop('checked', isChecked);
      updateUncheckButton();
      updateTotalPrice();
    });
  
    // 개별 항목 체크박스 클릭 시
    $('.item-check').on('change', function () {
      updateCheckAll();
      updateUncheckButton();
      updateTotalPrice();
    });
  
    // 선택 해제 버튼 클릭 시
    $('#uncheck-button').on('click', function () {
      $('#check-all').prop('checked', false);
      $('.item-check').prop('checked', false);
      updateUncheckButton();
      updateTotalPrice();
    });
  
    // 선택 해제 버튼 업데이트
    function updateUncheckButton() {
      let checkedCount = $('.item-check:checked').length;
      let totalCount = $('.item-check').length;
      $('#uncheck-button').toggleClass('disabled', checkedCount === 0);
    }
  
    // 전체 선택 체크박스 업데이트
    function updateCheckAll() {
      let totalCount = $('.item-check').length;
      let checkedCount = $('.item-check:checked').length;
      $('#check-all').prop('checked', totalCount === checkedCount);
    }
  
    // 선택 삭제 버튼 클릭 시
    $('.delete button').on('click', function () {
      if (confirm("삭제하시겠습니까?")) {
        $('.item-check:checked').closest('.item-detail').remove();
        updateCheckAll();
        updateTotalPrice();
      }
    });
  
    // X 버튼 클릭 시
    $('.X').on('click', function () {
      if (confirm("삭제하시겠습니까?")) {
        $(this).closest('.item-detail').remove();
        updateCheckAll();
        updateTotalPrice();
      }
    });
  
    // 구매 완료 버튼 이벤트
    $('#buy').click(function () {
      if (confirm("구매 하시겠습니까?")) {
        alert("구매가 완료되었습니다.");
      }
    });
  
  
  
  //   function loadCart() {
  //     fetch('/api/cart')
  //         .then(response => {
  //             if (!response.ok) {
  //                 throw new Error('Network response was not ok');
  //             }
  //             return response.json();
  //         })
  //         .then(data => {
  //             // 데이터 처리 및 UI 업데이트
  //             data.items.forEach(item => {
  //                 addItemToCart(item.id, item.name, item.price, item.quantity);
  //             });
  //             calculateTotal();
  //         })
  //         .catch(error => console.error('Error loading cart:', error));
  // }
  
  });
  