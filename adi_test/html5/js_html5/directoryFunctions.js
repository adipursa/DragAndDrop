// directoryFunctions.js - 디렉토리 조작 관련 핵심 함수 정의

// 전역 변수 선언
let expandedState = {};
let currentParentId = null;
let currentPath = []; // 현재 경로를 저장하는 배열 (디렉토리 이동용)
let directoryData = {}; // ID로 디렉토리 데이터를 빠르게 조회하기 위한 객체
let directoryIdMap = new Map(); // 디렉토리 ID 관리를 위한 Map
let directoryPathMap = new Map(); // 경로별 디렉토리 ID 관리를 위한 Map

// 디렉토리 트리 로드 함수 - 페이지 로드 시 자동 실행
function loadTree() {
    console.log("=======================================");
    console.log("loadTree 함수가 호출되었습니다.");
    try {
        // 이미 데이터가 있는지 확인
        const existingData = Object.keys(directoryData).length > 0 || directoryIdMap.size > 0;
        
        if (!existingData) {
            // 처음 로드 시에만 샘플 데이터 사용
            const sampleData = [
                {
                    id: "1",
                    name: "루트 디렉토리 1",
                    children: [
                        {
                            id: "2",
                            name: "하위 디렉토리 1-1",
                            children: []
                        },
                        {
                            id: "3",
                            name: "하위 디렉토리 1-2",
                            children: []
                        }
                    ]
                },
                {
                    id: "4",
                    name: "루트 디렉토리 2",
                    children: []
                }
            ];
            
            // 디렉토리 데이터 캐싱 및 경로 정보 추가
            processDirectoryData(sampleData);
            
            // 디렉토리 ID 맵 초기화
            initializeDirectoryMaps();
        }
        
        // 현재 경로 표시 업데이트 (최초 로드 시에는 루트 경로)
        updatePathNavigation();
        
        // 트리 렌더링 (맵 데이터 사용)
        const treeElement = document.getElementById('tree');
        if (treeElement) {
            console.log("트리 요소를 찾았습니다. 트리 렌더링을 시작합니다.");
            treeElement.innerHTML = '';
            
            // 맵 데이터에서 루트 디렉토리 가져오기
            const rootDirectories = Array.from(directoryIdMap.values())
                .filter(dir => !dir.parentId)
                .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
            
            console.log(`루트 디렉토리 ${rootDirectories.length}개를 맵에서 가져왔습니다.`);
            renderTree(rootDirectories, treeElement, null);
            console.log("디렉토리 트리가 렌더링되었습니다.");
            
            // 렌더링 후 이벤트 리스너 등록 (동적으로 생성된 요소에 이벤트 추가)
            setupTreeEventListeners();
            // 드래그 앤 드롭 기능 설정
            setupDragAndDrop();
        } else {
            console.error("tree 요소를 찾을 수 없습니다. ID가 'tree'인 요소가 HTML에 존재하는지 확인해주세요.");
        }
    } catch (error) {
        console.error("디렉토리 트리 로드 중 오류 발생:", error);
    }
    console.log("=======================================");
}

// 디렉토리 ID 맵 초기화 함수
function initializeDirectoryMaps() {
    console.log("디렉토리 ID 맵 초기화 중...");
    directoryIdMap.clear();
    directoryPathMap.clear();
    
    // 모든 디렉토리를 순회하며 맵에 추가
    Object.values(directoryData).forEach(dir => {
        // ID 맵에 추가 (ID -> 디렉토리 객체)
        directoryIdMap.set(dir.id, dir);
        
        // 경로 맵에 추가 (경로 문자열 -> ID)
        if (dir.path && dir.path.length > 0) {
            const pathString = dir.path.map(p => p.name).join('/');
            directoryPathMap.set(pathString, dir.id);
        }
    });
    
    console.log(`디렉토리 ID 맵 초기화 완료 - 총 ${directoryIdMap.size}개 항목`);
}

// 디렉토리 데이터를 처리하고 경로 정보를 추가하는 함수
function processDirectoryData(data, parentPath = [], parentId = null) {
    data.forEach(dir => {
        // 현재 디렉토리의 경로 생성
        const currentPath = [...parentPath, { id: dir.id, name: dir.name }];
        
        // 디렉토리 데이터 캐싱
        directoryData[dir.id] = {
            ...dir,
            path: currentPath,
            parentId: parentId
        };
        
        // 자식 디렉토리가 있으면 재귀적으로 처리
        if (dir.children && dir.children.length > 0) {
            processDirectoryData(dir.children, currentPath, dir.id);
        }
    });
}

// 디렉토리 ID로 디렉토리 객체 조회
function getDirectoryById(id) {
    // 먼저 ID 맵에서 조회
    if (directoryIdMap.has(id)) {
        return directoryIdMap.get(id);
    }
    
    // ID 맵에 없으면 일반 객체에서 조회
    return directoryData[id] || null;
}

// 경로 문자열로 디렉토리 ID 조회
function getDirectoryIdByPath(pathString) {
    return directoryPathMap.get(pathString) || null;
}

// 새 디렉토리 추가 시 맵 업데이트
function updateDirectoryMaps(directory) {
    // ID 맵 업데이트
    directoryIdMap.set(directory.id, directory);
    
    // 경로 맵에 추가 (경로가 있는 경우)
    if (directory.path && directory.path.length > 0) {
        const pathString = directory.path.map(p => p.name).join('/');
        directoryPathMap.set(pathString, directory.id);
    }
    
    console.log(`디렉토리 맵 업데이트됨 - ID: ${directory.id}`);
}

// 디렉토리 ID 체크 및 유효성 검증
function isValidDirectoryId(id) {
    return directoryIdMap.has(id) || directoryData[id] !== undefined;
}

// 상위-하위 관계 체크 (더 효율적인 방식)
function isAncestor(ancestorId, descendantId) {
    // 맵을 사용해 조회
    const descendant = getDirectoryById(descendantId);
    if (!descendant) return false;
    
    // 경로 정보를 활용해 체크
    if (descendant.path) {
        return descendant.path.some(node => node.id === ancestorId);
    }
    
    // 기존 방식 (fallback)
    let currentDir = descendant;
    while (currentDir && currentDir.parentId) {
        if (currentDir.parentId === ancestorId) {
            return true;
        }
        currentDir = getDirectoryById(currentDir.parentId);
    }
    
    return false;
}

