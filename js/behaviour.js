//INICIALIZAR EL TABLERO
var chess;

var historyTable;
var tablero;
var tableroDiv = [];
var dif_label;

var is_opening=true;
var curr_node = 48;
var playerTurn = true;
var playerSelected = [-1,-1];
var playerSelNot = '';
var movesCoords =[];
var playerColor = "w";
var movementCount = 1;


var isLocal = false;
var wTurn = true;
var diffyculty = 1;

var openbook_nodes;
var openbook_graph;

window.onload = function () {
  chess = new Chess();
  tablero = getTds();
  historyTable = document.getElementById("moveTable");
  dif_label = document.getElementById("dif_label");
  addOnClick();
  drawBoard();
  load_openning_book();
  //Intended for testing
  //play();
  is_opening=true;
  is_opening=true;
  curr_node = 48;

  var slider = document.getElementById("difficulty_s");
  difficulty = slider.value;
  dif_label.innerHTML = slider.value;
  slider.oninput = function() {
    difficulty = slider.value;
    dif_label.innerHTML = slider.value;
  }

}

//FUNCION PARA MOSTRAR U OCULTAR MÁS INFORMACIÓN
function toggle_info(){
  var element = document.getElementById("moreinfo-div");
  element.classList.toggle("hidden");
}

//FUNCIÓN PARA AÑADIR FUNCIONALIDAD ON onclick
function addOnClick(){
  for (var i = 0; i < tablero.length; i++) {
    let divs  = [];
    for (var j = 0; j < tablero[i].length; j++) {
      tablero[i][j].setAttribute('onclick', 'playerAction('+i+','+j+')');

      //remove current childs
      while (tablero[i][j].firstChild) {
        tablero[i][j].removeChild(tablero[i][j].firstChild);
      }
      tablero[i][j].appendChild(document.createElement("div"));
      divs.push(tablero[i][j].firstChild);
    }
    tableroDiv.push(divs);
  }
}

//FUNCIÓN EJECUTADA CUANDO EL JUGADOR DA CLICK EN EL TABLERO
function playerAction(y,x){
  if(playerTurn&&!chess.game_over()){
    //Check if there is already a piece selected and it is his turn
    var board = chess.board();
    var piece = board[y][x];

    if(playerSelected[0]==-1){
      if(piece!=null){
        if(piece.color==playerColor){
          //If the piece was eligible toggle effect and set it selected
          tablero[y][x].classList.toggle("selected");
          playerSelected=[y,x];
          playerSelNot = getNotation(y,x);

          //show posible moves
          var moves = chess.moves({square: getNotation(y,x), verbose: true });
          for (var i = 0; i < moves.length; i++) {
            let m_pos = getCoords(moves[i].to);
            movesCoords.push(m_pos);
            tableroDiv[m_pos.y][m_pos.x].appendChild(document.createElement("div"));
          }
        }
      }
    }
    else{
      //if the selected point is a posible move then move the piece
      var isValidMove = false;
      for (var i = 0; i < movesCoords.length; i++) {
        if(movesCoords[i].x==x&&movesCoords[i].y==y)
          isValidMove=true;
      }
      if(isValidMove){

        let lastMove = chess.move({ from: playerSelNot, to: getNotation(y,x) , promotion: 'q'});
        addMovementToHistory(lastMove);

        //reset
        drawBoard();
        tablero[playerSelected[0]][playerSelected[1]].classList.toggle("selected");
        playerSelected = [-1,-1];
        movesCoords=[];
        playerSelNot='';

        //setAI turn or Local
        if(isLocal){
          if(playerColor=="w"){
            playerColor="b";
          }
          else{
            playerColor="w";
          }

          if (chess.game_over()) {
            playerTurn=false;
            setGameOverText();
          }
          else {
            wTurn=!wTurn;
            setTextTurn(wTurn);
          }
        }
        else{
          if (chess.game_over()) {
            setGameOverText();
          }else {
            playerTurn=false;
            wTurn=!wTurn;
            setTextTurn(wTurn);
            playAI();
          }
        }



      }
      //if it is not a posible move then deselect the piece
      else{
        //reset
        drawBoard();
        tablero[playerSelected[0]][playerSelected[1]].classList.toggle("selected");
        playerSelected = [-1,-1];
        movesCoords=[];
        playerSelNot='';
      }
    }
  }
  else if(chess.game_over()){
    setGameOverText();
  }
}

