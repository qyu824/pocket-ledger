# ⚡ 精簡記帳 Pocket Ledger — 3 分鐘串接 Google Sheet 指南

這是一套**「本地秒開（0 延遲）＋ Google Sheet 自動雙向同步」**的自用記帳系統。

---

## 第一步：建立 Google Sheet 自動後端（2 分鐘）

1. 打開 [Google 試算表 (Google Sheets)](https://sheets.new) 新增一份空白試算表，命名為「**個人精簡記帳_Ledger**」。
2. 點選頂部選單：**「擴充功能 (Extensions)」→「Apps Script」**。
3. 打開本資料夾的 [`google_sheet_後端腳本_gas.js`](./google_sheet_後端腳本_gas.js)，將裡面的程式碼**全選複製**，貼上並覆蓋 Apps Script 編輯器裡原本的內容，按 `Ctrl + S` 儲存。
4. 點選右上角藍色按鈕 **「部署 (Deploy)」→「新增部署作業 (New deployment)」**：
   - 點選左側齒輪「選取類型」→ 勾選 **「網頁應用程式 (Web app)」**
   - **執行身分 (Execute as)**：選擇 **「我 (Me)」**
   - **誰可以存取 (Who has access)**：選擇 **「所有人 (Anyone)」** *(重要：這樣手機直接送請求才不會被 CORS 擋下)*
5. 點擊「部署」，完成授權（若跳出「Google 尚未驗證這個應用程式」，點選「進階」→「前往...(不安全)」→「允許」）。
6. 複製產生的 **「網頁應用程式網址 (Web app URL)」**（結尾為 `/exec`）。

---

## 第二步：開啟記帳 App 並綁定網址（1 分鐘）

1. 直接用電腦或手機開啟 [`index.html`](./index.html)。
   - **手機安裝成桌面 App 建議**：可將 `index.html` 丟到 GitHub Pages / Cloudflare Pages（免費靜態託管），用 iPhone Safari 或 Android Chrome 打開後，點選 **「分享 → 加入主畫面」**，就會變成全螢幕原生感 App。
2. 點擊底部導覽列最右側 **「🏦 資產與雲端」**。
3. 在「☁️ Google Sheet 雲端即時同步」欄位貼上剛剛複製的 `/exec` 網址，按 **「儲存網址並上傳至 Sheet」**。
4. 你的 Google Sheet 會自動長出三張分頁：
   - `收支流水_Transactions`（所有日常支出與收入）
   - `週期訂閱_Recurring`（Netflix、房租、保險等每月/每季/每年自動扣款）
   - `資產紀錄_Assets`（現金、活存、ETF、負債等總淨值快照）
5. 之後在「⚡ 秒記」每按一筆帳，手機端 **0 秒立即入帳**，背景自動同步寫入 Google Sheet！
