console.log("index.js가 로드되었습니다.");

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', function() {
    console.log("페이지 DOM이 완전히 로드되었습니다.");
    
    // DirectoryMain 모듈이 로드되었는지 확인
    if (typeof DirectoryMain === 'object' && typeof DirectoryMain.initialize === 'function') {
        console.log("DirectoryMain 모듈이 발견되었습니다 - 모듈화된 스크립트가 올바르게 로드되었습니다.");
        // DirectoryMain 모듈 초기화 직접 호출
        DirectoryMain.initialize();
    } else {
        console.error("DirectoryMain 모듈을 찾을 수 없습니다 - 모듈화된 JS 파일이 로드되지 않았거나 순서가 잘못되었습니다.");
    }
});