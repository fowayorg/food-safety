INSERT INTO SysUser (id, username, password, realName, role, phone, status, createdAt, updatedAt)
VALUES (REPLACE(UUID(),'-',''), 'admin', '$2b$10$ZQHWY0i0hZbGgWC0oZk1Ve/Fm0.xJB5pQpGRom8R8Eu3WeOqipaDu', '系统管理员', 'SUPER_ADMIN', '13800000000', 'ACTIVE', NOW(), NOW())
ON DUPLICATE KEY UPDATE password='$2b$10$ZQHWY0i0hZbGgWC0oZk1Ve/Fm0.xJB5pQpGRom8R8Eu3WeOqipaDu';
