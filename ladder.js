//Ompad, notepad for Omlet Chat
//Sony Theakanath

//Global Variables
var players = [];

//Player Class
function Player(name, score) {
   this.name = name;
   this.intScore = score;
}

document.onload = function() {
  updateTable();
}

function documentApiUpdatePlayers() {
   var textPlayer = JSON.stringify(players);
   documentApi.update(myDocId,UpdatePlayers, {"players" : textPlayer} , ReceiveUpdate, DidNotReceiveUpdate);
}

function deletePlayer() {
  deleteplayertext = $('#delete_player_box').val();
  var found = false
  for(x = 0; x < players.length; x++) {
      if(players[x].name == deleteplayertext) {
             players.splice(x, 1);
             found = true;
      }
  }
  if(found) {
    updateTable();
    $('#delete_user').modal('hide');
    documentApiUpdatePlayers();
  } else {
     $('#delete_user').modal('hide');
     alert("No matching player found!");
  }
  $('#delete_player_box').val('');

}

function addPlayer() {
   newplayertext = $('#new_player_box').val();
   var a = new Player(newplayertext, 300);
   players.push(a);
   players.sort(function(a,b) {return (a.intScore < b.intScore) ? 1 : ((b.intScore < a.intScore) ? -1 : 0);});
   console.log(players);
   updateTable();
   $('#new_player_box').val('');
   $('#add_user').modal('hide');
   clickedadd = true;
   documentApiUpdatePlayers();
}

function recordGame() {
   if($("#player1_formcontrol :selected").text() == $("#player2_formcontrol :selected").text()) {
     $('#add_game').modal('hide');
     alert("Players cannot be the same!");
   } else {
       var p1;
       var p2;
       for(x = 0; x < players.length; x++) {
          if(players[x].name == $("#player1_formcontrol :selected").text()) {
             p1 = players[x];
             players.splice(x, 1);
          }
          if(players[x].name == $("#player2_formcontrol :selected").text()) {
             p2 = players[x];
             players.splice(x, 1);
          }
       }
       calculateScore(p1, p2);
   }
}

function calculateScore(winner, loser) {
    var tempP1Score;
    var tempP2Score;
    var expectedresult;
    var upsetresult;

    //Matching point system to work with USATT Ranking System
    difference = Math.abs(winner.intScore-loser.intScore);
    if(difference >= 0 && difference <= 12) {
       expectedresult = 8;
       upsetresult = 8;
    } else if(difference >= 13 && difference <= 37) {
       expectedresult = 7;
       upsetresult = 10;
    } else if(difference >= 38 && difference <= 62) {
       expectedresult = 6;
       upsetresult = 13;
    } else if(difference >= 63 && difference <= 87) {
       expectedresult = 5;
       upsetresult = 16;
    } else if(difference >= 88 && difference <= 112) {
       expectedresult = 4;
       upsetresult = 20;
    } else if(difference >= 113 && difference <= 137) {
       expectedresult = 3;
       upsetresult = 25;
    } else if(difference >= 138 && difference <= 162) {
       expectedresult = 2;
       upsetresult = 30;
    } else if(difference >= 163 && difference <= 187) {
       expectedresult = 2;
       upsetresult = 35;
    } else if(difference >= 188 && difference <= 212) {
       expectedresult = 1;
       upsetresult = 40;
    } else if(difference >= 213 && difference <= 237) {
       expectedresult = 1;
       upsetresult = 45;
    } else {
       expectedresult = 0;
       upsetresult = 50;
    }

    tempP1Score = winner.intScore + expectedresult;
    tempP2Score = loser.intScore - upsetresult;
    winner.intScore = tempP1Score;
    loser.intScore = tempP2Score;
    players.push(winner);
    players.push(loser);

    //Clean up
    players.sort(function(a,b) {return (a.intScore < b.intScore) ? 1 : ((b.intScore < a.intScore) ? -1 : 0);});
    console.log(players);
    updateTable();
    documentApiUpdatePlayers();
    $('#add_game').modal('hide');
}

