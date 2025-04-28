-- 초기 디렉토리 데이터 삽입

-- 테이블 삭제 및 재생성 (존재할 경우)
DROP TABLE IF EXISTS directories;
CREATE TABLE directories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    path VARCHAR(255) NOT NULL,
    sort_order INT NOT NULL,
    parent_id BIGINT,
    FOREIGN KEY (parent_id) REFERENCES directories(id)
);

-- 루트 디렉토리
INSERT INTO directories (name, path, sort_order, parent_id) VALUES ('프로젝트', '/프로젝트', 1, NULL);
INSERT INTO directories (name, path, sort_order, parent_id) VALUES ('문서', '/문서', 2, NULL);

-- 하위 디렉토리 (프로젝트 하위)
INSERT INTO directories (name, path, sort_order, parent_id) VALUES ('웹 개발', '/프로젝트/웹 개발', 1, 1);
INSERT INTO directories (name, path, sort_order, parent_id) VALUES ('모바일 앱', '/프로젝트/모바일 앱', 2, 1);

-- 하위 디렉토리 (문서 하위)
INSERT INTO directories (name, path, sort_order, parent_id) VALUES ('기술 문서', '/문서/기술 문서', 1, 2);
