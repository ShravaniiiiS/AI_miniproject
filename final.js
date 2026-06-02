const grid = document.getElementById("grid");

const rows = 20;
const cols = 25;

let mode = "start";

let startNode = null;
let endNode = null;

let cells = [];

for(let r=0;r<rows;r++){

  let row=[];

  for(let c=0;c<cols;c++){

    let cell=document.createElement("div");

    cell.classList.add("cell");

    cell.dataset.row=r;
    cell.dataset.col=c;

    cell.onclick=()=>handleClick(cell);

    grid.appendChild(cell);

    row.push(cell);
  }

  cells.push(row);
}

function setMode(m){
  mode=m;
}

function handleClick(cell){

  if(mode==="start"){

    if(startNode)
      startNode.classList.remove("start");

    cell.classList.remove("wall","end");

    cell.classList.add("start");

    startNode=cell;
  }

  else if(mode==="end"){

    if(endNode)
      endNode.classList.remove("end");

    cell.classList.remove("wall","start");

    cell.classList.add("end");

    endNode=cell;
  }

  else{

    if(!cell.classList.contains("start") &&
       !cell.classList.contains("end")){

      cell.classList.toggle("wall");
    }
  }
}

function sleep(ms){
  return new Promise(resolve=>setTimeout(resolve,ms));
}

function heuristic(a,b){

  return Math.abs(a.row-b.row)+
         Math.abs(a.col-b.col);
}

async function startSimulation(){

  if(!startNode || !endNode){

    alert("Set start and end nodes");
    return;
  }

  clearPath();

  document.getElementById("status").innerText="Searching...";

  let open=[];

  let start={
    row:+startNode.dataset.row,
    col:+startNode.dataset.col,
    g:0,
    f:0,
    parent:null
  };

  let end={
    row:+endNode.dataset.row,
    col:+endNode.dataset.col
  };

  open.push(start);

  let visited=new Set();

  while(open.length){

    open.sort((a,b)=>a.f-b.f);

    let current=open.shift();

    let key=`${current.row}-${current.col}`;

    if(visited.has(key))
      continue;

    visited.add(key);

    if(current.row===end.row &&
       current.col===end.col){

      let path=[];
      let temp=current;

      while(temp){

        path.push(temp);
        temp=temp.parent;
      }

      path.reverse();

      for(let p of path){

        let cell=cells[p.row][p.col];

        if(!cell.classList.contains("start") &&
           !cell.classList.contains("end")){

          cell.classList.remove("visited");

          cell.classList.add("path");

          await sleep(40);
        }
      }

      document.getElementById("cost").innerText=current.g;

      document.getElementById("status").innerText="Path Found";

      return;
    }

    let dirs=[
      [1,0],
      [-1,0],
      [0,1],
      [0,-1]
    ];

    for(let d of dirs){

      let nr=current.row+d[0];
      let nc=current.col+d[1];

      if(nr>=0 && nc>=0 &&
         nr<rows && nc<cols){

        let cell=cells[nr][nc];

        if(cell.classList.contains("wall"))
          continue;

        let nkey=`${nr}-${nc}`;

        if(visited.has(nkey))
          continue;

        let g=current.g+1;

        let h=heuristic(
          {row:nr,col:nc},
          end
        );

        open.push({
          row:nr,
          col:nc,
          g:g,
          f:g+h,
          parent:current
        });

        if(!cell.classList.contains("end")){

          cell.classList.add("visited");

          await sleep(15);
        }
      }
    }
  }

  document.getElementById("status").innerText="No Path";
}

function clearPath(){

  for(let r=0;r<rows;r++){

    for(let c=0;c<cols;c++){

      cells[r][c]
      .classList.remove("visited","path");
    }
  }
}

function resetGrid(){

  for(let r=0;r<rows;r++){

    for(let c=0;c<cols;c++){

      cells[r][c].className="cell";
    }
  }

  startNode=null;
  endNode=null;

  document.getElementById("cost").innerText="0";

  document.getElementById("status").innerText="Waiting...";
}

function generateMaze(){

  resetGrid();

  for(let r=0;r<rows;r++){

    for(let c=0;c<cols;c++){

      if(Math.random()<0.28){

        cells[r][c]
        .classList.add("wall");
      }
    }
  }

  let sr=Math.floor(Math.random()*rows);
  let sc=Math.floor(Math.random()*cols);

  cells[sr][sc]
  .classList.remove("wall");

  cells[sr][sc]
  .classList.add("start");

  startNode=cells[sr][sc];

  let er,ec;

  do{

    er=Math.floor(Math.random()*rows);
    ec=Math.floor(Math.random()*cols);

  }while(er===sr && ec===sc);

  cells[er][ec]
  .classList.remove("wall");

  cells[er][ec]
  .classList.add("end");

  endNode=cells[er][ec];
}