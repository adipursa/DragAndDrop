-- 디렉토리 테이블 생성
CREATE TABLE IF NOT EXISTS directories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    path VARCHAR(255) NOT NULL,
    sort_order INT NOT NULL,
    parent_id BIGINT,
    FOREIGN KEY (parent_id) REFERENCES directories(id)
);