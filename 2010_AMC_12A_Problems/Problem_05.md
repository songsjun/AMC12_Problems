# 2010 AMC 12A Problem 5

## Problem
Halfway through a 100-shot archery tournament, Chelsea leads by 50 points. For each shot a bullseye scores 10 points, with other possible scores being 8, 4, 2, and 0 points. Chelsea always scores at least 4 points on each shot. If Chelsea's next n shots are bullseyes she will be guaranteed victory. What is the minimum value for n?

$\textbf{(A)}\ 38 \qquad \textbf{(B)}\ 40 \qquad \textbf{(C)}\ 42 \qquad \textbf{(D)}\ 44 \qquad \textbf{(E)}\ 46$
## Solution
Let k be the number of points Chelsea currently has. In order to guarantee victory, we must consider the possibility that the opponent scores the maximum amount of points by getting only bullseyes.


$$
\begin{align*}k+ 10n + 4(50-n) &> (k-50) + 50\cdot{10}\\ 6n &> 250\end{align*}
$$


The lowest integer value that satisfies the inequality is $\boxed{42\ \textbf{(C)}}.$
## See also
