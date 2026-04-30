"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Locale = "ar" | "en";

const ar = {
  // sidebar
  nav_dashboard: "لوحة التحكم",
  nav_all_players: "جميع الأعضاء",
  nav_expired: "الاشتراكات المنتهية",
  sign_out: "تسجيل الخروج",

  // dashboard
  dashboard_title: "لوحة التحكم",
  dashboard_subtitle: "نظرة عامة على الصالة",
  total_members: "إجمالي الأعضاء",
  active: "نشط",
  expired: "منتهٍ",
  expiring_soon: "ينتهي قريباً",
  within_7_days: "خلال 7 أيام",
  expiring_7_days: "ينتهي خلال 7 أيام القادمة",
  view_all_players: "عرض جميع الأعضاء ←",
  manage_players: "إدارة الأعضاء",
  manage_players_desc: "إضافة وتعديل وتجديد الاشتراكات",
  expired_members: "الأعضاء المنتهية اشتراكاتهم",
  expired_members_desc: "المتابعة والتجديد",
  no_city: "لا توجد مدينة",
  members: "أعضاء",

  // players page
  players_title: "الأعضاء",
  players_subtitle: "إدارة أعضاء الصالة الرياضية",
  tab_all: "الكل",
  tab_active: "نشط",
  tab_expiring: "ينتهي قريباً",
  tab_expired: "منتهٍ",
  add_player: "إضافة عضو",
  search_placeholder: "بحث بالاسم أو الهاتف...",
  no_players_search: "لا يوجد أعضاء مطابقون لبحثك.",
  no_players_category: "لا يوجد أعضاء في هذه الفئة.",
  player_singular: "عضو",
  player_plural: "أعضاء",

  // player modal
  add_player_title: "إضافة عضو جديد",
  edit_player_title: "تعديل بيانات العضو",
  full_name: "الاسم الكامل",
  phone: "رقم الهاتف",
  email: "البريد الإلكتروني",
  subscription_type: "نوع الاشتراك",
  start_date: "تاريخ البداية",
  end_date: "تاريخ الانتهاء",
  amount_paid: "المبلغ المدفوع (د.ع)",
  notes: "ملاحظات",
  notes_placeholder: "ملاحظات اختيارية...",
  save_changes: "حفظ التغييرات",
  add_player_btn: "إضافة عضو",
  cancel: "إلغاء",

  // player status labels
  status_active: "نشط",
  status_expiring: "ينتهي قريباً",
  status_expired: "منتهٍ",
  days_left: "ي متبقٍ",
  days_ago: "ي مضت",

  // subscription types
  sub_monthly: "شهري (شهر واحد)",
  sub_quarterly: "ربع سنوي (3 أشهر)",
  sub_semi_annual: "نصف سنوي (6 أشهر)",
  sub_annual: "سنوي (12 شهراً)",
  renew: "تجديد",
  renew_title: "تجديد اشتراك العضو",
  renew_btn: "تجديد الاشتراك",
  renewing: "جارٍ التجديد...",
  renew_info: "سيبدأ الاشتراك الجديد من تاريخ البداية المختار.",
  select_exercise_type: "اختر نوع التمرين",

  // table
  col_player: "العضو",
  col_phone: "الهاتف",
  col_plan: "الخطة",
  col_start: "البداية",
  col_end: "النهاية",
  col_status: "الحالة",
  dash: "—",

  // expired page
  expired_title: "الأعضاء المنتهية اشتراكاتهم",
  expired_info: "هؤلاء الأعضاء لديهم اشتراكات منتهية. استخدم زر التجديد (↻) لإعادة تفعيل اشتراكاتهم.",
  expired_singular: "اشتراك منتهٍ",
  expired_plural: "اشتراكات منتهية",

  // login
  gym_admin_panel: "لوحة تحكم الصالة",
  login_title: "تسجيل الدخول",
  sign_in: "تسجيل الدخول",
  signing_in: "جارٍ تسجيل الدخول...",
  email_label: "البريد الإلكتروني",
  password_label: "كلمة المرور",
  no_account: "ليس لديك حساب؟",
  register_here: "سجّل صالتك",
  copyright: "جميع الحقوق محفوظة",

  // register
  register_gym: "تسجيل صالة رياضية",
  have_account: "لديك حساب بالفعل؟",
  gym_info_section: "معلومات الصالة",
  admin_account_section: "بيانات حساب المسؤول",
  gym_name: "اسم الصالة *",
  city: "المدينة",
  gym_phone: "هاتف الصالة",
  gym_email_field: "بريد الصالة الإلكتروني",
  address: "العنوان",
  your_full_name: "اسمك الكامل *",
  login_email: "البريد الإلكتروني للدخول *",
  password: "كلمة المرور *",
  min_8: "8 أحرف على الأقل",
  confirm_password: "تأكيد كلمة المرور *",
  repeat_password: "أعد كتابة كلمة المرور",
  submit_application: "تقديم الطلب",
  submitting: "جارٍ الإرسال...",
  passwords_no_match: "كلمتا المرور غير متطابقتين.",
  password_too_short: "يجب أن تكون كلمة المرور 8 أحرف على الأقل.",
  application_success: "تم إرسال الطلب!",
  application_success_msg: "طلب تسجيل صالتك قيد المراجعة. سيتواصل معك فريق Master Gym بعد الموافقة.",
  gym_label: "الصالة",
  login_email_label: "البريد الإلكتروني",
  go_to_login: "الذهاب لتسجيل الدخول",

  // pending
  pending_title: "قيد المراجعة",
  pending_msg: "صالتك قيد المراجعة من قبل الفريق. ستتمكن من الوصول لصفحة التحكم بعد الموافقة.",
  rejected_title: "تم رفض الطلب",
  rejected_msg: "للأسف لم تتم الموافقة على طلب صالتك.",
  rejection_reason: "السبب:",
  contact_admin: "للاستفسار تواصل معنا على",
  pending_status: "قيد الانتظار",
  usually_24h: "عادةً تتم الموافقة خلال 24 ساعة. تحقق لاحقاً.",
  status: "الحالة",
  gym: "الصالة",
  checking: "جارٍ التحقق...",

  // header user info
  account_info: "معلومات الحساب",
  gym_name_label: "اسم الصالة",
  account_name: "اسم الحساب",
  email_field: "البريد الإلكتروني",
  gym_admin_role: "مدير الصالة",

  // subscription plans
  nav_plans: "خطط الاشتراك",
  plans_title: "خطط الاشتراك",
  plans_subtitle: "إدارة خطط وأسعار الاشتراكات",
  add_plan: "إضافة خطة",
  edit_plan: "تعديل الخطة",
  plan_name: "اسم الخطة *",
  exercise_type_label: "نوع التمرين",
  fitness: "لياقة بدنية",
  bodybuilding: "كمال الأجسام",
  duration_months_label: "المدة (أشهر)",
  price_label: "السعر (د.ع) *",
  plan_active: "نشطة",
  plan_inactive: "معطلة",
  plan_status: "الحالة",
  no_plans: "لا توجد خطط اشتراك بعد.",
  no_plans_type: "لا توجد خطط لهذا النوع.",
  delete_plan: "حذف الخطة",
  confirm_delete_plan: "هل أنت متأكد من حذف هذه الخطة؟",
  month: "شهر",
  months: "أشهر",
  tab_fitness: "لياقة بدنية",
  tab_bodybuilding: "كمال الأجسام",
  tab_all_plans: "الكل",
  select_plan: "اختر خطة الاشتراك",
  no_plans_for_type: "لا توجد خطط متاحة لهذا النوع",

  // financial stats
  total_revenue: "إجمالي الإيرادات",
  monthly_revenue: "إيرادات هذا الشهر",
  fitness_revenue: "إيرادات اللياقة",
  bodybuilding_revenue: "إيرادات كمال الأجسام",
  currency: "د.ع",

  // common
  loading: "جارٍ التحميل...",

  // theme / language
  dark: "داكن",
  light: "فاتح",
  language: "اللغة",
};

