# 2012 AMC 12A Problem 11

## Problem
Alex, Mel, and Chelsea play a game that has 6 rounds.  In each round there is a single winner, and the outcomes of the rounds are independent.  For each round the probability that Alex wins is $\frac{1}{2},$ and Mel is twice as likely to win as Chelsea.  What is the probability that Alex wins three rounds, Mel wins two rounds, and Chelsea wins one round?

$\textbf{(A)}\ \frac{5}{72}\qquad\textbf{(B)}\ \frac{5}{36}\qquad\textbf{(C)}\ \frac{1}{6}\qquad\textbf{(D)}\ \frac{1}{3}\qquad\textbf{(E)}\ 1$
## Solution 1
If m is the probability Mel wins and c is the probability Chelsea wins, $m=2c$ and $m+c=\frac12.$ From this we get $m=\frac13$ and $c=\frac16.$ For Alex to win three, Mel to win two, and Chelsea to win one, in that order, is $\frac{1}{2^3\cdot3^2\cdot6}=\frac{1}{432}.$ Multiply this by the number of permutations (orders they can win) which is $\frac{6!}{3!2!1!}=60.$

$$\frac{1}{432}\cdot60=\frac{60}{432}=\boxed{\textbf{(B)}\ \frac{5}{36}}$$
## Solution 2
The probability that Alex wins is $\frac{1}{2}$ , the probability that Mel wins is $\frac{1}{3}$ , and the probability that Chelsea wins is $\frac{1}{6}$ . There are $\binom{6}{3}$ ways to pick the three games that Alex wins, and $\binom{3}{2}$ ways to pick 2 out of the 3 remaining games that Mel wins - theres $\binom{1}{1}$ ways to see that Chelsea wins. Therefore, the number of ways is


$$\frac{1}{2^3}\times\frac{1}{3^2}\times\frac{1}{6}\times\binom{6}{3}\times\binom{3}{2} = \boxed{\textbf{(B)}\ \frac{5}{36}}$$


*~youtube.com/@indianmathguy*
## Video Solution by TheBeautyofMath
I preview the concept that will be used in the first part of this video, and show why it's important "Don't Memorize, Understand". I adapt the solution method of an older problem to inform the solution of this one: https://youtu.be/PO3XZaSchJc

*~IceMatrix*
## See Also
