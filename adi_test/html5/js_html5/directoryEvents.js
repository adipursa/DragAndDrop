/*
모듈화된
디렉토리
관리
시스템
*/

/**
 * DirectoryEvents 모듈 - 이벤트 처리 기능
 * 
 * 이 모듈은 다음과 같은 기능을 담당합니다:
 * - 트리 요소에 이벤트 리스너 등록
 * - 노드 요소에 이벤트 리스너 등록
 * - 디버그 버튼 및 기타 UI 이벤트 설정
 */
var DirectoryEvents = (function() {
    // 트리 요소에 이벤트 리스너 등록
    function setupTreeEventListeners() {
        console.log("트리 이벤트 리스너 설정을 시작합니다.");
        
        // 토글 아이콘 클릭 이벤트
        const toggleIcons = document.querySelectorAll('.tree-node .icon.fa-chevron-right, .tree-node .icon.fa-chevron-down');
        console.log(`토글 아이콘 ${toggleIcons.length}개를 찾았습니다.`);
        
        toggleIcons.forEach(icon => {
            icon.addEventListener('click', function(e) {
                e.stopPropagation();
                const nodeId = this.parentNode.dataset.id;
                console.log(`토글 아이콘 클릭됨: 노드 ID ${nodeId}`);
                DirectoryUI.toggleNode(nodeId);
            });
        });
        
        // 트리 노드에 이벤트 리스너 설정
        const treeNodes = document.querySelectorAll('.tree-node');
        console.log(`트리 노드 ${treeNodes.length}개를 찾았습니다.`);
        
        treeNodes.forEach(nodeElement => {
            setupNodeEventListeners(nodeElement);
        });
    }

    // 노드 요소에 이벤트 리스너 등록
    function setupNodeEventListeners(nodeElement) {
        console.log(`노드 ${nodeElement.dataset.id}에 이벤트 리스너를 설정합니다.`);
        
        // 하위 디렉토리 추가 버튼 클릭 이벤트
        const addButton = nodeElement.querySelector('.add-dir-btn');
        if (addButton) {
            addButton.addEventListener('click', function(e) {
                e.stopPropagation();
                const nodeId = nodeElement.dataset.id;
                const nodeName = nodeElement.dataset.name || nodeElement.textContent.trim().replace('[삭제]', '');
                console.log(`하위 디렉토리 추가 버튼 클릭됨: 부모 ID ${nodeId}`);
                DirectoryUI.showAddModal(nodeId, nodeName);
            });
        }
        
        // 삭제 버튼 클릭 이벤트
        const deleteButton = nodeElement.querySelector('.delete-btn');
        if (deleteButton) {
            deleteButton.addEventListener('click', function(e) {
                e.stopPropagation();
                const nodeId = nodeElement.dataset.id;
                console.log(`삭제 버튼 클릭됨: 노드 ID ${nodeId}`);
                DirectoryUtils.deleteDirectory(nodeId);
            });
        }
        
        // 노드 클릭 시 토글 기능 추가
        nodeElement.addEventListener('click', function(e) {
            if (e.target === this || (e.target.classList.contains('icon') && !e.target.classList.contains('fa-plus'))) {
                const nodeId = this.dataset.id;
                if (this.querySelector('.tree-children')) {
                    console.log(`노드 클릭됨 (토글): 노드 ID ${nodeId}`);
                    DirectoryUI.toggleNode(nodeId);
                }
            }
        });
        
        // 더블클릭 이벤트 (디렉토리 이동)
        nodeElement.addEventListener('dblclick', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const nodeId = this.dataset.id;
            DirectoryNavigation.handleDirectoryDoubleClick(nodeId);
        });
        
        // 드래그 및 드롭 속성 설정 (드래그 가능)
        nodeElement.setAttribute('draggable', 'true');
    }

    // 버튼 이벤트 설정
    function setupButtonEvents() {
        console.log("버튼 이벤트 설정");
        
        // 루트 디렉토리 추가 버튼
        const addRootButton = document.getElementById('addRootBtn');
        if (addRootButton) {
            addRootButton.addEventListener('click', function() {
                console.log("루트 디렉토리 추가 버튼 클릭됨");
                DirectoryUI.showAddRootModal();
            });
        }
        
        // 상위 디렉토리로 이동 버튼
        const upButton = document.getElementById('upDirBtn');
        if (upButton) {
            upButton.addEventListener('click', function() {
                console.log("상위 디렉토리로 이동 버튼 클릭됨");
                DirectoryNavigation.navigateUp();
            });
        }
        
        // 모달 닫기 버튼
        const closeButtons = document.querySelectorAll('.modal .close, .modal .cancel-btn');
        closeButtons.forEach(button => {
            button.addEventListener('click', function() {
                const modalId = this.closest('.modal').id;
                console.log(`모달 닫기 버튼 클릭됨: ${modalId}`);
                DirectoryUI.closeModal(modalId);
            });
        });
        
        // 새 디렉토리 추가 확인 버튼
        const addDirectoryConfirmButton = document.getElementById('addDirectoryConfirmBtn');
        if (addDirectoryConfirmButton) {
            addDirectoryConfirmButton.addEventListener('click', function() {
                console.log("디렉토리 추가 확인 버튼 클릭됨");
                DirectoryUtils.addNewDirectory();
            });
        }
        
        // 새 루트 디렉토리 추가 확인 버튼
        const addRootDirectoryConfirmButton = document.getElementById('addRootDirectoryConfirmBtn');
        if (addRootDirectoryConfirmButton) {
            addRootDirectoryConfirmButton.addEventListener('click', function() {
                console.log("루트 디렉토리 추가 확인 버튼 클릭됨");
                DirectoryUtils.addNewRootDirectory();
            });
        }
        
        // 디버그 버튼 (맵 상태 확인)
        const debugMapBtn = document.getElementById('debugMapBtn');
        if (debugMapBtn) {
            debugMapBtn.addEventListener('click', function() {
                console.log("디버그 버튼 클릭됨: 맵 상태 확인");
                DirectoryUI.showMapStatus();
            });
        }
        
        // 리셋 버튼 (맵 초기화 및 새로고침)
        const resetMapBtn = document.getElementById('resetMapBtn');
        if (resetMapBtn) {
            resetMapBtn.addEventListener('click', function() {
                console.log("리셋 버튼 클릭됨: 맵 초기화 및 새로고침");
                DirectoryUtils.resetAndRefresh();
            });
        }
    }

    // 키보드 이벤트 설정
    function setupKeyboardEvents() {
        document.addEventListener('keydown', function(e) {
            // ESC 키 - 모달 닫기
            if (e.key === 'Escape') {
                const visibleModal = document.querySelector('.modal[style*="display: block"]');
                if (visibleModal) {
                    console.log(`ESC 키 입력: ${visibleModal.id} 모달 닫기`);
                    DirectoryUI.closeModal(visibleModal.id);
                }
            }
            
            // Backspace 키 - 상위 디렉토리로 이동 (단, 입력 필드가 아닐 때)
            if (e.key === 'Backspace' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
                if (!document.querySelector('.modal[style*="display: block"]')) {
                    console.log("Backspace 키 입력: 상위 디렉토리로 이동");
                    DirectoryNavigation.navigateUp();
                    e.preventDefault(); // 브라우저의 뒤로 가기 방지
                }
            }
        });
    }

    // 공개 API
    return {
        setupTreeEventListeners: setupTreeEventListeners,
        setupNodeEventListeners: setupNodeEventListeners,
        setupButtonEvents: setupButtonEvents,
        setupKeyboardEvents: setupKeyboardEvents
    };
})();
