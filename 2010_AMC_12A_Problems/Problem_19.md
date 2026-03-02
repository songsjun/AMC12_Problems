# 2010 AMC 12A Problem 19

> This problem is the same as [2010 AMC 12A #19](https://artofproblemsolving.com/wiki/index.php/2010_AMC_12A_Problems) and [2010 AMC 10A #23](https://artofproblemsolving.com/wiki/index.php/2010_AMC_10A_Problems).
## Problem
Each of 2010 boxes in a line contains a single red marble, and for 1 $\le$ k $\le 2010,$ the box in the $k\text{th}$ position also contains k white marbles. Isabella begins at the first box and successively draws a single marble at random from each box, in order. She stops when she first draws a red marble. Let P(n) be the probability that Isabella stops after drawing exactly n marbles. What is the smallest value of n for which P(n) < $\frac{1}{2010}$?

$\textbf{(A)}\ 45 \qquad \textbf{(B)}\ 63 \qquad \textbf{(C)}\ 64 \qquad \textbf{(D)}\ 201 \qquad \textbf{(E)}\ 1005$
## Solution 1
The probability of drawing a white marble from box k is $\frac{k}{k + 1},$ and the probability of drawing a red marble from box k is $\frac{1}{k+1}.$

To stop after drawing n marbles, we must draw a white marble from boxes 1, 2, $\ldots,n-1$, and draw a red marble from box n. Thus, P(n) = $\left(\frac{1}{2} \cdot \frac{2}{3} \cdot \frac{3}{4} \cdots \frac$ {n - 1}{n}$\right) \cdot \frac{1}{n +1} = \frac{1}{n (n + 1)}.$

So, we must have $\frac{1}{n(n + 1)} < \frac{1}{2010}$ or n$(n+1) > 2010$.

Since n$(n+1)$ increases as n increases, we can simply test values of n; after some trial and error, we get that the minimum value of n is $\boxed{\textbf{(A) }45},$ since $45(46) = 2070$ but $44(45) = 1980$.
## Solution 2(cheap)
Do the same thing as Solution 1, but when we get to n$(n+1)>2010$ just test all the answer choices in ascending order(from A to E), and stop when one of the answer choices is greater than 2010. We get $45(46)=2070$, which is greater than 2010, so we are done. The answer is $\textbf{(A)}$

*~vsamc*
## Solution 3(very cheap)
Do the same thing as Solution 1, but when we get to n$(n+1)>2010$, remember that in our current era, the square root of the year is in the $4$0s. n(n+1)$$ is close $to n^2,$ so only $\textbf{(A)}$ can be correct.
## Video Solution by TheBeautyofMath
https://www.youtube.com/watch?v=47XsxmQ5Ej4
## See Also