//FUNCION DE PRUEBA DONDE LA AI JUEGA SOLA
function play(){
  var moves = chess.moves();
  var move = moves[Math.floor(Math.random() * moves.length)];
  chess.move(move);
  drawBoard();

  if(!chess.game_over()){
    window.setTimeout(play,500);
  }
}

//FUNCIÓN PARA OBTENER LOS TD DEL TABLERO EN PANTALLA
function getTds(){
  var t = document.getElementById("tablero");
  var trs = t.getElementsByTagName("tr");
  var tds = new Array(trs.length);

  for (var i=0; i<trs.length; i++)
  {
      tds[i] = trs[i].getElementsByTagName("td");
  }
  return tds;
}

//FUNCIÓN PARA DIBUJAR EL TABLERO DE ACUERDO AL ESTADO ACTUAL
function drawBoard(){
  var board = chess.board();
  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board[i].length; j++) {
      //remove current childs
      while (tableroDiv[i][j].firstChild) {
        tableroDiv[i][j].removeChild(tableroDiv[i][j].firstChild);
      }
      let piece = board[i][j];
      if(piece!=null){
        tableroDiv[i][j].appendChild(createElement(piece));
      }
      else{
        let empty =  document.createElement("IMG");
        empty.width = "50";
        empty.src = "./icons/empty.png";
        tableroDiv[i][j].appendChild(empty);
      }
    }
  }
}

//FUNCIÓN PARA OBTENER EL DOM ELEMENT A INSERTAR
function createElement(piece){
  let type= piece.type;
  let color= piece.color;
  let x = document.createElement("IMG");
  x.width = "50";
  if(color=="b"){
    if(type=="r"){
      x.src = "./icons/black/rook.png";
    }
    else if (type=="n") {
      x.src = "./icons/black/horse.png";
    }
    else if (type=="q") {
      x.src = "./icons/black/queen.png";
    }
    else if (type=="p") {
      x.src = "./icons/black/pawn.png";
    }
    else if (type=="k") {
      x.src = "./icons/black/king.png";
    }
    else if (type=="b") {
      x.src = "./icons/black/bishop.png";
    }
  }
  else{
    if(type=="r"){
      x.src = "./icons/white/rook.png";
    }
    else if (type=="n") {
      x.src = "./icons/white/horse.png";
    }
    else if (type=="q") {
      x.src = "./icons/white/queen.png";
    }
    else if (type=="p") {
      x.src = "./icons/white/pawn.png";
    }
    else if (type=="k") {
      x.src = "./icons/white/king.png";
    }
    else if (type=="b") {
      x.src = "./icons/white/bishop.png";
    }
  }
  return x;
}

//FUNCIÓN PARA IR DE NOTACION DE AJEDREZ A POSICION EN Array
function getCoords(e){
  var columns = ['a','b','c','d','e','f','g','h'];
  var pos = {};
  var indexY = e.length-1;
  var indexX = e.length-2;

  pos.y = 7-(parseInt(e.charAt(indexY))-1);
  pos.x = columns.indexOf(e.charAt(indexX));

  return pos;
}

//FUNCION PARA IR DE POSICION EN ARRAY A NOTACION DE AJEDREZ
function getNotation(y,x){
  var columns = ['a','b','c','d','e','f','g','h'];
  var not = '';
  not+=''+columns[x];
  not+=''+(8-y);


  return not;
}

//FUNCION PARA AÑADIR MOVIMIENTO AL HISTORIAL
function addMovementToHistory(mov){
   var tr = document.createElement("TR");

   var td_number = document.createElement("TD");
   td_number.innerHTML = ""+movementCount++;

   var td_piece = document.createElement("TD");
   td_piece.innerHTML = ""+mov.piece;

   var td_from = document.createElement("TD");
   td_from.innerHTML = ""+mov.from;

   var td_to = document.createElement("TD");
   td_to.innerHTML = ""+mov.to;

   tr.appendChild(td_number);
   tr.appendChild(td_piece);
   tr.appendChild(td_from);
   tr.appendChild(td_to);

   moves_array = book_posible_moves();
   
   if(is_opening){
    let found = false;
    for (let index = 0; index < moves_array.length; index++) {
      if(moves_array[index].move==mov.san){
        curr_node=moves_array[index].index;
        found=true;
      }
    }
    if(!found){
      console.log("opening book has been closed")
    }
    is_opening=found;
   }
   historyTable.appendChild(tr);
}