// 현재 경로 탐색 UI를 업데이트하는 함수
function updatePathNavigation() {
    // 경로 네비게이션 컨테이너가 존재하지 않으면 생성
    let pathNav = document.getElementById('pathNavigation');
    if (!pathNav) {
        const container = document.querySelector('.container');
        if (!container) return;
        
        // 경로 네비게이션 컨테이너 생성
        pathNav = document.createElement('div');
        pathNav.id = 'pathNavigation';
        pathNav.className = 'path-navigation';
        
        // 안내 텍스트 추가
        const pathText = document.createElement('div');
        pathText.className = 'path-text';
        pathText.innerHTML = '<i class="fas fa-folder-open"></i> 현재 위치: ';
        pathNav.appendChild(pathText);
        
        // 경로 표시 영역 추가
        const pathLinks = document.createElement('div');
        pathLinks.className = 'path-links';
        pathLinks.id = 'pathLinks';
        pathNav.appendChild(pathLinks);
        
        // 인스트럭션 패널 뒤에 삽입
        const instructionPanel = document.querySelector('.instruction-panel');
        container.insertBefore(pathNav, instructionPanel.nextSibling);
    }
    
    // 경로 링크 업데이트
    const pathLinks = document.getElementById('pathLinks');
    if (!pathLinks) return;
    
    pathLinks.innerHTML = '';
    
    // 홈(루트) 링크
    const homeLink = document.createElement('span');
    homeLink.className = 'path-link';
    homeLink.innerHTML = '<i class="fas fa-home"></i> 홈';
    homeLink.title = '루트 디렉토리로 이동';
    homeLink.addEventListener('click', () => navigateToDirectory(null));
    pathLinks.appendChild(homeLink);
    
    // 현재 경로가 있는 경우 경로 표시
    if (currentPath.length > 0) {
        pathLinks.appendChild(document.createTextNode(' > '));
        
        // 경로의 각 디렉토리에 대한 링크 생성
        currentPath.forEach((dir, index) => {
            const pathLink = document.createElement('span');
            pathLink.className = 'path-link';
            pathLink.textContent = dir.name;
            pathLink.title = `${dir.name}로 이동`;
            
            // 마지막 항목이 아닌 경우에만 클릭 이벤트 추가
            if (index < currentPath.length - 1) {
                pathLink.addEventListener('click', () => {
                    // 해당 경로까지의 디렉토리로 이동
                    navigateToDirectory(dir.id, currentPath.slice(0, index + 1));
                });
            } else {
                pathLink.classList.add('current');
            }
            
            pathLinks.appendChild(pathLink);
            
            // 마지막 항목이 아니면 구분자 추가
            if (index < currentPath.length - 1) {
                pathLinks.appendChild(document.createTextNode(' > '));
            }
        });
    }
}

// 특정 디렉토리로 이동하는 함수
function navigateToDirectory(directoryId, path = null) {
    console.log(`디렉토리 이동: ID ${directoryId || 'root'}`);
    
    // 루트로 이동하는 경우
    if (!directoryId) {
        currentPath = [];
        updatePathNavigation();
        
        // 트리 요소 업데이트
        const treeElement = document.getElementById('tree');
        if (treeElement) {
            treeElement.innerHTML = '';
            
            // 맵에서 루트 디렉토리들을 가져와서 렌더링
            const rootDirectories = Array.from(directoryIdMap.values())
                .filter(dir => !dir.parentId)
                .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
            
            console.log(`루트 디렉토리 ${rootDirectories.length}개를 맵에서 가져왔습니다.`);
            renderTree(rootDirectories, treeElement, null);
            setupTreeEventListeners();
        }
        
        return;
    }
    
    // ID로 디렉토리 정보 조회 (Map 사용)
    const directory = getDirectoryById(directoryId);
    if (!directory) {
        console.error(`ID가 ${directoryId}인 디렉토리를 찾을 수 없습니다.`);
        return;
    }
    
    // 경로 설정 (제공된 경로가 없으면 디렉토리의 경로 사용)
    currentPath = path || directory.path || [];
    updatePathNavigation();
    
    // 트리 요소 업데이트
    const treeElement = document.getElementById('tree');
    if (treeElement) {
        treeElement.innerHTML = '';
        
        // 하위 디렉토리 목록 가져오기 (Map 사용)
        const children = Array.from(directoryIdMap.values())
            .filter(dir => dir.parentId === directoryId)
            .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
        
        if (children && children.length > 0) {
            console.log(`디렉토리 ID ${directoryId}의 하위 항목 ${children.length}개를 맵에서 가져왔습니다.`);
            renderTree(children, treeElement, directoryId);
            setupTreeEventListeners();
        } else {
            console.log(`디렉토리 ID ${directoryId}에 하위 항목이 없습니다.`);
            // 빈 디렉토리 표시
            treeElement.innerHTML = '<div class="empty-dir-message">이 디렉토리는 비어 있습니다.</div>';
        }
    }
}

// 디렉토리 더블클릭 시 해당 디렉토리로 이동하는 이벤트 핸들러
function handleDirectoryDoubleClick(nodeId) {
    console.log(`디렉토리 더블클릭: ID ${nodeId}`);
    
    // ID로 디렉토리 정보 조회 (Map 사용)
    const directory = getDirectoryById(nodeId);
    if (!directory) {
        console.error(`ID가 ${nodeId}인 디렉토리를 찾을 수 없습니다.`);
        return;
    }
    
    // 하위 항목 확인 (Map 사용)
    const hasChildren = Array.from(directoryIdMap.values())
        .some(dir => dir.parentId === nodeId);
    
    // 하위 항목이 있는 경우에만 이동
    if (hasChildren) {
        navigateToDirectory(nodeId);
    } else {
        showNotification(`'${directory.name}'는 비어 있는 디렉토리입니다.`, 'info');
    }
}

