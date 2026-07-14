import type { CommonStatus, IMenu } from "@/api/types";
import type { PageColumn, SearchFieldSchema } from "@/hooks";
import { CommonStatusOptions, MenuTypeMap } from "@/utils/constant";
import { GetAntdIconComponent } from "@/utils";
import Delete24Regular from "@vicons/fluent/es/Delete24Regular";
import Edit24Regular from "@vicons/fluent/es/Edit24Regular";
import Options24Regular from "@vicons/fluent/es/Options24Regular";
import Status24Regular from "@vicons/fluent/es/Status24Regular";
import TextBulletListSquare24Regular from "@vicons/fluent/es/TextBulletListSquare24Regular";
import TextNumberFormat24Regular from "@vicons/fluent/es/TextNumberFormat24Regular";
import { NEllipsis, NIcon, NTag } from "naive-ui";
import { h } from "vue";

/** 搜索区的查询模型 */
export interface IMenuQuery {
  menuName?: string;
  status?: CommonStatus;
}

/** 新增 / 编辑弹窗的共享数据：由列表页 setData 传入，表单通过 modalApi.getData() 读取 */
export interface IMenuModalData {
  mode: "create" | "edit";
  record: IMenu | null;
}

/** 搜索表单 schema */
export const SearchSchema: SearchFieldSchema<IMenuQuery>[] = [
  { field: "menuName", label: "菜单名称" },
  { field: "status", label: "状态", component: "select", props: { options: CommonStatusOptions } },
];

/** 树形过滤：命中节点或其子孙命中的节点保留（搜索时保持树结构） */
const matchesNode = (node: IMenu, filters: IMenuQuery): boolean => {
  const menuName = filters.menuName?.trim();
  const nameMatched = !menuName || node.menuName.includes(menuName);
  const statusMatched = filters.status === undefined || filters.status === null || node.status === filters.status;
  return nameMatched && statusMatched;
};

export const FilterMenuTree = (nodes: IMenu[], filters: IMenuQuery): IMenu[] => {
  return nodes.reduce<IMenu[]>((result, node) => {
    const children = node.children?.length ? FilterMenuTree(node.children, filters) : [];

    if (matchesNode(node, filters) || children.length > 0) {
      result.push({
        ...node,
        children: children.length > 0 ? children : undefined,
      });
    }

    return result;
  }, []);
};

/** 列定义工厂：编辑回调由页面注入 */
export const CreateColumns = (handlers: { onEdit: (row: IMenu) => void }): PageColumn<IMenu>[] => [
  {
    key: "menuName",
    title: "菜单名称",
    icon: TextBulletListSquare24Regular,
    tree: true,
    minWidth: 200,
    align: "left",
    titleAlign: "left",
    render: (row) => {
      const iconComponent = GetAntdIconComponent(row.icon);
      const content = h(
        "span",
        { class: "inline-flex min-w-0 max-w-full items-center gap-2" },
        [
          iconComponent ? h(NIcon, { size: 18, class: "shrink-0" }, { default: () => h(iconComponent) }) : null,
          h("span", { class: "truncate" }, row.menuName),
        ].filter(Boolean),
      );

      return h(NEllipsis, { tooltip: true }, { default: () => content });
    },
  },
  {
    key: "menuType",
    title: "类型",
    icon: TextBulletListSquare24Regular,
    minWidth: 100,
    render: (row) => {
      const current = MenuTypeMap[row.menuType] ?? { label: row.menuType, type: "info" as const };
      return h(NTag, { type: current.type, size: "small" }, { default: () => current.label });
    },
  },
  { key: "sort", title: "排序", icon: TextNumberFormat24Regular, minWidth: 90 },
  {
    key: "permissionCode",
    title: "权限标识",
    icon: TextBulletListSquare24Regular,
    minWidth: 140,
    ellipsis: { tooltip: true },
    render: (row) => row.permissionCode || "-",
  },
  {
    key: "routePath",
    title: "路由地址",
    icon: TextBulletListSquare24Regular,
    minWidth: 140,
    ellipsis: { tooltip: true },
    render: (row) => row.routePath || "-",
  },
  {
    key: "status",
    title: "状态",
    icon: Status24Regular,
    minWidth: 100,
    render: (row) =>
      row.status === "enabled"
        ? h(NTag, { type: "success", size: "small" }, { default: () => "启用" })
        : h(NTag, { type: "error", size: "small" }, { default: () => "禁用" }),
  },
  {
    type: "actions",
    icon: Options24Regular,
    minWidth: 170,
    actions: [
      {
        label: "编辑",
        icon: Edit24Regular,
        auth: "system:menu:update",
        onClick: handlers.onEdit,
      },
      {
        label: "删除",
        icon: Delete24Regular,
        buttonType: "error",
        auth: "system:menu:delete",
        confirm: (row) => `确定要删除菜单「${row.menuName}」吗？若存在子菜单将一并删除。`,
      },
    ],
  },
];
