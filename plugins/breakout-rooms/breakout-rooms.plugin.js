(function () {

  let state$ = PEX.pluginAPI.createNewState({});

  const breakRoomRegEx = new RegExp("^breakout-room-\\d-(.*)");

  function load(participants$) {
    participants$.subscribe( (participants) => {
      let state = {};
      participants.forEach( (participant) => {
        let label = 'Move to breakout room';
        const conference = window.PEX.pexrtc.conference_name;
        if (breakRoomRegEx.test(conference)) {
          label = 'Return to main room';
        }
        state = Object.assign(state, {
          [participant.uuid]: {
            label: label
          }
        });

      });
      if (state) {
        state$.next(state);
      }
    });
  }

  function breakoutRoom(participant) {
    const conference = window.PEX.pexrtc.conference_name;
    if (breakRoomRegEx.test(conference)) {
      const mainRoom = conference.match(breakRoomRegEx)[1];
      const data = { "conference_alias": mainRoom };
      PEX.pluginAPI.sendRequest("participants/" + participant.uuid + "/transfer", data);
    } else {
      showBreakRoomsDialog(participant);        
    }
  }

  function showBreakRoomsDialog(participant) {
    const breakoutRoomsNumber = 10;
    PEX.pluginAPI.openTemplateDialog({
      title: 'Select breakout room',
      body: `<div id="layout-info" style="flex-wrap: wrap; justify-content: center;">
              <!-- actors_overlay_text can be set to auto or off on each of the layouts.-->
              <div style="margin: 10px;">
              <span>Select the breakout room to transfer the user to:</span><br><br>
              <select id="breakroom-select">` +
              [...Array(breakoutRoomsNumber).keys()].map( (index) => `<option value="breakout-room-${index + 1}">Breakout room ${index + 1}</option> ` ) +
              `</select><br><br>
              <button id="submit-plugin-breakout-rooms" class="dialog-button blue-action-button" style="border-radius: 10px; min-width: 0px;"> Move participant</button><br>
            </div>`
    })
    .then( (dialog) => {
      const submitButton = document.getElementById('submit-plugin-breakout-rooms');
      submitButton.onclick = () => {
        const select = document.getElementById('breakroom-select');
        const data = {
          conference_alias: select.value + '-' + window.PEX.pexrtc.conference_name,
          role: 'chair'
        }
        window.PEX.pluginAPI.sendRequest("participants/" + participant.uuid + "/transfer", data);
        dialog.close();
      };
    });
  }

  function unload() {
    console.log('Breakout rooms plugin', 'Unloaded');
  }

  PEX.pluginAPI.registerPlugin({
    id: 'breakout-rooms-plugin-1.0',
    load: load,
    unload: unload,
    breakoutRoom: breakoutRoom,
    state$: state$
  });

})();