// 트리 요소에 이벤트 리스너 등록
function setupTreeEventListeners() {
    console.log("트리 이벤트 리스너 설정을 시작합니다.");
    
    // 토글 아이콘 클릭 이벤트
    const toggleIcons = document.querySelectorAll('.tree-node .icon.fa-chevron-right, .tree-node .icon.fa-chevron-down');
    console.log(`토글 아이콘 ${toggleIcons.length}개를 찾았습니다.`);
    toggleIcons.forEach(icon => {
        icon.addEventListener('click', function(e) {
            e.stopPropagation();
            const nodeId = this.closest('.tree-node').dataset.id;
            console.log(`토글 아이콘 클릭됨: 노드 ID ${nodeId}`);
            toggleNode(nodeId);
        });
    });
    
    // 삭제 버튼 클릭 이벤트
    const deleteButtons = document.querySelectorAll('.tree-node .delete-btn');
    console.log(`삭제 버튼 ${deleteButtons.length}개를 찾았습니다.`);
    deleteButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const nodeId = this.closest('.tree-node').dataset.id;
            console.log(`삭제 버튼 클릭됨: 노드 ID ${nodeId}`);
            deleteDirectory(nodeId);
        });
    });
    
    // 하위 디렉토리 추가 버튼 클릭 이벤트
    const addDirButtons = document.querySelectorAll('.tree-node .add-dir-btn');
    console.log(`하위 디렉토리 추가 버튼 ${addDirButtons.length}개를 찾았습니다.`);
    addDirButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const nodeElement = this.closest('.tree-node');
            const nodeId = nodeElement.dataset.id;
            const nodeName = nodeElement.textContent.trim().replace('[삭제]', '');
            console.log(`하위 디렉토리 추가 버튼 클릭됨: 노드 ID ${nodeId}, 이름 ${nodeName}`);
            currentParentId = nodeId;
            showAddModal(nodeId, nodeName);
        });
    });
    
    // 노드 우클릭 이벤트 (하위 디렉토리 추가)
    const treeNodes = document.querySelectorAll('.tree-node');
    console.log(`트리 노드 ${treeNodes.length}개를 찾았습니다.`);
    treeNodes.forEach(node => {
        // 우클릭 이벤트 (하위 디렉토리 추가)
        node.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            e.stopPropagation();
            currentParentId = this.dataset.id;
            const nodeName = this.textContent.trim().replace('[삭제]', '');
            console.log(`노드 우클릭됨: 노드 ID ${currentParentId}, 이름 ${nodeName}`);
            showAddModal(this.dataset.id, nodeName);
        });
        
        // 노드 클릭 시 토글 기능 추가
        node.addEventListener('click', function(e) {
            if (e.target === this || (e.target.classList.contains('icon') && !e.target.classList.contains('fa-plus'))) {
                const nodeId = this.dataset.id;
                if (this.querySelector('.tree-children')) {
                    console.log(`노드 클릭됨 (토글): 노드 ID ${nodeId}`);
                    toggleNode(nodeId);
                }
            }
        });
        
        // 더블클릭 이벤트 (디렉토리 이동)
        node.addEventListener('dblclick', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const nodeId = this.dataset.id;
            handleDirectoryDoubleClick(nodeId);
        });
    });
    
    console.log("트리 이벤트 리스너가 설정되었습니다.");
}

// 트리 렌더링 함수
function renderTree(nodes, parent, parentId) {
    console.log(`renderTree 호출됨: ${nodes.length}개 노드, 부모 ID ${parentId || 'root'}`);
    nodes.forEach(node => {
        const isExpanded = expandedState[node.id] || false;
        const nodeElement = document.createElement('div');
        nodeElement.className = 'tree-node';
        nodeElement.dataset.id = node.id;
        nodeElement.dataset.parentId = parentId || '';
        // 드래그 앤 드롭을 위한 속성 추가
        nodeElement.draggable = true;
        
        // 폴더 아이콘 또는 파일 아이콘 추가
        let iconHTML = `<i class="icon fas ${node.children && node.children.length > 0 ? 'fa-folder' : 'fa-file'}"></i>`;
        
        // 펼침/접힘 아이콘 추가 (하위 항목이 있는 경우)
        if (node.children && node.children.length > 0) {
            iconHTML = `<i class="icon fas ${isExpanded ? 'fa-chevron-down' : 'fa-chevron-right'}"></i>` + iconHTML;
            if (isExpanded) {
                nodeElement.classList.add('expanded');
            }
        }
        
        // 노드 이름과 삭제 버튼, 하위 디렉토리 추가 버튼 추가
        nodeElement.innerHTML = iconHTML + node.name + 
                               `<span class="add-dir-btn" title="하위 디렉토리 추가"><i class="fas fa-plus"></i></span>` +
                               `<span class="delete-btn" title="삭제">[삭제]</span>`;
        
        parent.appendChild(nodeElement);
        console.log(`노드 추가됨: ID ${node.id}, 이름 ${node.name}`);
        
        // 하위 노드 렌더링
        if (node.children && node.children.length > 0) {
            const childrenContainer = document.createElement('div');
            childrenContainer.className = 'tree-children';
            if (isExpanded) {
                childrenContainer.style.display = 'block';
            }
            nodeElement.appendChild(childrenContainer);
            console.log(`하위 노드 컨테이너 추가됨: ID ${node.id}의 ${node.children.length}개 하위 항목`);
            renderTree(node.children, childrenContainer, node.id);
        }
    });
}

// 노드 펼침/접힘 토글 함수
function toggleNode(id) {
    console.log(`toggleNode(${id}) 함수가 호출되었습니다.`);
    const node = document.querySelector(`.tree-node[data-id="${id}"]`);
    if (!node) {
        console.error(`ID가 ${id}인 노드를 찾을 수 없습니다.`);
        return;
    }
    
    const isExpanded = node.classList.contains('expanded');
    expandedState[id] = !isExpanded;
    
    node.classList.toggle('expanded');
    const childrenContainer = node.querySelector('.tree-children');
    if (childrenContainer) {
        childrenContainer.style.display = isExpanded ? 'none' : 'block';
        console.log(`노드 ${id}의 하위 항목 표시 상태가 ${isExpanded ? '숨김' : '표시'}으로 변경되었습니다.`);
    } else {
        console.log(`노드 ${id}에 하위 항목이 없습니다.`);
    }
    
    const chevronIcon = node.querySelector('.icon.fa-chevron-right, .icon.fa-chevron-down');
    if (chevronIcon) {
        chevronIcon.classList.toggle('fa-chevron-right');
        chevronIcon.classList.toggle('fa-chevron-down');
    }
}

