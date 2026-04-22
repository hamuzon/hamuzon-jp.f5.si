// Birthday-Counter Translations (Feature ready to be connected)
const translations = {
  ja: {
    title: "誕生日カウントダウン",
    yearLabel: "年",
    monthLabel: "月",
    dayLabel: "日",
    withAge: "年齢を表示する",
    btnStart: "カウントダウン開始",
    btnReset: "リセット",
    btnExport: "JSON保存",
    btnImport: "JSON読込",
    celebration: "🎉 お誕生日おめでとうございます！ 🎂🎈",
    todayAge: "今日は {age} 歳の誕生日です！ 🎊",
    enjoyDay: "素敵な1日を！🌟",
    nextAge: "次の誕生日で {age} 歳になります",
    unitDays: "日",
    unitHours: "時間",
    unitMinutes: "分",
    unitSeconds: "秒"
  },
  en: {
    title: "Birthday Countdown",
    yearLabel: "Year",
    monthLabel: "Month",
    dayLabel: "Day",
    withAge: "Display my age",
    btnStart: "Start Countdown",
    btnReset: "Reset",
    btnExport: "Export JSON",
    btnImport: "Import JSON",
    celebration: "🎉 Happy Birthday! 🎂🎈",
    todayAge: "Today is your {age}th birthday! 🎊",
    enjoyDay: "Have a wonderful day! 🌟",
    nextAge: "You will be {age} on your next birthday",
    unitDays: "d",
    unitHours: "h",
    unitMinutes: "m",
    unitSeconds: "s"
  }
};

// Get browser language or default to English
const LANG = (navigator.language && navigator.language.startsWith('ja')) ? 'ja' : 'en';

/**
 * Translation helper function
 * @param {string} key 
 */
const t = (key) => (translations[LANG] && translations[LANG][key]) || key;