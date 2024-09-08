// header.js

$(document).ready(function() {
    $('.search-btn').on('click', function(e) {
        e.preventDefault();  // 페이지 새로고침 방지

        // 입력된 검색어 가져오기
        let searchQuery = $('.search-txt').val();  

        if (searchQuery.trim() === '') {
            // 검색어가 비어 있을 경우
            const searchUrl = `item-sort.html`;
            window.location.href = searchUrl;
        } else {
            // 검색어가 있을 때 - 검색 페이지로 이동
            const searchUrl = `item-sort.html?keyword=${encodeURIComponent(searchQuery)}`;
            window.location.href = searchUrl;
        }
    });
});