//FUNCION DE REINICIO DE JUEGO Local
function restart_local(){
  //restart_chess
  chess = new Chess();
  //restart tablero
  restart_tablero();
  //restart movimientos
  restart_movimientos();
  movementCount=1;

  //set everythig to play Local
  playerSelected = [-1,-1];
  playerTurn=true;
  isLocal=true;
  wTurn = true;
  playerColor="w";

  //display difficulty board
  var element = document.getElementById("difficulty_div");
  element.classList.add("hidden");

  //drawBoard
  drawBoard();
  setTextTurn(wTurn);
}

function restart(playerStart){
  //restart_chess
  chess = new Chess();
  is_opening=true;
  curr_node = 48;
  //restart tablero
  restart_tablero();
  //restart movimientos
  restart_movimientos();
  movementCount=1;

  //set everythig to play Local
  playerSelected = [-1,-1];
  playerTurn=playerStart;
  isLocal=false;
  wTurn = true;
  playerColor="w";

  //display difficulty board
  var element = document.getElementById("difficulty_div");
  element.classList.remove("hidden");

  if(!playerStart){
    playerColor="b";
    playAI();
  }

  //drawBoard
  drawBoard();
  setTextTurn(wTurn);
}

function restart_tablero(){
  tableroDiv = [];
  for (var i = 0; i < tablero.length; i++) {
    let divs  = [];
    for (var j = 0; j < tablero[i].length; j++) {
      //remove current childs
      while (tablero[i][j].firstChild) {
        tablero[i][j].removeChild(tablero[i][j].firstChild);
      }
      tablero[i][j].appendChild(document.createElement("div"));
      divs.push(tablero[i][j].firstChild);
    }
    tableroDiv.push(divs);
  }
}

function restart_movimientos(){
  while (historyTable.children.length>1) {
    historyTable.removeChild(historyTable.lastChild);
  }
}

//FUNCION PARA MOSTRAR EL TURNO
function setTextTurn(isWhite){
  var t = document.getElementById("turn");
  if(isWhite){
    t.innerHTML='Current turn: White';
  }
  else{
    t.innerHTML='Current turn: Black';
  }
}

//SET GAME OVER TEXT
function setGameOverText(){
  var t = document.getElementById("turn");
  t.innerHTML='Game over!';
  alert('game over');
}

//FUNCION PRINCIPAL PARA EJECUTAR LA LÓGICA DE LA IA
function playAI(){
  if(!isLocal&&!playerTurn&&!chess.game_over()&&chess.moves().length!=0){
    var ai_move;
    //GET MOVE ACCORDING TO BOOK OR ALPHA
    if(is_opening){
      let moves_array = book_posible_moves();
      if(!moves_array.empty){
        let num_m = Math.floor(Math.random() * Math.floor(moves_array.length));
        ai_move=moves_array[num_m].move;
      }else{
        is_opening=false;
        console.log("opening book has been closed")
      }

      
    }
    if(!is_opening){
      //GET MOVE ACORDING TO DIFFICULTY
      //Aleatory mode
      if(difficulty==0){
        ai_move=aleatoryMove();
      }
      //piece value mode
      else if (difficulty%2==1) {
        var premove = alpha_beta_basic(chess,(parseInt(difficulty)+1)/2,-Infinity,Infinity,wTurn);
        ai_move=premove.move;
      }
      //true evaluation function mode
      else{
        var premove = alpha_beta_complex(chess,difficulty/2,-Infinity,Infinity,wTurn);
        ai_move=premove.move;
      }
    }
    //EXECUTE MOVEMENTS
    if(ai_move!=null){
      var lastMove = chess.move(ai_move);

      if(lastMove!=null){
        addMovementToHistory(lastMove);

        //SET playerTurn
        drawBoard();
        playerTurn=true;

        if(!chess.game_over()){
          wTurn=!wTurn;
          setTextTurn(wTurn);
        }
      }
      else {
        setGameOverText();
      }
    }
    else{
      setGameOverText();
    }

  }
  else if(chess.game_over()){
    setGameOverText();
  }
}

function aleatoryMove(){
  let moves = chess.moves();
  return moves[Math.floor(Math.random() * moves.length)];
}

