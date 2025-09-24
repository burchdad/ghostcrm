import { Bell, User, Globe, Save, Share2, Download, Sparkles, Shuffle, Database, CreditCard, Wrench } from "lucide-react";
import type { RibbonControl } from "./types";

export const CONTROLS: RibbonControl[] = [
  { id:"profile",       group:"Home",    label:"Profile",        icon:<User/> },
  { id:"notifications", group:"Settings", label:"Notifications",  icon:<Bell/> },
  { id:"theme",         group:"Settings", label:"Theme",          icon:<Globe/> },
  { id:"language",      group:"Settings", label:"Language",       icon:<Globe/> },

  { id:"quickActions",  group:"Home",    label:"Quick",          icon:<Sparkles/> },
  { id:"bulkOps",       group:"Edit",    label:"Bulk Ops",       icon:<Shuffle/> },
  { id:"saveLayout",    group:"File",    label:"Save Layout",    icon:<Save/> },
  { id:"share",         group:"File",    label:"Share",          icon:<Share2/> },
  { id:"export",        group:"Reports", label:"Export",         icon:<Download/> },

  { id:"aiTools",       group:"AI",      label:"AI Tools",       icon:<Sparkles/> },
  { id:"automation",    group:"Automation",label:"Automation",   icon:<Shuffle/> },
  { id:"data",          group:"Data",    label:"Data",           icon:<Database/> },
  { id:"billing",       group:"Billing", label:"Billing",        icon:<CreditCard/> },
  { id:"developer",     group:"Developer",label:"Developer",     icon:<Wrench/> },
];
