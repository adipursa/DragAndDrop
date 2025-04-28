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
});

$(document).ready(function() {
    $('#loginForm').on('submit', function(e) {
        e.preventDefault();
        var username = $('#username').val();
        var password = $('#password').val();

        $.ajax({
            url: '/login',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ username: username, password: password }),
            success: function(response) {
                if (response === 'success') {
                    window.location.href = 'list.html';
                } else {
                    $('#errorMessage').show();
                    showToast('로그인에 실패했습니다. 사용자명 또는 비밀번호를 확인하세요.');
                }
            },
            error: function(xhr, status, error) {
                $('#errorMessage').show();
                showToast('로그인에 실패했습니다. 사용자명 또는 비밀번호를 확인하세요.');
                console.error(error);
            }
        });
    });
});