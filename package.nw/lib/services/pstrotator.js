validSettings.push("pstrotatorSettings")

var def_pstrotatorSettings = {
  enable: false,
  port: 12040,
  ip: "127.0.0.1"
};

var g_pstrotatorSettings = {};

function pstrotatorServiceChanged()
{
  g_pstrotatorSettings.enable = pstrotatorCheckBox.checked;
  g_pstrotatorSettings.ip = pstrotatorIpInput.value;
  g_pstrotatorSettings.port = pstrotatorPortInput.value;

  localStorage.pstrotatorSettings = JSON.stringify(g_pstrotatorSettings);
}
