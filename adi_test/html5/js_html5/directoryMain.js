/*
모듈화된
디렉토리
관리
시스템
*/

/**
 * DirectoryMain 모듈 - 초기화 및 메인 로직
 * 
 * 이 모듈은 다음과 같은 기능을 담당합니다:
 * - 애플리케이션 초기화
 * - DOM 로드 이벤트 처리
 * - 모듈 간 의존성 조정
 */
var DirectoryMain = (function() {
    // 애플리케이션 초기화 함수
    function initialize() {
        console.log("디렉토리 관리 시스템을 초기화합니다...");
        try {
            // 디렉토리 데이터 로드
            loadTree();
            
            // 이벤트 리스너 설정
            DirectoryEvents.setupButtonEvents();
            DirectoryEvents.setupKeyboardEvents();
            
            console.log("디렉토리 관리 시스템이 성공적으로 초기화되었습니다.");
        } catch (error) {
            console.error("초기화 중 오류 발생:", error);
            DirectoryUI.showNotification("시스템 초기화 중 오류가 발생했습니다.", "error");
        }
    }

    // 트리 로드 함수
    function loadTree() {
        console.log("트리 데이터를 로드합니다...");
        
        // 샘플 데이터 로드 (실제 구현에서는 서버에서 데이터 가져오기)
        DirectoryCore.loadSampleData();
        
        // 트리 렌더링
        const treeElement = document.getElementById('tree');
        if (treeElement) {
            const idMap = DirectoryCore.getIdMap();
            const rootDirectories = Array.from(idMap.values())
                .filter(dir => !dir.parentId)
                .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
            
            DirectoryUI.renderTree(rootDirectories, treeElement, null);
            DirectoryEvents.setupTreeEventListeners();
            
            // 경로 네비게이션 업데이트
            DirectoryUI.updatePathNavigation();
        } else {
            console.error("tree 요소를 찾을 수 없습니다.");
        }
    }

    // 공개 API
    return {
        initialize: initialize,
        loadTree: loadTree
    };
})();