const en: typeof ar = {
  nav_dashboard: "Dashboard",
  nav_all_players: "All Players",
  nav_expired: "Expired Players",
  sign_out: "Sign out",

  dashboard_title: "Dashboard",
  dashboard_subtitle: "Your gym overview",
  total_members: "Total Members",
  active: "Active",
  expired: "Expired",
  expiring_soon: "Expiring Soon",
  within_7_days: "Within 7 days",
  expiring_7_days: "Expiring in the next 7 days",
  view_all_players: "View all players →",
  manage_players: "Manage Players",
  manage_players_desc: "Add, edit, renew memberships",
  expired_members: "Expired Members",
  expired_members_desc: "Follow up and renew",
  no_city: "No city",
  members: "members",

  players_title: "Players",
  players_subtitle: "Manage your gym members",
  tab_all: "All",
  tab_active: "Active",
  tab_expiring: "Expiring",
  tab_expired: "Expired",
  add_player: "Add Player",
  search_placeholder: "Search by name or phone…",
  no_players_search: "No players match your search.",
  no_players_category: "No players in this category.",
  player_singular: "player",
  player_plural: "players",

  add_player_title: "Add New Player",
  edit_player_title: "Edit Player",
  full_name: "Full Name",
  phone: "Phone",
  email: "Email",
  subscription_type: "Subscription Type",
  start_date: "Start Date",
  end_date: "End Date",
  amount_paid: "Amount Paid (IQD)",
  notes: "Notes",
  notes_placeholder: "Optional notes…",
  save_changes: "Save Changes",
  add_player_btn: "Add Player",
  cancel: "Cancel",

  status_active: "Active",
  status_expiring: "Expiring Soon",
  status_expired: "Expired",
  days_left: "d left",
  days_ago: "d ago",

  sub_monthly: "Monthly (1 month)",
  sub_quarterly: "Quarterly (3 months)",
  sub_semi_annual: "Semi-Annual (6 months)",
  sub_annual: "Annual (12 months)",
  renew: "Renew",
  renew_title: "Renew Member Subscription",
  renew_btn: "Renew Subscription",
  renewing: "Renewing…",
  renew_info: "New subscription starts from the selected start date.",
  select_exercise_type: "Select exercise type",

  col_player: "Player",
  col_phone: "Phone",
  col_plan: "Plan",
  col_start: "Start",
  col_end: "End",
  col_status: "Status",
  dash: "—",

  expired_title: "Expired Members",
  expired_info: "These members have expired subscriptions. Use the Renew button (↻) to re-activate them.",
  expired_singular: "expired subscription",
  expired_plural: "expired subscriptions",

  gym_admin_panel: "Gym Admin Panel",
  login_title: "Sign in to your account",
  sign_in: "Sign in",
  signing_in: "Signing in…",
  email_label: "Email address",
  password_label: "Password",
  no_account: "Don't have an account?",
  register_here: "Register your gym",
  copyright: "All rights reserved",

  register_gym: "Register Your Gym",
  have_account: "Already have an account?",
  gym_info_section: "Gym Information",
  admin_account_section: "Your Admin Account",
  gym_name: "Gym Name *",
  city: "City",
  gym_phone: "Gym Phone",
  gym_email_field: "Gym Email",
  address: "Address",
  your_full_name: "Your Full Name *",
  login_email: "Login Email *",
  password: "Password *",
  min_8: "Min 8 characters",
  confirm_password: "Confirm Password *",
  repeat_password: "Repeat password",
  submit_application: "Submit Gym Application",
  submitting: "Submitting…",
  passwords_no_match: "Passwords do not match.",
  password_too_short: "Password must be at least 8 characters.",
  application_success: "Application Submitted!",
  application_success_msg: "Your gym registration request has been sent. The Master Gym team will review your application and notify you once it's approved.",
  gym_label: "Gym",
  login_email_label: "Login email",
  go_to_login: "Go to Login",

  pending_title: "Account Under Review",
  pending_msg: "Your gym is being reviewed by our team. You will have access to the admin panel once approved.",
  rejected_title: "Application Rejected",
  rejected_msg: "Unfortunately your gym application was not approved.",
  rejection_reason: "Reason:",
  contact_admin: "Contact us at",
  pending_status: "Pending Approval",
  usually_24h: "Usually approved within 24 hours. Check back later.",
  status: "Status",
  gym: "Gym",
  checking: "Checking…",

  account_info: "Account Info",
  gym_name_label: "Gym",
  account_name: "Name",
  email_field: "Email",
  gym_admin_role: "Gym Admin",

  dark: "Dark",
  light: "Light",
  language: "Language",

  nav_plans: "Subscription Plans",
  plans_title: "Subscription Plans",
  plans_subtitle: "Manage subscription plans and pricing",
  add_plan: "Add Plan",
  edit_plan: "Edit Plan",
  plan_name: "Plan Name *",
  exercise_type_label: "Exercise Type",
  fitness: "Fitness",
  bodybuilding: "Bodybuilding",
  duration_months_label: "Duration (months)",
  price_label: "Price (IQD) *",
  plan_active: "Active",
  plan_inactive: "Inactive",
  plan_status: "Status",
  no_plans: "No subscription plans yet.",
  no_plans_type: "No plans for this type.",
  delete_plan: "Delete Plan",
  confirm_delete_plan: "Are you sure you want to delete this plan?",
  month: "month",
  months: "months",
  tab_fitness: "Fitness",
  tab_bodybuilding: "Bodybuilding",
  tab_all_plans: "All",
  select_plan: "Select subscription plan",
  no_plans_for_type: "No plans available for this type",

  total_revenue: "Total Revenue",
  monthly_revenue: "This Month Revenue",
  fitness_revenue: "Fitness Revenue",
  bodybuilding_revenue: "Bodybuilding Revenue",
  currency: "IQD",

  loading: "Loading…",
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
