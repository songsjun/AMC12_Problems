# 2018 AMC 12A Problem 3

> This problem is the same as [2018 AMC 10A #4](https://artofproblemsolving.com/wiki/index.php/2018_AMC_10A_Problems/Problem_4) and [2018 AMC 12A #3](https://artofproblemsolving.com/wiki/index.php/2018_AMC_12A_Problems/Problem_3).
## Problem
How many ways can a student schedule $3$ mathematics courses -- algebra, geometry, and number theory -- in a $6$-period day if no two mathematics courses can be taken in consecutive periods? (What courses the student takes during the other $3$ periods is of no concern here.)

$\textbf{(A) }3\qquad\textbf{(B) }6\qquad\textbf{(C) }12\qquad\textbf{(D) }18\qquad\textbf{(E) }24$
## Solution 1
We must place the classes into the periods such that no two classes are in the same period or in consecutive periods.

Ignoring distinguishability, we can thus list out the ways that three periods can be chosen for the classes when periods cannot be consecutive:

Periods $1, 3, 5$


Periods $1, 3, 6$

Periods $1, 4, 6$

Periods $2, 4, 6$

There are $4$ ways to place $3$ non distinguishable classes into $6$ periods such that no two classes are in consecutive periods. For each of these ways, there are $3! = 6$ orderings of the classes among themselves.

Therefore, there are $4 \cdot 6 = \boxed{\textbf{(E) } 24}$ ways to choose the classes.

*~Versailles15625*
## Solution 2
Counting what we don't want is another slick way to solve this problem. Use PIE (Principle of Inclusion and Exclusion) to count two cases: 1. Two classes consecutive, 2. Three classes consecutive.

Case 1: Consider two consecutive periods as a "block" of which there are 5 places to put in(1,2; 2,3; 3,4; 4,5; 5,6). Then we simply need to place two classes within the block, $3 \cdot 2$. Finally we have 4 periods remaining to place the final math class. Thus there are $5 \cdot 3 \cdot 2 \cdot 4$ ways to place two consecutive math classes with disregard to the third.

Case 2: Now consider three consecutive periods as a "block" of which there are now 4 places to put in(1,2,3; 2,3,4; 3,4,5; 4,5,6). We now need to arrange the math classes in the block, $3 \cdot 2 \cdot 1$. Thus there are $4 \cdot 3 \cdot 2 \cdot 1$ ways to place all three consecutive math classes.

By PIE we subtract Case 1 by Case 2 in order to not overcount:  $120-24$. Then we subtract that answer from the total ways to place the classes with no restrictions: $(6 \cdot 5 \cdot 4) - 96= \boxed{\textbf{(E) } 24}$

*~LitJamal*
## Solution 3
We can tackle this problem with a stars-and-bars-ish approach. First, letting math class be 1 and non-math-class be 0, place $0s$ in between 3 $1s$:


$$10101$$


Now we need to place 1 additional 0. There are 4 places to put it:

$$\underline{\hspace{0.3cm}}1\underline{\hspace{0.3cm}}01\underline{\hspace{0.3cm}}01\underline{\hspace{0.3cm}}$$

 It can be placed in any 1 of the underscores.
Since there are $3!=6$ ways to order the math classes, the answer is $\cdot 4=\boxed{\textbf{(E) } 24}$.

~[https://artofproblemsolving.com/wiki/index.php/User:Firebolt360 firebolt360]
## Solution 4
Let $M$ represent a math class and $N$ represent a non-math class. We have _$N_N_N_$, where the spaces represent the possible spots the $M’s$ could go in. There are $\choose 3$ ways to choose the spots for the math classes and $3!=6$ ways to order the classes. Hence, the answer is $4 \cdot 6 = \boxed{\textbf{(E) } 24}$.
*~azc1027*
## Video Solution (CREATIVE THINKING!)
https://youtu.be/GHCecqsF8es

Education, the Study of Everything
## Video Solution
https://youtu.be/vO-ELYmgRI8

*~IceMatrix*
## Video Solution
https://youtu.be/kBOCP8p8-o8

*~savannahsolver*
## See Also
