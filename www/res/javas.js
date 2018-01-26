/** HRW Roomchecker
  * von Natalie Roth und Stefan Werntges
  * als Projekt im Modul VR / AR
  */

//Speicherort für die Datenbank als JSON Liste
//Für den Prototypen ist diese hart verdrahtet
var storage = window.localStorage;

// Funktionen der eigentlichen App
var app = {
  /**
  Einige der Funktionen sind durch das Plugin vorgegeben
  Bei der Lizens habdelt es sich um eine Entwickler Lizens ohne Rechte auf großflächige Verbreitung
  simpleOptions ermöglichen einen Schnellzugriff auf den Scanner.
  matchedImages listet auf, welche Marker nacheinander erkannt wurden.
  */
    vuforiaLicense: "AagZBDX/////AAAAGU6J3Zq0nkVem1dwIwjjASd90kLbi2boYVr1vLfMGXt2jOAzEAjYTHLMRb+vQJ7wtmyP1QKJO84U6DJRuUFbdhR0vAIk854OCMU9g1IM3FW/PwJOGZ+8r0F1fLLf8T1uOx2ZVGbm8OISnWJv+UqgOx0SfVWax7SGzZ8H2c01ZBT6tW67iT/+ns6ZsWNpYRA2XSrIOAS/+DkhW+gT4+MJSx4FgYjS4Ss1z7ZHbgXCkbBPjL/7uLVx2lDLZc6MVhb1Wnl2Lsh3nEPWyTDK1Qz0mHPnKFOmSuUnnzXxeGzm1ZYBYoptdE28tc2Qiw10TC5QopGLXiHjjYTgljQf3aAvQWy/A82KucDRzRa8G5BHmxYB",
    simpleOptions: null,
    matchedImages: [],

    //Konstruktor
    initialize: function() {
        this.bindEvents();
    },

    //Auflisten von benötigten Event Listener
    bindEvents: function() {
        document.addEventListener("deviceready", this.onDeviceReady, false);
    },

    //Spezielle Funktion um der App mitzuteilen, dass die Ansicht geladen ist.
    //Ab diesem Event wird die App startbereit gemacht
    onDeviceReady: function() {
        app.receivedEvent("deviceready");
    },

    //Die Kernfunktion für erhaltenen Events.
    //Da nur ein Event verwendet wird, ist dies einfach gehalten
    receivedEvent: function(id) {
      if(id == "deviceready") // Wenn die Ansicht geladen wurde
        // Binde eine onClick Funktion an das startScan Element
        document.getElementById("startScan").onclick = function () {
            app.startVuforia(true); //Startet Vuforia mit einfachen optionen (true)
        };
      }
    },
    //Startfunktion des Vuforia Plugins
    startVuforia: function(simpleOptions, successCallback, overlayMessage, targets){
        var options;

        //Einstellung von nicht definiertem overlay Text
        if(typeof overlayMessage == "undefined")
            overlayMessage = "Bitte richte deine Kamera auf ein Raumschild";

        //Definition der Ziele sofern keine speziellen Ziele angegeben wurden
        if(typeof targets == "undefined")
            targets = [ "HS_1", "HS_2", "HS_3", "HS_4" ];

        app.matchedImages = []; //löschen der Liste bereits gefundener Marker
        app.simpleOptions = simpleOptions; //setzt die simpleOptions Flag

        //Lade entsprechende Optionen
        if(!!app.simpleOptions){
            options = {
                databaseXmlFile: "www/targets/HRW.xml", //Datei der Marker
                targetList: targets,                    //Liste der Ziele
                overlayMessage: overlayMessage,         //Nachricht bei der Kamera
                vuforiaLicense: app.vuforiaLicense      //Die verwendete Lizens
            };
        } else {
            options = {
                databaseXmlFile: "www/targets/HRW.xml",
                targetList: targets,
                vuforiaLicense: app.vuforiaLicense,
                overlayMessage: overlayMessage,
                showDevicesIcon: true,                //Zeigt Vuforia Icons
                showAndroidCloseButton: true,         //Zeigt Android onScreen Button
                autostopOnImageFound: false           //Stoppt die Suche wenn ein Marker gefunden wurde
            };
        }

        //Eigentlicher Start der Vuforia Software mit den angegebenen Optionen
        navigator.VuforiaPlugin.startVuforia(
            options,
            successCallback || app.vuforiaMatch,  //Wenn ein Marker gefunden wurde, wird vuforiaMatch aufgerufen
            function(data) {
                alert("Error: " + data);
            }
        );
    },

    //Funktion bei gefunden Marker
    vuforiaMatch: function(data) {
        //Wenn ein Bild gefunden wurde
        if(data.status.imageFound) {
            //Wenn simpleOptions gewählt wurden
            if(app.simpleOptions) {
                loadInfo(data.result.imageName); //Funktion die bei gescannten Markern deren Namen verarbeitet
            }
        }
    },

    //Vuforia anhalten
    stopVuforia: function(){
        //Beende das Plugin und Werte die Daten aus
        navigator.VuforiaPlugin.stopVuforia(function (data) {
            //Aufruf beim Timeout
            if (data.success == "true") {
                alert("TOO SLOW! You took too long to find an image.");
            //Aufruf bei Fehlern
            } else {
                alert("Couldn\"t stop Vuforia\n"+data.message);
            }
        }, function (data) {
            console.log("Error stopping Vuforia:\n"+data);
        });
    },
};

