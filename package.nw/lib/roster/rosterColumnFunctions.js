function rosterColumnList(settings = {}, overrides = {})
{
  return g_rosterSettings.columnOrder.filter(column =>
  {
    return column && (settings[column] || overrides[column]) && !(overrides[column] === false)
  })
}

function renderHeaderForColumn(column)
{
  const columnInfo = ROSTER_COLUMNS[column]

  let attrs = (columnInfo && columnInfo.tableHeader && columnInfo.tableHeader()) || {}

  attrs.html = attrs.html || column

  if (columnInfo.compare)
  {
    attrs.style = "cursor: pointer"
    attrs.onClick = `setRosterSorting('${column}');`
  }

  return renderRosterTableHTML("th", attrs)
}

function renderEntryForColumn(column, entry)
{
  const columnInfo = ROSTER_COLUMNS[column]

  let attrs = (columnInfo && columnInfo.tableData && columnInfo.tableData(entry)) || {}

  return renderRosterTableHTML("td", attrs)
}

function renderRosterTableHTML(tag, attrs)
{
  let innerHtml = attrs.html || ""
  delete attrs.html

  let rawAttrs = attrs.rawAttrs || ""
  delete attrs.rawAttrs

  let attrEntries = Object.entries(attrs).filter(kv => !!kv[1])

  return `<${tag} ${rawAttrs} ${attrEntries.map((kv) => `${kv[0]}="${kv[1].replace(/"/g, "&quot;")}"`).join(" ")}>${innerHtml}</${tag}>`
}

function setRosterSorting(column)
{
  if (g_rosterSettings.sortColumn === column)
  {
    g_rosterSettings.sortReverse = !g_rosterSettings.sortReverse
  }
  else
  {
    g_rosterSettings.sortColumn = column
    g_rosterSettings.sortReverse = false
  }

  writeRosterSettings();

  window.opener.goProcessRoster();
}

function sortCallList(callList, sortColumn, sortReverse)
{
  const columnInfo = ROSTER_COLUMNS[sortColumn]

  callList.sort((columnInfo && columnInfo.compare) || ROSTER_COLUMNS.Age.compare)

  if (sortReverse)
  {
    callList.reverse()
  }
}

function validateRosterColumnOrder(columns)
{
  let correctedColumnOrder = (columns || DEFAULT_COLUMN_ORDER || []).slice();

  DEFAULT_COLUMN_ORDER.forEach(column =>
  {
    if (!correctedColumnOrder.includes(column)) correctedColumnOrder.push(column);
  })
  correctedColumnOrder = correctedColumnOrder.filter(column => !!ROSTER_COLUMNS[column])

  return correctedColumnOrder;
}

function changeRosterColumnOrder(columns)
{
  g_rosterSettings.columnOrder = validateRosterColumnOrder(columns);
  writeRosterSettings();
  window.opener.goProcessRoster();
}
