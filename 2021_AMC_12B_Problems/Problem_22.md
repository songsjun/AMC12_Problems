# 2021 AMC 12B Problem 22

> This problem is the same as [2021 AMC 10B #24](https://artofproblemsolving.com/wiki/index.php/2021_AMC_10B_Problems#Problem_24) and [2021 AMC 12B #22](https://artofproblemsolving.com/wiki/index.php/2021_AMC_12B_Problems#Problem_22).
## Problem
Arjun and Beth play a game in which they take turns removing one brick or two adjacent bricks from one "wall" among a set of several walls of bricks, with gaps possibly creating new walls. The walls are one brick tall. For example, a set of walls of sizes 4 and 2 can be changed into any of the following by one move: (3,2),(2,1,2),(4),(4,1),(2,2), or (1,1,2).


> [Asymptote diagram - not rendered in Markdown]

```asy
unitsize(4mm); real[] boxes = {0,1,2,3,5,6,13,14,15,17,18,21,22,24,26,27,30,31,32,33}; for(real i:boxes){ draw(box((i,0),($i+1$,3))); } draw((8,1.5)--(12,1.5),Arrow()); defaultpen(fontsize(20pt)); label(",",(20,0)); label(",",(29,0)); label(",...",(35.5,0));
```


Arjun plays first, and the player who removes the last brick wins. For which starting configuration is there a strategy that guarantees a win for Beth?

$\textbf{(A) }(6,1,1) \qquad \textbf{(B) }(6,2,1) \qquad \textbf{(C) }(6,2,2)\qquad \textbf{(D) }(6,3,1) \qquad \textbf{(E) }(6,3,2)$
## Solution 1
We say that a game state is an N-position if it is winning for the next player (the player to move), and a P-position if it is winning for the other player. We are trying to find which of the given states is a P-position.

First we note that symmetrical positions are P-positions, as the second player can win by mirroring the first player's moves. It follows that (6, 1, 1) is an N-position, since we can win by moving to (2, 2, 1, 1); this rules out $\textbf{(A)}.$ We next look at (6, 2, 1). The possible next states are

$$(6, 2), \enskip (6, 1, 1), \enskip (6, 1), \enskip (5, 2, 1), \enskip (4, 2, 1, 1), \enskip (4, 2, 1), \enskip (3, 2, 2, 1), \enskip (3, 2, 1, 1), \enskip (2, 2, 2, 1).$$

None of these are symmetrical, so we might reasonably suspect that they are all N-positions. Indeed, it just so happens that for all of these states except (6, 2) and (6, 1), we can win by moving to (2, 2, 1, 1); it remains to check that (6, 2) and (6, 1) are N-positions.

To save ourselves work, it would be nice if we could find a single P-position directly reachable from both (6, 2) and (6, 1). We notice that (3, 2, 1) is directly reachable from both states, so it would suffice to show that (3, 2, 1) is a P-position. Indeed, the possible next states are

$$(3, 2), \enskip (3, 1, 1), \enskip (3, 1), \enskip (2, 2, 1), \enskip (2, 1, 1, 1), \enskip (2, 1, 1),$$

which allow for the following refutations:


$$
\begin{align*} &(3, 2) \to (2, 2), && &&(3, 1, 1) \to (1, 1, 1, 1), && &&(3, 1) \to (1, 1), \\ &(2, 2, 1) \to (2, 2), && &&(2, 1, 1, 1) \to (1, 1, 1, 1), && &&(2, 1, 1) \to (1, 1). \end{align*}
$$


Hence, (3, 2, 1) is a P-position, so (6, 2) and (6, 1) are both N-positions, along with all other possible next states from (6, 2, 1) as noted before. Thus, (6, 2, 1) is a P-position, so our answer is $\boxed{\textbf{(B)}}. ($For completeness, we could also rule out $\textbf{(C)}, \textbf{(D)}$ and $\textbf{(E)}$ as in Solution 2.)

-Note: In general, this game is very complicated. For example (8, 7, 5, 3, 2) is winning for the first player but good luck showing that.
## Solution 2 (Elimination)
(6,1,1) can be turned into (2,2,1,1) by Arjun, which is symmetric, so Beth will lose.

(6,3,1) can be turned into (3,1,3,1) by Arjun, which is symmetric, so Beth will lose.

(6,2,2) can be turned into (2,2,2,2) by Arjun, which is symmetric, so Beth will lose.

(6,3,2) can be turned into (3,2,3,2) by Arjun, which is symmetric, so Beth will lose.

That leaves (6,2,1) or $\boxed{\textbf{(B)}}.$
## Solution 3 (Nim-values)
Let the nim-value of the ending game state, where someone has just removed the final brick, be 0. Then, any game state with a nim-value of 0 is losing. It is well-known that the nim-value of a supergame (a combination of two or more individual games) is the binary xor function on the nim-values of the individual games that compose the supergame. Therefore, we calculate the nim-values of the states with a single wall up to 6 bricks long (since the answer choices only go up to 6).

First, the game with 1 brick has a nim-value of 1.

Similarly, the game with 2 bricks has a nim-value of 2.

Next, we consider a 3 brick wall. After the next move, the possible resulting game states are 1 brick, a 2 brick wall, or 2 separate bricks. The first two options have nim-values of 1 and 2. The final option has a nim-value of $1\oplus 1 = 0,$ so the nim-value of this game state is 3.

Next, the 4 brick wall. The possible states are a 2 brick wall, a 3 brick wall, a 2 brick wall and a 1 brick wall, or a 1 brick wall and a 1 brick wall. The nim-values of these states are 2, 3, 3, and 0, respectively, and hence the nim-value of this game state is 1.

[Why is the nim-value of it 1? - awesomediabrine

https://en.wikipedia.org/wiki/Mex_(mathematics)]

The possible game states after the 5 brick wall are the following: a 3 brick wall, a 4 brick wall, a 3 brick wall and a 1 brick wall, a two 2 brick walls, and a 2 brick wall plus a 1 brick wall. The nim-values of these are 3, 1, 2, 0, and 3, respectively, meaning the nim-value of a 5 brick wall is 4.

Finally, we find the nim-value of a 6 brick wall. The possible states are a 5 brick wall, a 4 brick wall and a 1 brick wall, a 3 brick wall and a 2 brick wall, a 4 brick wall, a 3 brick wall and a 1 brick wall, and finally two 2 brick walls. The nim-values of these game states are 4, 0, 1, 1, 2, and 0, respectively. This means the 6 brick wall has a nim-value of 3.

The problem is asking which of the answer choices is losing, or has a nim-value of 0. We see that option $\textbf{(A)}$ has a nim-value of $3\oplus1\oplus1=3,$ option $\textbf{(B)}$ has a nim-value of $3\oplus2\oplus1=0,$ option $\textbf{(C)}$ has a nim-value of $3\oplus2\oplus2=3,$ option $\textbf{(D)}$ has a nim-value of $3\oplus3\oplus1=1,$ and option $\textbf{(E)}$ has a nim-value of $3\oplus3\oplus2=2,$ so the answer is $\boxed{\textbf{(B) }(6, 2, 1)}.$

This method can also be extended to solve the note after the first solution. The nim-values of the 7 brick wall and the 8 brick wall are 2 and 1, using the same method as above. The nim-value of (8, 7, 5, 3, 2) is therefore $1\oplus2\oplus4\oplus3\oplus2 = 6,$ which is winning.
## Solution 4
Consider the following, much simpler game.

Arjun and Beth can each either take 1 or 2 bricks from the right-hand-side of a continuous row of initially n bricks.
It is easy to see that for n a multiple of 3, Beth can "mirror" whatever Arjun plays: if he takes 1, she takes 2, and if he takes 2, she takes 1. With this strategy, Beth always takes the last brick. If n is not a multiple of 3, then Arjun takes whichever amount puts Beth in the losing position.

The total number of bricks in the initial states given by the answer choices is 8, 9, 10, 10, 11. Thus, answer choice $\textbf{(B)}$ appears promising as a winning position for Beth. The difference between this game and the simplified game is that in certain positions, namely those consisting of fragments of size only 1, taking 2 bricks is not allowed. We can assume that for the starting position (6, 2, 1), Beth always has a move to ensure that she can continue to mirror Arjun throughout the game. (This could be proven rigorously with lots of casework. In particular, she must avoid providing Arjun with a position of 3 continuous bricks, because then he could take the middle block and force a win.) The assumption seems reasonable, so the answer is $\boxed{\textbf{(B)}}.$
## Solution 5
We can start by guessing and checking our solutions. Let's start with A, (6,1,1). Arjun goes first, and he has a winning strategy. His strategy is to cut the 6 block in half, so whatever Beth does, Arjun will copy. If we see this in practice, Arjun has made the block in to (2,2,1,1). If Beth takes 1, he will take one. If Beth takes 2, he will take 2 as well.

Then, we can guess solution B, (6,2,1). If Arjun starts by taking 1 of the blocks, he will either have (6,1,1), (6,2), (x,y,2,1) (Where x+$y = 5$). If he has (6,1,1), Beth can take 2 out of the middle of (6,1,1) to get (2,2,1,1) which we know Arjun will lose because we know by symmetry from answer choice A. If he has (6,2), Beth will take out one from the edge, and we get (5,2). Beth can now copy whatever Arjun does, so she will win.

Next, if he takes one out to get (x,y,2,1), we can either have (4,1,2,1) or (3,2,2,1). If it is the first case, Beth can take the edge 2 out of the 4, which gives us (2,1,2,1) and whatever Arjun does, Beth can do, so she has established a win. If it is the 2nd case, Beth can take out 2 from the 3 to get (1,2,2,1), in which, Beth can copy whatever Arjun does, so Beth will win. So in all 4 cases, Beth wins. So our answer is  $\boxed{\textbf{(B)}}$

*~Arcticturn*
## Solution 6 (Mirroring)
In many game problems, the winning strategy is to simply copy all of your opponent's moves. Since you will always have a valid move if you mirror a valid move, you must move last and win.

Then, if Arjun can make the game "mirrorable" in his first move, then he can just copy all of Beth's moves after that.

(6,1,1) can be turned into (2,2,1,1) by Arjun. Any move Beth makes, Arjun can just copy on the other block with same value. For example, if Beth took one block off the first 2, Arjun takes one block off the second 2.

(6,2,2) turns into (2,2,2,2).

(6,3,1) turns into (3,1,3,1).

(6,3,2) turns into (3,2,3,2).

There are definitely other ways to split, but Arjun must win these games. This leaves answer $\boxed{B(6,2,1)}.$
## Solution 7 (Side Games)
We will call the 6-wall the main game and the remaining walls the side game.
It is clear that if there is no side game, Arjun can win by taking the middle two walls out. However, if Beth is ever able to force Arjun to take two turns in a row on the main game, their roles will swap and she will win. To do so, she must force Arjun to take two turns in a row, which means she needs to take the last wall in the side game. In other words, we can reduce the problem into Beth winning a game with starting configuration ignoring the 6-wall.

From here, it's clear that Beth loses (1,1), (2,2), and (3,2). However, Beth does win both (3,1) and (2,1). However, with the (3,1) case, Arjun can instead start the game by splitting the (3,1) into (1, 1, 1), which would swap their roles. Since Arjun now wins the side game, Beth will lose the (3,1) case, making the answer $\boxed{B(6, 2, 1)}$

*~Shadowleafy*
## Video Solution by Mathematical Dexterity (Be A Copycat!)
https://www.youtube.com/watch?v=m6yWxyYZLqw
## Video Solution by OmegaLearn (Game Theory)
https://youtu.be/zkSBMVAfYLo

*~pi_is_3.14*
## Video Solution by Interstigation (Goal of Winning - Pairs and Symmetricity & In-depth)
https://youtu.be/PUP3PqinjtM

*~Interstigation*
## Test your strategy online
https://mastermaththroughplay.com/games/brick-wall
## See Also