//Shares document to Omlet once pressed
function shareToOmlet() {
      if(Omlet.isInstalled()) {
          documentApiUpdatePlayers();
          var rdl = Omlet.createRDL({
                  noun: "ladder",
                  displayTitle: "OmPong Ladder",
                  displayThumbnailUrl: "https://mobi-summer-sony.s3.amazonaws.com/appimages/pingpong.png",
                  displayText: "See the current Ping Pong Ladder!",  
                  webCallback: "https://mobi-summer-sony.s3.amazonaws.com/ladder.html",
                  callback: (window.location.href),
          });
          Omlet.exit(rdl);
      }
}

/**
  Shared Document API. None of the methods have been edited other than ReceiveUpdate
*/

Omlet.ready(function(){
  initDocument();
});

function updateTable() {
    if(players.length > 3) {
       $("#share_to_omlet").hide()
    }
    $("#ranking_table > tbody").html("");
    $('#player1_formcontrol option').remove();
    $('#player2_formcontrol option').remove();
    for(x = 0; x < players.length; x++) {
      $('#ranking_table > tbody:last').append('<tr><td>' + (x+1) + '</td><td>' + players[x].name + '</td><td>' + (players[x].intScore).toFixed(2) +'</td></tr>');
      $("#player1_formcontrol").append('<option>' + players[x].name +'</option>');
      $("#player2_formcontrol").append('<option>' + players[x].name +'</option>');
    }
}

function ReceiveUpdate(doc) {
  myDoc = doc;
  for(key in myDoc) {
    console.log(key);
  }
  players = JSON.parse(myDoc["players"]);
  console.log("players: " + myDoc["players"]);
  updateTable();
}

function Initialize(old, params) {
  return params;
}

function UpdatePlayers(old, params) {
  old.players = params["players"];
  return old;
  console.log("Updating!");
}


function InitialDocument() {
  var initValues = {
    'players' : "",
  };
  return initValues;
}

function DocumentCreated(doc) {
    console.log("Document has been created.");
}

function DidNotReceiveUpdate(doc) {
  console.log("I did not receive an update");
}

/**
  Omlet Framework Code. Ignore everything below.
*/

var documentApi;
var myDoc;
var myDocId;

function watchDocument(docref, OnUpdate) {
    documentApi.watch(docref, function(updatedDocRef) {
        if (docref != myDocId) {
            console.log("Wrong document!!");
        } else {
            documentApi.get(docref, OnUpdate);
        }}, function(result) {
            var timestamp = result.Expires;
            var expires = timestamp - new Date().getTime();
            var timeout = 0.8 * expires;
            setTimeout(function() {
                watchDocument(docref, OnUpdate);
        }, timeout);
    }, Error);
}

function initDocument() {
    if (Omlet.isInstalled()) {
        documentApi = Omlet.document;
        _loadDocument();
    }
}

function hasDocument() {
    var docIdParam = window.location.hash.indexOf("/docId/");
    return (docIdParam != -1);
}

function getDocumentReference() {
    var docIdParam = window.location.hash.indexOf("/docId/");
    if (docIdParam == -1) return false;
    var docId = window.location.hash.substring(docIdParam+7);
    var end = docId.indexOf("/");
    if (end != -1) {
        docId = docId.substring(0, end);
    }
    return docId;
}

function _loadDocument() {
    if (hasDocument()) {
        myDocId = getDocumentReference();
        documentApi.get(myDocId, ReceiveUpdate);
        watchDocument(myDocId, ReceiveUpdate);
    } else {
        documentApi.create(function(d) {
            myDocId = d.Document;
            location.hash = "#/docId/" + myDocId;
            documentApi.update(myDocId, Initialize, InitialDocument(),
            function() {
                documentApi.get(myDocId, DocumentCreated);
            }, function(e) {
                alert("error: " + JSON.stringify(e));
            });
            watchDocument(myDocId, ReceiveUpdate);
          }, function(e) {
            alert("error: " + JSON.stringify(e));
        });
    }
}