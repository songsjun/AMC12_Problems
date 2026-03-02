# 2021 AMC 12A Problem 23

> This problem is the same as [2021 AMC 10A #23](https://artofproblemsolving.com/wiki/index.php/2021_AMC_10A_Problems/Problem_23) and [2021 AMC 12A #23](https://artofproblemsolving.com/wiki/index.php/2021_AMC_12A_Problems/Problem_23).
## Problem
Frieda the frog begins a sequence of hops on a 3 $\times 3$ grid of squares, moving one square on each hop and choosing at random the direction of each hop-up, down, left, or right. She does not hop diagonally. When the direction of a hop would take Frieda off the grid, she "wraps around" and jumps to the opposite edge. For example if Frieda begins in the center square and makes two hops "up", the first hop would place her in the top row middle square, and the second hop would cause Frieda to jump to the opposite edge, landing in the bottom row middle square. Suppose Frieda starts from the center square, makes at most four hops at random, and stops hopping if she lands on a corner square. What is the probability that she reaches a corner square on one of the four hops?

$\textbf{(A)} ~\frac{9}{16}\qquad\textbf{(B)} ~\frac{5}{8}\qquad\textbf{(C)} ~\frac{3}{4}\qquad\textbf{(D)} ~\frac{25}{32}\qquad\textbf{(E)} ~\frac{13}{16}$
## Solution 1 (Complementary Counting)
We will use complementary counting.
First, the frog can go left with probability $\frac14.$ We observe symmetry, so our final answer will be multiplied by 4 for the 4 directions, and since $4\cdot \frac14=1,$ we will ignore the leading probability.

From the left, she either goes left to another edge ($\frac14)$ or back to the center ($\frac14).$ Time for some casework.

$\textbf{Case 1:} She goes back to the center.$

Now, she can go in any 4 directions, and then has 2 options from that edge. This gives $\frac12. --$End case 1

$\textbf{Case 2:} She goes to another edge (rightmost).$

Subcase 1: She goes back to the left edge. She now has 2 places to go, giving $\frac12$

Subcase 2: She goes to the center. Now any move works.

$\frac14 \cdot \frac12 + \frac14 \cdot 1=\frac18 + \frac 14=\frac38$ for this case. --End case 2

She goes back to the center in Case 1 with probability $\frac14,$ and to the right edge with probability $\frac14$

So, our answer is $\frac14 \cdot \frac12 + \frac14 \cdot \frac38=\frac14 (\frac12+\frac38)=\frac14 \cdot \frac78 = \frac7{32}$

But, don't forget complementary counting. So, we get $1-\frac7{32}=\frac{25}{32} \implies \boxed{D}.$ ~ firebolt360
## Solution 2 (Direct Counting and Probability States)
We can draw a state diagram with three states: center, edge, and corner. Denote center by M, edge by E, and corner by C. There are a few ways Frieda can reach a corner in four or less moves: EC, EEC, EEEC, EMEC. Then, calculating the probabilities of each of these cases happening, we have $1\cdot\tfrac{1}{2}+1\cdot\tfrac{1}{4}\cdot\tfrac{1}{2}+1\cdot\tfrac{1}{4}\cdot\tfrac{1}{4}\cdot\tfrac{1}{2}+1\cdot\tfrac{1}{4}\cdot1\cdot\tfrac{1}{2}=\tfrac{25}{32},$ so the answer is $\boxed{D}.$ ~IceWolf10
## Solution 3 (Finds Numerator and Denominator Separately)
Suppose Frieda makes four independent hops without stopping so that each outcome is equally likely.

**Denominator**

There are $4^4=256$ ways for Frieda to make four hops without restrictions.

**Numerator**

We perform casework on which hop Frieda reaches a corner for the first time:

 1.   The second hop (The third and the fourth hops have no restrictions.)

The four hops have 4, 2, 4, 4 options, respectively. So, this case has $4\cdot2\cdot4\cdot4=128$ ways.

2.   The third hop (The fourth hop has no restrictions.)

No matter which direction the first hop takes, the second hop must "wrap around".

The four hops have 4, 1, 2, 4 options, respectively. So, this case has $4\cdot1\cdot2\cdot4=32$ ways.

3.   The fourth hop (There are two subcases based on the second hop.)

     1.   The second hop "wraps around". It follows that the third hop must also "wrap around".

The four hops have 4, 1, 1, 2 options, respectively. So, this subcase has $4\cdot1\cdot1\cdot2=8$ ways.


2.   The second hop returns to the center.


The four hops have 4, 1, 4, 2 options, respectively. So, this subcase has $4\cdot1\cdot4\cdot2=32$ ways.

 Together, this case has $8+32=40$ ways.

The numerator is $128+32+40=200$.

**Probability**

The requested probability is $\frac{200}{256}=\boxed{\textbf{(D)} ~\frac{25}{32}}.$

**Remark**

This problem is quite similar to [1995 AIME Problem 3](https://artofproblemsolving.com/wiki/index.php/1995_AIME_Problems/Problem_3).

*~MRENTHUSIASM*
## Solution 4
Let $C_n$ be the probability that Frieda is on the central square after n moves, $E_n$ be the probability that Frieda is on one of the four squares on the middle of the edges after n moves, and $V_n$ (V for vertex) be the probability that Frieda is on a corner after n moves. The only way to reach the center is by moving in 1 specific direction out of 4 total directions from the middle of an edge, so $C_{n+1}=\frac{E_n}{4}.$ The ways to reach the middle of an edge are by moving in any direction from the center or by moving in 1 specific direction from the middle of an edge, so $E_{n+1}=C_n+\frac{E_n}{4}.$ The ways to reach a corner are by simply staying there after reaching there in a previous move or by moving in 2 specific directions from the middle of an edge, so $V_{n+1}=V_n+\frac{E_n}{2}.$ Since Frieda always start from the center, $C_0=1, E_0=0$, and $V_0=0$. We use the previous formulas to work out $V_4$ and find it to be $\boxed{\textbf{(D)} ~\frac{25}{32}}.$

*~SmileKat32*
## Solution 5
Imagine an infinite grid of 2 by 2 squares such that there is a 2 by 2 square centered at ($3x$, $3y$) for all ordered pairs of integers (x, y).


> [Asymptote diagram - not rendered in Markdown]

```asy
dot((0,0)); draw((-1,-1)--(-1,1)--(1,1)--(1,-1)--cycle); draw((-4,-1)--(-4,1)--(-2,1)--(-2,-1)--cycle); draw((2,-1)--(2,1)--(4,1)--(4,-1)--cycle); draw((-1,2)--(-1,4)--(1,4)--(1,2)--cycle); draw((-1,-4)--(-1,-2)--(1,-2)--(1,-4)--cycle); draw((-4,2)--(-2,2)--(-2,4)--(-4,4)--cycle); draw((4,-2)--(2,-2)--(2,-4)--(4,-4)--cycle); draw((4,2)--(2,2)--(2,4)--(4,4)--cycle); draw((-4,-2)--(-2,-2)--(-2,-4)--(-4,-4)--cycle); draw((-3,-3)--(3,-3)--(3,3)--(-3,3)--cycle); draw((-4,0)--(4,0)); draw((0,4)--(0,-4));
```


It is easy to see that the problem is equivalent to Frieda moving left, right, up, or down on this infinite grid starting at (0, 0) (minus the teleportations). Since counting the complement set is easier, we'll count the number of 4-step paths such that Frieda never reaches a corner point.

In other words, since the reachable corner points are ($\pm 1, \pm 1), (\pm 1, \pm 2), (\pm 2, \pm 1),$  and ($\pm 2, \pm 2),$ Frieda can only travel along the collection of points included in S, where S is all points on $x=0$ and $y=0$ such that |y|<4 and |x|<4, respectively, plus all points on the big square with side length 6 centered at (0, 0). We then can proceed with casework:

Case 1: Frieda never reaches (0, $\pm 3)$ nor ($\pm 3, 0).$

When Frieda only moves horizontally or vertically for her four moves, she can do so in $2^4 - 4 = 12$ ways for each case . Thus, 12 $\cdot 2$ total paths for the subcase of staying in one direction. (For instance, all length 4 combinations of F and B except FFFF, BBBB, FFFB, and BBBF for the horizontal direction.)

There is another subcase where she changes directions during her path. There are four symmetric cases for this subcase depending on which of the four quadrants Frieda hugs. For the first quadrant, the possible paths are FBUD, FBUU, UDFB, and UDFF. Thus, a total of 4 $\cdot 4 = 16$ ways for this subcase.

Total for Case 1: $24 + 16 = 40$

Case 2: Frieda reaches (0, $\pm 3)$ or ($\pm 3, 0).$

Once Frieda reaches one of the points listed above (by using three moves), she has four choices for her last move. Thus, a total of 4 $\cdot 4 = 16$ paths for this case.

Our total number of paths never reaching coroners is thus $16+40=56$, making for an answer of $\frac{4^4-56}{4^4} = \boxed{\textbf{(D)} ~\frac{25}{32}}.$

*~fidgetboss_4000*
## Solution 6 (Casework)
We take cases on the number of hops needed to reach a corner. For simplicity, denote E as a move that takes Frieda to an edge, W as wrap-around move and C as a corner move. Also, denote O as a move that takes us to the center.

**2 Hops**

Then, Frieda will have to (E, C) as her set of moves. There are 4 ways to move to an edge, and 2 corners to move to, for a total of 4 $\cdot 2 = 8$ cases here. Then, there are 4 choices for each move, for a probability of $\frac{8}{4 \cdot 4} = \frac{1}{2}.$

**3 Hops**

In this case, Frieda must wrap-around. There's only one possible combination, just (E, W, C). There are 4 ways to move to an edge, 1 way to wrap-around (you must continue in the same direction) and 2 corners, for a total of 4 $\cdot 1 \cdot 2 = 8$ cases here. Then, there are 4 choices for each move, for a probability of $\frac{8}{4 \cdot 4 \cdot 4} = \frac{1}{8}.$

**4 Hops**

Lastly, there are two cases we must consider here. The first case is (E, O, E, C), and the second is (E, W, W, C). For the first case, there are 4 ways to move to an edge, 1 way to return to the center, 4 ways to move to an edge once again, and 2 ways to move to a corner. Hence, there is a total of 4 $\cdot 1 \cdot 4 \cdot 2 = 32$ cases here. Then, for the second case, there are 4 ways to move to a corner, 1 way to wrap-around, 1 way to wrap-around the way Frieda just came from, and 2 ways to move to a corner. This implies there are 4 $\cdot 1 \cdot 1 \cdot 2 = 8$ cases here. Then, there is a total of $8+32 = 40$ cases, out of a total of $4^4 = 256$ cases, for a probability of $\frac{40}{256} = \frac{5}{32}.$

Then, the total probability that Frieda ends up on a corner is $\frac{1}{2} + \frac{1}{8} + \frac{5}{32} = \frac{25}{32},$ corresponding to choice $\boxed{\textbf{(D)} ~\frac{25}{32}}.$

*~rocketsri ~minor edit by trevian1*
## Solution 7
I denote 3x3 grid by

- HOME square (x1)

- CORN squares (x4)

- SIDE squares (x4)

Transitions:

- HOME always move to SIDE

- CORN is DONE

- SIDE move to HOME with $p=1/4$, move to SIDE with $p=1/4$, and move to CORN with $p=1/2$.

After one move, will be on $\text{SIDE}$ square

After two moves, will be 1/2 + 1/4 ($\text{HOME}) + 1/4 (\text{SIDE})$

After three moves, will be 1/2 + 1/4 ($\text{SIDE}) + 1/$4 (1/2 + 1/4(\text{SIDE}) + 1/$4(\text{HOME})$)$$

After four moves, probability on CORN will be 1/2 + 1/4 (1/2) + 1/$4( 1/2 + 1/4(1/2)$) = 1/2 + 1/8 + $5/32 = 25 / 32$.

*~ccx09*
## Solution 8 (Markov Chain)
The grid is symmetrical. Denote the center cell as state Center, the 4 middle side cells as state Side, the 4 corner cells as state Corner. We can draw the following State Transition Diagram with [https://en.wikipedia.org/wiki/Markov_chain Markov Chain]. The numbers on the transition arc are the transition probability.
[900px|center](https://artofproblemsolving.com/wiki/index.php/File:Markov_Chain(center_side_corner).png)

We calculate the probability of different states in each round in the following table by iterating a few more times:


$$
\begin{array}{|c|c|c|c|} \hline \textbf{Round} & \textbf{Center} & \textbf{Side} & \textbf{Corner}\\ \hline &&&\\ 1 & 0 & 1 & 0\\ &&&\\ \hline &&&\\ 2 & \frac{1}{4} & \frac{1}{4} & \frac{1}{2}\\ &&&\\ \hline &&&\\ 3 & \frac{1}{4} \cdot \frac{1}{4} = \frac{1}{16} & \frac{1}{4} + \frac{1}{4} \cdot \frac{1}{4} = \frac{5}{16} & \frac{1}{4} \cdot \frac{1}{2} + \frac{1}{2} = \frac{5}{8}\\ &&&\\ \hline &&&\\ 4 & \frac{5}{16} \cdot \frac{1}{4} = \frac{5}{64} & \frac{1}{16} + \frac{5}{16} \cdot \frac{1}{4} = \frac{9}{64} & \frac{5}{16} \cdot \frac{1}{2} + \frac{5}{8} = \frac{25}{32}\\ &&&\\ \hline \end{array}
$$


Therefore, the answer is $\boxed{\textbf{(D)} ~\frac{25}{32}}.$

~[https://artofproblemsolving.com/wiki/index.php/User:Isabelchen isabelchen]
## Solution 9
Let us go through the frog’s jumps step by step to find the probability that it will land in a corner. Denote the frog’s position as F:

> [Asymptote diagram - not rendered in Markdown]

```asy
label("$F$",(0,0)); draw((-1,-1)--(-1,1)--(1,1)--(1,-1)--cycle); draw((1,-1)--(1,1)--(3,1)--(3,-1)--cycle); draw((-1,1)--(-1,3)--(1,3)--(1,1)--cycle); draw((-3,-1)--(-3,1)--(-1,1)--(-1,-1)--cycle); draw((-1,-3)--(-1,-1)--(1,-1)--(1,-3)--cycle); draw((-3,-3)--(3,-3)--(3,3)--(-3,3)--cycle);
```

First notice that since the frog only moves up, down, left or right, it’s original hop will not matter by symmetry, because all first hops will bring the frog at the edge next to two corners. WLOG we let the frog hop up:

> [Asymptote diagram - not rendered in Markdown]

```asy
label("$F$",(0,2)); draw((-1,-1)--(-1,1)--(1,1)--(1,-1)--cycle); draw((1,-1)--(1,1)--(3,1)--(3,-1)--cycle); draw((-1,1)--(-1,3)--(1,3)--(1,1)--cycle); draw((-3,-1)--(-3,1)--(-1,1)--(-1,-1)--cycle); draw((-1,-3)--(-1,-1)--(1,-1)--(1,-3)--cycle); draw((-3,-3)--(3,-3)--(3,3)--(-3,3)--cycle);
```

Notice that in its second hop, there are two ways for it to move to a corner (left and right) out of four, and thus the probability of Frieda reaching a corner on the second hop is $\frac{1}{2}.$

There are two other cases for Frieda’s second hop: it could either wrap around to another edge square or move back to the middle. We analyze each of these cases individually, noting that each has probability $\frac{1}{4}$:

> [Asymptote diagram - not rendered in Markdown]

```asy
label("$F$",(0,-2)); draw((-1,-1)--(-1,1)--(1,1)--(1,-1)--cycle); draw((1,-1)--(1,1)--(3,1)--(3,-1)--cycle); draw((-1,1)--(-1,3)--(1,3)--(1,1)--cycle); draw((-3,-1)--(-3,1)--(-1,1)--(-1,-1)--cycle); draw((-1,-3)--(-1,-1)--(1,-1)--(1,-3)--cycle); draw((-3,-3)--(3,-3)--(3,3)--(-3,3)--cycle);
```

In this case, there are again 2 choices to go to a corner on the third hop, go back to the previous square, or go to the middle. Here there is a $\frac{1}{2}$ probability that Frieda will reach a corner on the third hop. If Frieda hops back with a $\frac{1}{4}$ probability, she will again have a $\frac{1}{2}$ chance of reaching a corner on her fourth hop, but after four hops she stops hopping, so there are no more chances for her to reach a corner if she hops back. If she hops to the middle, then her fourth hop cannot reach a corner and that case yields 0 probability of reaching a corner.

To sum up this case, the total probability of her reaching a corner is $\frac{1}{4}\left(\frac{1}{2}+\frac{1}{4}\cdot \frac{1}{2}\right).$

Finally suppose Frieda goes back to her initial position after 2 steps. Then her third step again doesn’t matter because whatever she does, she will be next to 2 corners, so the probability of her reaching a corner on her fourth hop in this case is $\frac{1}{4}\cdot\frac{1}{2}.$

Summing up all the cases, we get

$$\frac{1}{2}+\frac{1}{4}\left(\frac{1}{2}+\frac{1}{4}\cdot\frac{1}{2}\right)+\frac{1}{4}\cdot\frac{1}{2} = \frac{1}{2}+\frac{1}{4}\left(\frac{1}{2}+\frac{1}{8}\right)+\frac{1}{8} = \frac{5}{4}\cdot\left(\frac{1}{2}+\frac{1}{8}\right) = \frac{5}{4} \cdot \frac{5}{8} = \boxed{\textbf{(D)} ~\frac{25}{32}}.$$

*~KingRavi*
## Solution 10 (Similar to the States Solution)
Denote the center square as C, the edge squares as E, and the corner squares as Co. On the first move, the probability of Frieda on the C is 0 because she's moving away from the center square. The probability she's on E is 1 because no matter which direction she goes, she's always going to end up on an edge square. Probability she's on Co equals 1 - (0 + 1) = 0 by complementary counting. Notice that the probability Frieda will be on the C can be expressed as: P(C) = $\frac{1}{4} \cdot P(E$ from last move) because one-fourth of the moves Frieda takes from an edge square sends her back to C. Also, she can't reach C from a Co square. Now P(E) = P(C from last move) + $\frac{1}{4} \cdot P(E$ from last move) simply from the same logic. We can find P(Co) using complementary counting. On the second move, P(C) = $\frac{1}{4} \cdot 1 = \frac{1}{4}$ and P(E) = 0 + $\frac{1}{4} \cdot 1 = \frac{1}{4}.$ Now P(Co) = 1 - $\frac{1}{4} - \frac{1}{4} = \frac{1}{2}.$ On the third move, P(C) = $\frac{1}{4} \cdot \frac{1}{4} = \frac{1}{16}$ and P(E) = $\frac{1}{4} + \frac{1}{4} \cdot \frac{1}{4} = \frac{5}{16}. P(Co) = 1 - \frac{1}{16} - \frac{5}{16} = \frac{5}{8}.$ Now on the fourth and last move, P(C) = $\frac{1}{4} \cdot \frac{5}{16} = \frac{5}{64}$ and P(E) = $\frac{1}{16} + \frac{1}{4} \cdot \frac{5}{16} = \frac{9}{64}.$ Finally, P(Co) = 1 - $\frac{5}{64} - \frac{9}{64} = 1 - \frac{7}{32} = \frac{25}{32}.$

*~ilikemath247365*
## Video Solution by Punxsutawney Phil
https://youtube.com/watch?v=kHLR57iP0cU

Note: This video solution is not available
## Video Solution by OmegaLearn (Using Probability States)
https://youtu.be/rLAcJe3o-uA?t=318

*~pi_is_3.14*
## Video Solution by TheBeautyofMath
https://youtu.be/BM6ttcz8oLA

*~IceMatrix*
## Video Solution by TheCALT (Casework)
https://www.youtube.com/watch?v=BHHZPy9VjAM

*~bobthegod78*
## Video Solution by MRENTHUSIASM (English & Chinese)
https://www.youtube.com/watch?v=f6LrMimIUWw

*~MRENTHUSIASM*
## Video Solution by firebolt360
https://youtu.be/ude2rzO1cmk

*~firebolt360*
## Video Solution using probability states
https://youtu.be/Kr0w6XUuet8
## See also
