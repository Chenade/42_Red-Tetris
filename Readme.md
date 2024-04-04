# Red Tetris [42 Porject]

---

#### Built with
##### Front-end
	- React.js + Redux
	- Socket.io
##### Back-end
	- Node.js
	- Socket.io

---

#### Page
- Enter Player Name
- Enter Room number / Create a room
- Play
- (ScoreBoard)

---

#### Socket Behavior
- Server to Client
	- Connect accept or decline
	- Start
	- Puzzle type
	- Oppsing player movement
	- Oppsing player disconnect

- Client to Server
	- Join a room
	- Left a room
	- Movement
		- Rotation
		- Horizontal move (Left or Right)
		- Touch the pile
		- Destory line counts
		- Lose

---

#### Socket information
- Server
```
{
	Type:
	Value: 
}
```

- Client
```
{
	playername
	room number
	info:
	{
		Type: 
		Value:
	}
}
```

