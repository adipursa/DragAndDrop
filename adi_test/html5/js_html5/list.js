async function loadHTML(url, targetId) {
    try {
        const response = await fetch(url);
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const scriptContent = doc.querySelector('script').textContent;
        eval(scriptContent); // JavaScript 코드 실행
        if (targetId) {
            document.getElementById(targetId).innerHTML += doc.body.innerHTML;
        }
    } catch (error) {
        console.error('HTML 파일을 불러오는 데 실패했습니다:', error);
    }
}

// 필요한 HTML 파일들을 불러옴
document.addEventListener('DOMContentLoaded', async () => {
    await loadHTML('../js_html5/notification.html', null);
    loadDirectories(); // 디렉토리 목록 로드
});

// 디렉토리 데이터를 로드하는 함수
function loadDirectories() {
    $.ajax({
        url: '/api/directories',
        method: 'GET',
        dataType: 'json',
        success: function(data) {
            renderDirectories(data, '#directoryList');
        },
        error: function(xhr, status, error) {
            showToast('디렉토리 데이터를 로드하는 데 실패했습니다.');
            console.error(error);
        }
    });
}

// 디렉토리를 렌더링하는 함수
function renderDirectories(directories, containerId) {
    var $container = $(containerId);
    $container.empty();
    directories.forEach(function(dir) {
        var $item = $('<div>').addClass('directory-item').attr('data-id', dir.id);
        var $iconFolder = $('<span>').addClass('icon-folder').html('<i class="fas fa-folder"></i>');
        var $name = $('<span>').addClass('directory-name').text(dir.name + ' (' + dir.path + ')');
        var $deleteBtn = $('<button>').addClass('btn btn-delete').text('삭제').on('click', function() {
            deleteDirectory(dir.id);
        });
        $item.append($iconFolder, $name, $deleteBtn);
        $container.append($item);
    });
}

// 새 디렉토리 추가 함수
function addDirectory() {
    var name = prompt('새 디렉토리 이름을 입력하세요:');
    var parentId = prompt('부모 디렉토리 ID를 입력하세요 (없으면 빈칸):');
    if (name) {
        var data = { name: name };
        if (parentId) data.parentId = parseInt(parentId);
        $.ajax({
            url: '/api/directories',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(data),
            success: function() {
                loadDirectories();
                showToast('디렉토리가 추가되었습니다.');
            },
            error: function(xhr, status, error) {
                showToast('디렉토리 추가에 실패했습니다.');
                console.error(error);
            }
        });
    }
}

// 디렉토리 삭제 함수
function deleteDirectory(id) {
    if (confirm('이 디렉토리를 삭제하시겠습니까? 하위 디렉토리도 모두 삭제됩니다.')) {
        $.ajax({
            url: '/api/directories/' + id,
            method: 'DELETE',
            success: function() {
                loadDirectories();
                showToast('디렉토리가 삭제되었습니다.');
            },
            error: function(xhr, status, error) {
                showToast('디렉토리 삭제에 실패했습니다.');
                console.error(error);
            }
        });
    }
}