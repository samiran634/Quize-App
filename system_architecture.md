# transition form single player to multiplayer
takeing the minimum user cradential(name and gamil ) allocate a unique id to the perticuler user.
(fetch this info from radis server)
make a general loby to know ongoing matches
when ever a matches is going to be created it should take some basic iinformation about the game the informations--->
1) what is the game dificulty
2) what is the mmax number of people can take part in the ongoing game
3) will the game be locked( means once started no one can join to the game )
4) is the game rated or not
5) the no of questions that will be used in the game
all the info should be storted in the redis memory and should be given as a object when required
 also when the game ends the info about te game also be deleted
 game specifications-->
 ( use of web socket is mandatory)
 allocate a room id and allow random members joining according to the data given during game creation
 broadcast the queston package to the all users who are in the game 
 to know who are in the game allocate a unique id to the game which is running and associate it among users.
 >>> follow up problem 
 1) what if some player got disconnectd during the game
 2)  how to controle concurancy   
 show a question for 20 seconds
 after 20 seconds show leaderboard after accumulating the scores 
 when the game ends update the rating of user if the game is rated 



 # components definition-
 ## loby-> 
 the place where every player who selected multiplayer option will land in first. 
 this is the place which will contain info about running games with a join button.

## leaderbord->
dynamic ranktable which updated after each problem