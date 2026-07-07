import Add24Regular from "@vicons/fluent/es/Add24Regular";
import AlignCenterHorizontal20Regular from "@vicons/fluent/es/AlignCenterHorizontal20Regular";
import Alert24Regular from "@vicons/fluent/es/Alert24Regular";
import Apps24Regular from "@vicons/fluent/es/Apps24Regular";
import ArrowDownload24Regular from "@vicons/fluent/es/ArrowDownload24Regular";
import ArrowUpload24Regular from "@vicons/fluent/es/ArrowUpload24Regular";
import Attach24Regular from "@vicons/fluent/es/Attach24Regular";
import Book24Regular from "@vicons/fluent/es/Book24Regular";
import Bookmark24Regular from "@vicons/fluent/es/Bookmark24Regular";
import Briefcase24Regular from "@vicons/fluent/es/Briefcase24Regular";
import Building24Regular from "@vicons/fluent/es/Building24Regular";
import CalendarLtr24Regular from "@vicons/fluent/es/CalendarLtr24Regular";
import Camera24Regular from "@vicons/fluent/es/Camera24Regular";
import Cart24Regular from "@vicons/fluent/es/Cart24Regular";
import ChartMultiple24Regular from "@vicons/fluent/es/ChartMultiple24Regular";
import Checkmark24Regular from "@vicons/fluent/es/Checkmark24Regular";
import Clipboard24Regular from "@vicons/fluent/es/Clipboard24Regular";
import Cloud24Regular from "@vicons/fluent/es/Cloud24Regular";
import Code24Regular from "@vicons/fluent/es/Code24Regular";
import Copy24Regular from "@vicons/fluent/es/Copy24Regular";
import Database24Regular from "@vicons/fluent/es/Database24Regular";
import Delete24Regular from "@vicons/fluent/es/Delete24Regular";
import Desktop24Regular from "@vicons/fluent/es/Desktop24Regular";
import Dismiss24Regular from "@vicons/fluent/es/Dismiss24Regular";
import Document24Regular from "@vicons/fluent/es/Document24Regular";
import Edit24Regular from "@vicons/fluent/es/Edit24Regular";
import Filter24Regular from "@vicons/fluent/es/Filter24Regular";
import Folder24Regular from "@vicons/fluent/es/Folder24Regular";
import Globe24Regular from "@vicons/fluent/es/Globe24Regular";
import Grid24Regular from "@vicons/fluent/es/Grid24Regular";
import History24Regular from "@vicons/fluent/es/History24Regular";
import Home24Regular from "@vicons/fluent/es/Home24Regular";
import Image24Regular from "@vicons/fluent/es/Image24Regular";
import Info24Regular from "@vicons/fluent/es/Info24Regular";
import Key24Regular from "@vicons/fluent/es/Key24Regular";
import Laptop24Regular from "@vicons/fluent/es/Laptop24Regular";
import Link24Regular from "@vicons/fluent/es/Link24Regular";
import LockClosed24Regular from "@vicons/fluent/es/LockClosed24Regular";
import Mail24Regular from "@vicons/fluent/es/Mail24Regular";
import Mic24Regular from "@vicons/fluent/es/Mic24Regular";
import Money24Regular from "@vicons/fluent/es/Money24Regular";
import Options24Regular from "@vicons/fluent/es/Options24Regular";
import Organization24Regular from "@vicons/fluent/es/Organization24Regular";
import PanelLeft24Regular from "@vicons/fluent/es/PanelLeft24Regular";
import People24Regular from "@vicons/fluent/es/People24Regular";
import Person24Regular from "@vicons/fluent/es/Person24Regular";
import Phone24Regular from "@vicons/fluent/es/Phone24Regular";
import Print24Regular from "@vicons/fluent/es/Print24Regular";
import Pulse24Regular from "@vicons/fluent/es/Pulse24Regular";
import Search24Regular from "@vicons/fluent/es/Search24Regular";
import Server24Regular from "@vicons/fluent/es/Server24Regular";
import Settings24Regular from "@vicons/fluent/es/Settings24Regular";
import Share24Regular from "@vicons/fluent/es/Share24Regular";
import Shield24Regular from "@vicons/fluent/es/Shield24Regular";
import SignOut24Regular from "@vicons/fluent/es/SignOut24Regular";
import Star24Regular from "@vicons/fluent/es/Star24Regular";
import Tag24Regular from "@vicons/fluent/es/Tag24Regular";
import TextBulletListSquare24Regular from "@vicons/fluent/es/TextBulletListSquare24Regular";
import Video24Regular from "@vicons/fluent/es/Video24Regular";
import Wrench24Regular from "@vicons/fluent/es/Wrench24Regular";
import type { Component } from "vue";

