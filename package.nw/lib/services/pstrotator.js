/**
 * PSTRotator is a third party application (windows-only) that interfaces with dozens of antenna rotators.
 * It offers a way for other apps to request rotation to a specific azimuth, or a grid square.
 *
 * Other rotator control apps, like [CatRotator](https://www.pianetaradio.it/blog/catrotator/) also support this API.
 *
 * The most comprehensive API details are in this Groups.io post:
 *   https://groups.io/g/PstRotator/message/5825
 *
 */

validSettings.push("pstrotatorSettings")

var def_pstrotatorSettings = {
  enable: false,
  port: 12000,
  ip: "127.0.0.1"
};

var g_pstrotatorSettings = {};

function pstrotatorServiceChanged()
{
  if (g_pstrotatorSettings.enabled != pstrotatorCheckBox.checked)
  {
    // This setting toggles the presence of a contextual menu item in the roster,
    // which is constructed only during roster initialization.
    //
    // So when this setting is changed, we need to reload the entire roster window.
    //
    g_pstrotatorSettings.enable = pstrotatorCheckBox.checked;
    if (g_rosterInitialized)
    {
      try
      {
        g_callRosterWindowHandle.window.location.reload();
      }
      catch (e)
      {
        console.error(e);
      }
    }
  }

  g_pstrotatorSettings.ip = pstrotatorIpInput.value;
  g_pstrotatorSettings.port = pstrotatorPortInput.value;

  localStorage.pstrotatorSettings = JSON.stringify(g_pstrotatorSettings);
}

function aimRotator(info) {
  const { callObj } = info

  if (
    g_pstrotatorSettings.enable == true &&
    g_pstrotatorSettings.port > 0 &&
    g_pstrotatorSettings.ip.length > 4 &&
    (callObj.azimuth || callObj.grid)
  )
  {
    let payload = "<PST>"
    if (callObj.azimuth)
    {
      payload += `<AZIMUTH>${callObj.azimuth}</AZIMUTH>`
    }
    else
    {
      payload += `<QRA>${callObj.grid}</QRA>`
    }

    payload += "</PST>"

    try
    {
      sendUdpMessage(
        payload,
        payload.length,
        parseInt(g_pstrotatorSettings.port),
        g_pstrotatorSettings.ip
      );
      addLastTraffic(`<font style='color:white'>Aiming rotator towards ${data.DEcall}</font>`);
    }
    catch (e)
    {
      addLastTraffic("<font style='color:red'>Exception HRD Log</font>");
    }
  }
}
