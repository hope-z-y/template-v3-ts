# 模块开发规范

推荐目录结构：

```text
src/views/system-management/example-management/
  index.vue
  data.ts
  modules/
    form.vue
```

## 页面职责

- `index.vue`：页面编排、查询区、表格、弹窗挂载。
- `data.ts`：表格列和行内操作渲染，状态选项、枚举映射、默认值，页面局部类型。
- `modules/`：新增/编辑表单、详情抽屉等子组件。

## 组合函数

模板提供：

- `useCrudDialog`：新增/编辑弹窗状态。
- `useColumnVisibility`：列显隐与本地持久化。
- `useDeleteConfirm`：删除确认。
- `useTableQuery`：远程分页查询。

新模块优先复用这些组合函数，避免复制分页、删除和弹窗状态样板代码。

## 注释规范

- 对安全策略、权限判断、动态路由、复杂数据转换写清楚“为什么这样做”。
- 对普通赋值、简单点击事件不写流水账注释，避免初学者被噪音淹没。