// 루트 디렉토리 추가 모달 표시 함수
function showAddRootModal() {
    console.log("showAddRootModal 함수가 호출되었습니다.");
    currentParentId = null;
    showAddModal(null, '루트');
}

// 디렉토리 추가 모달 표시 함수
function showAddModal(parentId, parentName) {
    console.log(`showAddModal(${parentId}, ${parentName}) 함수가 호출되었습니다.`);
    const newDirNameInput = document.getElementById('newDirName');
    if (newDirNameInput) {
        newDirNameInput.value = '';
    } else {
        console.error("newDirName 입력 필드를 찾을 수 없습니다.");
    }
    
    const modalTitle = document.querySelector('.modal-title');
    if (modalTitle) {
        modalTitle.textContent = parentName ? `${parentName} 아래 새 디렉토리 추가` : '새 루트 디렉토리 추가';
    } else {
        console.error("modal-title 요소를 찾을 수 없습니다.");
    }
    
    const modal = document.getElementById('addModal');
    if (modal) {
        modal.style.display = 'block';
        
        // 포커스를 입력 필드로 이동
        if (newDirNameInput) {
            setTimeout(() => {
                newDirNameInput.focus();
            }, 100);
        }
        
        console.log("모달이 표시되었습니다.");
    } else {
        console.error("addModal 요소를 찾을 수 없습니다.");
    }
}

// 모달 닫기 함수
function closeModal(modalId) {
    console.log(`closeModal(${modalId}) 함수가 호출되었습니다.`);
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        console.log(`모달 ${modalId}가 닫혔습니다.`);
    } else {
        console.error(`ID가 ${modalId}인 모달을 찾을 수 없습니다.`);
    }
}

// 새 디렉토리 추가 함수
function addNewDirectory() {
    console.log("addNewDirectory 함수가 호출되었습니다.");
    const newDirNameInput = document.getElementById('newDirName');
    if (!newDirNameInput || !newDirNameInput.value.trim()) {
        alert('디렉토리 이름을 입력하세요.');
        return;
    }
    
    const name = newDirNameInput.value.trim();
    console.log(`새 디렉토리 추가: ${name}, 부모 ID: ${currentParentId || 'root'}`);
    
    // 실제 API 요청 대신 임시 처리
    const newId = Date.now().toString(); // 임시 ID 생성
    const newNode = {
        id: newId,
        name: name,
        children: []
    };
    
    // 경로 및 부모 ID 설정
    let parentNode = null;
    if (currentParentId) {
        parentNode = getDirectoryById(currentParentId);
        if (parentNode) {
            newNode.parentId = currentParentId;
            if (parentNode.path) {
                newNode.path = [...parentNode.path, { id: newId, name: name }];
            } else {
                newNode.path = [{ id: newId, name: name }];
            }
        } else {
            newNode.path = [{ id: newId, name: name }];
        }
    } else {
        // 루트 디렉토리인 경우
        newNode.path = [{ id: newId, name: name }];
    }
    
    // 데이터 저장
    directoryData[newId] = newNode;
    
    // 맵에 추가
    updateDirectoryMaps(newNode);
    
    // 노드 추가 로직
    if (currentParentId) {
        // 하위 디렉토리 추가
        const parentNode = document.querySelector(`.tree-node[data-id="${currentParentId}"]`);
        if (parentNode) {
            let childrenContainer = parentNode.querySelector('.tree-children');
            if (!childrenContainer) {
                childrenContainer = document.createElement('div');
                childrenContainer.className = 'tree-children';
                parentNode.appendChild(childrenContainer);
                console.log(`노드 ${currentParentId}에 새 하위 항목 컨테이너를 생성했습니다.`);
                
                // 부모 노드에 펼침 아이콘 추가 (이전에 자식 노드가 없었다면)
                const parentIcon = parentNode.querySelector('.icon.fas');
                if (parentIcon && !parentNode.querySelector('.icon.fa-chevron-right, .icon.fa-chevron-down')) {
                    // 폴더 아이콘 앞에 화살표 아이콘 추가
                    const chevronIcon = document.createElement('i');
                    chevronIcon.className = 'icon fas fa-chevron-right';
                    parentNode.insertBefore(chevronIcon, parentIcon);
                    
                    // 클릭 이벤트 리스너 추가
                    chevronIcon.addEventListener('click', function(e) {
                        e.stopPropagation();
                        toggleNode(currentParentId);
                    });
                }
                
                // 이미 부모 노드가 있었다면 폴더 아이콘으로 변경
                const fileIcon = parentNode.querySelector('.icon.fa-file');
                if (fileIcon) {
                    fileIcon.classList.remove('fa-file');
                    fileIcon.classList.add('fa-folder');
                }
            }
            
            // 부모 노드가 펼쳐져 있도록 설정
            if (!parentNode.classList.contains('expanded')) {
                console.log(`부모 노드 ${currentParentId}를 펼칩니다.`);
                toggleNode(currentParentId);
            }
            
            // 새 노드 추가 (폴더 아이콘으로 추가)
            const nodeElement = document.createElement('div');
            nodeElement.className = 'tree-node';
            nodeElement.dataset.id = newNode.id;
            nodeElement.dataset.parentId = currentParentId;
            nodeElement.innerHTML = `<i class="icon fas fa-folder"></i>${name}` +
                                   `<span class="add-dir-btn" title="하위 디렉토리 추가"><i class="fas fa-plus"></i></span>` +
                                   `<span class="delete-btn" title="삭제">[삭제]</span>`;
            childrenContainer.appendChild(nodeElement);
            console.log(`하위 디렉토리가 추가되었습니다: ID ${newNode.id}, 이름 ${name}`);
            
            // 새 노드에 이벤트 리스너 추가
            setupNodeEventListeners(nodeElement);
            
            // 부모 객체에 자식 추가
            const parentDir = getDirectoryById(currentParentId);
            if (parentDir) {
                if (!parentDir.children) parentDir.children = [];
                parentDir.children.push(newNode);
            }
        } else {
            console.error(`ID가 ${currentParentId}인 부모 노드를 찾을 수 없습니다.`);
        }
    } else {
        // 루트 디렉토리 추가
        const treeElement = document.getElementById('tree');
        if (treeElement) {
            const nodeElement = document.createElement('div');
            nodeElement.className = 'tree-node';
            nodeElement.dataset.id = newNode.id;
            nodeElement.innerHTML = `<i class="icon fas fa-folder"></i>${name}` +
                                   `<span class="add-dir-btn" title="하위 디렉토리 추가"><i class="fas fa-plus"></i></span>` +
                                   `<span class="delete-btn" title="삭제">[삭제]</span>`;
            treeElement.appendChild(nodeElement);
            console.log(`루트 디렉토리가 추가되었습니다: ID ${newNode.id}, 이름 ${name}`);
            
            // 새 노드에 이벤트 리스너 추가
            setupNodeEventListeners(nodeElement);
        }
    }
    
    // 모달 닫기
    closeModal('addModal');
    
    // 알림 메시지 표시
    showNotification(`디렉토리 '${name}'이(가) 추가되었습니다.`);
}

