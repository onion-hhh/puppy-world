-- 创建数据库
CREATE DATABASE IF NOT EXISTS puppy_world DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE puppy_world;

-- 1. 用户表（user）
CREATE TABLE IF NOT EXISTS `user` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `openid` VARCHAR(100) NOT NULL COMMENT '微信/支付宝openid',
  `nickname` VARCHAR(50) NOT NULL COMMENT '用户昵称',
  `avatar` VARCHAR(255) COMMENT '用户头像',
  `phone` VARCHAR(20) COMMENT '手机号码',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态：1-正常，0-禁用',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_openid` (`openid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 2. 宠物友好地点表（place）
CREATE TABLE IF NOT EXISTS `place` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '地点ID',
  `name` VARCHAR(100) NOT NULL COMMENT '地点名称',
  `type` TINYINT NOT NULL COMMENT '地点类型：1-公园，2-超市，3-餐厅',
  `address` VARCHAR(255) NOT NULL COMMENT '详细地址',
  `phone` VARCHAR(20) COMMENT '联系电话',
  `business_hours` VARCHAR(100) COMMENT '营业时间',
  `rules` TEXT COMMENT '宠物友好规则',
  `tags` VARCHAR(255) COMMENT '标签（逗号分隔）',
  `latitude` DECIMAL(10,6) COMMENT '纬度',
  `longitude` DECIMAL(10,6) COMMENT '经度',
  `avg_score` DECIMAL(2,1) DEFAULT 0 COMMENT '平均评分',
  `collect_count` INT DEFAULT 0 COMMENT '收藏数',
  `comment_count` INT DEFAULT 0 COMMENT '评论数',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态：1-正常，0-下架',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  INDEX `idx_type` (`type`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='宠物友好地点表';

-- 3. 提交记录表（apply）
CREATE TABLE IF NOT EXISTS `apply` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '提交记录ID',
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '提交用户ID',
  `place_id` BIGINT UNSIGNED COMMENT '关联地点ID（审核通过后关联）',
  `name` VARCHAR(100) NOT NULL COMMENT '地点名称',
  `type` TINYINT NOT NULL COMMENT '地点类型：1-公园，2-超市，3-餐厅',
  `address` VARCHAR(255) NOT NULL COMMENT '详细地址',
  `phone` VARCHAR(20) COMMENT '联系电话',
  `business_hours` VARCHAR(100) COMMENT '营业时间',
  `rules` TEXT COMMENT '宠物友好规则',
  `tags` VARCHAR(255) COMMENT '标签（逗号分隔）',
  `latitude` DECIMAL(10,6) COMMENT '纬度',
  `longitude` DECIMAL(10,6) COMMENT '经度',
  `status` TINYINT NOT NULL DEFAULT 0 COMMENT '审核状态：0-待审核，1-审核通过，2-审核驳回',
  `reject_reason` TEXT COMMENT '驳回理由',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '提交时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_place_id` (`place_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='提交记录表';

-- 4. 收藏表（collect）
CREATE TABLE IF NOT EXISTS `collect` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '收藏ID',
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  `place_id` BIGINT UNSIGNED NOT NULL COMMENT '地点ID',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '收藏时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_place` (`user_id`, `place_id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_place_id` (`place_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='收藏表';

-- 5. 评论/评分表（comment）
CREATE TABLE IF NOT EXISTS `comment` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '评论ID',
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  `place_id` BIGINT UNSIGNED NOT NULL COMMENT '地点ID',
  `content` TEXT NOT NULL COMMENT '评论内容',
  `score` TINYINT NOT NULL COMMENT '评分（1-5星）',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '评论时间',
  PRIMARY KEY (`id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_place_id` (`place_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='评论/评分表';

-- 6. 管理员表（admin）
CREATE TABLE IF NOT EXISTS `admin` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '管理员ID',
  `username` VARCHAR(50) NOT NULL COMMENT '用户名',
  `password` VARCHAR(100) NOT NULL COMMENT '密码（加密存储）',
  `nickname` VARCHAR(50) NOT NULL COMMENT '昵称',
  `role` TINYINT NOT NULL DEFAULT 1 COMMENT '角色：1-普通管理员，2-超级管理员',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态：1-正常，0-禁用',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='管理员表';


-- 8. 系统通知表（notification）
CREATE TABLE IF NOT EXISTS `notification` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '通知ID',
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  `type` TINYINT NOT NULL COMMENT '通知类型：1-审核结果，2-系统通知',
  `title` VARCHAR(100) NOT NULL COMMENT '通知标题',
  `content` TEXT NOT NULL COMMENT '通知内容',
  `is_read` TINYINT NOT NULL DEFAULT 0 COMMENT '是否已读：0-未读，1-已读',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_is_read` (`is_read`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统通知表';

-- 地点智能审核记录表
CREATE TABLE IF NOT EXISTS audit_log (
  id INT PRIMARY KEY AUTO_INCREMENT,
  apply_id BIGINT UNSIGNED NOT NULL,
  audit_type ENUM('auto','manual') DEFAULT 'auto',
  rule_score DECIMAL(5,2) DEFAULT 0,
  ai_score DECIMAL(5,2) DEFAULT 0,
  final_score DECIMAL(5,2) DEFAULT 0,
  rule_result JSON,
  ai_result JSON,
  final_decision TINYINT,
  reject_reason VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (apply_id) REFERENCES apply(id)
);
CREATE INDEX IF NOT EXISTS idx_audit_apply_id ON audit_log(apply_id);

-- 初始化管理员账号：admin / 密码：admin123
INSERT INTO `admin` (`username`, `password`, `nickname`, `role`) VALUES 
('admin', '$10$I0oAk6hD5MCpo/A.2dQy8O4Twg1xRY1HMt7ThPxT5eo.jZiws7Su2', '超级管理员', 2);

-- 初始化地点类型数据
INSERT INTO `place` (`name`, `type`, `address`, `phone`, `business_hours`, `rules`, `tags`, `status`) VALUES
('中央公园', 1, '北京市朝阳区中央公园', '12345678901', '06:00-22:00', '需牵绳，禁止大型犬', '允许牵绳,提供宠物饮水', 1),
('宠物友好超市', 2, '上海市浦东新区宠物友好超市', '13800138000', '09:00-21:00', '需牵绳，宠物需坐购物车', '允许牵绳,宠物购物车', 1),
('狗狗餐厅', 3, '广州市天河区狗狗餐厅', '13900139000', '10:00-22:00', '需牵绳，宠物需坐专用座位', '允许牵绳,宠物菜单', 1);