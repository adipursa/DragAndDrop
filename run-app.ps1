# DropAnd 애플리케이션 빌드 및 실행 스크립트

# 디렉토리 이동
cd C:/Users/master/workspace/dropAnd

# 로그 디렉토리 생성
if (!(Test-Path -Path "logs")) {
    New-Item -ItemType Directory -Path "logs"
}

# 빌드 실행
Write-Host "애플리케이션 빌드 중..."
mvn clean install

# 빌드 성공 여부 확인
if ($LASTEXITCODE -eq 0) {
    Write-Host "빌드 성공. 애플리케이션 실행 중..."
    mvn spring-boot:run
} else {
    Write-Host "빌드 실패. 로그를 확인하세요: logs/app.log"
}

# 에러가 발생해도 창이 닫히지 않도록 pause 명령어 추가
Write-Host "작업이 완료되었습니다. 창을 닫으려면 아무 키나 누르세요..."
pause
