# Red Tetris | Post-common-core | 42 Paris
## DEV NOTE
```
# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Red-tetris [Post-common-core]                      :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: ykuo & rukobaya                            +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2024/05/17 16:48:22 by ykuo              #+#    #+#              #
#    Updated: 2024/06/17 16:49:02 by ykuo             ###   ########.fr        #
#                                                                              #
# **************************************************************************** #
```

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
	- new player join the room
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

##### Server
- Get New Puzzle
```
{
	event: newPuzzle:
	data:{
		type: (int)
	}
}
```

- Get Opponment update
```
{
	event: op_puzzle:
	data:{
		type: (int)
	}
}
```
- message
```
{
	event: op_(next/action/...):
	player: (player1/player2)
	data:
	{
		data (left/right/rotate):
		Value:
	}
}
```


- Error
```
{
	event: error:
	data:{
		message
	}
}
```
---

##### Client

- joinRoom
```
{
	roomId:
}
```
- leaveRoom
```
{
}
```
- start
```
{
}
```
- end
```
{
	winner:
}
```
- message
```
{
	event (next/action):
	info:
	{
		data (left/right/rotate):
		Value:
	}
}
```