// 개별 노드에 이벤트 리스너 추가
function setupNodeEventListeners(nodeElement) {
    console.log(`노드 ${nodeElement.dataset.id}에 이벤트 리스너를 설정합니다.`);
    // 삭제 버튼 클릭 이벤트
    const deleteBtn = nodeElement.querySelector('.delete-btn');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            const nodeId = nodeElement.dataset.id;
            console.log(`삭제 버튼 클릭됨: 노드 ID ${nodeId}`);
            deleteDirectory(nodeId);
        });
    }
    
    // 하위 디렉토리 추가 버튼 클릭 이벤트
    const addDirBtn = nodeElement.querySelector('.add-dir-btn');
    if (addDirBtn) {
        addDirBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            const nodeId = nodeElement.dataset.id;
            const nodeName = nodeElement.textContent.trim().replace('[삭제]', '');
            console.log(`하위 디렉토리 추가 버튼 클릭됨: 노드 ID ${nodeId}, 이름 ${nodeName}`);
            currentParentId = nodeId;
            showAddModal(nodeElement.dataset.id, nodeName);
        });
    }
    
    // 노드 우클릭 이벤트 (하위 디렉토리 추가)
    nodeElement.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        e.stopPropagation();
        currentParentId = nodeElement.dataset.id;
        const nodeName = nodeElement.textContent.trim().replace('[삭제]', '');
        console.log(`노드 우클릭됨: 노드 ID ${currentParentId}, 이름 ${nodeName}`);
        showAddModal(nodeElement.dataset.id, nodeName);
    });
    
    // 노드 클릭 시 토글 기능 추가
    nodeElement.addEventListener('click', function(e) {
        if (e.target === this || (e.target.classList.contains('icon') && !e.target.classList.contains('fa-plus'))) {
            const nodeId = this.dataset.id;
            if (this.querySelector('.tree-children')) {
                console.log(`노드 클릭됨 (토글): 노드 ID ${nodeId}`);
                toggleNode(nodeId);
            }
        }
    });
    
    // 더블클릭 이벤트 (디렉토리 이동)
    nodeElement.addEventListener('dblclick', function(e) {
        e.preventDefault();
        e.stopPropagation();
        const nodeId = this.dataset.id;
        handleDirectoryDoubleClick(nodeId);
    });
    
    // 드래그 앤 드롭 이벤트 설정
    // 드래그 가능하도록 설정
    nodeElement.draggable = true;
    
    // 드래그 시작 시 이벤트
    nodeElement.addEventListener('dragstart', function(e) {
        e.dataTransfer.setData('text/plain', nodeElement.dataset.id);
        nodeElement.classList.add('dragging');
        console.log(`드래그 시작: ${nodeElement.textContent.trim().replace('[삭제]', '')}, ID ${nodeElement.dataset.id}`);
    });
    
    // 드래그 종료 시 이벤트
    nodeElement.addEventListener('dragend', function(e) {
        nodeElement.classList.remove('dragging');
        document.querySelectorAll('.tree-node').forEach(n => {
            n.classList.remove('drop-target');
        });
    });
    
    // 드래그 엔터 이벤트 (드래그한 아이템이 대상 요소 위로 들어올 때)
    nodeElement.addEventListener('dragenter', function(e) {
        e.preventDefault();
        if (nodeElement !== e.target && !nodeElement.classList.contains('dragging')) {
            nodeElement.classList.add('drop-target');
        }
    });
    
    // 드래그 오버 이벤트 (드래그한 아이템이 대상 요소 위에 있을 때 계속 발생)
    nodeElement.addEventListener('dragover', function(e) {
        e.preventDefault(); // 필수: 드롭 허용
    });
    
    // 드래그 리브 이벤트 (드래그한 아이템이 대상 요소에서 벗어날 때)
    nodeElement.addEventListener('dragleave', function(e) {
        // 자식 요소로 이동했을 때는 dragleave 이벤트가 발생하지 않도록 체크
        const relatedTarget = e.relatedTarget;
        if (relatedTarget && !nodeElement.contains(relatedTarget)) {
            nodeElement.classList.remove('drop-target');
        }
    });
    
    // 드롭 이벤트 (드래그한 아이템을 대상 요소에 놓을 때)
    nodeElement.addEventListener('drop', function(e) {
        e.preventDefault();
        nodeElement.classList.remove('drop-target');
        
        const draggedId = e.dataTransfer.getData('text/plain');
        const targetId = nodeElement.dataset.id;
        
        // 자기 자신에게 드롭하는 경우 무시
        if (draggedId === targetId) {
            console.log("자기 자신에게 드롭할 수 없습니다.");
            return;
        }
        
        // 상위 디렉토리가 하위 디렉토리로 들어가는 것 방지
        if (isAncestor(draggedId, targetId)) {
            console.log("상위 디렉토리를 하위 디렉토리로 이동할 수 없습니다.");
            showNotification("상위 디렉토리를 하위 디렉토리로 이동할 수 없습니다.", "error");
            return;
        }
        
        console.log(`디렉토리 이동: ID ${draggedId}를 ID ${targetId} 아래로 이동`);
        moveDirectory(draggedId, targetId);
    });
}

