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

  saveLogSettings();
}

function aimRotator(info)
{
  const { callObj } = info

  if (
    g_pstrotatorSettings.enable == true &&
    g_pstrotatorSettings.port > 0 &&
    g_pstrotatorSettings.ip.length > 4 &&
    (callObj.distance > 0)
  )
  {
    // If we have a .grid, we have a .distance and .heading, so just send the heading
    let payload = `<PST><AZIMUTH>${Math.round(callObj.heading)}</AZIMUTH></PST>`;
    
    try
    {
      sendUdpMessage(
        payload,
        payload.length,
        parseInt(g_pstrotatorSettings.port),
        g_pstrotatorSettings.ip
      );
      if (callObj.DEcall)
      {
        addLastTraffic(`<font style='color:white'>Aiming rotator at ${callObj.DEcall}</font>`);
      }
      else
      {
        addLastTraffic(`<font style='color:white'>Aiming rotator to ${callObj.heading}&deg;</font>`);
      }
    }
    catch (e)
    {
      addLastTraffic("<font style='color:red'>UDP aimRotator failed</font>");
    }
  }
}
