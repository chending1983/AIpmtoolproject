# 晶拓网站组件系统文档

## 概述

本组件系统实现了网站公共组件（Header、Footer）的统一管理与复用，确保所有页面保持一致的样式、交互逻辑和功能特性。

## 目录结构

```
components/
├── header.html          # Header组件
├── footer.html          # Footer组件
├── README.md           # 本文档
└── examples/           # 使用示例（可选）
```

## 快速开始

### 1. 在页面中引入组件加载器

```html
<head>
    <!-- 其他样式表 -->
    <script src="js/component-loader.js"></script>
</head>
```

### 2. 添加组件容器

```html
<body>
    <!-- Header组件容器 -->
    <div id="header-container" data-component="header" data-active-nav="about" data-lang="zh"></div>
    
    <!-- 页面主体内容 -->
    <main id="main-content">
        <!-- 页面内容 -->
    </main>
    
    <!-- Footer组件容器 -->
    <div id="footer-container" data-component="footer" data-show-social="true"></div>
</body>
```

### 3. 组件自动加载

组件加载器会在 `DOMContentLoaded` 事件后自动检测并加载所有标记了 `data-component` 属性的容器。

## Header组件

### 配置选项

通过 `data-*` 属性配置：

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `data-active-nav` | string | 自动检测 | 当前活动导航项：home, about, products, applications, news, contact |
| `data-lang` | string | 'zh' | 当前语言：en, zh, es |

### 使用示例

```html
<!-- 自动检测当前页面并设置活动导航 -->
<div id="header-container" data-component="header"></div>

<!-- 显式指定活动导航和语言 -->
<div id="header-container" data-component="header" data-active-nav="products" data-lang="en"></div>
```

### JavaScript API

```javascript
// 获取Header组件实例
const header = JTComponents.get('header');

// 设置语言
header.setLanguage('en');

// 设置活动导航
header.setActiveNavigation('about');

// 获取当前语言
const currentLang = header.getLanguage();
```

### 事件

| 事件名 | 触发时机 | 数据 |
|--------|----------|------|
| `header:navClick` | 导航链接点击时 | `{ href, nav }` |
| `header:languageChange` | 语言切换时 | `{ language }` |

```javascript
// 监听导航点击
document.addEventListener('header:navClick', (e) => {
    console.log('导航点击:', e.detail.href);
});

// 监听语言切换
document.addEventListener('header:languageChange', (e) => {
    console.log('切换到语言:', e.detail.language);
});
```

## Footer组件

### 配置选项

通过 `data-*` 属性配置：

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `data-show-social` | boolean | true | 是否显示社交媒体链接 |
| `data-custom-class` | string | - | 自定义CSS类名 |

### 使用示例

```html
<!-- 默认配置 -->
<div id="footer-container" data-component="footer"></div>

<!-- 隐藏社交媒体链接 -->
<div id="footer-container" data-component="footer" data-show-social="false"></div>

<!-- 添加自定义类名 -->
<div id="footer-container" data-component="footer" data-custom-class="footer-custom"></div>
```

### JavaScript API

```javascript
// 获取Footer组件实例
const footer = JTComponents.get('footer');

// 控制社交媒体显示/隐藏
footer.setSocialVisible(false);

// 更新版权信息
footer.updateCopyright('2024', '公司名称');
```

### 事件

| 事件名 | 触发时机 | 数据 |
|--------|----------|------|
| `footer:linkClick` | Footer链接点击时 | `{ href, text }` |
| `footer:socialClick` | 社交媒体链接点击时 | `{ platform }` |

```javascript
// 监听Footer链接点击
document.addEventListener('footer:linkClick', (e) => {
    console.log('链接点击:', e.detail.href);
});

// 监听社交媒体点击
document.addEventListener('footer:socialClick', (e) => {
    console.log('社交媒体平台:', e.detail.platform);
});
```

## 组件加载器 API

### 全局对象

组件加载器提供了全局的 `JTComponents` 对象，用于与组件系统交互。

### 方法

#### `JTComponents.load(name, container)`

动态加载组件到指定容器。

```javascript
// 加载Header组件到新容器
const container = document.createElement('div');
document.body.appendChild(container);
await JTComponents.load('header', container);
```

#### `JTComponents.get(name)`

获取已加载的组件实例。

```javascript
const header = JTComponents.get('header');
if (header) {
    header.setLanguage('en');
}
```

#### `JTComponents.reload(name)`

重新加载指定组件。

```javascript
await JTComponents.reload('header');
```

#### `JTComponents.clearCache()`

清除组件缓存。

```javascript
JTComponents.clearCache();
```

#### `JTComponents.on(eventName, callback)`

