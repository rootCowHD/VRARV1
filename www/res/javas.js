/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

var g_db;
var showStatus = "main";

var storage = window.localStorage;


var app = {
    // Vuforia license
    vuforiaLicense: "AagZBDX/////AAAAGU6J3Zq0nkVem1dwIwjjASd90kLbi2boYVr1vLfMGXt2jOAzEAjYTHLMRb+vQJ7wtmyP1QKJO84U6DJRuUFbdhR0vAIk854OCMU9g1IM3FW/PwJOGZ+8r0F1fLLf8T1uOx2ZVGbm8OISnWJv+UqgOx0SfVWax7SGzZ8H2c01ZBT6tW67iT/+ns6ZsWNpYRA2XSrIOAS/+DkhW+gT4+MJSx4FgYjS4Ss1z7ZHbgXCkbBPjL/7uLVx2lDLZc6MVhb1Wnl2Lsh3nEPWyTDK1Qz0mHPnKFOmSuUnnzXxeGzm1ZYBYoptdE28tc2Qiw10TC5QopGLXiHjjYTgljQf3aAvQWy/A82KucDRzRa8G5BHmxYB",
    // Are we launching Vuforia with simple options?
    simpleOptions: null,
    // Which images have we matched?
    matchedImages: [],
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // "load", "deviceready", "offline", and "online".
    bindEvents: function() {
        document.addEventListener("deviceready", this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of "this" is the event. In order to call the "receivedEvent"
    // function, we must explicitly call "app.receivedEvent(...);"
    onDeviceReady: function() {
        app.receivedEvent("deviceready");
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        // Start Vuforia using simple options
        document.getElementById("startScan").onclick = function () {
            app.startVuforia(true);
        };
    },
    // Start the Vuforia plugin
    startVuforia: function(simpleOptions, successCallback, overlayMessage, targets){
        var options;

        if(typeof overlayMessage == "undefined")
            overlayMessage = "Bitte richte deine Kamera auf ein Raumschild";

        if(typeof targets == "undefined")
            targets = [ "HS_1", "HS_2", "HS_3", "HS_4" ];

        // Reset the matched images
        app.matchedImages = [];

        // Set the global simpleOptions flag
        app.simpleOptions = simpleOptions;

        // Log out wether or not we are using simpleOptions
        console.log("Simple options: "+!!app.simpleOptions);

        // Load either simple, or full options
        if(!!app.simpleOptions){
            options = {
                databaseXmlFile: "www/targets/HRW.xml",
                targetList: targets,
                overlayMessage: overlayMessage,
                vuforiaLicense: app.vuforiaLicense
            };
        } else {
            options = {
                databaseXmlFile: "www/targets/HRW.xml",
                targetList: targets,
                vuforiaLicense: app.vuforiaLicense,
                overlayMessage: overlayMessage,
                showDevicesIcon: true,
                showAndroidCloseButton: true,
                autostopOnImageFound: false
            };
        }

        // Start Vuforia with our options
        navigator.VuforiaPlugin.startVuforia(
            options,
            successCallback || app.vuforiaMatch,
            function(data) {
                alert("Error: " + data);
            }
        );
    },
    vuforiaMatch: function(data) {
        // Have we found an image?

        if(data.status.imageFound) {
            // If we are using simple options, alert the image name
            if(app.simpleOptions) {
                loadInfo(data.result.imageName);
                //Toene beim Scannen abspielen
                //app.playSound(); // Play a sound so that the user has some feedback
            //    navigator.vibrate(500);
            }
        }/**/
        console.log(data);
    },
    // Stop the Vuforia plugin
    stopVuforia: function(){
        navigator.VuforiaPlugin.stopVuforia(function (data) {
            console.log(data);

            if (data.success == "true") {
                alert("TOO SLOW! You took too long to find an image.");
            } else {
                alert("Couldn\"t stop Vuforia\n"+data.message);
            }
        }, function (data) {
            console.log("Error stopping Vuforia:\n"+data);
        });
    },
    // Play a bell sound
    playSound: function(resumeTrackers) {
        // Where are we playing the sound from?
        var soundURL = app.getMediaURL("sounds/sound.wav");

        // Setup the media object
        var media = new Media(soundURL, function(){
            console.log("Sound Played");

            navigator.VuforiaPlugin.startVuforiaTrackers(
                function() {
                    console.log("Started tracking again")
                },
                function() {
                    console.log("Could not start tracking again")
                }
            );
        }, app.mediaError);
        // Play the sound
        media.play();
    },
    // Get the correct media URL for both Android and iOS
    getMediaURL: function(s) {
        if(device.platform.toLowerCase() === "android") return "/android_asset/www/" + s;
        return s;
    },
    // Handle a media error
    mediaError: function(e) {
        alert("Media Error");
        alert(JSON.stringify(e));
    }
};

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

  //Abfrage nach aenderungen seit letztem Datum
  var lastTime = storage.getItem("lastDate");
  //Abfrage
  /*if (!lastTime instanceof Date){
    firstLoadDB();
  }/**/
  firstLoadDB();
  //todo: update der Datenbank von Server



  //Speichern der letzten Abfrage als letztes Datum
  storage.setItem("lastDate", Date.now());
  //laden der lokalen Datenbank
  g_db = JSON.parse(localStorage.getItem("db"));
});

function loadInfo(e){
    loadHTML(e);
    $("#showRoom").css("visibility","visible");
}

app.initialize();


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
