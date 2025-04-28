/*
 * directoryManager-05-init.js
 * 디렉토리 관리 통합 모듈 - 05 초기화
 * 
 * 이 파일은 페이지 로드 시 초기화 로직을 포함합니다.
 */

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    console.log("페이지 로드됨 - 디렉토리 관리자 초기화");
    
    // 샘플 데이터 로드
    DirectoryManager.loadSampleData();
    
    // 경로 네비게이션 초기화
    DirectoryManager.updatePathNavigation();
    
    // 초기 트리 렌더링
    const treeElement = document.getElementById('tree');
    if (treeElement) {
        DirectoryManager.renderInitialTree();
    }
    
    // 이벤트 설정
    DirectoryManager.setupButtonEvents();
    DirectoryManager.setupKeyboardEvents();
    DirectoryManager.setupTreeEventListeners();
    
    // 드래그 앤 드롭 설정
    DirectoryManager.setupDragAndDrop();
}); 