//ALPHA BETA WITH SIMPLE EVALUATION ONLY CONSIDERING VALUE OF PIECES
function alpha_beta_basic(position, depth, alpha, beta, maximizingPlayer){
  var rMove = {};
  if(depth == 0||position.game_over()){
    if(position.game_over()){
      if(position.in_checkmate()){
        if(!maximizingPlayer){
          rMove.score = 1000000;
          return rMove; //mov ganador
        }
        else{
          rMove.score = -1000000;
          return rMove; //mov perdedor
        }
      }
      else{
        rMove.score = 0;
        return rMove;
      }
    }
    else{
      rMove.score = simple_eval(position);
      return rMove;
    }
  }
  //obtener movimientos
  var moves = chess.moves({ verbose: true });

  if(maximizingPlayer){
    var maxEval = -Infinity;
    //obtener el movimiento hijo con mayor puntaje
    for (var i = 0; i < moves.length; i++) {
      position.move(moves[i]);
      var eval = alpha_beta_basic(position, depth - 1, alpha, beta, false).score;
      if(eval > maxEval){
        maxEval=eval;
        rMove.move = moves[i];
        rMove.score = eval;
      }
      if(eval > alpha){
        alpha=eval;
      }
      position.undo();
      if(beta <= alpha){
        break;
      }
    }
    return rMove;
  }
  //obtener el movimiento hijo con menor puntaje
  else {
    var minEval = Infinity;

    //obtener el movimiento hijo con mayor puntaje
    for (var i = 0; i < moves.length; i++) {
      position.move(moves[i]);
      var eval = alpha_beta_basic(position, depth - 1, alpha, beta, true).score;
      if(eval < minEval){
        minEval=eval;
        rMove.move = moves[i];
        rMove.score = eval;
      }
      if(eval < beta){
        beta=eval;
      }
      position.undo();
      if(beta <= alpha){
        break;
      }
    }
    return rMove;
  }
}

function simple_eval(position){
  var board = chess.board();
  var sum = 0;
  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board[i].length; j++) {
      if(board[i][j]!=null){
        let type= board[i][j].type;
        let color= board[i][j].color;
        if(color=="b"){
          if(type=="r"){
            sum-=50;
          }
          else if (type=="n") {
            sum-=30;
          }
          else if (type=="q") {
            sum-=90;
          }
          else if (type=="p") {
            sum-=10;
          }
          else if (type=="k") {
            sum-=900;
          }
          else if (type=="b") {
            sum-=30;
          }
        }
        else{
          if(type=="r"){
            sum+=50;
          }
          else if (type=="n") {
            sum+=30;
          }
          else if (type=="q") {
            sum+=90;
          }
          else if (type=="p") {
            sum+=10;
          }
          else if (type=="k") {
            sum+=900;
          }
          else if (type=="b") {
            sum+=30;
          }
        }
      }
    }
  }
  return sum;
}

//ALPHA BETA CONSIDERING VALUE OF PIECES AND position
function alpha_beta_complex(position, depth, alpha, beta, maximizingPlayer){
  var rMove = {};
  if(depth == 0||position.game_over()){
    if(position.game_over()){
      if(position.in_checkmate()){
        if(!maximizingPlayer){
          rMove.score = 1000000;
          return rMove; //mov ganador
        }
        else{
          rMove.score = -1000000;
          return rMove; //mov perdedor
        }
      }
      else{
        rMove.score = 0;
        return rMove;
      }
    }
    else{
      rMove.score = complex_eval(position);
      return rMove;
    }
  }
  //obtener movimientos
  var moves = chess.moves({ verbose: true });


  if(maximizingPlayer){
    var maxEval = -Infinity;
    //obtener el movimiento hijo con mayor puntaje
    for (var i = 0; i < moves.length; i++) {
      position.move(moves[i]);
      var eval = alpha_beta_complex(position, depth - 1, alpha, beta, false).score;
      if(eval > maxEval){
        maxEval=eval;
        rMove.move = moves[i];
        rMove.score = eval;
      }
      if(eval > alpha){
        alpha=eval;
      }
      position.undo();
      if(beta <= alpha){
        break;
      }
    }
    return rMove;
  }
  //obtener el movimiento hijo con menor puntaje
  else {
    var minEval = Infinity;

    //obtener el movimiento hijo con mayor puntaje
    for (var i = 0; i < moves.length; i++) {
      position.move(moves[i]);
      var eval = alpha_beta_complex(position, depth - 1, alpha, beta, true).score;
      if(eval < minEval){
        minEval=eval;
        rMove.move = moves[i];
        rMove.score = eval;
      }
      if(eval < beta){
        beta=eval;
      }
      position.undo();
      if(beta <= alpha){
        break;
      }
    }
    return rMove;
  }
}