// 디렉토리 삭제 함수
function deleteDirectory(id) {
    console.log(`deleteDirectory(${id}) 함수가 호출되었습니다.`);
    if (confirm('정말로 이 디렉토리를 삭제하시겠습니까? 하위 디렉토리도 모두 삭제됩니다.')) {
        console.log(`디렉토리 삭제: ${id}`);
        
        // 디렉토리 객체 조회
        const directoryToDelete = getDirectoryById(id);
        if (!directoryToDelete) {
            console.error(`ID가 ${id}인 디렉토리를 찾을 수 없습니다.`);
            return;
        }
        
        // UI에서 노드 제거
        const nodeToRemove = document.querySelector(`.tree-node[data-id="${id}"]`);
        if (nodeToRemove) {
            const nodeName = directoryToDelete.name || nodeToRemove.textContent.trim().replace('[삭제]', '');
            
            // 하위 디렉토리가 있는 경우, 함께 제거
            const childrenContainer = nodeToRemove.querySelector('.tree-children');
            if (childrenContainer) {
                // 하위 디렉토리들도 재귀적으로 데이터에서 제거
                removeChildrenFromData(directoryToDelete);
                
                // UI에서 제거
                nodeToRemove.removeChild(childrenContainer);
                console.log(`노드 ${id}의 하위 항목을 제거했습니다.`);
            }
            
            // 노드 제거
            nodeToRemove.parentNode.removeChild(nodeToRemove);
            console.log(`노드 ${id}를 제거했습니다.`);
            
            // 부모 객체에서 제거
            if (directoryToDelete.parentId) {
                const parentDir = getDirectoryById(directoryToDelete.parentId);
                if (parentDir && parentDir.children) {
                    parentDir.children = parentDir.children.filter(child => child.id !== id);
                }
            }
            
            // 맵에서 제거
            directoryIdMap.delete(id);
            
            // 경로 맵에서 제거
            if (directoryToDelete.path) {
                const pathString = directoryToDelete.path.map(p => p.name).join('/');
                directoryPathMap.delete(pathString);
            }
            
            // 데이터에서 제거
            delete directoryData[id];
            
            // 알림 메시지 표시
            showNotification(`디렉토리 '${nodeName}'이(가) 삭제되었습니다.`);
        } else {
            console.error(`ID가 ${id}인 노드를 UI에서 찾을 수 없습니다.`);
            
            // UI에 노드가 없더라도 데이터는 삭제
            
            // 부모 객체에서 제거
            if (directoryToDelete.parentId) {
                const parentDir = getDirectoryById(directoryToDelete.parentId);
                if (parentDir && parentDir.children) {
                    parentDir.children = parentDir.children.filter(child => child.id !== id);
                }
            }
            
            // 하위 디렉토리들도 재귀적으로 데이터에서 제거
            removeChildrenFromData(directoryToDelete);
            
            // 맵에서 제거
            directoryIdMap.delete(id);
            
            // 경로 맵에서 제거
            if (directoryToDelete.path) {
                const pathString = directoryToDelete.path.map(p => p.name).join('/');
                directoryPathMap.delete(pathString);
            }
            
            // 데이터에서 제거
            delete directoryData[id];
            
            showNotification(`디렉토리 '${directoryToDelete.name}'이(가) 삭제되었습니다.`);
        }
    } else {
        console.log(`디렉토리 ${id} 삭제가 취소되었습니다.`);
    }
}

// 하위 디렉토리들을 데이터와 맵에서 제거하는 함수
function removeChildrenFromData(directory) {
    if (!directory.children || directory.children.length === 0) return;
    
    directory.children.forEach(child => {
        // 재귀적으로 하위 항목도 제거
        removeChildrenFromData(child);
        
        // 맵에서 제거
        directoryIdMap.delete(child.id);
        
        // 경로 맵에서 제거
        if (child.path) {
            const pathString = child.path.map(p => p.name).join('/');
            directoryPathMap.delete(pathString);
        }
        
        // 데이터에서 제거
        delete directoryData[child.id];
    });
}

