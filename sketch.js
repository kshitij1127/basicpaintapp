var canvas;
var database;
var drawing = [];
var currentPath = [];
var isDrawing = false;

function setup() {
  canvas = createCanvas(3000,500);

  canvas.mousePressed(startPath);
  canvas.mouseReleased(endPath);
  canvas.parent("canvascontainer");
  var saveButton = select("#saveButton");
  saveButton.mousePressed(saveDrawing);

  var clearButton = select("#clearButton");
  clearButton.mousePressed(clearDrawing);

  database = firebase.database();
  var ref = database.ref("drawings");
  ref.on("value", gotData, errData);

  var params = getURLParams();
  console.log(params);
  if (params.id) {
    console.log(params.id)
    showDrawing(params.id);
  }
}

function startPath() {
  isDrawing = true;
  currentPath = [];
  drawing.push(currentPath);
}

function endPath() {
  isDrawing = false;
}

function draw() {
  background(0);

  if (isDrawing) {
    var point = {
      x: mouseX,
      y: mouseY,
    };
    currentPath.push(point);
  }

  stroke(255);
  strokeWeight(4);
  noFill();
  for (var i = 0; i < drawing.length; i++) {
    var path = drawing[i];
    beginShape();
    for (var j = 0; j < path.length; j++) {
      vertex(path[j].x, path[j].y);
    }
    endShape();
  }
}

function saveDrawing() {
  var ref = database.ref("drawings");
  var data = {
    name: "Kshitij",
    drawing: drawing,
  };
  var result = ref.push(data, dataSent);
  console.log(result.key);

  function dataSent(status) {
    console.log(status);
  }
}

function gotData(data) {
  //clear the listing
  var elts = selectAll(".listing");
  for (var i = 0; i < elts.length; i++) {
    elts[i].remove();
  }

  var drawings = data.val();
  var keys = Object.keys(drawings);
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var li = createElement("li", "");
    li.class("listing");
    var ahref = createA("#", key);
    ahref.mousePressed(showDrawing);
    ahref.parent(li);

    var perma = createA("?id=" + key, "permalink");
    perma.parent(li);
    perma.style("padding", "20px");

    li.parent("drawinglist");
  }
}

function errData(err) {
  console.log(err);
}

function showDrawing(key) {
  console.log(arguments)
  if (!key) {
    key = this.html();
  }
  var ref = database.ref("drawings/" + key);
  ref.once("value", oneDrawing, errData);

  function oneDrawing(data) {
    var dbdrawing = data.val();
    drawing = dbdrawing.drawing;
  }
}

function clearDrawing() {
  drawing = [];
}
