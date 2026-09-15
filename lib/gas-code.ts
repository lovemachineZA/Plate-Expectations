export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * ==============================================================================
 * PLATE EXPECTATIONS - MEAL PLANNER & RECIPE HUB (Google Apps Script)
 * ==============================================================================
 * Deployment Instructions:
 * 1. Open your Google Sheet (or create a new blank one).
 * 2. Click Extensions > Apps Script.
 * 3. Replace all code in Code.gs with this script.
 * 4. Click Deploy > New deployment.
 * 5. Select type "Web app".
 * 6. Set Description: "Plate Expectations API".
 * 7. Set "Execute as": "Me".
 * 8. Set "Who has access": "Anyone" (allows seamless client-side fetch from the PWA).
 * 9. Click Deploy and copy the Web App URL into Plate Expectations Settings.
 * ==============================================================================
 */

const SHEET_RECIPES = 'Recipes';
const SHEET_PANTRY = 'Pantry';
const SHEET_MEALPLAN = 'MealPlan';
const SHEET_GROCERY = 'GroceryList';
const SHEET_TAGS = 'Tags';

/**
 * Handle GET requests: Return all 5 tables as JSON
 */
function doGet(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    ensureTablesExist(ss);

    const recipes = getTableData(ss.getSheetByName(SHEET_RECIPES));
    const pantry = getTableData(ss.getSheetByName(SHEET_PANTRY));
    const mealPlan = getTableData(ss.getSheetByName(SHEET_MEALPLAN));
    const groceryList = getTableData(ss.getSheetByName(SHEET_GROCERY));
    const tagsData = getTableData(ss.getSheetByName(SHEET_TAGS));

    const tags = tagsData.map(function(t) {
      return t.Tag || t.tag || t.Name || t.name;
    }).filter(Boolean);

    const response = {
      status: 'success',
      timestamp: new Date().toISOString(),
      data: {
        recipes: recipes,
        pantry: pantry,
        mealPlan: mealPlan,
        groceryList: groceryList,
        tags: tags
      }
    };

    return ContentService.createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handle POST requests: Synchronize changes using LockService for concurrency
 */
function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    // Wait up to 10 seconds for concurrent write locks
    const success = lock.tryLock(10000);
    if (!success) {
      return ContentService.createTextOutput(JSON.stringify({
        status: 'error',
        message: 'Could not obtain lock, concurrent write in progress. Please retry.'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    const contents = e.postData ? JSON.parse(e.postData.contents) : {};
    const action = contents.action || 'SYNC_ALL';
    const payload = contents.payload || {};
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    ensureTablesExist(ss);

    if (action === 'SYNC_ALL') {
      if (payload.recipes) saveTableData(ss.getSheetByName(SHEET_RECIPES), payload.recipes);
      if (payload.pantry) saveTableData(ss.getSheetByName(SHEET_PANTRY), payload.pantry);
      if (payload.mealPlan) saveTableData(ss.getSheetByName(SHEET_MEALPLAN), payload.mealPlan);
      if (payload.groceryList) saveTableData(ss.getSheetByName(SHEET_GROCERY), payload.groceryList);
      if (payload.tags) saveTagsList(ss.getSheetByName(SHEET_TAGS), payload.tags);
    } else if (action === 'UPDATE_RECIPE') {
      updateSingleRow(ss.getSheetByName(SHEET_RECIPES), payload.recipe, 'ID');
    } else if (action === 'UPDATE_PANTRY') {
      updateSingleRow(ss.getSheetByName(SHEET_PANTRY), payload.pantryItem, 'ID');
    } else if (action === 'UPDATE_MEALPLAN') {
      updateSingleRow(ss.getSheetByName(SHEET_MEALPLAN), payload.mealPlanDay, 'DayOfWeek');
    } else if (action === 'SAVE_TAGS' || action === 'UPDATE_TAGS') {
      saveTagsList(ss.getSheetByName(SHEET_TAGS), payload.tags || []);
    } else if (action === 'ADD_TAG') {
      addSingleTag(ss.getSheetByName(SHEET_TAGS), payload.tag);
    }

    const response = {
      status: 'success',
      action: action,
      serverTime: new Date().toISOString()
    };

    return ContentService.createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

/**
 * Read sheet rows into array of objects using header keys
 */
function getTableData(sheet) {
  if (!sheet) return [];
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  const headers = data[0];
  const rows = [];
  for (let i = 1; i < data.length; i++) {
    const rowObj = {};
    for (let j = 0; j < headers.length; j++) {
      rowObj[headers[j]] = data[i][j];
    }
    rows.push(rowObj);
  }
  return rows;
}

/**
 * Overwrite table sheet with current list of objects
 */
function saveTableData(sheet, items) {
  if (!sheet || !items || !items.length) return;
  const headers = Object.keys(items[0]);
  sheet.clearContents();
  sheet.appendRow(headers);
  const rows = items.map(function(item) {
    return headers.map(function(h) {
      let val = item[h];
      if (Array.isArray(val)) return val.join(', ');
      return val !== undefined && val !== null ? val : '';
    });
  });
  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
  }
}

function saveTagsList(sheet, tags) {
  if (!sheet) return;
  sheet.clearContents();
  sheet.appendRow(['Tag', 'UpdatedDate']);
  const dateStr = Utilities.formatDate(new Date(), 'GMT', 'yyyy-MM-dd HH:mm');
  const rows = tags.map(function(tag) {
    return [tag, dateStr];
  });
  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, 2).setValues(rows);
  }
}

function addSingleTag(sheet, tag) {
  if (!sheet || !tag) return;
  const existing = getTableData(sheet).map(function(r) { return r.Tag; });
  if (existing.indexOf(tag) === -1) {
    const dateStr = Utilities.formatDate(new Date(), 'GMT', 'yyyy-MM-dd HH:mm');
    sheet.appendRow([tag, dateStr]);
  }
}

/**
 * Upsert a single item by key column
 */
function updateSingleRow(sheet, item, keyName) {
  if (!sheet) return;
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return;
  const headers = data[0];
  const keyIndex = headers.indexOf(keyName);
  if (keyIndex === -1) return;

  const keyValue = item[keyName];
  let foundRow = -1;

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][keyIndex]) === String(keyValue)) {
      foundRow = i + 1;
      break;
    }
  }

  const rowValues = headers.map(function(h) {
    let val = item[h];
    if (Array.isArray(val)) return val.join(', ');
    return val !== undefined && val !== null ? val : '';
  });

  if (foundRow !== -1) {
    sheet.getRange(foundRow, 1, 1, headers.length).setValues([rowValues]);
  } else {
    sheet.appendRow(rowValues);
  }
}

