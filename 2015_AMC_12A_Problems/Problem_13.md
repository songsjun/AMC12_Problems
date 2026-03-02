# 2015 AMC 12A Problem 13

## Problem
A league with 12 teams holds a round-robin tournament, with each team playing every other team exactly once. Games either end with one team victorious or else end in a draw. A team scores 2 points for every game it wins and 1 point for every game it draws. Which of the following is NOT a true statement about the list of 12 scores?

$\textbf{(A)}\ \text{There must be an even number of odd scores.}\\ \qquad\textbf{(B)}\ \text{There must be an even number of even scores.}\\ \qquad\textbf{(C)}\ \text{There cannot be two scores of }0\text{.}\\ \qquad\textbf{(D)}\ \text{The sum of the scores must be at least }100\text{.}\\ \qquad\textbf{(E)}\ \text{The highest score must be at least }12\text{.}$
## Solution 1
We can eliminate answer choices $\textbf{(A)}$ and $\textbf{(B)}$ because there are an even number of scores, so if one is false, the other must be false too. Answer choice $\textbf{(C)}$ must be true since every team plays every other team, so it is impossible for two teams to lose every game. Answer choice $\textbf{(D)}$ must be true since each game gives out a total of two points, and there are $\binom{12}{2} = 66$ games, for a total of 132 points. Answer choice $\boxed{\textbf{(E)}}$ is false. If everyone draws each of their 11 games, then every team will tie for first place with 11 points each.

Quick question, why does the answer key say 3?
## Solution 2
We will proceed by process of elimination:

$\textbf{(A)}: We know that this must be true, since any tied results in a 1 point (which is odd) for both teams. Hence, there must be 0 or a positive even number of odd scores.$

$\textbf{(B)}: This is true too, because each non-tie generates 2 points for the winner, and 0 points for the loser, which are both even scores. Hence, there must be 0 or a positive even number of even scores as well.$

$\textbf{(C)}: This must be true since every team plays every other team, so it is impossible for two teams to lose every game.$

$\textbf{(D)}: This is true as well. Since any game gives out a net total of two points, and there are \binom{12}{2} = 66 games, there are a total of 132 points for any round-robin tournament.$

Therefore, answer choice $\boxed{\textbf{(E)}}$ is false. If everyone ties, every team will be tied for the first place with 11 points each.

*~xHypotenuse*
## Solution 3
This one tries not to use the process of elimination, even though that would be far easier.
Statement $\boxed{\textbf{(E)}}$ assumes one team wins at least 6 games (they need 12 points, ignoring tie possibilities). Can we prevent the number one team from winning 6 games? Yes, all we need to do is ensure EVERY team wins 5 games out of 11. This gets us 60 wins, and thus we will have 60 corresponding losses. The remaining 12 points are distributed through ties since there's only one game left per team. Each team rounds off with $10+1 = 11$ points.
We just found an exception to statement $\boxed{\textbf{(E)}}.$ Thus, it is our "not" answer.

*~panikd*
## See Also
