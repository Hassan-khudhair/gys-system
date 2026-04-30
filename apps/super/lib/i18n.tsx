"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Locale = "ar" | "en";

const ar = {
  // sidebar
  nav_dashboard: "لوحة التحكم",
  nav_gyms: "الصالات",
  nav_applications: "الطلبات",
  sign_out: "تسجيل الخروج",

  // dashboard
  dashboard_title: "لوحة التحكم",
  dashboard_subtitle: "نظرة عامة على جميع الصالات والأعضاء",
  total_gyms: "إجمالي الصالات",
  active_gyms: "الصالات النشطة",
  total_members: "إجمالي الأعضاء",
  expiring_soon: "ينتهي قريباً",
  within_7_days: "خلال 7 أيام القادمة",
  pending_apps: "طلب تسجيل صالة معلق",
  pending_apps_plural: "طلبات تسجيل صالات معلقة",
  review_note: "راجع وافق على طلبات تسجيل الصالات الجديدة",
  review_now: "مراجعة الآن",
  recent_gyms: "أحدث الصالات",
  view_all: "عرض الكل ←",
  no_gyms_yet: "لا توجد صالات بعد.",
  create_first_gym: "أنشئ أول صالة ←",
  no_city: "لا مدينة",
  members: "أعضاء",
  active: "نشط",
  expired: "منتهٍ",

  // gyms
  gyms_title: "الصالات",
  gyms_subtitle: "إدارة جميع الصالات المسجلة",
  add_gym: "إضافة صالة",
  search_gyms: "بحث عن صالة...",
  gym_singular: "صالة",
  gym_plural: "صالات",
  gym_name: "اسم الصالة *",
  city: "المدينة",
  phone: "الهاتف",
  gym_email: "البريد الإلكتروني",
  address: "العنوان",
  max_members: "الحد الأقصى للأعضاء",
  status: "الحالة",
  col_gym: "الصالة",
  col_city: "المدينة",
  col_status: "الحالة",
  col_members: "الأعضاء",
  col_active: "نشط",
  col_expiring: "ينتهي قريباً",
  col_created: "تاريخ الإنشاء",
  no_gyms_search: "لا توجد صالات مطابقة لبحثك.",
  no_gyms_start: "لا توجد صالات بعد. أنشئ أولى صالاتك.",
  status_active: "نشط",
  status_inactive: "غير نشط",
  status_suspended: "موقوف",

  // gym modal
  create_gym: "إنشاء صالة جديدة",
  edit_gym: "تعديل بيانات الصالة",
  save_changes: "حفظ التغييرات",
  cancel: "إلغاء",

  // applications
  applications_title: "طلبات التسجيل",
  applications_subtitle: "مراجعة والموافقة على طلبات تسجيل الصالات",
  tab_pending: "معلق",
  tab_approved: "موافق عليه",
  tab_rejected: "مرفوض",
  pending_notice: "صالة في انتظار موافقتك. الموافقة ستنشئ حسابها وتمنح المسؤول صلاحية الدخول.",
  pending_notice_plural: "صالات في انتظار موافقتك.",
  no_applications: "لا توجد طلبات",
  applied: "تاريخ التقديم",
  admin_label: "المسؤول",
  reject: "رفض",
  approve: "موافقة",
  approving: "جارٍ الموافقة...",
  reject_application: "رفض الطلب",
  rejecting: "جارٍ الرفض...",
  rejection_reason_placeholder: "سبب الرفض (اختياري)...",
  rejection_note: "رفض",
  reason: "السبب",

  // login / setup
  super_admin_panel: "لوحة تحكم المشرف العام",
  login_title: "تسجيل الدخول",
  sign_in: "تسجيل الدخول",
  signing_in: "جارٍ تسجيل الدخول...",
  email_label: "البريد الإلكتروني",
  password_label: "كلمة المرور",
  copyright: "جميع الحقوق محفوظة",

  // setup
  setup_title: "إنشاء حساب المشرف العام",
  setup_subtitle: "هذه الصفحة تُستخدم مرة واحدة فقط لإنشاء الحساب الرئيسي.",
  setup_warning: "لا تشارك هذه الصفحة مع أي شخص.",
  create_account: "إنشاء الحساب",
  creating: "جارٍ الإنشاء...",
  confirm_password: "تأكيد كلمة المرور",
  password: "كلمة المرور",
  account_created: "تم إنشاء الحساب!",
  account_created_msg: "تم إنشاء حساب المشرف العام بنجاح.",
  go_to_login: "الذهاب لتسجيل الدخول",

  // header
  super_admin_role: "المشرف العام",
  account_info: "معلومات الحساب",
  account_name: "اسم الحساب",
  email_field: "البريد الإلكتروني",

  // common
  loading: "جارٍ التحميل...",
  back_to_gyms: "العودة إلى الصالات",
  members_count: "الأعضاء",
  no_members_gym: "لا يوجد أعضاء مسجلون في هذه الصالة.",
  gyms_registered: "صالة مسجلة",
  gyms_registered_plural: "صالات مسجلة",
  created: "أُنشئ",
  col_name: "الاسم",
  col_phone: "الهاتف",
  col_subscription: "الاشتراك",
  col_start: "البداية",
  col_end: "النهاية",

  // exercise + financial
  exercise_type_label: "نوع التمرين",
  fitness: "لياقة بدنية",
  bodybuilding: "كمال الأجسام",

  total_revenue: "إجمالي الإيرادات",
  monthly_revenue: "إيرادات هذا الشهر",
  fitness_revenue: "إيرادات اللياقة",
  bodybuilding_revenue: "إيرادات كمال الأجسام",
  currency: "د.ع",

  // player status day text
  days_left: "ي متبقٍ",
  days_ago: "ي مضت",

  // theme / language
  dark: "داكن",
  light: "فاتح",
  language: "اللغة",
};