监听组件加载器事件。

```javascript
JTComponents.on('componentsLoaded', (data) => {
    console.log(`${data.count} 个组件已加载`);
});
```

#### `JTComponents.config(options)`

配置组件加载器。

```javascript
JTComponents.config({
    cacheEnabled: true,        // 启用缓存
    cacheDuration: 300000,     // 缓存5分钟
    retryAttempts: 3,          // 重试3次
    retryDelay: 1000          // 重试延迟1秒
});
```

### 事件

| 事件名 | 触发时机 | 数据 |
|--------|----------|------|
| `componentLoader:componentLoaded` | 单个组件加载完成 | `{ name, container }` |
| `componentLoader:componentsLoaded` | 所有组件加载完成 | `{ count }` |
| `page:ready` | 页面完全就绪（组件加载完成） | - |

```javascript
// 监听所有组件加载完成
document.addEventListener('componentLoader:componentsLoaded', (e) => {
    console.log('所有组件加载完成');
});

// 监听页面就绪
document.addEventListener('page:ready', () => {
    // 初始化页面特定功能
    initPageFeatures();
});
```

## 响应式设计

组件已实现响应式设计，在不同设备尺寸下保持良好的显示效果：

### 断点

- **桌面端**: > 992px
- **平板端**: 768px - 992px
- **移动端**: < 768px

### Header响应式行为

- **桌面端**: 完整导航菜单显示
- **平板端**: 导航菜单保持，间距调整
- **移动端**: 汉堡菜单，点击展开导航

### Footer响应式行为

- **桌面端**: 4列布局
- **平板端**: 2列布局
- **移动端**: 单列布局，内容居中

## 扩展组件

### 创建新组件

1. 在 `components/` 目录下创建新的HTML文件
2. 使用 `<template>` 标签定义组件模板
3. 添加组件逻辑脚本
4. 可选：添加组件样式

#### 示例：创建ContactForm组件

```html
<!-- components/contact-form.html -->
<template id="contact-form-template">
    <form class="contact-form" id="contact-form">
        <!-- 表单内容 -->
    </form>
</template>

<script>
(function() {
    'use strict';
    
    class ContactFormComponent {
        constructor(container) {
            this.container = container;
            this.init();
        }
        
        init() {
            // 渲染和初始化逻辑
        }
        
        emit(eventName, data) {
            const event = new CustomEvent(`contactForm:${eventName}`, {
                detail: data,
                bubbles: true
            });
            this.container.dispatchEvent(event);
        }
    }
    
    window.ContactFormComponent = ContactFormComponent;
})();
</script>
```

### 使用新组件

```html
<div id="contact-form-container" data-component="contact-form"></div>
```

## 最佳实践

### 1. 组件容器ID

建议使用描述性的ID：

```html
<!-- 推荐 -->
<div id="header-container" data-component="header"></div>
<div id="footer-container" data-component="footer"></div>

<!-- 不推荐 -->
<div id="h" data-component="header"></div>
```

### 2. 事件处理

在 `DOMContentLoaded` 中监听组件事件：

```javascript
document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('header:navClick', handleNavClick);
    document.addEventListener('header:languageChange', handleLanguageChange);
});
```

### 3. 错误处理

组件加载失败时，加载器会自动重试。可以通过监听错误事件来处理：

```javascript
window.addEventListener('error', (e) => {
    if (e.message.includes('component')) {
        console.error('组件加载错误:', e.message);
    }
});
```

### 4. 性能优化

- 启用组件缓存（默认启用）
- 避免频繁重新加载组件
- 使用 `JTComponents.reload()` 而不是清空容器重新加载

## 故障排除

### 组件未加载

1. 检查 `data-component` 属性是否正确
2. 确认组件文件存在于 `components/` 目录
3. 检查浏览器控制台是否有错误信息
4. 确认 `component-loader.js` 已正确引入

### 样式问题

1. 检查 `enhanced-pages.css` 是否已引入
2. 确认没有CSS冲突
3. 检查响应式断点是否正确

### JavaScript错误

1. 确认组件类名正确（PascalCase + Component后缀）
2. 检查事件监听是否正确添加
3. 确认在 `DOMContentLoaded` 后访问组件

## 更新日志

### v1.0.0 (2024-03-13)

- 初始版本发布
- 实现Header组件
- 实现Footer组件
- 实现组件加载器
- 支持响应式设计
- 支持组件通信

## 贡献指南

1. 修改组件前请备份原文件
2. 遵循现有的代码风格和命名规范
3. 更新本文档以反映变更
4. 测试所有使用组件的页面

## 联系方式

如有问题或建议，请联系开发团队。