function complex_eval(position){
  var board = chess.board();
  var sum = 0;
  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board[i].length; j++) {
      if(board[i][j]!=null){
        let type= board[i][j].type;
        let color= board[i][j].color;
        if(color=="b"){
          if(type=="r"){
            sum-=50+rookEvalBlack[i][j];
          }
          else if (type=="n") {
            sum-=30+knightEval[i][j];
          }
          else if (type=="q") {
            sum-=90+evalQueen[i][j];
          }
          else if (type=="p") {
            sum-=10+pawnEvalBlack[i][j];
          }
          else if (type=="k") {
            sum-=900+kingEvalBlack[i][j];
          }
          else if (type=="b") {
            sum-=30+bishopEvalBlack[i][j];
          }
        }
        else{
          if(type=="r"){
            sum+=50+rookEvalWhite[i][j];
          }
          else if (type=="n") {
            sum+=30+knightEval[i][j];
          }
          else if (type=="q") {
            sum+=90+evalQueen[i][j];
          }
          else if (type=="p") {
            sum+=10+pawnEvalWhite[i][j];
          }
          else if (type=="k") {
            sum+=900+kingEvalWhite[i][j];
          }
          else if (type=="b") {
            sum+=30+bishopEvalWhite[i][j];
          }
        }
      }
    }
  }
  return sum;
}

function load_openning_book(){
  openbook_nodes = JSON.parse(`{
    "nodes":[
      {"turn":1, "move":"e4"},
      {"turn":1, "move":"c5"},
      {"turn":2, "move":"Nf3"},
      {"turn":2, "move":"d6"},
      {"turn":2, "move":"Nc6"},
      {"turn":2, "move":"e6"},
      {"turn":3, "move":"d4"},
      {"turn":3, "move":"d4"},
      {"turn":3, "move":"d4"},
      {"turn":3, "move":"cxd4"},
      {"turn":3, "move":"cxd4"},
      {"turn":3, "move":"cxd4"},
      {"turn":4, "move":"Nxd4"},
      {"turn":4, "move":"Nxd4"},
      {"turn":4, "move":"Nxd4"},
      {"turn":4, "move":"Nf6"},
      {"turn":4, "move":"g6"},
      {"turn":4, "move":"e5"},
      {"turn":4, "move":"Nf6"},
      {"turn":4, "move":"e6"},
      {"turn":4, "move":"Nf6"},
      {"turn":4, "move":"Nc6"},
      {"turn":4, "move":"a6"},
      {"turn":5, "move":"Nc3"},
      {"turn":5, "move":"Nc3"},
      {"turn":5, "move":"Nc3"},
      {"turn":5, "move":"Nc3"},
      {"turn":5, "move":"Nc3"},
      {"turn":5, "move":"Nc3"},
      {"turn":5, "move":"e6"},
      {"turn":5, "move":"a6"},
      {"turn":5, "move":"g6"},
      {"turn":5, "move":"Nc6"},
      {"turn":5, "move":"Bg7"},
      {"turn":5, "move":"d6"},
      {"turn":5, "move":"e6"},
      {"turn":5, "move":"Nc6"},
      {"turn":5, "move":"Nf6"},
      {"turn":5, "move":"a6"},
      {"turn":5, "move":"Nc6"},
      {"turn":6, "move":"Be2"},
      {"turn":6, "move":"Be2"},
      {"turn":6, "move":"Be3"},
      {"turn":6, "move":"Be2"},
      {"turn":6, "move":"Be3"},
      {"turn":6, "move":"Be2"},
      {"turn":6, "move":"a6"},
      {"turn":6, "move":"e6"},
      {"turn":0, "move":"none"}
      ]
  }`).nodes;
  openbook_graph_str = `0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
  0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
  0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
  0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
  0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
  0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
  0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
  0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
  0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
  0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
  0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
  1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0`;

  openbook_graph_str=  openbook_graph_str.split('\n');
  openbook_graph = new Array(openbook_nodes.length);
  for (let index = 0; index < openbook_nodes.length; index++) {
    line = openbook_graph_str[index].split(',');
    openbook_graph[index] = new Array(openbook_nodes.length);
    for (let index2 = 0; index2 < openbook_nodes.length; index2++) {
      openbook_graph[index][index2] = parseInt(line[index2].replace(/\s/g, ""));
    }
  }

}

function book_posible_moves(){
  var num_nodes = openbook_graph.length;
  var posible_moves = new Array();
  for (let index = 0; index < num_nodes; index++) {
    if(openbook_graph[curr_node][index]==1){
      posible_moves.push({"index":index, "move":openbook_nodes[index].move});
    }
  }

  return posible_moves;
}


// initial call
//minimax(currentPosition, 3, -∞, +∞, true)
