function renderNormalRosterHeaders(columns)
{
  let html = "<table id='callTable' class='rosterTable' align=left><thead>"
  html = html + columns.map(column => renderHeaderForColumn(column)).join("\n")
  html = html + "</thead><tbody>"

  return html
}

function renderNormalRosterRow(columns, callObj)
{
  callObj.grid4 = callObj.grid4 || (callObj.grid && callObj.grid.length > 1) ? callObj.grid.substr(0, 4) : "-";
  callObj.hash = callObj.hash || `${callObj.DEcall}${callObj.band}${callObj.mode}`;

  let html = `<tr id='${callObj.hash}'>`;

  html = html + columns.map(column => renderEntryForColumn(column, callObj)).join("\n")

  html += "</tr>";

  return html;
}

function renderNormalRosterFooter()
{
  return "</tbody></table>";
}
