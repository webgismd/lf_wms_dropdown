/*
   Demo of Dropdown sort added of a DataBC WMS Layer service
   by mdouville March 2021
*/

var MAX_ZOOM_LEVEL = 16;
var layerControl;
var layers;
var wmsbase = "https://openmaps.gov.bc.ca/geo/pub/wms";

var startExploreApp = function() {
    layers = {};
    
    // define map and starting location
    var map = L.map("map").setView([55, -123.3], 5);

    
    // defined Base layers 
    L.esri.tiledMapLayer({
    //url: "http://services.arcgisonline.com/ArcGIS/rest/services/USA_Topo_Maps/MapServer",
    url: "https://services.arcgisonline.com/arcgis/rest/services/World_Shaded_Relief/MapServer",
    maxZoom: 15
    }).addTo(map);

    layerControl = L.control.layers().addTo(map);
    // Resize the main and map div
    var mapFit = function() {
       $("#main").css("height", $(window).height() + "px");
       $("#map").css("height",$(window).height()-300 + "px");
       map.invalidateSize(false);
    };

    $(document).ready(mapFit);
    $(window).resize(mapFit);

    // Layer selection dialog
    $("#dialog-layers").dialog({
        autoOpen: false,
        height: 300,
        width: 350,
        modal: true
    });

    $("#layer-selection").button().click(function() {
        $("#dialog-layers").dialog("open");
    });

    // Duplicate layer warning message
    function showDuplicateMsg() {
        $("#warning-duplicate").dialog("open");
    };

    $(document).ready(function() {
        $("#warning-duplicate").dialog({
            autoOpen: false,
            height: 300,
            width: 350,
            modal: true
        });
    });

    // No Layer to remove warnning message
    function showRemoveMsg() {
        $("#warning-no-layer").dialog("open");
    };

    $(document).ready(function() {
        $("#warning-no-layer").dialog({
            autoOpen: false,
            height: 300,
            width: 350,
            modal: true
        });
    });


    // Get layers names from geoserver
  
    var geoSel = document.getElementById("geoserver-list");
    
    function sortSelect(selElem) {
        var tmpAry = new Array();
        for (var i=0;i<selElem.options.length;i++) {
            tmpAry[i] = new Array();
            tmpAry[i][0] = selElem.options[i].text;
            tmpAry[i][1] = selElem.options[i].value;
        }
        tmpAry.sort();
        while (selElem.options.length > 0) {
            selElem.options[0] = null;
        }
        for (var i=0;i<tmpAry.length;i++) {
            var op = new Option(tmpAry[i][0], tmpAry[i][1]);
            selElem.options[i] = op;
        }
        return;
    }
 
    // Get Geoserver info with GetCapabilities
    $.ajax({
        type: "GET",
        url: wmsbase+"?SERVICE=WMS&REQUEST=GetCapabilities&TILED=true&VERSION=1.1.1",
        dataType: "xml",
        success: function(xmlDoc) {
          
            
                var layerNames = $(xmlDoc).find("Layer > Layer > Name");
                var layerTitles = $(xmlDoc).find("Layer > Layer > Title");
                for (var i = 0; i < layerNames.length; i++) {
                    var layerName = layerNames[i].textContent;
                    var layerTitle = layerTitles[i].textContent;
                    var opt = document.createElement("option");
                    opt.innerHTML = layerTitle;
                    opt.value = layerName;
                    geoSel.appendChild(opt);
                }
                sortSelect(geoSel);
        }
    });

     // Add layers form geoserver list
     $(document).ready(function() {
         $("#addGeoLayer").click(function() {
            var e = document.getElementById("geoserver-list");
            var selectedLayer = e.options[e.selectedIndex].value;
            // Check for duplicae layes
            if ( selectedLayer in layers ) {
                showDuplicateMsg();
            }
            else {
                var geoLayer = new L.TileLayer.WMS(wmsbase, {
                    layers : selectedLayer,
                    format: "image/png",
                    transparent: true
                });
                layerControl.addOverlay(geoLayer, selectedLayer);
                
                map.addLayer(geoLayer);
                // Keep track of layers that have been added
                layers[selectedLayer] =  geoLayer;
                layerControl = L.control.layers(layers,  { collapsed: false }).addTo(map);
            }
         });
     });

    // Remove layers from Geoserver
    $(document).ready(function() {
        $("#removeGeoLayer").click(function() {
            var e = document.getElementById("geoserver-list");
            var selectedLayer = e.options[e.selectedIndex].value;
             // Check in the layer is in the map port
             if (selectedLayer in layers) {
                 layerControl.removeLayer(layers[selectedLayer]);
                 map.removeLayer(layers[selectedLayer]);
                 delete layers[selectedLayer];
             }
             else {
                 showRemoveMsg();
             }
        });
    });
};

$(document).ready(startExploreApp);