//Starte die initialisierung der Vuforia App
app.initialize();



//Funktion beim fertig laden der Ansicht
//Es werden lediglich Events zum Sichtbar / Unsichtbar machen der Informationen gebunden
$(document).ready(function(){
  $("#closeShowroom").on("touch click",function(){
    $("#showRoom").css("visibility","hidden");
    $("#roomDates").toggleClass("invis");
    $("#roomInfo").toggleClass("invis");
  });
  $("#roomInfoButton").on("touch click",function(){
    $("#roomInfo").toggleClass("invis");
  });
  $("#roomCloseInfo").on("touch click",function(){
    $("#roomInfo").toggleClass("invis");
  });
  $("#roomCloseDates").on("touch click",function(){
    $("#roomDates").toggleClass("invis");
  });
  $("#roomDatesButton").on("touch click",function(){
      $("#roomDates").toggleClass("invis");
  });

  //Abfrage nach Änderungen seit letztem aufruf
  var lastTime = storage.getItem("lastDate");
  //Abfrage ob es ein lastDate gibt
  /*if (!lastTime instanceof Date){
    firstLoadDB();
  }/**/

  //lokale Datenbank laden, im eigentlichen Programm wird dies nur beim ersten Start (kein lastDate) ausgeführt
  firstLoadDB();

  //An dieser Stelle würde vom Server ein update gezogen werden
  //Diese würde in den lokalen Speicher gelegt werden

  //Speichern der letzten Abfrage als letztes Datum
  storage.setItem("lastDate", Date.now());

  //Parsen der lokalen Datenbank in eine auslesbare Variable
  g_db = JSON.parse(localStorage.getItem("db"));
});

//Macht den Infobereich Sichtbar
function loadInfo(e){
    loadHTML(e);
    $("#showRoom").css("visibility","visible");
}

//Lädt Info für Info aus der Datenbank
function loadHTML(k){

  $("#Montag").html("<div class='full'>Montag</div>");
  $("#Dienstag").html("<div class='full'>Dienstag</div>");
  $("#Mittwoch").html("<div class='full'>Mittwoch</div>");
  $("#Donnerstag").html("<div class='full'>Donnerstag</div>");
  $("#Freitag").html("<div class='full'>Freitag</div>");
  var count = 0;
  for (var i = 0; i < g_db.belegung.length; i++) {
    if(g_db.belegung[i].HS_Nr == k){
      count++;/**/
      if(g_db.belegung[i].Wochentag == "Montag"){
        $("#Montag").append("<div class='half'>"+g_db.belegung[i].Startzeit+"</div>");
        $("#Montag").append("<div class='half'>"+g_db.belegung[i].Endezeit+"</div>");
      }
      else if(g_db.belegung[i].Wochentag == "Dienstag"){
        $("#Dienstag").append("<div class='half'>"+g_db.belegung[i].Startzeit+"</div>");
        $("#Dienstag").append("<div class='half'>"+g_db.belegung[i].Endezeit+"</div>");
      }
      else if(g_db.belegung[i].Wochentag == "Mittwoch"){
        $("#Mittwoch").append("<div class='half'>"+g_db.belegung[i].Startzeit+"</div>");
        $("#Mittwoch").append("<div class='half'>"+g_db.belegung[i].Endezeit+"</div>");
      }
      else if(g_db.belegung[i].Wochentag == "Donnerstag"){
        $("#Donnerstag").append("<div class='half'>"+g_db.belegung[i].Startzeit+"</div>");
        $("#Donnerstag").append("<div class='half'>"+g_db.belegung[i].Endezeit+"</div>");
      }
      else if(g_db.belegung[i].Wochentag == "Freitag"){
        $("#Freitag").append("<div class='half'>"+g_db.belegung[i].Startzeit+"</div>");
        $("#Freitag").append("<div class='half'>"+g_db.belegung[i].Endezeit+"</div>");
      }/**/
    }
  }
  for (var i = 0; i < g_db.raeume.length; i++){
    if(g_db.raeume[i].HS_Nr == k){
      $("#roomType").html(g_db.raeume[i].Typ);
      $("#roomSeats").html(g_db.raeume[i].Sitzplaetze);
      if(g_db.raeume[i].Beamer == 1){
        $("#roomProjector").html("Beamer vorhanden");
      }
      if(g_db.raeume[i].Tafel == 1){
        $("#roomChalkBoard").html("Tafel vorhanden");
      }
      if(g_db.raeume[i].Whiteboard == 1){
        $("#roomWhiteBoard").html("Whiteboard vorhanden");
      }
    }
  }

  $("#roomHead").html(k);
  $("#roomDatesButton").html(count+" vergebene Termine");
}