/**
 * Initialize all 5 required tabs if missing
 */
function ensureTablesExist(ss) {
  const required = [
    {
      name: SHEET_RECIPES,
      headers: ['ID', 'Name', 'Ingredients', 'Instructions', 'CookTimeMins', 'Rating_Aatish', 'Rating_Faeeza', 'Tags', 'Notes', 'ImageURL', 'LastCookedDate', 'CreatedBy', 'LastEditedBy', 'LastEditedTimestamp', 'Calories', 'Servings']
    },
    {
      name: SHEET_PANTRY,
      headers: ['ID', 'ItemName', 'Category', 'InStock', 'UseFirst', 'AddedDate', 'Expiry']
    },
    {
      name: SHEET_MEALPLAN,
      headers: ['DayOfWeek', 'DayName', 'Date', 'BreakfastRecipeID', 'BreakfastRecipeName', 'BreakfastAssignedTo', 'LunchRecipeID', 'LunchRecipeName', 'LunchAssignedTo', 'RecipeID', 'RecipeName', 'AssignedTo', 'IsLeftoverOrOut', 'LeftoverType', 'IsLocked', 'Notes']
    },
    {
      name: SHEET_GROCERY,
      headers: ['ItemName', 'Quantity', 'Category', 'Store', 'Checked', 'SourceRecipes']
    },
    {
      name: SHEET_TAGS,
      headers: ['Tag', 'UpdatedDate']
    }
  ];

  required.forEach(function(def) {
    let sheet = ss.getSheetByName(def.name);
    if (!sheet) {
      sheet = ss.insertSheet(def.name);
      sheet.appendRow(def.headers);
      sheet.getRange(1, 1, 1, def.headers.length).setFontWeight('bold').setBackground('#E5E4DE');
    }
  });
}
`;
