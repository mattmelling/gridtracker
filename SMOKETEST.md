Before any release, test the following scenarios on each platform at a minimum.

| test scenario | description | test steps |
| ------ | ------ | ------ |
| load adif data | test adif log file loading using the adif load button and local file dialog | 1. load adif file using adif button with known results (i.e. confirmed grids) <br/> 2. load adif file using local log file button with known results (i.e. confirmed grids) |
| CR | test Call Roster with all modes on an active band | 1. verify filters are working as expected: new DXCC/State/County/... <br/> 2. verify all traffic vs. only wanted works <br/> 3. verify award tracker yields expected results <br/> 4. verify alerts being triggered |
| audio alerts | test audio alerts being triggered | 1. check if alerts are still present and correctly working from the last release <br/> 2. add new alert using synthesized speech and verify successful trigger <br/> 3. add new mp3 alert and verify successful trigger |
| psk reporter spots | test psk reporter spots being shown | 1. check if psk spots show after transmitting <br/> 2. verify heatmap is shown |
| award layer | test award layers being shown | 1. cycle through all award layers and verify all confirmed entities show up |
| lookups | test callsign lookups | 1. test qrz lookup <br/> 2. test callook 3. test other callbook |
