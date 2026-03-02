# 2004 AMC 12A Problem 7

> This problem is the same as [2004 AMC 12A #7](https://artofproblemsolving.com/wiki/index.php/2004_AMC_12A_Problems) and [2004 AMC 10A #8](https://artofproblemsolving.com/wiki/index.php/2004_AMC_10A_Problems/Problem_8).
## Problem
A game is played with tokens according to the following rule.  In each round, the player with the most tokens gives one token to each of the other players and also places one token in the discard pile.  The game ends when some player runs out of tokens.  Players A, B, and C start with 15, 14, and 13 tokens, respectively.  How many rounds will there be in the game?


$$\mathrm{(A) \ } 36 \qquad \mathrm{(B) \ } 37 \qquad \mathrm{(C) \ } 38 \qquad \mathrm{(D) \ } 39 \qquad \mathrm{(E) \ } 40$$

## Solutions
### Solution 1
We look at a set of three rounds, where the players begin with $x+1$, x, and $x-1$ tokens.
After three rounds, there will be a net loss of 1 token per player (they receive two tokens and lose three). Therefore, after 36 rounds -- or 12 three-round sets, A,B and C will have 3, 2, and 1 tokens, respectively.  After 1 more round, player A will give away 3 tokens, leaving them empty-handed, and thus the game will end. We then have there are $36+1=\boxed{\mathrm{(B)}\ 37}$ rounds until the game ends.
### Solution 2
Let's bash a few rounds. The amounts are for players 1,2, and 3, respectively.

First round: 15,14,13 (given)
Second round: 12,15,14
Third round: 13,12,15
Fourth round: 14,13,12

We see that after 3 rounds are played, we have the exact same scenario as the first round but with one token less per player. So, the sequence 1,4,7,10... where each of the next members are 3 greater than the previous one corresponds with the sequence 15,14,13,12... where the first sequence represents the round and the second sequence represents the number of tokens player 1 has. But we note that once player 1 reaches 3 coins, the game will end on his next turn as he must give away all his coins. Therefore, we want the $15-3+1=13$th number in the sequence 1,4,7,10... which is $\boxed{\mathrm{(B)}\ 37}.$

Solution by franzliszt
### Solution 3
Looking at a set of five rounds, you'll see A has 4 fewer tokens than in the beginning. Looking at four more rounds, you'll notice A has the same amount of tokens, namely 11, compared to round five. If you keep doing this process, you'll see a pattern: Every four rounds, the amount of tokens A has either decreased by 4 or stayed the same compared to the previous four rounds. For example, in round nine, A had 11 tokens, in round 13, A had 11 tokens, and in round 17, A had 7 tokens, etc. Using this weird pattern, you can find out that in round 37, A should have 3 tokens, but since they would have given them away in that round, the game would end on $\boxed{\mathrm{(B)}\ 37}.$

This strategy is a very slow one, requiring you to list out about 25 rounds.
## Video Solution
https://youtu.be/bUntEiqAF6g

Education, the Study of Everything
## See also