//Die Datenbank ist hart verdrahtet, um unabhaengig von einem Server zu sein.
//Diese Datenbank wuerde entsprechend durch einen Server geupdated werden.
//Durch das lokale vorhalten, wird eine permanente Internetverbindung nicht voraus gesetzt.
function firstLoadDB(){
  var tmp = {
  "raeume": [
    {
      "HS_Nr": "HS_1",
      "Typ": "Hoersaal",
      "{{3}}": null,
      "{{4}}')": null,
      "Sitzplaetze": "40",
      "PC_Hoersaal": "0",
      "Beamer": "1",
      "Tafel": "1",
      "Whiteboard": "0"
    },
    {
      "HS_Nr": "HS_2",
      "Typ": "Hoersaal",
      "{{3}}": null,
      "{{4}}')": null,
      "Sitzplaetze": "90",
      "PC_Hoersaal": "0",
      "Beamer": "1",
      "Tafel": "1",
      "Whiteboard": "0"
    },
    {
      "HS_Nr": "HS_3",
      "Typ": "Hoersaal",
      "{{3}}": null,
      "{{4}}')": null,
      "Sitzplaetze": "90",
      "PC_Hoersaal": "0",
      "Beamer": "1",
      "Tafel": "1",
      "Whiteboard": "0"
    },
    {
      "HS_Nr": "HS_4",
      "Typ": "Hoersaal",
      "{{3}}": null,
      "{{4}}')": null,
      "Sitzplaetze": "90",
      "PC_Hoersaal": "0",
      "Beamer": "1",
      "Tafel": "1",
      "Whiteboard": "0"
    }
  ],
  "belegung": [
    {
      "Belegung_ID": "1",
      "HS_Nr": "HS_3",
      "Wochentag": "Montag",
      "{{14}}": null,
      "{{15}}": null,
      "{{16}}": null,
      "{{17}}')": null,
      "Startzeit": "00:00:00",
      "Endezeit": "07:59:00"
    },
    {
      "Belegung_ID": "2",
      "HS_Nr": "HS_3",
      "Wochentag": "Montag",
      "{{14}}": null,
      "{{15}}": null,
      "{{16}}": null,
      "{{17}}')": null,
      "Startzeit": "18:00:00",
      "Endezeit": "23:59:00"
    },
    {
      "Belegung_ID": "3",
      "HS_Nr": "HS_1",
      "Wochentag": "Montag",
      "{{14}}": null,
      "{{15}}": null,
      "{{16}}": null,
      "{{17}}')": null,
      "Startzeit": "00:00:00",
      "Endezeit": "07:59:00"
    },
    {
      "Belegung_ID": "4",
      "HS_Nr": "HS_2",
      "Wochentag": "Montag",
      "{{14}}": null,
      "{{15}}": null,
      "{{16}}": null,
      "{{17}}')": null,
      "Startzeit": "00:00:00",
      "Endezeit": "07:59:00"
    },
    {
      "Belegung_ID": "5",
      "HS_Nr": "HS_4",
      "Wochentag": "Montag",
      "{{14}}": null,
      "{{15}}": null,
      "{{16}}": null,
      "{{17}}')": null,
      "Startzeit": "00:00:00",
      "Endezeit": "07:59:00"
    },
    {
      "Belegung_ID": "6",
      "HS_Nr": "HS_1",
      "Wochentag": "Montag",
      "{{14}}": null,
      "{{15}}": null,
      "{{16}}": null,
      "{{17}}')": null,
      "Startzeit": "18:00:00",
      "Endezeit": "23:59:00"
    },
    {
      "Belegung_ID": "7",
      "HS_Nr": "HS_2",
      "Wochentag": "Montag",
      "{{14}}": null,
      "{{15}}": null,
      "{{16}}": null,
      "{{17}}')": null,
      "Startzeit": "18:00:00",
      "Endezeit": "23:59:00"
    },
    {
      "Belegung_ID": "8",
      "HS_Nr": "HS_4",
      "Wochentag": "Montag",
      "{{14}}": null,
      "{{15}}": null,
      "{{16}}": null,
      "{{17}}')": null,
      "Startzeit": "18:00:00",
      "Endezeit": "23:59:00"
    },
    {
      "Belegung_ID": "9",
      "HS_Nr": "HS_1",
      "Wochentag": "Montag",
      "{{14}}": null,
      "{{15}}": null,
      "{{16}}": null,
      "{{17}}')": null,
      "Startzeit": "08:00:00",
      "Endezeit": "10:30:00"
    },
    {
      "Belegung_ID": "10",
      "HS_Nr": "HS_1",
      "Wochentag": "Montag",
      "{{14}}": null,
      "{{15}}": null,
      "{{16}}": null,
      "{{17}}')": null,
      "Startzeit": "08:00:00",
      "Endezeit": "10:30:00"
    },
    {
      "Belegung_ID": "11",
      "HS_Nr": "HS_1",
      "Wochentag": "Montag",
      "{{14}}": null,
      "{{15}}": null,
      "{{16}}": null,
      "{{17}}')": null,
      "Startzeit": "10:35:00",
      "Endezeit": "12:15:00"
    },
    {
      "Belegung_ID": "12",
      "HS_Nr": "HS_1",
      "Wochentag": "Dienstag",
      "{{14}}": null,
      "{{15}}": null,
      "{{16}}": null,
      "{{17}}')": null,
      "Startzeit": "09:35:00",
      "Endezeit": "11:20:00"
    },
    {
      "Belegung_ID": "13",
      "HS_Nr": "HS_1",
      "Wochentag": "Dienstag",
      "{{14}}": null,
      "{{15}}": null,
      "{{16}}": null,
      "{{17}}')": null,
      "Startzeit": "13:15:00",
      "Endezeit": "15:45:00"
    },
    {
      "Belegung_ID": "14",
      "HS_Nr": "HS_1",
      "Wochentag": "Mittwoch",
      "{{14}}": null,
      "{{15}}": null,
      "{{16}}": null,
      "{{17}}')": null,
      "Startzeit": "10:35:00",
      "Endezeit": "12:15:00"
    },
    {
      "Belegung_ID": "15",
      "HS_Nr": "HS_1",
      "Wochentag": "Mittwoch",
      "{{14}}": null,
      "{{15}}": null,
      "{{16}}": null,
      "{{17}}')": null,
      "Startzeit": "12:20:00",
      "Endezeit": "13:05:00"
    },
    {
      "Belegung_ID": "16",
      "HS_Nr": "HS_1",
      "Wochentag": "Montag",
      "{{14}}": null,
      "{{15}}": null,
      "{{16}}": null,
      "{{17}}')": null,
      "Startzeit": "10:35:00",
      "Endezeit": "12:15:00"
    },
    {
      "Belegung_ID": "17",
      "HS_Nr": "HS_1",
      "Wochentag": "Dienstag",
      "{{14}}": null,
      "{{15}}": null,
      "{{16}}": null,
      "{{17}}')": null,
      "Startzeit": "09:35:00",
      "Endezeit": "11:20:00"
    },
    {
      "Belegung_ID": "18",
      "HS_Nr": "HS_1",
      "Wochentag": "Dienstag",
      "{{14}}": null,
      "{{15}}": null,
      "{{16}}": null,
      "{{17}}')": null,
      "Startzeit": "13:15:00",
      "Endezeit": "15:45:00"
    },
    {
      "Belegung_ID": "19",
      "HS_Nr": "HS_1",
      "Wochentag": "Mittwoch",
      "{{14}}": null,
      "{{15}}": null,
      "{{16}}": null,
      "{{17}}')": null,
      "Startzeit": "10:35:00",
      "Endezeit": "12:15:00"
    },
    {
      "Belegung_ID": "20",
      "HS_Nr": "HS_1",
      "Wochentag": "Mittwoch",
      "{{14}}": null,
      "{{15}}": null,
      "{{16}}": null,
      "{{17}}')": null,
      "Startzeit": "12:20:00",
      "Endezeit": "13:05:00"
    },
    {
      "Belegung_ID": "21",
      "HS_Nr": "HS_1",
      "Wochentag": "Mittwoch",
      "{{14}}": null,
      "{{15}}": null,
      "{{16}}": null,
      "{{17}}')": null,
      "Startzeit": "14:05:00",
      "Endezeit": "16:35:00"
    },
    {
      "Belegung_ID": "22",
      "HS_Nr": "HS_1",
      "Wochentag": "Donnerstag",
      "{{14}}": null,
      "{{15}}": null,
      "{{16}}": null,
      "{{17}}')": null,
      "Startzeit": "08:00:00",
      "Endezeit": "10:30:00"
    },
    {
      "Belegung_ID": "23",
      "HS_Nr": "HS_1",
      "Wochentag": "Donnerstag",
      "{{14}}": null,
      "{{15}}": null,
      "{{16}}": null,
      "{{17}}')": null,
      "Startzeit": "14:05:00",
      "Endezeit": "14:50:00"
    },
    {
      "Belegung_ID": "24",
      "HS_Nr": "HS_1",
      "Wochentag": "Freitag",
      "{{14}}": null,
      "{{15}}": null,
      "{{16}}": null,
      "{{17}}')": null,
      "Startzeit": "12:15:00",
      "Endezeit": "13:05:00"
    },
    {
      "Belegung_ID": "25",
      "HS_Nr": "HS_1",
      "Wochentag": "Freitag",
      "{{14}}": null,
      "{{15}}": null,
      "{{16}}": null,
      "{{17}}')": null,
      "Startzeit": "14:05:00",
      "Endezeit": "18:20:00"
    },
    {
      "Belegung_ID": "26",
      "HS_Nr": "HS_1",
      "Wochentag": "Dienstag",
      "{{14}}": null,
      "{{15}}": null,
      "{{16}}": null,
      "{{17}}')": null,
      "Startzeit": "00:00:00",
      "Endezeit": "07:59:00"
    },
    {
      "Belegung_ID": "27",
      "HS_Nr": "HS_1",
      "Wochentag": "Dienstag",
      "{{14}}": null,
      "{{15}}": null,
      "{{16}}": null,
      "{{17}}')": null,
      "Startzeit": "18:00:00",
      "Endezeit": "23:59:00"
    },
    {
      "Belegung_ID": "28",
      "HS_Nr": "HS_1",
      "Wochentag": "Mittwoch",
      "{{14}}": null,
      "{{15}}": null,
      "{{16}}": null,
      "{{17}}')": null,
      "Startzeit": "00:00:00",
      "Endezeit": "07:59:00"
    },
    {
      "Belegung_ID": "29",
      "HS_Nr": "HS_1",
      "Wochentag": "Mittwoch",
      "{{14}}": null,
      "{{15}}": null,
      "{{16}}": null,
      "{{17}}')": null,
      "Startzeit": "18:00:00",
      "Endezeit": "23:59:00"
    },
    {
      "Belegung_ID": "30",
      "HS_Nr": "HS_1",
      "Wochentag": "Donnerstag",
      "{{14}}": null,
      "{{15}}": null,
      "{{16}}": null,
      "{{17}}')": null,
      "Startzeit": "00:00:00",
      "Endezeit": "07:59:00"
    },
    {
      "Belegung_ID": "31",
      "HS_Nr": "HS_1",
      "Wochentag": "Donnerstag",
      "{{14}}": null,
      "{{15}}": null,
      "{{16}}": null,
      "{{17}}')": null,
      "Startzeit": "18:00:00",
      "Endezeit": "23:59:00"
    },
    {
      "Belegung_ID": "32",
      "HS_Nr": "HS_1",
      "Wochentag": "Freitag",
      "{{14}}": null,
      "{{15}}": null,
      "{{16}}": null,
      "{{17}}')": null,
      "Startzeit": "00:00:00",
      "Endezeit": "07:59:00"
    },
    {
      "Belegung_ID": "33",
      "HS_Nr": "HS_1",
      "Wochentag": "Freitag",
      "{{14}}": null,
      "{{15}}": null,
      "{{16}}": null,
      "{{17}}')": null,
      "Startzeit": "18:00:00",
      "Endezeit": "23:59:00"
    },
    {
      "Belegung_ID": "34",
      "HS_Nr": "HS_2",
      "Wochentag": "Montag",
      "{{14}}": null,
      "{{15}}": null,
      "{{16}}": null,
      "{{17}}')": null,
      "Startzeit": "00:00:00",
      "Endezeit": "07:59:00"
    },
    {
      "Belegung_ID": "35",
      "HS_Nr": "HS_2",
      "Wochentag": "Montag",
      "{{14}}": null,
      "{{15}}": null,
      "{{16}}": null,
      "{{17}}')": null,
      "Startzeit": "08:50:00",
      "Endezeit": "11:20:00"
    },
    {
      "Belegung_ID": "36",
      "HS_Nr": "HS_2",
      "Wochentag": "Montag",
      "{{14}}": null,
      "{{15}}": null,
      "{{16}}": null,
      "{{17}}')": null,
      "Startzeit": "11:30:00",
      "Endezeit": "12:15:00"
    },
    {
      "Belegung_ID": "37",
      "HS_Nr": "HS_2",
      "Wochentag": "Montag",
      "{{14}}": null,
      "{{15}}": null,
      "{{16}}": null,
      "{{17}}')": null,
      "Startzeit": "14:05:00",
      "Endezeit": "15:45:00"
    },
    {
      "Belegung_ID": "38",
      "HS_Nr": "HS_2",
      "Wochentag": "Montag",
      "{{14}}": null,
      "{{15}}": null,
      "{{16}}": null,
      "{{17}}')": null,
      "Startzeit": "18:00:00",
      "Endezeit": "23:59:00"
    },
    {
      "Belegung_ID": "39",
      "HS_Nr": "HS_2",
      "Wochentag": "Dienstag",
      "{{14}}": null,
      "{{15}}": null,
      "{{16}}": null,
      "{{17}}')": null,
      "Startzeit": "00:00:00",
      "Endezeit": "07:59:00"
    },
    {
      "Belegung_ID": "40",
      "HS_Nr": "HS_2",
      "Wochentag": "Dienstag",
      "{{14}}": null,
      "{{15}}": null,
      "{{16}}": null,
      "{{17}}')": null,
      "Startzeit": "09:45:00",
      "Endezeit": "10:30:00"
    },
    {
      "Belegung_ID": "41",
      "HS_Nr": "HS_2",
      "Wochentag": "Dienstag",
      "{{14}}": null,
      "{{15}}": null,
      "{{16}}": null,
      "{{17}}')": null,
      "Startzeit": "11:30:00",
      "Endezeit": "13:05:00"
    },
    {
      "Belegung_ID": "42",
      "HS_Nr": "HS_2",
      "Wochentag": "Dienstag",
      "{{14}}": null,
      "{{15}}": null,
      "{{16}}": null,
      "{{17}}')": null,
      "Startzeit": "13:15:00",
      "Endezeit": "14:50:00"
    },
    {
      "Belegung_ID": "43",
      "HS_Nr": "HS_2",
      "Wochentag": "Dienstag",
      "{{14}}": null,
      "{{15}}": null,
      "{{16}}": null,
      "{{17}}')": null,
      "Startzeit": "18:00:00",
      "Endezeit": "23:59:00"
    },
    {
      "Belegung_ID": "44",
      "HS_Nr": "HS_2",
      "Wochentag": "Mittwoch",
      "{{14}}": null,
      "{{15}}": null,
      "{{16}}": null,
      "{{17}}')": null,
      "Startzeit": "00:00:00",
      "Endezeit": "07:59:00"
    },
    {
      "Belegung_ID": "45",
      "HS_Nr": "HS_2",
      "Wochentag": "Mittwoch",
      "{{14}}": null,
      "{{15}}": null,
      "{{16}}": null,
      "{{17}}')": null,
      "Startzeit": "10:30:00",
      "Endezeit": "12:15:00"
    },
    {
      "Belegung_ID": "46",
      "HS_Nr": "HS_2",
      "Wochentag": "Mittwoch",
      "{{14}}": null,
      "{{15}}": null,
      "{{16}}": null,
      "{{17}}')": null,
      "Startzeit": "14:05:00",
      "Endezeit": "16:35:00"
    },
    {
      "Belegung_ID": "47",
      "HS_Nr": "HS_2",
      "Wochentag": "Mittwoch",
      "{{14}}": null,
      "{{15}}": null,
      "{{16}}": null,
      "{{17}}')": null,
      "Startzeit": "18:00:00",
      "Endezeit": "23:59:00"
    },
    {
      "Belegung_ID": "48",
      "HS_Nr": "HS_2",
      "Wochentag": "Donnerstag",
      "{{14}}": null,
      "{{15}}": null,
      "{{16}}": null,
      "{{17}}')": null,
      "Startzeit": "00:00:00",
      "Endezeit": "07:59:00"
    },
    {
      "Belegung_ID": "49",
      "HS_Nr": "HS_2",
      "Wochentag": "Donnerstag",
      "{{14}}": null,
      "{{15}}": null,
      "{{16}}": null,
      "{{17}}')": null,
      "Startzeit": "13:15:00",
      "Endezeit": "16:35:00"
    },
    {
      "Belegung_ID": "50",
      "HS_Nr": "HS_2",
      "Wochentag": "Donnerstag",
      "{{14}}": null,
      "{{15}}": null,
      "{{16}}": null,
      "{{17}}')": null,
      "Startzeit": "18:00:00",
      "Endezeit": "23:59:00"
    },
    {
      "Belegung_ID": "51",
      "HS_Nr": "HS_2",
      "Wochentag": "Freitag",
      "{{14}}": null,
      "{{15}}": null,
      "{{16}}": null,
      "{{17}}')": null,
      "Startzeit": "00:00:00",
      "Endezeit": "07:59:00"
    },
    {
      "Belegung_ID": "52",
      "HS_Nr": "HS_2",
      "Wochentag": "Freitag",
      "{{14}}": null,
      "{{15}}": null,
      "{{16}}": null,
      "{{17}}')": null,
      "Startzeit": "08:00:00",
      "Endezeit": "12:15:00"
    },
    {
      "Belegung_ID": "53",
      "HS_Nr": "HS_2",
      "Wochentag": "Freitag",
      "{{14}}": null,
      "{{15}}": null,
      "{{16}}": null,
      "{{17}}')": null,
      "Startzeit": "18:00:00",
      "Endezeit": "23:59:00"
    },
    {
      "Belegung_ID": "54",
      "HS_Nr": "HS_3",
      "Wochentag": "Montag",
      "{{14}}": null,
      "{{15}}": null,
      "{{16}}": null,
      "{{17}}')": null,
      "Startzeit": "00:00:00",
      "Endezeit": "07:59:00"
    },
    {
      "Belegung_ID": "55",
      "HS_Nr": "HS_3",
      "Wochentag": "Montag",
      "{{14}}": null,
      "{{15}}": null,
      "{{16}}": null,
      "{{17}}')": null,
      "Startzeit": "08:00:00",
      "Endezeit": "10:30:00"
    },
    {
      "Belegung_ID": "56",
      "HS_Nr": "HS_3",
      "Wochentag": "Montag",
      "{{14}}": null,
      "{{15}}": null,
      "{{16}}": null,
      "{{17}}')": null,
      "Startzeit": "12:20:00",
      "Endezeit": "14:05:00"
    },
    {
      "Belegung_ID": "57",
      "HS_Nr": "HS_3",
      "Wochentag": "Montag",
      "{{14}}": null,
      "{{15}}": null,
      "{{16}}": null,
      "{{17}}')": null,
      "Startzeit": "18:00:00",
      "Endezeit": "23:59:00"
    },
    {
      "Belegung_ID": "58",
      "HS_Nr": "HS_3",
      "Wochentag": "Dienstag",
      "{{14}}": null,
      "{{15}}": null,
      "{{16}}": null,
      "{{17}}')": null,
      "Startzeit": "00:00:00",
      "Endezeit": "07:59:00"
    },
    {
      "Belegung_ID": "59",
      "HS_Nr": "HS_3",
      "Wochentag": "Dienstag",
      "{{14}}": null,
      "{{15}}": null,
      "{{16}}": null,
      "{{17}}')": null,
      "Startzeit": "08:50:00",
      "Endezeit": "09:35:00"
    },
    {
      "Belegung_ID": "60",
      "HS_Nr": "HS_3",
      "Wochentag": "Dienstag",
      "{{14}}": null,
      "{{15}}": null,
      "{{16}}": null,
      "{{17}}')": null,
      "Startzeit": "09:45:00",
      "Endezeit": "13:05:00"
    },
    {
      "Belegung_ID": "61",
      "HS_Nr": "HS_3",
      "Wochentag": "Dienstag",
      "{{14}}": null,
      "{{15}}": null,
      "{{16}}": null,
      "{{17}}')": null,
      "Startzeit": "18:00:00",
      "Endezeit": "23:59:00"
    },
    {
      "Belegung_ID": "62",
      "HS_Nr": "HS_3",
      "Wochentag": "Mittwoch",
      "{{14}}": null,
      "{{15}}": null,
      "{{16}}": null,
      "{{17}}')": null,
      "Startzeit": "00:00:00",
      "Endezeit": "07:59:00"
    },
    {
      "Belegung_ID": "63",
      "HS_Nr": "HS_3",
      "Wochentag": "Mittwoch",
      "{{14}}": null,
      "{{15}}": null,
      "{{16}}": null,
      "{{17}}')": null,
      "Startzeit": "09:45:00",
      "Endezeit": "11:20:00"
    },
    {
      "Belegung_ID": "64",
      "HS_Nr": "HS_3",
      "Wochentag": "Mittwoch",
      "{{14}}": null,
      "{{15}}": null,
      "{{16}}": null,
      "{{17}}')": null,
      "Startzeit": "11:30:00",
      "Endezeit": "12:15:00"
    },
    {
      "Belegung_ID": "65",
      "HS_Nr": "HS_3",
      "Wochentag": "Mittwoch",
      "{{14}}": null,
      "{{15}}": null,
      "{{16}}": null,
      "{{17}}')": null,
      "Startzeit": "12:20:00",
      "Endezeit": "14:00:00"
    },
    {
      "Belegung_ID": "66",
      "HS_Nr": "HS_3",
      "Wochentag": "Mittwoch",
      "{{14}}": null,
      "{{15}}": null,
      "{{16}}": null,
      "{{17}}')": null,
      "Startzeit": "18:00:00",
      "Endezeit": "23:59:00"
    },
    {
      "Belegung_ID": "67",
      "HS_Nr": "HS_3",
      "Wochentag": "Donnerstag",
      "{{14}}": null,
      "{{15}}": null,
      "{{16}}": null,
      "{{17}}')": null,
      "Startzeit": "00:00:00",
      "Endezeit": "07:59:00"
    },
    {
      "Belegung_ID": "68",
      "HS_Nr": "HS_3",
      "Wochentag": "Donnerstag",
      "{{14}}": null,
      "{{15}}": null,
      "{{16}}": null,
      "{{17}}')": null,
      "Startzeit": "09:45:00",
      "Endezeit": "11:20:00"
    },
    {
      "Belegung_ID": "69",
      "HS_Nr": "HS_3",
      "Wochentag": "Donnerstag",
      "{{14}}": null,
      "{{15}}": null,
      "{{16}}": null,
      "{{17}}')": null,
      "Startzeit": "14:05:00",
      "Endezeit": "15:45:00"
    },
    {
      "Belegung_ID": "70",
      "HS_Nr": "HS_3",
      "Wochentag": "Donnerstag",
      "{{14}}": null,
      "{{15}}": null,
      "{{16}}": null,
      "{{17}}')": null,
      "Startzeit": "18:00:00",
      "Endezeit": "23:59:00"
    },
    {
      "Belegung_ID": "71",
      "HS_Nr": "HS_3",
      "Wochentag": "Freitag",
      "{{14}}": null,
      "{{15}}": null,
      "{{16}}": null,
      "{{17}}')": null,
      "Startzeit": "00:00:00",
      "Endezeit": "07:59:00"
    },
    {
      "Belegung_ID": "72",
      "HS_Nr": "HS_3",
      "Wochentag": "Freitag",
      "{{14}}": null,
      "{{15}}": null,
      "{{16}}": null,
      "{{17}}')": null,
      "Startzeit": "12:20:00",
      "Endezeit": "15:45:00"
    },
    {
      "Belegung_ID": "73",
      "HS_Nr": "HS_3",
      "Wochentag": "Freitag",
      "{{14}}": null,
      "{{15}}": null,
      "{{16}}": null,
      "{{17}}')": null,
      "Startzeit": "18:00:00",
      "Endezeit": "23:59:00"
    },
    {
      "Belegung_ID": "74",
      "HS_Nr": "HS_4",
      "Wochentag": "Montag",
      "{{14}}": null,
      "{{15}}": null,
      "{{16}}": null,
      "{{17}}')": null,
      "Startzeit": "00:00:00",
      "Endezeit": "07:59:00"
    },
    {
      "Belegung_ID": "75",
      "HS_Nr": "HS_4",
      "Wochentag": "Montag",
      "{{14}}": null,
      "{{15}}": null,
      "{{16}}": null,
      "{{17}}')": null,
      "Startzeit": "12:20:00",
      "Endezeit": "15:45:00"
    },
    {
      "Belegung_ID": "76",
      "HS_Nr": "HS_4",
      "Wochentag": "Montag",
      "{{14}}": null,
      "{{15}}": null,
      "{{16}}": null,
      "{{17}}')": null,
      "Startzeit": "15:50:00",
      "Endezeit": "16:35:00"
    },
    {
      "Belegung_ID": "77",
      "HS_Nr": "HS_4",
      "Wochentag": "Montag",
      "{{14}}": null,
      "{{15}}": null,
      "{{16}}": null,
      "{{17}}')": null,
      "Startzeit": "18:00:00",
      "Endezeit": "23:59:00"
    },
    {
      "Belegung_ID": "78",
      "HS_Nr": "HS_4",
      "Wochentag": "Dienstag",
      "{{14}}": null,
      "{{15}}": null,
      "{{16}}": null,
      "{{17}}')": null,
      "Startzeit": "00:00:00",
      "Endezeit": "07:59:00"
    },
    {
      "Belegung_ID": "79",
      "HS_Nr": "HS_4",
      "Wochentag": "Dienstag",
      "{{14}}": null,
      "{{15}}": null,
      "{{16}}": null,
      "{{17}}')": null,
      "Startzeit": "09:45:00",
      "Endezeit": "12:15:00"
    },
    {
      "Belegung_ID": "80",
      "HS_Nr": "HS_4",
      "Wochentag": "Dienstag",
      "{{14}}": null,
      "{{15}}": null,
      "{{16}}": null,
      "{{17}}')": null,
      "Startzeit": "12:20:00",
      "Endezeit": "14:00:00"
    },
    {
      "Belegung_ID": "81",
      "HS_Nr": "HS_4",
      "Wochentag": "Dienstag",
      "{{14}}": null,
      "{{15}}": null,
      "{{16}}": null,
      "{{17}}')": null,
      "Startzeit": "18:00:00",
      "Endezeit": "23:59:00"
    },
    {
      "Belegung_ID": "82",
      "HS_Nr": "HS_4",
      "Wochentag": "Mittwoch",
      "{{14}}": null,
      "{{15}}": null,
      "{{16}}": null,
      "{{17}}')": null,
      "Startzeit": "00:00:00",
      "Endezeit": "07:59:00"
    },
    {
      "Belegung_ID": "83",
      "HS_Nr": "HS_4",
      "Wochentag": "Mittwoch",
      "{{14}}": null,
      "{{15}}": null,
      "{{16}}": null,
      "{{17}}')": null,
      "Startzeit": "08:00:00",
      "Endezeit": "10:35:00"
    },
    {
      "Belegung_ID": "84",
      "HS_Nr": "HS_4",
      "Wochentag": "Mittwoch",
      "{{14}}": null,
      "{{15}}": null,
      "{{16}}": null,
      "{{17}}')": null,
      "Startzeit": "10:45:00",
      "Endezeit": "12:15:00"
    },
    {
      "Belegung_ID": "85",
      "HS_Nr": "HS_4",
      "Wochentag": "Mittwoch",
      "{{14}}": null,
      "{{15}}": null,
      "{{16}}": null,
      "{{17}}')": null,
      "Startzeit": "12:20:00",
      "Endezeit": "14:50:00"
    },
    {
      "Belegung_ID": "86",
      "HS_Nr": "HS_4",
      "Wochentag": "Mittwoch",
      "{{14}}": null,
      "{{15}}": null,
      "{{16}}": null,
      "{{17}}')": null,
      "Startzeit": "18:00:00",
      "Endezeit": "23:59:00"
    },
    {
      "Belegung_ID": "87",
      "HS_Nr": "HS_4",
      "Wochentag": "Donnerstag",
      "{{14}}": null,
      "{{15}}": null,
      "{{16}}": null,
      "{{17}}')": null,
      "Startzeit": "00:00:00",
      "Endezeit": "07:59:00"
    },
    {
      "Belegung_ID": "88",
      "HS_Nr": "HS_4",
      "Wochentag": "Donnerstag",
      "{{14}}": null,
      "{{15}}": null,
      "{{16}}": null,
      "{{17}}')": null,
      "Startzeit": "10:45:00",
      "Endezeit": "12:15:00"
    },
    {
      "Belegung_ID": "89",
      "HS_Nr": "HS_4",
      "Wochentag": "Donnerstag",
      "{{14}}": null,
      "{{15}}": null,
      "{{16}}": null,
      "{{17}}')": null,
      "Startzeit": "12:20:00",
      "Endezeit": "14:00:00"
    },
    {
      "Belegung_ID": "90",
      "HS_Nr": "HS_4",
      "Wochentag": "Donnerstag",
      "{{14}}": null,
      "{{15}}": null,
      "{{16}}": null,
      "{{17}}')": null,
      "Startzeit": "18:00:00",
      "Endezeit": "23:59:00"
    },
    {
      "Belegung_ID": "91",
      "HS_Nr": "HS_4",
      "Wochentag": "Freitag",
      "{{14}}": null,
      "{{15}}": null,
      "{{16}}": null,
      "{{17}}')": null,
      "Startzeit": "00:00:00",
      "Endezeit": "07:59:00"
    },
    {
      "Belegung_ID": "92",
      "HS_Nr": "HS_4",
      "Wochentag": "Freitag",
      "{{14}}": null,
      "{{15}}": null,
      "{{16}}": null,
      "{{17}}')": null,
      "Startzeit": "08:50:00",
      "Endezeit": "12:15:00"
    },
    {
      "Belegung_ID": "93",
      "HS_Nr": "HS_4",
      "Wochentag": "Freitag",
      "{{14}}": null,
      "{{15}}": null,
      "{{16}}": null,
      "{{17}}')": null,
      "Startzeit": "18:00:00",
      "Endezeit": "23:59:00"
    }
  ]
};
  localStorage.setItem("db", JSON.stringify(tmp));
}
