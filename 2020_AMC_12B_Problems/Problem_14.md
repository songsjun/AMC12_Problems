# 2020 AMC 12B Problem 14

> This problem is the same as [2020 AMC 10B #16](https://artofproblemsolving.com/wiki/index.php/2020_AMC_10B_Problems) and [2020 AMC 12B #14](https://artofproblemsolving.com/wiki/index.php/2020_AMC_12B_Problems).
## Problem
Bela and Jenn play the following game on the closed interval $[0, n]$ of the real number line, where $n$ is a fixed integer greater than $4$. They take turns playing, with Bela going first. At his first turn, Bela chooses any real number in the interval $[0, n]$. Thereafter, the player whose turn it is chooses a real number that is more than one unit away from all numbers previously chosen by either player. A player unable to choose such a number loses. Using optimal strategy, which player will win the game?

$\textbf{(A)} \text{ Bela will always win.} \qquad \textbf{(B)} \text{ Jenn will always win.} \qquad \textbf{(C)} \text{ Bela will win if and only if }n \text{ is odd.} \\ \textbf{(D)} \text{ Jenn will win if and only if }n \text{ is odd.} \qquad \textbf{(E)} \text { Jenn will win if and only if } n>8.$
## Solution 1 (Game Theory)
We use game theory.

Notice how they say Optimal Strategy. This means that each player plays the best move in any scene.

We then solve through cases.

We set $n > 4, n$ is even. Say $n = 10$. Then, we see that Bela could pick either 3 or 4, and then Jenn would be forced to choose either $1(2)$, 5, or 6. But notice how you can only make one move, and 1 and $[5,6]$ are on opposite sides. So therefore, Bela will always win.

We set $n > 4, n$ is odd. Say $n = 9$. This is even easier! Bela could just choose the middle, and then again, Jenn would be forced to pick a move that Bela could just replicate and win. So, Bela will also always win.

Through deduction, our answer is $\boxed{\textbf{(A)} \text{ Bela will always win.}}$

$\textit{But that's just a theory, a game theory!}$

*~Pinotation*
## Solution 2 (Symmetry)
If Bela selects the middle number in the range $[0, n]$ and then mirror whatever number Jenn selects, then if Jenn can select a number within the range, so can Bela. Jenn will always be the first person to run out of a number to choose, so the answer is $\boxed{\textbf{(A)} \text{ Bela will always win.}}$
## Solution 3 (Educated Guess)
First of all, realize that the parity of $n$ likely has no effect on the strategy, since Bela obviously wins when $n=1$, and it's not hard to find a winning strategy for $n=2$ or $n=3$ (start with $n/2$).  Similarly, there is no reason the strategy would change when $n>8.$

So we are left with $\textbf{(A)}$ and $\textbf{(B)}.$ From here it is best to try out random numbers and try to find the strategy that will let Bela win, but if you can't find it, realize that it is more likely the answer is $\boxed{\textbf{(A)} \text{ Bela will always win}}$ since Bela has the first move and thus has more control.
## Solution 4 (Simulation)
We can just play the game. We can draw a number line to $9$ and assume Bela and Jenn will only play the integer values. From now after playing one round of the game, Bela will win so answers $\textbf{(B)},\textbf{(D)},$ and $\textbf{(E)}$ are eliminated. Now we want to test if Bela will win if $n$ is even so we can draw another number line this time up to $10$. Now after playing the game, we can find that Bela won yet again so the answer is $\boxed{\textbf{(A)} \text{ Bela will always win}}.$

*~minor edits by jjbros*
## Solution 5 (Answer Choices)
Play out $n=5$ and $n=6$. In the first case, Bela can choose $0$ and win, and in the second case, Bela can choose $1$ and win (try it out). This rules out $\textbf{(B)}$, $\textbf{(C)}$, and $\textbf{(D)}$.

Next, consider $\textbf{(E)}$. Assume for the sake of contradiction that this is true; an alternate way of stating this is that for $n>8$, the second player always wins (we ignore the "only if" statement). Thus, $n=9$ is a win for the second player. Consider $n=11$. If Bela chooses $11$, then the game becomes an $n=9$ case where the first player is instead Jenn. However, by the claim that the second player should win $n>8$, this game should be a win for Bela, but we have already stated that any games with $n>8$ should be a win for Jenn, which is a contradiction. Thus $\textbf{(E)}$ is incorrect, and so the answer is $\boxed{\textbf{(A)} \text{ Bela will always win}}

*~eevee9406*
## Video Solution (HOW TO THINK CREATIVELY!!!)
https://youtu.be/0mlJhyy1m4M

*~Education, the Study of Everything.*
## Video Solution by TheBeautyOfMath
https://youtu.be/3BvJeZU3T-M

https://youtu.be/0xgTR3UEqbQ
## See Also
