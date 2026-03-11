import {
  MdSettings,
  MdPeople,
  MdChat,
  MdEmail,
  MdReport,
  MdAnalytics,
  MdAttachMoney,
  MdPayment,
  MdShoppingCart,
  MdEvent,
  MdNotifications,
  MdSecurity,
  MdAssignment,
  MdManageAccounts,
  MdDashboard,
  MdFolder,
  MdPublic,
  MdApps,
  MdExtension,
  MdWidgets,
  MdLayers,
  MdGroupWork,
  MdBubbleChart,
} from "react-icons/md";

const DYNAMIC_ICONS = [
  MdExtension,
  MdDashboard,
  MdWidgets,
  MdLayers,
  MdFolder,
  MdSettings,
  MdPublic,
  MdApps,
  MdGroupWork,
  MdBubbleChart,
];

const SEMANTIC_MAPPING: Record<string, React.FC<any>> = {
  setting: MdSettings,
  user: MdPeople,
  people: MdPeople,
  client: MdPeople,
  feedback: MdChat,
  email: MdEmail,
  message: MdChat,
  chat: MdChat,
  report: MdReport,
  analytic: MdAnalytics,
  money: MdAttachMoney,
  bill: MdAttachMoney,
  invoice: MdAttachMoney,
  pay: MdPayment,
  cart: MdShoppingCart,
  shop: MdShoppingCart,
  store: MdShoppingCart,
  event: MdEvent,
  calendar: MdEvent,
  notif: MdNotifications,
  alert: MdNotifications,
  secur: MdSecurity,
  role: MdSecurity,
  auth: MdSecurity,
  task: MdAssignment,
  assign: MdAssignment,
  form: MdAssignment,
  admin: MdManageAccounts,
  dash: MdDashboard,
  folder: MdFolder,
  public: MdPublic,
  web: MdPublic,
  app: MdApps,
};

export const getDynamicIcon = (key: string) => {
  const lowercaseKey = key.toLowerCase();

  for (const [keyword, IconComponent] of Object.entries(SEMANTIC_MAPPING)) {
    if (lowercaseKey.includes(keyword)) {
      return <IconComponent size={20} />;
    }
  }

  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = key.charCodeAt(i) + ((hash << 5) - hash);
  }
  const IconComponent = DYNAMIC_ICONS[Math.abs(hash) % DYNAMIC_ICONS.length];
  return <IconComponent size={20} />;
};