# Aria·R 私人读书知识库 — 搭建计划

## 项目概述
Aria·R — 私人读书网站，用于管理阅读记录、存储读书笔记和摘抄、追踪阅读进度，并提供跨书籍的知识关联与可视化呈现。

## Stage 1: GitHub 仓库创建与初始化
- 使用GitHub MCP创建仓库 `aria-r`
- 初始化README（基于需求文档）
- 推送初始项目结构

## Stage 2: 项目初始化（Mode A — 多Agent）
- 加载 `vibecoding-webapp-swarm` 技能
- 运行 `init-webapp.sh` 初始化项目
- 确定构建类型：前端优先（Phase 1功能），后期可接入后端

## Stage 3: 设计（Pro_Designer）
- 创建设计Agent，生成 design.md + 各页面设计文档
- 包含首页、书架、摘录集、回响、共鸣图谱等页面设计

## Stage 4: Scaffold（脚手架搭建）
- 搭建基础框架：路由、Navbar、Footer、Layout
- 实现首页（Landing Page）
- 生成媒体资源

## Stage 5: 页面并行开发
- 按页面分组并行开发：
  - 组1: 书架（书籍管理、阅读状态追踪）
  - 组2: 摘录集（摘录CRUD、语音输入）
  - 组3: 回响 + 搜索（回顾功能、全文搜索）
  - 组4: 共鸣图谱（关系图可视化）

## Stage 6: 合并、构建与部署
- 合并所有分支
- 构建并部署
- 推送至GitHub