const en: typeof ar = {
  nav_dashboard: "Dashboard",
  nav_gyms: "Gyms",
  nav_applications: "Applications",
  sign_out: "Sign out",

  dashboard_title: "Dashboard",
  dashboard_subtitle: "Overview of all gyms and members",
  total_gyms: "Total Gyms",
  active_gyms: "Active Gyms",
  total_members: "Total Members",
  expiring_soon: "Expiring Soon",
  within_7_days: "Within next 7 days",
  pending_apps: "Pending Gym Application",
  pending_apps_plural: "Pending Gym Applications",
  review_note: "Review and approve new gym registration requests",
  review_now: "Review Now",
  recent_gyms: "Recent Gyms",
  view_all: "View all →",
  no_gyms_yet: "No gyms yet.",
  create_first_gym: "Create the first gym →",
  no_city: "No city",
  members: "members",
  active: "Active",
  expired: "Expired",

  gyms_title: "Gyms",
  gyms_subtitle: "Manage all registered gyms",
  add_gym: "Add Gym",
  search_gyms: "Search gyms…",
  gym_singular: "gym",
  gym_plural: "gyms",
  gym_name: "Gym Name *",
  city: "City",
  phone: "Phone",
  gym_email: "Email",
  address: "Address",
  max_members: "Max Members",
  status: "Status",
  col_gym: "Gym",
  col_city: "City",
  col_status: "Status",
  col_members: "Members",
  col_active: "Active",
  col_expiring: "Expiring",
  col_created: "Created",
  no_gyms_search: "No gyms match your search.",
  no_gyms_start: "No gyms yet. Create one to get started.",
  status_active: "Active",
  status_inactive: "Inactive",
  status_suspended: "Suspended",

  create_gym: "Create New Gym",
  edit_gym: "Edit Gym",
  save_changes: "Save Changes",
  cancel: "Cancel",

  applications_title: "Gym Applications",
  applications_subtitle: "Review and approve gym registration requests",
  tab_pending: "Pending",
  tab_approved: "Approved",
  tab_rejected: "Rejected",
  pending_notice: "gym waiting for your approval. Approving will create their gym and grant dashboard access.",
  pending_notice_plural: "gyms waiting for your approval.",
  no_applications: "No applications",
  applied: "Applied",
  admin_label: "Admin",
  reject: "Reject",
  approve: "Approve",
  approving: "Approving…",
  reject_application: "Reject Application",
  rejecting: "Rejecting…",
  rejection_reason_placeholder: "Reason for rejection (optional)…",
  rejection_note: "Rejecting",
  reason: "Reason",

  super_admin_panel: "Super Admin Panel",
  login_title: "Sign in to your account",
  sign_in: "Sign in",
  signing_in: "Signing in…",
  email_label: "Email address",
  password_label: "Password",
  copyright: "All rights reserved",

  setup_title: "Create Super Admin Account",
  setup_subtitle: "This page is used once to create the master account.",
  setup_warning: "Do not share this page with anyone.",
  create_account: "Create Account",
  creating: "Creating…",
  confirm_password: "Confirm Password",
  password: "Password",
  account_created: "Account Created!",
  account_created_msg: "Super admin account created successfully.",
  go_to_login: "Go to Login",

  super_admin_role: "Super Admin",
  account_info: "Account Info",
  account_name: "Name",
  email_field: "Email",

  dark: "Dark",
  light: "Light",
  language: "Language",

  loading: "Loading…",
  back_to_gyms: "Back to Gyms",
  members_count: "Members",
  no_members_gym: "No members registered in this gym.",
  gyms_registered: "gym registered",
  gyms_registered_plural: "gyms registered",
  created: "Created",
  col_name: "Name",
  col_phone: "Phone",
  col_subscription: "Subscription",
  col_start: "Start",
  col_end: "End",

  exercise_type_label: "Exercise Type",
  fitness: "Fitness",
  bodybuilding: "Bodybuilding",

  total_revenue: "Total Revenue",
  monthly_revenue: "This Month Revenue",
  fitness_revenue: "Fitness Revenue",
  bodybuilding_revenue: "Bodybuilding Revenue",
  currency: "IQD",

  days_left: "d left",
  days_ago: "d ago",
};

type T = typeof ar;
const translations = { ar, en };

interface LocaleCtx {
  locale: Locale;
  dir: "rtl" | "ltr";
  t: (key: keyof T) => string;
  setLocale: (l: Locale) => void;
}

const Ctx = createContext<LocaleCtx>({
  locale: "ar", dir: "rtl",
  t: (k) => k as string,
  setLocale: () => {},
});

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("ar");

  useEffect(() => {
    const saved = localStorage.getItem("locale") as Locale | null;
    if (saved === "ar" || saved === "en") setLocaleState(saved);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
    localStorage.setItem("locale", locale);
  }, [locale]);

  const t = (key: keyof T) => translations[locale][key] as string;

  return (
    <Ctx.Provider value={{ locale, dir: locale === "ar" ? "rtl" : "ltr", t, setLocale: setLocaleState }}>
      {children}
    </Ctx.Provider>
  );
}

export function useLocale() {
  return useContext(Ctx);
}
