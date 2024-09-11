// 이미지 리스트 관리
const imageList = document.getElementById('imageList');
const removeImageBtn = document.querySelector('.remove-image-btn');
const existingFiles = new Set(); // 중복된 이미지를 막기 위한 Set

function addImageInput() {
    const li = document.createElement('li');

    // 파일 입력 필드 생성
    const input = document.createElement('input');
    input.type = 'file';
    input.name = 'files';
    input.accept = 'image/*';
    input.required = true;

    input.onchange = function () {
        const file = input.files[0];
        const previousFileName = input.getAttribute('data-file-name');

        if (file) {
            // 파일이 선택되었을 때 중복 여부 확인
            if (existingFiles.has(file.name) && file.name !== previousFileName) {
                alert('이미 이 이미지를 선택했습니다.');
                input.value = null; // 필드를 초기화
            } else {
                // 중복이 아닐 경우 Set에 추가
                if (previousFileName) {
                    existingFiles.delete(previousFileName); // 이전 파일 이름 제거
                }
                existingFiles.add(file.name);
                input.setAttribute('data-file-name', file.name); // 현재 파일 이름 저장
            }
        } else {
            // 파일이 선택되지 않았을 경우, 기존 파일 이름 제거
            if (previousFileName) {
                existingFiles.delete(previousFileName);
                input.removeAttribute('data-file-name'); // 데이터 속성 제거
            }
        }
    };

    // 첫 번째 이미지 입력 필드인지 확인
    if (imageList.children.length !== 0) {
        // 첫 번째가 아니면 체크박스 추가
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'img-checkbox';
        li.appendChild(checkbox); // 체크박스를 li에 추가
    }

    li.appendChild(input); // 파일 입력 필드를 li에 추가
    imageList.appendChild(li);

    // 대표 이미지 레이블 업데이트
    updateRepresentativeLabel();
}

function updateRepresentativeLabel() {
    const items = imageList.getElementsByTagName('li');

    // 모든 대표 이미지 레이블 제거
    Array.from(items).forEach(item => {
        const label = item.querySelector('.rep-img-label');
        if (label) {
            item.removeChild(label);
        }
    });

    // 첫 번째 항목에만 대표 이미지 레이블 추가
    if (items.length > 0) {
        const firstItem = items[0];
        const repLabel = document.createElement('span');
        repLabel.className = 'rep-img-label';
        repLabel.innerText = '대표 이미지';
        firstItem.insertBefore(repLabel, firstItem.firstChild);
    }

    // 삭제 버튼 상태 업데이트
    updateRemoveButtonState();
}

function updateRemoveButtonState() {
    const items = imageList.getElementsByTagName('li');
    removeImageBtn.disabled = items.length === 1; // 대표 이미지만 남았을 때 비활성화
}

// 이미지 삭제를 체크박스로 할 수 있게 기능 추가
function removeCheckedImages() {
    const items = imageList.getElementsByTagName('li');
    Array.from(items).forEach(item => {
        const checkbox = item.querySelector('.img-checkbox');
        if (checkbox && checkbox.checked) {
            const input = item.querySelector('input[type="file"]');
            const fileName = input.files[0]?.name;
            if (fileName) {
                existingFiles.delete(fileName); // Set에서 제거
            }
            imageList.removeChild(item);
        }
    });
    updateRepresentativeLabel();
}

// 처음에 이미지 입력 하나 추가
addImageInput();

// 폼 제출 시 추가적인 검증 및 처리
document.getElementById('updateItemForm').onsubmit = function (e) {
    const items = imageList.getElementsByTagName('li');
    if (items.length === 0) {
        alert('적어도 하나의 이미지를 업로드해야 합니다.');
        e.preventDefault(); // 폼 제출 막기
    }

    const stockQuantity = parseInt(document.getElementById('stockQuantity').value, 10);
    const price = parseInt(document.getElementById('price').value, 10);

    if (stockQuantity < 100) {
        alert('수량을 100개 이상 넣어야 합니다.');
        e.preventDefault(); // 폼 제출 막기
    }

    if (price < 100) {
        alert('가격을 100원 이상 넣어야 합니다.');
        e.preventDefault(); // 폼 제출 막기
    }
};

// 체크된 이미지 삭제 버튼 클릭 시 처리
removeImageBtn.addEventListener('click', removeCheckedImages);