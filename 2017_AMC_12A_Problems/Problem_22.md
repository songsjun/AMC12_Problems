# 2017 AMC 12A Problem 22

## Problem
A square is drawn in the Cartesian coordinate plane with vertices at (2, 2), (-2, 2), (-2, -2), (2, -2). A particle starts at (0,0). Every second it moves with equal probability to one of the eight lattice points (points with integer coordinates) closest to its current position, independently of its previous moves. In other words, the probability is 1/8 that the particle will move from (x, y) to each of (x, y + 1), (x + 1, y + 1), (x + 1, y), (x + 1, y - 1), (x, y - 1), (x - 1, y - 1), (x - 1, y), or (x - 1, y + 1). The particle will eventually hit the square for the first time, either at one of the 4 corners of the square or at one of the 12 lattice points in the interior of one of the sides of the square. The probability that it will hit at a corner rather than at an interior point of a side is m/n, where m and n are relatively prime positive integers. What is m + n?

$\textbf{(A) } 4 \qquad\textbf{(B) } 5 \qquad\textbf{(C) } 7 \qquad\textbf{(D) } 15 \qquad\textbf{(E) } 39$
## Solution
We let c, e, and m be the probability of reaching a corner before an edge when starting at an "inside corner" (e.g. (1, 1)), an "inside edge" (e.g. (1, 0)), and the middle respectively.

Starting in the middle, there is a $\frac{4}{8}$ chance of moving to an inside edge and a $\frac{4}{8}$ chance of moving to an inside corner, so

$$m = \frac{1}{2}e + \frac{1}{2}c.$$

Starting at an inside edge, there is a $\frac{2}{8}$ chance of moving to another inside edge, a $\frac{2}{8}$ chance of moving to an inside corner, a $\frac{1}{8}$ chance of moving into the middle, and a $\frac{3}{8}$ chance of reaching an outside edge and stopping. Therefore,


$$e = \frac{1}{4}e + \frac{1}{4}c + \frac{1}{8}m + \frac{3}{8}\cdot 0 = \frac{1}{4}e + \frac{1}{4}c + \frac{1}{8}m.$$


Starting at an inside corner, there is a $\frac{2}{8}$ chance of moving to an inside edge, a $\frac{1}{8}$ chance of moving into the middle, a $\frac{4}{8}$ chance of moving to an outside edge and stopping, and finally a $\frac{1}{8}$ chance of reaching that elusive outside corner. This gives


$$c = \frac{1}{4}e + \frac{1}{8}m + \frac{1}{2}0 + \frac{1}{8}\cdot 1 = \frac{1}{4}e + \frac{1}{8}m + \frac{1}{8}.$$


Solving this system of equations gives


$$
m = \frac{4}{35},
e = \frac{1}{14},
c = \frac{11}{70}.
$$


Since the particle starts at (0, 0), it is m we are looking for, so the final answer is

$$4 + 35 = \boxed{\textbf{(E) }39}.$$
## Remark (Markov Chain)
[center|450px](https://artofproblemsolving.com/wiki/index.php/File:2017AMC12AP22.png)

This problem can be modeled as an [https://en.wikipedia.org/wiki/Absorbing_Markov_chain Absorbing Markov Chain].

[https://artofproblemsolving.com/wiki/index.php/2014_AMC_12B_Problems/Problem_22 2014 AMC12B Problem 22] is a similar problem that can also be solved by using an Absorbing Markov Chain.

~[https://artofproblemsolving.com/wiki/index.php/User:Isabelchen isabelchen]
## Video Solutions
https://www.youtube.com/watch?v=rz-Ma_O2bT4

Solution by Richard Rusczyk -
https://www.youtube.com/watch?v=ixDXFRffUZ4&list=PLyhPcpM8aMvLZmuDnM-0vrFniLpo7Orbp&index=2
- AMBRIGGS
## See Also