/** 菜单可选图标（均为 Fluent 24 Regular 线框风格） */
export const MENU_FLUENT_ICON_NAMES = [
  "Settings24Regular",
  "People24Regular",
  "Person24Regular",
  "Shield24Regular",
  "TextBulletListSquare24Regular",
  "Organization24Regular",
  "Briefcase24Regular",
  "Book24Regular",
  "Wrench24Regular",
  "Pulse24Regular",
  "SignIn24Regular",
  "History24Regular",
  "Home24Regular",
  "Apps24Regular",
  "Grid24Regular",
  "Document24Regular",
  "Folder24Regular",
  "Database24Regular",
  "Server24Regular",
  "Cloud24Regular",
  "Globe24Regular",
  "Link24Regular",
  "Mail24Regular",
  "Phone24Regular",
  "CalendarLtr24Regular",
  "Calendar24Regular",
  "ChartMultiple24Regular",
  "Money24Regular",
  "Cart24Regular",
  "Building24Regular",
  "Desktop24Regular",
  "Laptop24Regular",
  "Print24Regular",
  "Image24Regular",
  "Camera24Regular",
  "Video24Regular",
  "Mic24Regular",
  "Key24Regular",
  "LockClosed24Regular",
  "Alert24Regular",
  "Info24Regular",
  "Star24Regular",
  "Bookmark24Regular",
  "Tag24Regular",
  "Attach24Regular",
  "Share24Regular",
  "Copy24Regular",
  "Clipboard24Regular",
  "Search24Regular",
  "Filter24Regular",
  "Options24Regular",
  "PanelLeft24Regular",
  "Code24Regular",
  "ArrowUpload24Regular",
  "ArrowDownload24Regular",
  "Add24Regular",
  "Edit24Regular",
  "Delete24Regular",
  "Checkmark24Regular",
  "Dismiss24Regular",
  "AlignCenterHorizontal20Regular",
] as const;

export type MenuFluentIconName = (typeof MENU_FLUENT_ICON_NAMES)[number];

const fluentIconMap: Record<MenuFluentIconName, Component> = {
  Settings24Regular,
  People24Regular,
  Person24Regular,
  Shield24Regular,
  TextBulletListSquare24Regular,
  Organization24Regular,
  Briefcase24Regular,
  Book24Regular,
  Wrench24Regular,
  Pulse24Regular,
  SignIn24Regular: SignOut24Regular,
  History24Regular,
  Home24Regular,
  Apps24Regular,
  Grid24Regular,
  Document24Regular,
  Folder24Regular,
  Database24Regular,
  Server24Regular,
  Cloud24Regular,
  Globe24Regular,
  Link24Regular,
  Mail24Regular,
  Phone24Regular,
  CalendarLtr24Regular,
  Calendar24Regular: CalendarLtr24Regular,
  ChartMultiple24Regular,
  Money24Regular,
  Cart24Regular,
  Building24Regular,
  Desktop24Regular,
  Laptop24Regular,
  Print24Regular,
  Image24Regular,
  Camera24Regular,
  Video24Regular,
  Mic24Regular,
  Key24Regular,
  LockClosed24Regular,
  Alert24Regular,
  Info24Regular,
  Star24Regular,
  Bookmark24Regular,
  Tag24Regular,
  Attach24Regular,
  Share24Regular,
  Copy24Regular,
  Clipboard24Regular,
  Search24Regular,
  Filter24Regular,
  Options24Regular,
  PanelLeft24Regular,
  Code24Regular,
  ArrowUpload24Regular,
  ArrowDownload24Regular,
  Add24Regular,
  Edit24Regular,
  Delete24Regular,
  Checkmark24Regular,
  Dismiss24Regular,
  AlignCenterHorizontal20Regular,
};

/** 是否为 vicons/fluent 中存在的 24Regular 图标名 */
export const isFluentMenuIconName = (iconName?: string | null): iconName is string => {
  return Boolean(iconName?.endsWith("24Regular") && fluentIconMap[iconName as MenuFluentIconName]);
};

/**
 * 根据 Fluent 图标组件名解析图标组件。
 * 仅接受以 24Regular 结尾且在图标库中存在的名称，否则返回 null。
 */
export const getFluentIconComponent = (iconName?: string | null): Component | null => {
  if (!isFluentMenuIconName(iconName)) return null;
  return fluentIconMap[iconName as MenuFluentIconName];
};
