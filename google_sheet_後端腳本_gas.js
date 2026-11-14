/**
 * 精簡記帳 Pocket Ledger v2 — Google Sheets 後端同步腳本 (GAS)
 * 支援：收支流水（含扣款帳戶）、帳戶與信用卡餘額、自訂常用品項、週期訂閱
 */

const SHEETS_CONFIG = {
  transactions: {
    name: '收支流水_Transactions',
    headers: ['id', 'date', 'type', 'category', 'amount', 'accountId', 'toAccountId', 'note', 'source', 'updatedAt']
  },
  accounts: {
    name: '帳戶與信用卡_Accounts',
    headers: ['id', 'name', 'kind', 'balance', 'updatedAt']
  },
  presets: {
    name: '常用品項_Presets',
    headers: ['id', 'name', 'type', 'category', 'amount', 'accountId']
  },
  recurring: {
    name: '週期訂閱_Recurring',
    headers: ['id', 'name', 'type', 'category', 'amount', 'accountId', 'cycle', 'BillingDay', 'startDate', 'active', 'lastGeneratedMonth', 'updatedAt']
  }
};

const SPREADSHEET_ID = '1Gfq3xIJ76_dw0y3kjDRAqt4tLj3fgicvbRNO8QIWSFE';

function ensureSheets() {
  const ss = SPREADSHEET_ID
    ? SpreadsheetApp.openById(SPREADSHEET_ID)
    : SpreadsheetApp.getActiveSpreadsheet();
  const result = {};
  Object.keys(SHEETS_CONFIG).forEach(key => {
    const cfg = SHEETS_CONFIG[key];
    let sheet = ss.getSheetByName(cfg.name);
    if (!sheet) {
      sheet = ss.insertSheet(cfg.name);
      sheet.appendRow(cfg.headers);
      sheet.getRange(1, 1, 1, cfg.headers.length).setFontWeight('bold').setBackground('#f3f4f6');
      sheet.setFrozenRows(1);
    }
    result[key] = sheet;
  });
  return result;
}

function sheetToObjects(sheet, headers) {
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return [];
  const data = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
  return data
    .filter(row => row[0] !== '' && row[0] !== null)
    .map(row => {
      const obj = {};
      headers.forEach((h, i) => {
        let val = row[i];
        if (val instanceof Date) {
          val = Utilities.formatDate(val, Session.getScriptTimeZone(), 'yyyy-MM-dd');
        }
        obj[h] = val;
      });
      return obj;
    });
}

function overwriteSheetWithObjects(sheet, headers, items) {
  sheet.clearContents();
  const rows = [headers];
  items.forEach(item => {
    rows.push(headers.map(h => (item[h] !== undefined && item[h] !== null) ? item[h] : ''));
  });
  sheet.getRange(1, 1, rows.length, headers.length).setValues(rows);
}

function doGet(e) {
  try {
    const sheets = ensureSheets();
    const payload = {
      ok: true,
      syncedAt: new Date().toISOString(),
      transactions: sheetToObjects(sheets.transactions, SHEETS_CONFIG.transactions.headers),
      accounts: sheetToObjects(sheets.accounts, SHEETS_CONFIG.accounts.headers),
      presets: sheetToObjects(sheets.presets, SHEETS_CONFIG.presets.headers),
      recurring: sheetToObjects(sheets.recurring, SHEETS_CONFIG.recurring.headers)
    };
    return ContentService
      .createTextOutput(JSON.stringify(payload))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents || '{}');
    const sheets = ensureSheets();

    if (Array.isArray(body.transactions)) {
      overwriteSheetWithObjects(sheets.transactions, SHEETS_CONFIG.transactions.headers, body.transactions);
    }
    if (Array.isArray(body.accounts)) {
      overwriteSheetWithObjects(sheets.accounts, SHEETS_CONFIG.accounts.headers, body.accounts);
    }
    if (Array.isArray(body.presets)) {
      overwriteSheetWithObjects(sheets.presets, SHEETS_CONFIG.presets.headers, body.presets);
    }
    if (Array.isArray(body.recurring)) {
      overwriteSheetWithObjects(sheets.recurring, SHEETS_CONFIG.recurring.headers, body.recurring);
    }

    return ContentService
      .createTextOutput(JSON.stringify({
        ok: true,
        syncedAt: new Date().toISOString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
