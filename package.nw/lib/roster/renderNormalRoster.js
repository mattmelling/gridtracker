function renderNormalRosterHeaders(columns)
{
  let html = "<table id='callTable' class='rosterTable' align=left onmouseenter='rosterInFocus()' onmouseleave='rosterNoFocus()' ><thead>";
  html = html + columns.map(column => renderHeaderForColumn(column)).join("");
  html = html + "</thead><tbody>";

  return html;
}

function renderNormalRosterRow(columns, callObj)
{
  let html = `<tr id='${callObj.hash}' >`;
  html = html + columns.map(column => renderEntryForColumn(column, callObj)).join("");
  html += "</tr>";

  return html;
}

function renderNormalRosterFooter()
{
  return "</tbody></table>";
}
