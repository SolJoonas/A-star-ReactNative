import React ,{ useState, useEffect }from 'react';
import {TouchableOpacity, Text, View, FlatList, Button } from 'react-native';
import styles from './styles/Gridstyles';

const map=[];
var OpenSet=[];
var ClosedSet=[];

// tässä määritetään kartan koko
var xSize = 5;
var ySize = 5;
var mapSize = xSize*ySize;

var startStop = [];

var start = 0;
var end = 0;

var startID;
var endID;

export default class app extends React.Component{

  constructor(props) {
    super(props);
    this.state={clickcount:0};
    this.handleUpdate = this.handleUpdate.bind(this);
    this.navigate = this.navigate.bind(this);
    this.updateMap = this.updateMap.bind(this);
    
    Mapinit(); 
  }

  handleUpdate = () =>{
    aStar(map[startID]);
    trail();
    console.log(map);
    this.setState({clickcount :this.state.clickcount + 1})    
  }

  updateMap = () =>{

    window.location.reload(false);
  }

  navigate = (id) =>{
    if(startStop.length < 2){
      startStop.push(map[id]);
      console.log(startStop);
    }
    else{
      console.log('On jo kaksi');
    }

    if(startStop.length > 1){
      end = startStop[1].Location;
      endID = startStop[1].ID;
    }
    else{
      start = startStop[0].Location;
      startID = startStop[0].ID;
    }

    this.setState({clickcount :this.state.clickcount + 1})
  }
    
  render(){
    return(
    <View style={styles.container}>
      <Text>Etsin parhaan reitin sinulle</Text>
      <Text>Kun olet valinnut Aloitus ja lopetus pisteen klikkaamalla ruutuja paina navigate</Text>
      <Text style={styles.startText}>Tämä on aloitus pisteen väri</Text>
      <Text style={styles.endText}>Tämä on lopetus pisteen väri</Text>
      <Text style={styles.wallText}>Tämän väriset ovat esteitä</Text>
      <Button title="Navigate" onPress={this.handleUpdate} style={styles.startbutton}></Button>
      <Button title="New map" onPress={this.updateMap} style={styles.startbutton}></Button>
      <FlatList
        data={map}
        extraData={this.state.clickcount}
        renderItem={({item}) => <View style={drawmap(item)}>
          <TouchableOpacity style={styles.button} onPress={()=>{this.navigate(item.ID)}}>
            <Text>{item.ID}</Text>
          </TouchableOpacity>            
        </View>}
        numColumns={xSize}
      />
    </View>
    );
  } 
}

//tutkii parhaan reitin aloituksesta lopetukseen. 

function aStar(current){

  var CurrentID = current.ID;
  OpenSet.push(CurrentID);

  do{
    var minscore = mapSize; // etäisyys ei voi olla suurempi kun kartan leveys x korkeus

    for (let index = 0; index < OpenSet.length; index++) {
      map[OpenSet[index]].score =  Distance(map[OpenSet[index]].Location)
      if(map[OpenSet[index]].score < minscore){
        minscore = map[OpenSet[index]].fscore; // mikä on pienin fscore opensetissä
      }
    }

    for (let index = 0; index < OpenSet.length; index++) {
      if(map[OpenSet[index]].score > minscore){ // poistetaan kaikki patsi ne joilla on pienin fscore
        ClosedSet.push(OpenSet[index]);
        removeFromOpenList(OpenSet[index]);
      }
    }

    var possibilities = OpenSet.length;

    for (let index = 0; index < possibilities; index++) {

      CurrentID = OpenSet[index];
      map[CurrentID].Neighbours = Neighbours(map[CurrentID].x, map[CurrentID].y, map[CurrentID].ID); // katsotaan naapurit ja  tallennetaan niiden ID listaan objektin sisään
      
      for (let index = 0; index < map[CurrentID].Neighbours.length; index++) {

        var NeighbourID = map[CurrentID].Neighbours[index].ID;

        //jos solu ei ole Opensetissä tai Closed setissä eli ei ole kurkittu sitä ennen voidaan se
        //lisätä Opensettiin. 
        if(InOpenSet(NeighbourID) == false && InClosedSet(NeighbourID) == false){
          map[NeighbourID].score =  Distance(map[NeighbourID].Location);
          map[NeighbourID].cameFrom = CurrentID;         
          OpenSet.push(NeighbourID);
        }
      }
    
    }
    ClosedSet.push(CurrentID);
    removeFromOpenList(CurrentID);
  }while(CurrentID != endID)//(JSON.stringify(current.Location)!=JSON.stringify(end))
}

