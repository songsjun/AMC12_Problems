# 2013 AMC 12B Problem 18

## Problem
Barbara and Jenna play the following game, in which they take turns. A number of coins lie on a table. When it is Barbara’s turn, she must remove 2 or 4 coins, unless only one coin remains, in which case she loses her turn. When it is Jenna’s turn, she must remove 1 or 3 coins. A coin flip determines who goes first. Whoever removes the last coin wins the game. Assume both players use their best strategy. Who will win when the game starts with 2013 coins and when the game starts with 2014 coins?

$\textbf{(A)} Barbara will win with 2013 coins and Jenna will win with 2014 coins.$

$\textbf{(B)} Jenna will win with 2013 coins, and whoever goes first will win with 2014 coins.$

$\textbf{(C)} Barbara will win with 2013 coins, and whoever goes second will win with 2014 coins.$

$\textbf{(D)} Jenna will win with 2013 coins, and Barbara will win with 2014 coins.$

$\textbf{(E)} Whoever goes first will win with 2013 coins, and whoever goes second will win with 2014 coins.$
## Solution 1
We split into 2 cases: 2013 coins, and 2014 coins.

$\textbf{2013 coins:}$
Notice that when there are 5 coins left, whoever moves first loses, as they must leave an amount of coins the other person can take. If Jenna goes first, she can take 3 coins. Then, whenever Barbara takes coins, Jenna will take the amount that makes the total coins taken in that round 5. (For instance, if Barbara takes 4 coins, Jenna will take 1). Eventually, since 2010=0 ($\text{mod }5)$ it will be Barbara's move with 5 coins remaining, so she will lose. If Barbara goes first, on each round, Jenna will take the amount of coins that makes the total coins taken on that round 5. Since 2013=3 ($\text{mod }5),$ it will be Barbara's move with 3 coins remaining, so she will have to take 2 coins, allowing Jenna to take the last coin. Therefore, Jenna will win with 2013 coins.

$\textbf{2014 coins:}$
If Jenna moves first, she will take 1 coin, leaving 2013 coins, and she wins as shown above. If Barbara moves first, she can take 4 coins, leaving 2010. After every move by Jenna, Barbara will then take the number of coins that makes the total taken in that round 5. Since $2010=0\text{(mod }5),$ it will be Jenna's turn with 5 coins left, so
Barbara will win. In this case, whoever moves first wins.

Based on this, the answer is $\boxed{\textbf{(B)}}$
## Solution 2
We start with some key observations.

First, notice that when there are 0 ($\text{mod }5)$ coins left, whoever moves first loses, since the other player can keep taking exactly 5 minus the amount the first player took, eventually removing the last coin.

Furthermore, notice that if Barbara is going first when there are 1 ($\text{mod }5)$ coins left, she will lose, since the Jenna can follow a similar strategy to the 0 ($\text{mod }5)$ case. This will leave Barbara with only 1 coin at the end, in which she loses her turn and Jenna wins.

With these in mind, we split into 2 cases: 2013 coins, and 2014 coins.

$\textbf{2013 coins:}$

If Barbara goes first, she can remove either 2 or 4 coins. If she removes 2 coins, then Jenna will remove 1 coin, so there will be 0 ($\text{mod }5)$ left (hence Barbara will lose). Alternatively, if she removes 4 coins, then Jenna will remove 3 coins, so there will be 1 ($\text{mod }5)$ left (and Barbara will lose again). In both of these cases, Jenna will win.

If Jenna goes first, she will remove 3 coins, so there will be 0 ($\text{mod }5)$ coins left. Hence Jenna will win if she goes first.

Putting these together, Jenna will always win with 2013 coins.

$\textbf{2014 coins:}$

If Barbara goes first, she will remove 4 coins, so there will be 0 ($\text{mod }5)$ coins left. Hence Barbara will win.

Or, if Jenna goes first, she will remove 3 coins, so there will be 1 ($\text{mod }5)$ coins left. Hence Jenna will win.

Based on these, whoever goes first will win with 2014 coins.

Therefore, the answer is $\boxed{\textbf{(B)}}.$

*~xHypotenuse*
## Video Solution
https://youtu.be/I6JgSPbL6gY  ~Math Problem Solving Skills
## See also
