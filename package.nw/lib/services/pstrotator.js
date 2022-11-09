validSettings.push("pstrotatorSettings")

var def_pstrotatorSettings = {
  enable: false,
  port: 12000,
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

function aimRotator({callObj})
  console.log("Aim Rotator", callObj)

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
      console.log("UDP Payload", payload)
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