//poistaa objectin Opensetistä IDn perusteella.
function removeFromOpenList(removeID){
  for (let index = 0; index < OpenSet.length; index++) {
    if(OpenSet[index] == removeID){
      OpenSet.splice(index,1);
    }
  }
}

// tutkii onko solu Closedsetissä
function InClosedSet(id){
  var is = false;
  for (let index = 0; index < ClosedSet.length; index++) {
    if(id == ClosedSet[index]){
      is  = true;
    }
  }
  return is;
}

// tutkii onko solu Opensetissä
function InOpenSet(id){
  var is = false;
  for (let index = 0; index < OpenSet.length; index++) {
    if(id == OpenSet[index]){
      is  = true;
    }
  }
  return is;
}

// piirtää reitin. 
function trail(){

  var endPoint = map[endID]; //solusta johon reitin haku loppui. Nyt oon koodannu sen vaan maaliksi koska koodi ei tunnista epäonnistumista.
  var past = true;
  var trailPath;
  var last = endPoint; // tässä kohtaa määritän mistä solusta lähetään, tämä muuttuu kun reittiä mennään eteenpäin.

  map[startID].trail = true; // värjää aloituksen reitiksi

  do{

    trailPath = map[last.ID];
    map[trailPath.ID].trail = true;
    last = map[trailPath.cameFrom];

    if(trailPath.ID==startID){
      past = false;
    }

  }while(past != false)
}

function cell(nx,ny,random,idnum){

  // kartta muodostuu soluista joilla kaikilla omat alla olevat omat tiedot.

  let ID = idnum;
  let cameFrom = 0;
  let x = nx;
  let y = ny;
  let loc = [x,y];
  let score = 0;
  let wall = wallorNot(random, loc);
  var blocks = [];
  var trail = false;

  return {'x':x,'y':y,'wall':wall, 'Neighbours':blocks, 'Location':loc , 'score':score,'ID':ID, 'cameFrom':cameFrom,'trail':trail};
}

// tämä voisi olla parempi mutta toimii kuitenkin toistaiseksi.
function Neighbours(x, y, id){

  var NL = []; // tahän kootaan lista naapureista

  // alla tutkitaan missä suunnassa on käytettävä naapuri joka voidaan lisätä listaan.

  if(y > 0){ // voiko mennä ylös
    
    if (map[id-(xSize)].wall != true){
      NL.push(map[id-(xSize)]);
    }
  }
  if(y < ySize-1){ // voiko mennä alas
    
    if (map[id+(xSize)].wall != true){
      NL.push(map[id+(xSize)]);
    }
  }
  if(x > 0){ // voiko mennä vasemmalle
    
    if (map[id-1].wall != true){
      NL.push(map[id-1]);
    }
  }
  if(x < xSize-1){ // voiko mennä oikealle
    
    if (map[id+1].wall != true){
      NL.push(map[id+1]);
    }
  }
  
  for (let x = 0; x < OpenSet.length; x++) {
    for (let y = 0; y < NL.length; y++) {
      if (OpenSet[x].ID == NL[y].ID){
        NL.splice(y,1);
      }
      
    }
  }
  
  return NL;
}

// tällä funktiolla määritellään satunnaisesti mikä solu on este
function wallorNot(random,loc){
  if(JSON.stringify(loc)==JSON.stringify(start) || JSON.stringify(loc) == JSON.stringify(end)){
    return false;
  }
  else{
    if(random>0.8){
      return true;
    }
    else{
      return false;
    }
  }
}

//luo solut karttaan.
function Mapinit(){
  var num = 0;
  for (let y = 0; y < ySize; y++) {
    for (let x = 0; x < xSize; x++) {
      var randomnum = Math.random();
      map.push(cell(x,y,randomnum,num));
      num++
     }
  }
}

//tällä määritellään kartan värit.
function drawmap(item){
  var blockstyle;
  if (item.trail == true){
    blockstyle = styles.Trail;
  }
  if (!item.wall){
    if (item.ID == startID){
      blockstyle = styles.start;
    }
    else if (item.ID == endID){
      blockstyle = styles.end;
    }
    else if (item.trail == true){
      blockstyle = styles.Trail;
    }
    else{
    blockstyle = styles.mapfree;
    }
  }
  else{
    blockstyle = styles.mapblock;
  }
  return(blockstyle);
}
// lasketaan matka tähän functioon lähetetystä solusta maaliin. 
function Distance(location){
  return Math.abs(location[0]-end[0])+Math.abs(location[1]-end[1]); // toimii vain jos aloitus on vasemmassa yläkulmassa
}