// 알림 메시지 표시 함수
function showNotification(message, type = 'info') {
    console.log(`알림 메시지: ${message}`);
    const toastContainer = document.getElementById('toastContainer');
    if (toastContainer) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <span>${message}</span>
            <button class="toast-close">&times;</button>
        `;
        
        toastContainer.appendChild(toast);
        
        // 닫기 버튼 이벤트
        const closeBtn = toast.querySelector('.toast-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                toastContainer.removeChild(toast);
            });
        }
        
        // 자동 제거 (3초 후)
        setTimeout(() => {
            if (toast.parentNode === toastContainer) {
                toastContainer.removeChild(toast);
            }
        }, 3000);
    } else {
        console.error("toastContainer 요소를 찾을 수 없습니다.");
    }
}

// 상위 디렉토리로 이동하는 함수
function navigateUp() {
    console.log("상위 디렉토리로 이동합니다.");
    
    // 현재 경로가 없으면 (루트에 있으면) 아무 작업도 하지 않음
    if (currentPath.length === 0) {
        showNotification("이미 최상위 디렉토리에 있습니다.", "info");
        return;
    }
    
    // 현재 경로의 마지막에서 하나 뺀 디렉토리로 이동
    if (currentPath.length > 1) {
        // 마지막에서 두 번째 항목의 ID 가져오기
        const parentDirId = currentPath[currentPath.length - 2].id;
        // 마지막 항목 제외한 경로로 이동
        navigateToDirectory(parentDirId, currentPath.slice(0, -1));
    } else {
        // 현재 경로에 항목이 하나만 있으면 루트로 이동
        navigateToDirectory(null);
    }
}

// 드래그 앤 드롭 초기화 함수
function setupDragAndDrop() {
    const treeNodes = document.querySelectorAll('.tree-node');
    console.log(`드래그 앤 드롭 설정: ${treeNodes.length}개 노드에 적용`);
    
    // 이벤트 리스너 등록
    treeNodes.forEach(node => {
        // 드래그 시작 시 이벤트
        node.addEventListener('dragstart', function(e) {
            e.dataTransfer.setData('text/plain', node.dataset.id);
            node.classList.add('dragging');
            console.log(`드래그 시작: ${node.textContent.trim().replace('[삭제]', '')}, ID ${node.dataset.id}`);
        });
        
        // 드래그 종료 시 이벤트
        node.addEventListener('dragend', function(e) {
            node.classList.remove('dragging');
            document.querySelectorAll('.tree-node').forEach(n => {
                n.classList.remove('drop-target');
            });
        });
        
        // 드래그 엔터 이벤트 (드래그한 아이템이 대상 요소 위로 들어올 때)
        node.addEventListener('dragenter', function(e) {
            e.preventDefault();
            if (node !== e.target && !node.classList.contains('dragging')) {
                node.classList.add('drop-target');
            }
        });
        
        // 드래그 오버 이벤트 (드래그한 아이템이 대상 요소 위에 있을 때 계속 발생)
        node.addEventListener('dragover', function(e) {
            e.preventDefault(); // 필수: 드롭 허용
        });
        
        // 드래그 리브 이벤트 (드래그한 아이템이 대상 요소에서 벗어날 때)
        node.addEventListener('dragleave', function(e) {
            // 자식 요소로 이동했을 때는 dragleave 이벤트가 발생하지 않도록 체크
            const relatedTarget = e.relatedTarget;
            if (relatedTarget && !node.contains(relatedTarget)) {
                node.classList.remove('drop-target');
            }
        });
        
        // 드롭 이벤트 (드래그한 아이템을 대상 요소에 놓을 때)
        node.addEventListener('drop', function(e) {
            e.preventDefault();
            node.classList.remove('drop-target');
            
            const draggedId = e.dataTransfer.getData('text/plain');
            const targetId = node.dataset.id;
            
            // 자기 자신에게 드롭하는 경우 무시
            if (draggedId === targetId) {
                console.log("자기 자신에게 드롭할 수 없습니다.");
                return;
            }
            
            // 상위 디렉토리가 하위 디렉토리로 들어가는 것 방지
            if (isAncestor(draggedId, targetId)) {
                console.log("상위 디렉토리를 하위 디렉토리로 이동할 수 없습니다.");
                showNotification("상위 디렉토리를 하위 디렉토리로 이동할 수 없습니다.", "error");
                return;
            }
            
            console.log(`디렉토리 이동: ID ${draggedId}를 ID ${targetId} 아래로 이동`);
            moveDirectory(draggedId, targetId);
        });
    });
}

// 디렉토리 이동 함수
function moveDirectory(directoryId, newParentId) {
    // 실제 서버 API 호출 대신 로컬에서 처리
    console.log(`moveDirectory: ${directoryId} -> ${newParentId}`);
    
    // 이동할 디렉토리와 새 부모 디렉토리 찾기 (Map 사용)
    let directoryToMove = getDirectoryById(directoryId);
    let newParentDirectory = getDirectoryById(newParentId);
    
    if (!directoryToMove) {
        console.error(`이동할 디렉토리 (ID: ${directoryId})를 찾을 수 없습니다.`);
        
        // 이동할 디렉토리가 없으면 자동으로 생성
        directoryToMove = {
            id: directoryId,
            name: `임시 디렉토리 ${directoryId.substring(0, 5)}`,
            children: [],
            parentId: null,
            path: [{ id: directoryId, name: `임시 디렉토리 ${directoryId.substring(0, 5)}` }]
        };
        
        // 전역 데이터에 추가
        directoryData[directoryId] = directoryToMove;
        
        // 맵에도 추가
        updateDirectoryMaps(directoryToMove);
        
        // UI에 표시
        const treeElement = document.getElementById('tree');
        if (treeElement) {
            const nodeElement = document.createElement('div');
            nodeElement.className = 'tree-node';
            nodeElement.dataset.id = directoryId;
            nodeElement.innerHTML = `<i class="icon fas fa-folder"></i>${directoryToMove.name}` +
                                   `<span class="add-dir-btn" title="하위 디렉토리 추가"><i class="fas fa-plus"></i></span>` +
                                   `<span class="delete-btn" title="삭제">[삭제]</span>`;
            treeElement.appendChild(nodeElement);
            console.log(`루트 디렉토리가 추가되었습니다: ID ${directoryId}, 이름 ${directoryToMove.name}`);
            
            // 새 노드에 이벤트 리스너 추가
            setupNodeEventListeners(nodeElement);
        }
    } else {
        // 이동할 디렉토리가 있는 경우
        console.log(`디렉토리 이동: ID ${directoryId}를 ID ${newParentId} 아래로 이동`);
        
        // 이동할 디렉토리의 부모 디렉토리 찾기
        const parentDir = getDirectoryById(newParentId);
        if (parentDir) {
            // 이동할 디렉토리를 부모 디렉토리의 자식으로 추가
            if (!parentDir.children) parentDir.children = [];
            parentDir.children.push(directoryToMove);
            
            // 이동할 디렉토리의 부모 ID 업데이트
            directoryToMove.parentId = newParentId;
            
            // 이동할 디렉토리의 경로 업데이트
            if (directoryToMove.path) {
                directoryToMove.path = [...parentDir.path, directoryToMove];
            } else {
                directoryToMove.path = [...parentDir.path, directoryToMove];
            }
            
            // 맵에 업데이트
            updateDirectoryMaps(directoryToMove);
            
            // 트리 렌더링
            const treeElement = document.getElementById('tree');
            if (treeElement) {
                treeElement.innerHTML = '';
                renderTree(parentDir.children, treeElement, parentDir.id);
                setupTreeEventListeners();
            }
        } else {
            console.error(`ID가 ${newParentId}인 부모 디렉토리를 찾을 수 없습니다.`);
        }
    }
}

// UI 새로고침 함수
function refreshUI() {
    console.log("UI 새로고침 함수가 호출되었습니다.");
    
    // 현재 열려있는 디렉토리 정보 저장
    const currentViewId = currentPath.length > 0 ? currentPath[currentPath.length - 1].id : null;
    
    // 맵 데이터 확인 및 디버그 출력
    console.log(`Map 상태: ${directoryIdMap.size}개 항목, 경로 맵: ${directoryPathMap.size}개 항목`);
    
    // 현재 보고 있는 디렉토리의 내용을 새로고침
    if (currentViewId) {
        // 현재 디렉토리가 맵에 존재하는지 확인
        if (directoryIdMap.has(currentViewId)) {
            console.log(`현재 디렉토리 ID ${currentViewId}가 맵에 존재합니다. 해당 디렉토리로 이동합니다.`);
            navigateToDirectory(currentViewId);
        } else {
            console.error(`현재 디렉토리 ID ${currentViewId}가 맵에 존재하지 않습니다. 루트로 이동합니다.`);
            // 존재하지 않으면 루트로 이동
            navigateToDirectory(null);
        }
    } else {
        // 루트 디렉토리 보기 (맵 데이터 사용)
        console.log("루트 디렉토리를 새로고침합니다.");
        loadTree();
    }
}

// 맵 데이터 상태 출력 및 확인 함수 (디버깅용)
function debugMaps() {
    console.log("======= 디렉토리 맵 디버그 정보 =======");
    console.log(`directoryData 크기: ${Object.keys(directoryData).length}개 항목`);
    console.log(`directoryIdMap 크기: ${directoryIdMap.size}개 항목`);
    console.log(`directoryPathMap 크기: ${directoryPathMap.size}개 항목`);
    
    console.log("\n## directoryIdMap 내용:");
    directoryIdMap.forEach((value, key) => {
        console.log(`  - ID: ${key}, 이름: ${value.name}, 부모: ${value.parentId || 'root'}`);
    });
    
    console.log("\n## directoryPathMap 내용:");
    directoryPathMap.forEach((value, key) => {
        console.log(`  - 경로: ${key}, 연결 ID: ${value}`);
    });
    
    console.log("\n## 상위-하위 구조 분석:");
    // 각 디렉토리의 하위 항목 수 계산
    const childCountMap = new Map();
    directoryIdMap.forEach((dir) => {
        const parentId = dir.parentId;
        if (parentId) {
            childCountMap.set(parentId, (childCountMap.get(parentId) || 0) + 1);
        }
    });
    
    // 결과 출력
    childCountMap.forEach((count, parentId) => {
        const parentDir = directoryIdMap.get(parentId);
        if (parentDir) {
            console.log(`  - '${parentDir.name}' (ID: ${parentId})의 하위 항목 수: ${count}개`);
        } else {
            console.log(`  - 알 수 없는 부모 ID ${parentId}의 하위 항목 수: ${count}개`);
        }
    });
    
    console.log("======================================");
    return true;
}

// 디렉토리 맵 상태를 브라우저에 표시하는 함수
function showMapStatus() {
    const status = debugMaps();
    showNotification(`맵 상태 확인: ${status ? '성공' : '실패'}. 콘솔을 확인하세요.`, 'info');
    return status;
}

// 맵 초기화 후 UI 새로고침 함수
function resetAndRefresh() {
    console.log("맵 데이터 초기화 및 UI 새로고침");
    
    // 맵 초기화
    directoryIdMap.clear();
    directoryPathMap.clear();
    directoryData = {};
    
    // 기본 데이터 로드
    const sampleData = [
        {
            id: "1",
            name: "루트 디렉토리 1",
            children: [
                {
                    id: "2",
                    name: "하위 디렉토리 1-1",
                    children: []
                },
                {
                    id: "3",
                    name: "하위 디렉토리 1-2",
                    children: []
                }
            ]
        },
        {
            id: "4",
            name: "루트 디렉토리 2",
            children: []
        }
    ];
    
    // 데이터 처리 및 맵 초기화
    processDirectoryData(sampleData);
    initializeDirectoryMaps();
    
    // UI 업데이트
    currentPath = [];
    updatePathNavigation();
    
    // 트리 새로고침
    const treeElement = document.getElementById('tree');
    if (treeElement) {
        treeElement.innerHTML = '';
        const rootDirs = Array.from(directoryIdMap.values())
            .filter(dir => !dir.parentId);
        renderTree(rootDirs, treeElement, null);
        setupTreeEventListeners();
    }
    
    showNotification("디렉토리 구조가 초기화되었습니다.", "success");
    return true;
}

// 페이지 로드 시 실행되는 함수
document.addEventListener('DOMContentLoaded', function() {
    console.log("directoryFunctions.js가 로드되었습니다.");
    console.log("페이지 로드 완료 - 트리 로드 함수를 호출합니다.");
    
    // 디렉토리 트리 로드 함수 직접 호출
    setTimeout(function() {
        loadTree();
    }, 500);
    
    // 모달 엔터 키 처리
    const newDirNameInput = document.getElementById('newDirName');
    if (newDirNameInput) {
        newDirNameInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (typeof addNewDirectory === 'function') {
                    addNewDirectory();
                }
            }
        });
    }
    
    // 버튼 이벤트 핸들러 직접 연결
    const addRootBtn = document.getElementById('addRootBtn');
    if (addRootBtn) {
        addRootBtn.addEventListener('click', function() {
            console.log("루트 디렉토리 추가 버튼이 클릭되었습니다.");
            showAddRootModal();
        });
    } else {
        console.error("addRootBtn 요소를 찾을 수 없습니다.");
    }
    
    const closeModalBtn = document.getElementById('closeModalBtn');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', function() {
            closeModal('addModal');
        });
    }
    
    const addDirBtn = document.getElementById('addDirBtn');
    if (addDirBtn) {
        addDirBtn.addEventListener('click', function() {
            addNewDirectory();
        });
    }
    
    // 뒤로 가기 버튼 이벤트 처리
    const goBackBtn = document.getElementById('goBackBtn');
    if (goBackBtn) {
        goBackBtn.addEventListener('click', function() {
            navigateUp();
        });
    } else {
        console.error("goBackBtn 요소를 찾을 수 없습니다.");
    }
    
    // 디버그 버튼 이벤트 처리
    const debugMapBtn = document.getElementById('debugMapBtn');
    if (debugMapBtn) {
        debugMapBtn.addEventListener('click', function() {
            console.log("맵 데이터 디버그 버튼이 클릭되었습니다.");
            showMapStatus();
        });
    }
    
    const resetMapBtn = document.getElementById('resetMapBtn');
    if (resetMapBtn) {
        resetMapBtn.addEventListener('click', function() {
            console.log("맵 초기화 버튼이 클릭되었습니다.");
            resetAndRefresh();
        });
    }
});